/**
 * OpenRouter API Client
 *
 * Universal client for calling AI models via OpenRouter.
 * Supports both regular and streaming responses.
 */

import type { ContentEngineConfig } from '../config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface CompletionResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Call OpenRouter API and return the full response
 */
export async function complete(
  config: ContentEngineConfig,
  options: CompletionOptions
): Promise<CompletionResult> {
  const model = options.model || config.defaultTextModel;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openrouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.siteUrl,
      'X-Title': config.siteName,
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 8192,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API error (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  return {
    content,
    model: data.model || model,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
  };
}

/**
 * Call OpenRouter API with streaming, yielding chunks as they arrive
 */
export async function* completeStream(
  config: ContentEngineConfig,
  options: CompletionOptions
): AsyncGenerator<string, string, undefined> {
  const model = options.model || config.defaultTextModel;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openrouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.siteUrl,
      'X-Title': config.siteName,
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 8192,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API error (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.replace('data: ', '').trim();
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          fullContent += content;
          yield content;
        }
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }

  return fullContent;
}

/**
 * Generate an image using OpenRouter (Gemini Image model).
 * Returns base64-encoded image data.
 */
export async function generateImageBase64(
  config: ContentEngineConfig,
  prompt: string,
  model?: string
): Promise<{ base64: string; mimeType: string }> {
  const imageModel = model || config.imageModel;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openrouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.siteUrl,
      'X-Title': config.siteName,
    },
    body: JSON.stringify({
      model: imageModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Image generation failed (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;

  // Find image data — OpenRouter may return it in different locations:
  // 1. message.images[] (newer format, e.g. Gemini 2.5 Flash Image)
  // 2. message.content[] as array with image_url parts (older format)
  let dataUri: string | undefined;

  // Strategy 1: Check message.images array
  if (Array.isArray(message?.images) && message.images.length > 0) {
    const imgPart = message.images.find(
      (part: Record<string, unknown>) =>
        part.type === 'image_url' && typeof part.image_url === 'object'
    );
    dataUri = imgPart?.image_url?.url;
  }

  // Strategy 2: Check message.content as array (legacy)
  if (!dataUri && Array.isArray(message?.content)) {
    const imgPart = message.content.find(
      (part: Record<string, unknown>) =>
        part.type === 'image_url' && typeof part.image_url === 'object'
    );
    dataUri = imgPart?.image_url?.url;
  }

  if (!dataUri) {
    throw new Error('No image data in response');
  }
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Invalid image data URI');
  }

  return {
    mimeType: match[1],
    base64: match[2],
  };
}
