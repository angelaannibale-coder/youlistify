"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type Provider = {
  id: number; name: string | null; last_name: string | null; business_name: string | null;
  email: string | null; phone: string | null; city: string | null; state: string | null;
  bio: string | null; name_display?: string | null; user_id: string | null;
};

export default function DashboardPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { window.location.href = "/sign-in"; return; }

      const selectFields = "id,name,last_name,business_name,email,phone,city,state,bio,name_display,user_id";
      const { data: owned } = await supabase.from("Providers").select(selectFields).eq("user_id", session.user.id).maybeSingle();
      if (owned) { setProvider(owned as Provider); setLoading(false); return; }

      // Claiming is performed server-side. The server verifies the Supabase session,
      // then only connects one unclaimed listing whose email exactly matches the authenticated email.
      try {
        const response = await fetch("/api/claim-listing", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const result = await response.json();
        if (response.ok && result.provider) {
          setProvider(result.provider as Provider);
          setLoading(false);
          return;
        }
        if (response.status === 409) {
          setMessage("We found more than one unclaimed listing using this email. Please contact YouListify support so we can safely connect the correct listing.");
        } else if (response.status === 500 && result.error === "Server configuration incomplete") {
          setMessage("Your account is signed in, but listing recovery is not fully configured yet. Please contact YouListify support.");
        } else {
          setMessage("We couldn't find a listing connected to this email. If you already created a listing, make sure you're signed in with the same email address you used on the listing. If you need help recovering it, contact YouListify support.");
        }
      } catch {
        setMessage("We couldn't connect your listing right now. Please try again or contact YouListify support.");
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  async function handleSignOut() { await supabase.auth.signOut(); window.location.href = "/"; }
  if (loading) return <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>Connecting your listing...</main>;

  return <main style={{minHeight:"100vh",background:"#f8f8fb",padding:"40px 20px",fontFamily:"Arial, sans-serif"}}>
    <div style={{maxWidth:"900px",margin:"0 auto",background:"white",borderRadius:"24px",padding:"36px",boxShadow:"0 10px 35px rgba(0,0,0,.08)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"20px",flexWrap:"wrap",marginBottom:"28px"}}>
        <div><div style={{color:"#5b4cf0",fontWeight:"700",marginBottom:"8px"}}>YOULISTIFY PROVIDER</div><h1 style={{fontSize:"40px",margin:0,color:"#182033"}}>My Dashboard</h1></div>
        {provider && <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}><a href="/dashboard/edit" style={{background:"#4f46e5",color:"white",padding:"12px 18px",borderRadius:"10px",textDecoration:"none",fontWeight:"600"}}>Edit My Listing</a><a href={`/provider/${provider.id}`} style={{background:"#4f46e5",color:"white",padding:"12px 18px",borderRadius:"10px",textDecoration:"none",fontWeight:"600"}}>View My Profile</a></div>}
      </div>
      {message && <div style={{padding:"18px",borderRadius:"12px",background:"#fff7ed",marginBottom:"24px",lineHeight:1.5}}>{message}</div>}
      {provider && <><h2 style={{color:"#182033"}}>Welcome, {provider.name || "Provider"}</h2><p style={{color:"#667085",marginBottom:"28px"}}>This is where you’ll manage how your YouListify listing appears.</p><div style={{display:"grid",gap:"16px",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))"}}><div style={{border:"1px solid #eee",borderRadius:"16px",padding:"20px"}}><strong>Listing name</strong><div style={{marginTop:"8px",color:"#667085"}}>{provider.business_name || provider.name || "Not added"}</div></div><div style={{border:"1px solid #eee",borderRadius:"16px",padding:"20px"}}><strong>Location</strong><div style={{marginTop:"8px",color:"#667085"}}>{[provider.city,provider.state].filter(Boolean).join(", ") || "Not added"}</div></div><div style={{border:"1px solid #eee",borderRadius:"16px",padding:"20px"}}><strong>Email</strong><div style={{marginTop:"8px",color:"#667085"}}>{provider.email || "Not added"}</div></div><div style={{border:"1px solid #eee",borderRadius:"16px",padding:"20px"}}><strong>Phone</strong><div style={{marginTop:"8px",color:"#667085"}}>{provider.phone || "Not added"}</div></div></div><div style={{marginTop:"28px",padding:"22px",borderRadius:"16px",background:"#f7f6ff"}}><strong>Name display</strong><p style={{marginBottom:0,color:"#667085"}}>{provider.name_display === "initial" ? "First name + last initial" : provider.name_display === "first" ? "First name only" : "Full name"}</p></div></>}
      <a href="/" style={{display:"inline-block",marginTop:"28px",color:"#4f46e5",textDecoration:"none",fontWeight:"600"}}>← Back to YouListify</a><button onClick={handleSignOut} style={{display:"block",marginTop:"18px",border:"1px solid #ddd",background:"white",padding:"12px 18px",borderRadius:"10px",cursor:"pointer",fontWeight:"600"}}>Sign Out</button>
    </div>
  </main>;
}
