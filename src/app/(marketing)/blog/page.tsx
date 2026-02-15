import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import {
  getPublishedPosts,
  getFeaturedPosts,
  categoryLabels,
  categoryColors,
} from "@/lib/blog";
import type { BlogPostRow } from "@/lib/supabase/types";
import { BreadcrumbJsonLd } from "@/components/ui/BreadcrumbJsonLd";

export const revalidate = 300; // 5 min ISR

export const metadata: Metadata = {
  title: "Блог | Здраве, Хормони и Уелнес",
  description:
    "Научи повече за хормоналния баланс, управлението на стреса и цялостното благосъстояние. Статии от експерти в областта на здравето.",
  alternates: { canonical: "https://luralab.eu/blog" },
  openGraph: {
    title: "Блог | LURA",
    description: "Статии за здраве, хормони и уелнес",
  },
};

type BlogCategory = BlogPostRow["category"];

export default async function BlogPage() {
  const [allPosts, featuredPosts] = await Promise.all([
    getPublishedPosts(),
    getFeaturedPosts(),
  ]);

  // Calculate category counts
  const categoryCounts = allPosts.reduce(
    (acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const categories = Object.entries(categoryCounts).map(([category, count]) => ({
    category: category as BlogCategory,
    label: categoryLabels[category as BlogCategory],
    count,
  }));

  const recentPosts = allPosts.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F2EF] to-white">
      <BreadcrumbJsonLd
        items={[
          { name: "Начало", url: "https://luralab.eu" },
          { name: "Блог", url: "https://luralab.eu/blog" },
        ]}
      />
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#B2D8C6]/20 text-[#2D4A3E] text-sm font-medium mb-6">
            LURA Блог
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold text-[#2D4A3E] mb-6">
            Знание за{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D4A3E] via-[#B2D8C6] to-[#FFC1CC]">
              твоето здраве
            </span>
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Научно обосновани статии за хормонален баланс, управление на стреса и
            цялостно благосъстояние.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3">
          {categories.map(({ category, label, count }) => (
            <Link
              key={category}
              href={`/blog?category=${category}`}
              className="px-4 py-2 rounded-full text-sm font-medium transition hover:scale-105"
              style={{
                backgroundColor: `${categoryColors[category]}30`,
                color: "#2D4A3E",
              }}
            >
              {label} ({count})
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-[#2D4A3E] mb-8">
              Препоръчани статии
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => {
                const author = post.author as { name?: string } | null;
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-stone-100 hover:shadow-xl transition"
                  >
                    <div className="aspect-[16/9] relative bg-stone-100 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${categoryColors[post.category]}30`,
                          }}
                        >
                          {categoryLabels[post.category]}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-stone-500">
                          <Clock className="w-3 h-3" />
                          {post.read_time} мин
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-[#2D4A3E] mb-2 group-hover:text-[#B2D8C6] transition">
                        {post.title}
                      </h3>
                      <p className="text-stone-600 text-sm mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">{author?.name || "LURA"}</span>
                        <span className="text-[#2D4A3E] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Прочети <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#2D4A3E] mb-8">
            Всички статии
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-xl p-6 shadow-md border border-stone-100 hover:shadow-lg hover:border-[#B2D8C6] transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${categoryColors[post.category]}30`,
                    }}
                  >
                    {categoryLabels[post.category]}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-stone-500">
                    <Clock className="w-3 h-3" />
                    {post.read_time} мин
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#2D4A3E] mb-2 group-hover:text-[#B2D8C6] transition line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">
                    {new Date(post.published_at).toLocaleDateString("bg-BG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="text-[#2D4A3E] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Прочети <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#2D4A3E] to-[#1f352c] rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Готова ли си за баланс?
          </h2>
          <p className="text-stone-300 mb-8 max-w-lg mx-auto">
            Corti-Glow комбинира най-добрите съставки за управление на стреса и
            хормонален баланс.
          </p>
          <Link
            href="/produkt"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#B2D8C6] text-[#2D4A3E] rounded-full font-semibold hover:bg-[#FFC1CC] transition"
          >
            Опитай Corti-Glow
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
