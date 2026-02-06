// OpenRouter AI Client for text and image generation

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Models
const TEXT_MODEL = "google/gemini-2.0-flash-001";
const IMAGE_MODEL = "google/gemini-2.0-flash-exp:free"; // For image generation

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Generate text content
export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://luralab.eu",
        "X-Title": "LuraLab Content Generator",
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter text error:", error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Generate text error:", error);
    throw error;
  }
}

// Generate blog article
export async function generateBlogArticle(topic: string, keywords: string[]): Promise<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
}> {
  const systemPrompt = `Ти си експерт по здраве и уелнес, специализиран в хормонален баланс, управление на стреса и женско здраве.
Пишеш на български език за блога на LURA - бранд за премиум добавки.
Стилът ти е информативен, но достъпен. Използваш научни факти, но ги обясняваш просто.
Включваш практични съвети, които читателите могат да приложат веднага.`;

  const prompt = `Напиши подробна блог статия на тема: "${topic}"

Ключови думи за SEO: ${keywords.join(", ")}

Форматирай отговора като JSON с тази структура:
{
  "title": "Заглавие на статията (привлекателно, до 60 символа)",
  "slug": "url-friendly-slug-на-латиница",
  "excerpt": "Кратко описание за preview (до 160 символа)",
  "content": "Пълното съдържание в Markdown формат с h2, h3, списъци, удебелен текст",
  "category": "една от: hormoni, stress, sŭn, hranene, wellness"
}

Статията трябва да е минимум 800 думи, с ясна структура и практични съвети.`;

  const response = await generateText(prompt, systemPrompt);

  // Parse JSON from response
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse blog article JSON:", e);
  }

  throw new Error("Failed to generate blog article");
}

// Generate product review
export async function generateReview(): Promise<{
  title: string;
  content: string;
  author: string;
  location: string;
  rating: number;
  stat?: string;
}> {
  const systemPrompt = `Генерирай автентичен отзив за Corti-Glow - продукт за хормонален баланс.
Отзивът трябва да звучи естествено, от реална жена в България.
Фокусирай се върху конкретни резултати: по-добър сън, намалено подуване, повече енергия, по-добро настроение.`;

  const prompt = `Генерирай отзив за Corti-Glow.

Форматирай като JSON:
{
  "title": "Кратко заглавие на отзива (до 30 символа)",
  "content": "Съдържание на отзива (2-3 изречения, лично и автентично)",
  "author": "Име и първа буква на фамилия (напр. Мария К.)",
  "location": "Град в България",
  "rating": 5,
  "stat": "Опционално: конкретен резултат като '-3 см талия' или 'по-добър сън'"
}`;

  const response = await generateText(prompt, systemPrompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse review JSON:", e);
  }

  throw new Error("Failed to generate review");
}

// Generate marketing copy
export async function generateMarketingCopy(type: "email" | "social" | "ad", context: string): Promise<string> {
  const systemPrompt = `Ти си копирайтър за LURA - премиум бранд за добавки за жени.
Тонът е топъл, емпатичен, но професионален. Използваш емоции, но не си прекалено "салesy".
Фокусираш се върху ползите: по-добър сън, намален стрес, хормонален баланс, повече енергия.`;

  const typePrompts = {
    email: `Напиши имейл за: ${context}. Включи subject line, preview text и body. Форматирай като HTML.`,
    social: `Напиши Instagram пост за: ${context}. Включи caption и hashtags. Максимум 2200 символа.`,
    ad: `Напиши Facebook/Instagram реклама за: ${context}. Включи headline, primary text и CTA.`,
  };

  return generateText(typePrompts[type], systemPrompt);
}

// Generate image with Gemini
export async function generateImage(prompt: string): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY environment variable is not set");
    return null;
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://luralab.eu",
        "X-Title": "LuraLab Image Generator",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter image error:", error);
      return null;
    }

    const data = await response.json();
    // The response format depends on the model
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("Generate image error:", error);
    return null;
  }
}

// Generate product description
export async function generateProductDescription(
  productName: string,
  ingredients: string[],
  benefits: string[]
): Promise<{
  tagline: string;
  shortDescription: string;
  longDescription: string;
  bulletPoints: string[];
}> {
  const systemPrompt = `Ти си копирайтър за премиум добавки. Пишеш на български.
Стилът е елегантен, научен, но достъпен. Фокусираш се върху ползите за клиента.`;

  const prompt = `Напиши продуктово описание за "${productName}".

Съставки: ${ingredients.join(", ")}
Ползи: ${benefits.join(", ")}

Форматирай като JSON:
{
  "tagline": "Кратък слоган (до 50 символа)",
  "shortDescription": "Кратко описание за product card (до 100 символа)",
  "longDescription": "Подробно описание (2-3 параграфа)",
  "bulletPoints": ["5 ключови ползи като bullet points"]
}`;

  const response = await generateText(prompt, systemPrompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse product description JSON:", e);
  }

  throw new Error("Failed to generate product description");
}
