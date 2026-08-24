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

      await supabase
        .from("Providers")
        .update({ user_id: user.id })
        .eq("email", user.email)
        .is("user_id", null);
    }

    linkListingToUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setTimeout(linkListingToUser, 0);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return null;
}
