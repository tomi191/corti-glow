/**
 * Example: Generate a Blog Post
 *
 * Usage: npx tsx content-engine/examples/generate-blog-post.ts
 *
 * Requires: OPENROUTER_API_KEY in .env or environment
 */

import { createDefaultConfig } from '../config';
import { generateBlogPost } from '../ai/blog-generator';

async function main() {
  // Load config from environment variables
  const config = createDefaultConfig();

  if (!config.openrouterApiKey) {
    console.error('Missing OPENROUTER_API_KEY');
    process.exit(1);
  }

  console.log('Generating blog post...\n');

  const result = await generateBlogPost(config, {
    topic: 'Кортизол и кожа: Как стресът остарява лицето ви и какво да направите',
    keywords: ['кортизол кожа', 'стрес стареене', 'ашваганда кожа', 'кортизолов дисбаланс'],
    contentType: 'tofu',
    category: 'хормонален баланс',
    targetWordCount: 2000,
    author: 'dr-maria',
  });

  console.log('=== RESULT ===\n');
  console.log(`Title: ${result.title}`);
  console.log(`Slug: ${result.suggestedSlug}`);
  console.log(`Words: ${result.wordCount}`);
  console.log(`Reading time: ${result.readingTime} min`);
  console.log(`Meta title: ${result.metaTitle}`);
  console.log(`Meta desc: ${result.metaDescription}`);
  console.log(`Keywords: ${result.keywords.join(', ')}`);
  if (result.tldr) console.log(`TL;DR: ${result.tldr}`);
  if (result.keyTakeaways) console.log(`Key Takeaways: ${result.keyTakeaways.join(' | ')}`);
  if (result.faq) console.log(`FAQ: ${result.faq.length} questions`);
  if (result.sources) console.log(`Sources: ${result.sources.length} references`);
  console.log(`\nContent preview:\n${result.content.substring(0, 500)}...`);
}

main().catch(console.error);
