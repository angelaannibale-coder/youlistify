"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function JobBoardComingSoon() {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const suggestionSection = document.querySelector(".suggestion-section");
    if (!suggestionSection?.parentElement) return;
    const node = document.createElement("div");
    node.id = "jobs-gigs-tasks-home";
    suggestionSection.parentElement.insertBefore(node, suggestionSection);
    setMountNode(node);
    return () => node.remove();
  }, []);

  if (!mountNode) return null;

  return createPortal(
    <section style={{padding:"64px 20px",background:"#f7f7ff",borderTop:"1px solid #e8e8f5"}}>
      <div style={{maxWidth:"980px",margin:"0 auto",background:"white",border:"1px solid #e6e7f0",borderRadius:"28px",padding:"clamp(28px,5vw,52px)",textAlign:"center",boxShadow:"0 18px 50px rgba(30,35,90,.07)"}}>
        <span style={{display:"inline-block",fontSize:"13px",fontWeight:800,letterSpacing:".12em",color:"#5b4df5",marginBottom:"12px"}}>NOW ON YOULISTIFY</span>
        <h2 style={{fontSize:"clamp(32px,5vw,52px)",lineHeight:1.05,margin:"0 0 16px",color:"#111a3a"}}>Jobs, Gigs & Tasks</h2>
        <p style={{maxWidth:"720px",margin:"0 auto 28px",fontSize:"18px",lineHeight:1.6,color:"#667085"}}>Need someone for a job, a freelance gig, or a quick task? Post what you need free during launch — or browse opportunities and respond directly.</p>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/work" style={{display:"inline-block",padding:"15px 24px",borderRadius:"14px",background:"#5b4df5",color:"white",textDecoration:"none",fontWeight:800,fontSize:"16px"}}>Browse Jobs, Gigs & Tasks</a>
          <a href="/post-work" style={{display:"inline-block",padding:"15px 24px",borderRadius:"14px",background:"white",color:"#5b4df5",textDecoration:"none",fontWeight:800,fontSize:"16px",border:"1px solid #cfcdfc"}}>Post Work Free</a>
        </div>
        <p style={{margin:"18px 0 0",fontSize:"14px",color:"#8a91a3"}}>One YouListify account can be used to post work, manage responses, and list your services.</p>
      </div>
    </section>,
    mountNode
  );
}
