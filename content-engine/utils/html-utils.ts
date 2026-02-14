/**
 * HTML Utilities
 *
 * Common HTML manipulation functions for content processing.
 */

/**
 * Strip all HTML tags from content.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract text from a specific HTML element.
 *
 * @example
 * ```ts
 * extractFromElement('<div class="tldr">Summary here</div>', 'div', 'tldr')
 * // → 'Summary here'
 * ```
 */
export function extractFromElement(html: string, tag: string, className?: string): string | null {
  const pattern = className
    ? new RegExp(`<${tag}[^>]*class="[^"]*${className}[^"]*"[^>]*>(.*?)</${tag}>`, 's')
    : new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 's');

  const match = html.match(pattern);
  if (!match) return null;

  return stripHtml(match[1]);
}

/**
 * Extract excerpt from content (first 200 chars of plain text).
 */
export function extractExcerpt(html: string, maxLength: number = 200): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Count words in HTML content.
 */
export function countWords(html: string): number {
  const text = stripHtml(html);
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Extract all H2 headings from HTML (useful for TOC generation).
 */
export function extractHeadings(html: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: stripHtml(match[2]),
    });
  }

  return headings;
}
