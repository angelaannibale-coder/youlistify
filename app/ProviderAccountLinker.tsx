"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProviderAccountLinker() {
  useEffect(() => {
    async function linkListingToUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id || !user.email) return;

      const { error } = await supabase.rpc("claim_provider_listing");
      if (error) console.error("Could not securely link provider listing:", error);
    }

    linkListingToUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setTimeout(linkListingToUser, 0);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return null;
}
