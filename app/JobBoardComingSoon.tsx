"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";

export default function JobBoardComingSoon() {
  const [mountNode, setMountNode] = useState<Element | null>(null);
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("post");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const footer = document.querySelector("footer");
    if (!footer?.parentElement) return;
    const node = document.createElement("div");
    node.id = "job-board-coming-soon";
    footer.parentElement.insertBefore(node, footer);
    setMountNode(node);
    return () => node.remove();
  }, []);

  async function submitInterest(e: FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    setSending(true);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const label = interest === "browse" ? "Browse jobs/gigs/tasks" : "Post a job/gig/task";
    const { error } = await supabase.from("suggestions").insert({
      suggestion: `[JOB BOARD INTEREST] ${label}`,
      email: cleanEmail,
    });
    setSending(false);

    if (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  }

  if (!mountNode) return null;

  return createPortal(
    <section style={{padding:"64px 20px",background:"#f7f7ff",borderTop:"1px solid #e8e8f5"}}>
      <div style={{maxWidth:"980px",margin:"0 auto",background:"white",border:"1px solid #e6e7f0",borderRadius:"28px",padding:"clamp(28px,5vw,52px)",textAlign:"center",boxShadow:"0 18px 50px rgba(30,35,90,.07)"}}>
        <span style={{display:"inline-block",fontSize:"13px",fontWeight:800,letterSpacing:".12em",color:"#5b4df5",marginBottom:"12px"}}>COMING SOON</span>
        <h2 style={{fontSize:"clamp(32px,5vw,52px)",lineHeight:1.05,margin:"0 0 16px",color:"#111a3a"}}>Jobs, gigs & tasks on YouListify</h2>
        <p style={{maxWidth:"720px",margin:"0 auto 28px",fontSize:"18px",lineHeight:1.6,color:"#667085"}}>Soon you’ll be able to post what you need done — from a quick task or weekend gig to contract work or a job — and providers will be able to browse opportunities and respond.</p>
        {!sent ? (
          <form onSubmit={submitInterest} style={{maxWidth:"620px",margin:"0 auto"}}>
            <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"16px"}}>
              <button type="button" onClick={()=>setInterest("post")} style={{padding:"11px 16px",borderRadius:"999px",border:interest==="post"?"2px solid #5b4df5":"1px solid #d9dce7",background:interest==="post"?"#f0eeff":"white",fontWeight:700,cursor:"pointer"}}>I want to post work</button>
              <button type="button" onClick={()=>setInterest("browse")} style={{padding:"11px 16px",borderRadius:"999px",border:interest==="browse"?"2px solid #5b4df5":"1px solid #d9dce7",background:interest==="browse"?"#f0eeff":"white",fontWeight:700,cursor:"pointer"}}>I want to find work</button>
            </div>
            <div style={{display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"center"}}>
              <input aria-label="Email address" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email me when it launches" style={{flex:"1 1 280px",minWidth:0,padding:"15px 17px",borderRadius:"14px",border:"1px solid #d9dce7",fontSize:"16px"}} />
              <button type="submit" disabled={sending} style={{padding:"15px 22px",border:0,borderRadius:"14px",background:"#5b4df5",color:"white",fontWeight:800,fontSize:"16px",cursor:"pointer"}}>{sending?"Saving...":"Keep me posted"}</button>
            </div>
          </form>
        ) : (
          <div style={{fontSize:"19px",fontWeight:800,color:"#16803b",padding:"12px"}}>✓ You’re on the list. We’ll let you know when it’s ready.</div>
        )}
        <p style={{margin:"18px 0 0",fontSize:"14px",color:"#8a91a3"}}>Provider listings remain the main focus now. The opportunity board will open as the YouListify community grows.</p>
      </div>
    </section>,
    mountNode
  );
}
