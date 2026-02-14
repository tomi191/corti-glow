import { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://luralab.eu";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Static pages
  const staticPages = [
    "",
    "/produkt",
    "/nauka",
    "/za-nas",
    "/pomosht",
    "/poveritelnost",
    "/obshti-usloviya",
    "/blog",
    "/dostavka-i-vrashtane",
    "/prosledi-porachka",
  ];

  const staticRoutes = staticPages.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 1 : route === "/produkt" ? 0.9 : route === "/blog" ? 0.8 : 0.7,
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
