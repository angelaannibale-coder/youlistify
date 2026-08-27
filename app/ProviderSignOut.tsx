"use client";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProviderSignOut() {
  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      style={{
        border: "1px solid #ddd",
        background: "white",
        color: "#374151",
        padding: "10px 16px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 600,
        whiteSpace: "nowrap"
      }}
    >
      Sign out
    </button>
  );
}
