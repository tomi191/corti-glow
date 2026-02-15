import { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog";
import { listProducts } from "@/lib/actions/products";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://luralab.eu";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use realistic last-modified dates per page type
  const staticPages: { route: string; lastmod: string; freq: "weekly" | "monthly"; priority: number }[] = [
    { route: "", lastmod: "2026-02-14", freq: "weekly", priority: 1 },
    { route: "/magazin", lastmod: "2026-02-15", freq: "weekly", priority: 0.9 },
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

  // Products from Supabase
  const { products } = await listProducts();
  const productRoutes = products.map((product) => ({
    url: `${BASE_URL}/produkt/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Blog posts from Supabase (or fallback)
  const posts = await getPublishedPosts();
  const blogRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
