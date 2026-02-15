import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import {
  getPostBySlug,
  getPublishedPosts,
  getAllPublishedSlugs,
  categoryLabels,
  categoryColors,
} from "@/lib/blog";
import type { BlogPostRow } from "@/lib/supabase/types";
import { BreadcrumbJsonLd } from "@/components/ui/BreadcrumbJsonLd";

export const revalidate = 300; // 5 min ISR

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Статията не е намерена" };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    alternates: { canonical: `https://luralab.eu/blog/${slug}` },
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [(post.author as { name?: string })?.name || "LURA"],
      images: post.image
        ? [{ url: `https://luralab.eu${post.image}` }]
        : undefined,
    },
  };
}

// Generate Article schema for SEO
function generateArticleSchema(post: BlogPostRow, url: string) {
  const author = post.author as { name?: string; credentials?: string; image?: string } | null;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image ? `https://luralab.eu${post.image}` : undefined,
    author: {
      "@type": "Person",
      name: author?.name || "LURA",
      jobTitle: author?.credentials || undefined,
      image: author?.image ? `https://luralab.eu${author.image}` : undefined,
    },
    publisher: {
      "@type": "Organization",
      name: "LURA Wellness",
      logo: { "@type": "ImageObject", url: "https://luralab.eu/logo.png" },
    },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    mainEntityOfPage: url,
  };
}

// Generate FAQ schema for SEO
function generateFAQSchema(post: BlogPostRow) {
  const faq = post.faq as { question: string; answer: string }[] | null;
  if (!faq || !Array.isArray(faq) || faq.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

// Simple markdown to HTML (for posts stored as markdown)
function markdownToHtml(content: string): string {
  // If content already contains HTML tags, return as-is
  if (/<[a-z][\s\S]*>/i.test(content.trim().slice(0, 100))) {
    return content;
  }

  return content
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-[#B2D8C6] pl-4 my-6 text-stone-600 italic">$1</blockquote>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-[#2D4A3E] mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-[#2D4A3E] mt-10 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-[#2D4A3E] mb-6">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 mb-2">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc list-inside mb-6 text-stone-600">$&</ul>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 mb-2">$2</li>')
    .replace(/✅/g, '<span class="text-green-600">✅</span>')
    .replace(/❌/g, '<span class="text-red-500">❌</span>')
    .replace(/\n\n/g, '</p><p class="text-stone-600 mb-4 leading-relaxed">')
    .replace(/^(?!<[hulo])/gm, '<p class="text-stone-600 mb-4 leading-relaxed">')
    .replace(/(?<![>])$/gm, '</p>');
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const url = `https://luralab.eu/blog/${post.slug}`;
  const author = post.author as { name?: string; credentials?: string; bio?: string; image?: string } | null;
  const keyTakeaways = post.key_takeaways as string[] | null;
  const sources = post.sources as { title: string; publication?: string; year?: number; url?: string }[] | null;

  // Get related posts (same category, excluding current)
  const allPosts = await getPublishedPosts();
  const relatedPosts = allPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  const contentHtml = markdownToHtml(post.content);

  // Schema markup
  const articleSchema = generateArticleSchema(post, url);
  const faqSchema = generateFAQSchema(post);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Schema */}
      <BreadcrumbJsonLd
        items={[
          { name: "Начало", url: "https://luralab.eu" },
          { name: "Блог", url: "https://luralab.eu/blog" },
          { name: post.title, url },
        ]}
      />
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-b from-[#F5F2EF] to-white pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-[#2D4A3E] transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Обратно към блога
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${categoryColors[post.category]}30`,
              }}
            >
              {categoryLabels[post.category]}
            </span>
            <span className="flex items-center gap-1 text-sm text-stone-500">
              <Clock className="w-4 h-4" />
              {post.read_time} мин четене
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#2D4A3E] mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-stone-600 mb-8">{post.excerpt}</p>

          {/* Author with E-E-A-T signals */}
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
            {author?.image ? (
              <Image
                src={author.image}
                alt={author.name || ""}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] flex items-center justify-center text-lg font-bold text-[#2D4A3E]">
                {(author?.name || "L").charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-[#2D4A3E]">
                  {author?.name || "LURA"}
                </span>
                {author?.credentials && (
                  <span className="px-2 py-0.5 text-xs bg-[#B2D8C6]/20 text-[#2D4A3E] rounded-full">
                    {author.credentials}
                  </span>
                )}
              </div>
              {author?.bio && (
                <p className="text-sm text-stone-500 mb-2">{author.bio}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.published_at).toLocaleDateString("bg-BG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {post.updated_at && post.updated_at !== post.published_at && (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Обновена: {new Date(post.updated_at).toLocaleDateString("bg-BG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.image && (
        <div className="px-6 pb-8">
          <div className="max-w-3xl mx-auto">
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Key Takeaways - for featured snippets */}
      {keyTakeaways && Array.isArray(keyTakeaways) && keyTakeaways.length > 0 && (
        <div className="px-6 py-8 bg-[#B2D8C6]/10 border-y border-[#B2D8C6]/20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold text-[#2D4A3E] mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2D4A3E]" />
              Ключови изводи
            </h2>
            <ul className="space-y-2">
              {keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-3 text-stone-600">
                  <span className="w-6 h-6 rounded-full bg-[#2D4A3E] text-white text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Content */}
      <article className="px-6 pb-20">
        <div
          className="max-w-3xl mx-auto prose prose-stone prose-lg"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>

      {/* Sources */}
      {sources && Array.isArray(sources) && sources.length > 0 && (
        <section className="px-6 pb-8">
          <div className="max-w-3xl mx-auto border-t border-stone-200 pt-8">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
              Източници
            </h3>
            <ul className="space-y-2 text-sm text-stone-500">
              {sources.map((source, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-stone-400">[{index + 1}]</span>
                  <span>
                    {source.title}
                    {source.publication && <em> - {source.publication}</em>}
                    {source.year && ` (${source.year})`}
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2D4A3E] hover:underline ml-1"
                      >
                        →
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-[#B2D8C6]/20 to-[#FFC1CC]/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-semibold text-[#2D4A3E] mb-3">
            Опитай Corti-Glow
          </h3>
          <p className="text-stone-600 mb-6">
            Научно обоснована формула за хормонален баланс и управление на стреса.
          </p>
          <Link
            href="/produkt"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D4A3E] text-white rounded-full font-medium hover:bg-[#1f352c] transition"
          >
            Виж Продукта
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="px-6 pb-20 bg-[#F5F2EF]">
          <div className="max-w-5xl mx-auto py-16">
            <h2 className="text-2xl font-semibold text-[#2D4A3E] mb-8">
              Свързани статии
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group bg-white rounded-xl p-6 shadow-md border border-stone-100 hover:shadow-lg hover:border-[#B2D8C6] transition"
                >
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                    style={{
                      backgroundColor: `${categoryColors[related.category]}30`,
                    }}
                  >
                    {categoryLabels[related.category]}
                  </span>
                  <h3 className="text-lg font-semibold text-[#2D4A3E] mb-2 group-hover:text-[#B2D8C6] transition">
                    {related.title}
                  </h3>
                  <p className="text-stone-600 text-sm line-clamp-2">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
