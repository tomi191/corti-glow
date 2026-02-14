import { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://luralab.eu";

export default function sitemap(): MetadataRoute.Sitemap {
  // Use realistic last-modified dates per page type
  const staticPages: { route: string; lastmod: string; freq: "weekly" | "monthly"; priority: number }[] = [
    { route: "", lastmod: "2026-02-14", freq: "weekly", priority: 1 },
    { route: "/produkt", lastmod: "2026-02-14", freq: "weekly", priority: 0.9 },
    { route: "/blog", lastmod: "2026-01-25", freq: "weekly", priority: 0.8 },
    { route: "/nauka", lastmod: "2026-01-15", freq: "monthly", priority: 0.8 },
    { route: "/za-nas", lastmod: "2026-01-10", freq: "monthly", priority: 0.7 },
    { route: "/pomosht", lastmod: "2026-01-10", freq: "monthly", priority: 0.7 },
    { route: "/dostavka-i-vrashtane", lastmod: "2026-01-10", freq: "monthly", priority: 0.7 },
    { route: "/poveritelnost", lastmod: "2025-12-01", freq: "monthly", priority: 0.3 },
    { route: "/obshti-usloviya", lastmod: "2025-12-01", freq: "monthly", priority: 0.3 },
    { route: "/prosledi-porachka", lastmod: "2026-01-10", freq: "monthly", priority: 0.5 },
  ];

  const staticRoutes = staticPages.map((page) => ({
    url: `${BASE_URL}${page.route}`,
    lastModified: new Date(page.lastmod),
    changeFrequency: page.freq,
    priority: page.priority,
  }));

  // Blog posts
  const blogRoutes = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
