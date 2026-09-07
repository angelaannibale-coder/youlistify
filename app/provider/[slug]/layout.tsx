import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

type ProviderSeo = {
  id: number;
  name: string | null;
  last_name: string | null;
  business_name: string | null;
  name_display: string | null;
  city: string | null;
  state: string | null;
  service_mode: string | null;
  bio: string | null;
  provider_services?: Array<{ services?: { name?: string | null } | null }> | null;
};

const loadProvider = cache(async (slug: string): Promise<ProviderSeo | null> => {
  const id = slug.split("-").pop();
  if (!id || !/^\d+$/.test(id)) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data } = await admin
      .from("Providers")
      .select("id,name,last_name,business_name,name_display,city,state,service_mode,bio,provider_services(services(name))")
      .eq("id", id)
      .eq("profile_active", true)
      .maybeSingle();
    return data as ProviderSeo | null;
  } catch {
    return null;
  }
});

function providerName(provider: ProviderSeo) {
  if (provider.business_name) return provider.business_name;
  if (provider.name_display === "first") return provider.name || "Service provider";
  if (provider.name_display === "initial") {
    return `${provider.name || "Service provider"}${provider.last_name ? ` ${provider.last_name.charAt(0)}.` : ""}`;
  }
  return [provider.name, provider.last_name].filter(Boolean).join(" ") || "Service provider";
}

function providerDescription(provider: ProviderSeo, name: string) {
  const services = provider.provider_services
    ?.map((item) => item.services?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
  const location = [provider.city, provider.state].filter(Boolean).join(", ");
  const fallback = `View ${name} on YouListify${services ? ` for ${services}` : ""}${location ? ` in ${location}` : provider.service_mode === "remote" ? " for remote services" : ""}.`;
  const description = provider.bio?.trim() || fallback;
  return description.length > 160 ? `${description.slice(0, 157).trim()}...` : description;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = await loadProvider(slug);
  if (!provider) {
    return {
      title: "Service provider not found | YouListify",
      robots: { index: false, follow: false }
    };
  }

  const name = providerName(provider);
  const description = providerDescription(provider, name);
  const canonical = `/provider/${slug}`;

  return {
    title: `${name} | YouListify Service Provider`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${name} | YouListify`,
      description,
      url: canonical,
      siteName: "YouListify",
      type: "profile"
    }
  };
}

export default async function ProviderLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = await loadProvider(slug);
  if (!provider) return children;

  const name = providerName(provider);
  const description = providerDescription(provider, name);
  const services = provider.provider_services
    ?.map((item) => item.services?.name)
    .filter(Boolean) as string[] | undefined;
  const entityType = provider.business_name ? "Organization" : "Person";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `https://youlistify.com/provider/${slug}`,
    name: `${name} on YouListify`,
    description,
    mainEntity: {
      "@type": entityType,
      name,
      description,
      ...(services?.length ? { knowsAbout: services } : {}),
      ...((provider.city || provider.state) && {
        areaServed: {
          "@type": "Place",
          name: [provider.city, provider.state].filter(Boolean).join(", ")
        }
      })
    }
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
