import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

type WorkSeo = {
  id: number;
  title: string;
  description: string;
  post_type: string;
  city: string | null;
  state: string | null;
  remote: boolean;
  location_mode?: "local" | "remote" | "both" | null;
  category: string | null;
};

const loadPost = cache(async (id: string): Promise<WorkSeo | null> => {
  if (!/^\d+$/.test(id)) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data } = await admin
      .from("work_posts")
      .select("id,title,description,post_type,city,state,remote,location_mode,category")
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle();
    return data as WorkSeo | null;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await loadPost(id);
  if (!post) {
    return {
      title: "Opportunity not found | YouListify",
      robots: { index: false, follow: false }
    };
  }

  const place = getPlace(post);
  const fallback = `${post.post_type} opportunity${place ? ` in ${place}` : ""} on YouListify.`;
  const rawDescription = post.description?.trim() || fallback;
  const description = rawDescription.length > 160 ? `${rawDescription.slice(0, 157).trim()}...` : rawDescription;
  const canonical = `/work/${id}`;

  return {
    title: `${post.title} | YouListify`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${post.title} | YouListify`,
      description,
      url: canonical,
      siteName: "YouListify",
      type: "website"
    }
  };
}

export default async function WorkDetailLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await loadPost(id);
  if (!post) return children;

  const place = getPlace(post);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `https://youlistify.com/work/${id}`,
    name: post.title,
    description: post.description,
    about: {
      "@type": "Thing",
      name: `${post.post_type}${post.category ? `: ${post.category}` : ""}`
    },
    ...(place && { contentLocation: { "@type": "Place", name: place } })
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      {children}
    </>
  );
}

function getPlace(post: WorkSeo) {
  const mode = post.location_mode || (post.remote ? "remote" : "local");
  const local = [post.city, post.state].filter(Boolean).join(", ");
  if (mode === "remote") return "Remote";
  if (mode === "both" && local) return `${local} + Remote`;
  return local;
}
