import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const baseUrl = "https://youlistify.com";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "provider";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/work`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/list-service`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/post-work`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/safety`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.5 }
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return staticPages;

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const [{ data: providers }, { data: posts }] = await Promise.all([
      admin
        .from("Providers")
        .select("id,name,created_at")
        .eq("profile_active", true)
        .order("created_at", { ascending: false })
        .limit(1000),
      admin
        .from("work_posts")
        .select("id,created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1000)
    ]);

    const providerPages: MetadataRoute.Sitemap = (providers || []).map((provider) => ({
      url: `${baseUrl}/provider/${slugify(provider.name || "provider")}-${provider.id}`,
      lastModified: provider.created_at ? new Date(provider.created_at) : now,
      changeFrequency: "weekly",
      priority: 0.7
    }));

    const workPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
      url: `${baseUrl}/work/${post.id}`,
      lastModified: post.created_at ? new Date(post.created_at) : now,
      changeFrequency: "weekly",
      priority: 0.6
    }));

    return [...staticPages, ...providerPages, ...workPages];
  } catch {
    return staticPages;
  }
}
