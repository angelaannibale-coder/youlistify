"use client";

import { useEffect } from "react";

export default function ProviderNotificationBridge() {
  useEffect(() => {
    if (!window.location.pathname.startsWith("/list-service")) return;

    const originalFetch = window.fetch.bind(window);
    let pendingProvider: Record<string, any> | null = null;
    let pendingServices: number[] = [];
    let notifying = false;

    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const bodyText = typeof init?.body === "string" ? init.body : "";

      if (url.includes("/rest/v1/Providers") && init?.method === "POST") {
        try {
          const parsed = JSON.parse(bodyText);
          pendingProvider = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch {}
      }

      if (url.includes("/rest/v1/provider_services") && init?.method === "POST") {
        try {
          const parsed = JSON.parse(bodyText);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          pendingServices = rows.map((row: any) => Number(row.service_id)).filter(Number.isFinite);
        } catch {}
      }

      const response = await originalFetch(input, init);

      if (
        response.ok &&
        !notifying &&
        pendingProvider &&
        url.includes("/rest/v1/provider_services") &&
        init?.method === "POST"
      ) {
        notifying = true;
        const provider = pendingProvider;
        const serviceIds = [...pendingServices];
        pendingProvider = null;
        pendingServices = [];

        queueMicrotask(async () => {
          try {
            let serviceNames: string[] = [];
            if (serviceIds.length) {
              const params = new URLSearchParams({
                select: "name",
                id: `in.(${serviceIds.join(",")})`,
              });
              const serviceResponse = await originalFetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/services?${params.toString()}`,
                {
                  headers: {
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
                  },
                }
              );
              if (serviceResponse.ok) {
                const rows = await serviceResponse.json();
                serviceNames = rows.map((row: any) => row.name).filter(Boolean);
              }
            }

            await originalFetch("/api/admin/new-provider", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: [provider.name, provider.last_name].filter(Boolean).join(" "),
                businessName: provider.business_name,
                email: provider.email,
                phone: provider.phone,
                city: provider.city,
                state: provider.state,
                serviceMode: provider.service_mode,
                services: serviceNames,
              }),
            });
          } catch (error) {
            console.error("Provider admin notification failed:", error);
          } finally {
            notifying = false;
          }
        });
      }

      return response;
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
