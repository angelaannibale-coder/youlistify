"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function JobBoardComingSoon() {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const categoriesSection = document.querySelector("#categories");
    if (!categoriesSection?.parentElement) return;
    const node = document.createElement("div");
    node.id = "youlistify-find-or-post";
    categoriesSection.parentElement.insertBefore(node, categoriesSection);
    setMountNode(node);
    return () => node.remove();
  }, []);

  if (!mountNode) return null;

  const actionLink: React.CSSProperties = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", minHeight:"48px", padding:"0 20px",
    borderRadius:"13px", background:"#5b4df5", color:"#fff", textDecoration:"none", fontWeight:800
  };
  const card: React.CSSProperties = {
    flex:"1 1 290px", background:"#fff", border:"1px solid #e6e9f0", borderRadius:"24px",
    padding:"clamp(24px,3vw,34px)", boxShadow:"0 14px 36px rgba(28,35,67,.06)"
  };
  const kicker: React.CSSProperties = {
    display:"inline-block", fontSize:"12px", fontWeight:900, letterSpacing:".1em", color:"#5b4df5", marginBottom:"12px"
  };

  return createPortal(
    <section style={{padding:"68px 20px",background:"#fafbff",borderTop:"1px solid #f0f1f5",borderBottom:"1px solid #f0f1f5"}}>
      <div style={{maxWidth:"1120px",margin:"0 auto"}}>
        <div style={{textAlign:"center",maxWidth:"790px",margin:"0 auto 36px"}}>
          <span style={{display:"inline-block",fontSize:"12px",fontWeight:900,letterSpacing:".12em",color:"#5b4df5",marginBottom:"10px"}}>THREE SIMPLE WAYS TO USE YOULISTIFY</span>
          <h2 style={{fontSize:"clamp(32px,5vw,50px)",lineHeight:1.06,letterSpacing:"-.04em",margin:"0 0 14px",color:"#101a38"}}>Find someone. Post what you need. Get found.</h2>
          <p style={{fontSize:"17px",lineHeight:1.65,color:"#667085",margin:0}}>Search people who are ready to work, post exactly what you need, or list your own service so customers can find you.</p>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:"18px",alignItems:"stretch"}}>
          <article style={card}>
            <span style={kicker}>SEARCH SERVICES</span>
            <h3 style={{fontSize:"26px",margin:"0 0 12px",color:"#101a38"}}>Find the right person.</h3>
            <p style={{color:"#667085",fontSize:"16px",lineHeight:1.65,margin:"0 0 18px"}}>Search by service and location, see profiles and availability, and contact people directly. No account required to search.</p>
            <a href="#top" style={actionLink}>Search Services</a>
          </article>

          <article style={{...card,border:"1px solid #dcd8ff"}}>
            <span style={kicker}>JOBS · GIGS · TASKS</span>
            <h3 style={{fontSize:"26px",margin:"0 0 12px",color:"#101a38"}}>Post what you need.</h3>
            <p style={{color:"#667085",fontSize:"16px",lineHeight:1.65,margin:"0 0 16px"}}>Need someone for an ongoing job, freelance gig or one-time task? Create a post and let people respond.</p>
            <div style={{background:"#f5f3ff",border:"1px solid #dedaff",borderRadius:"16px",padding:"14px 16px",margin:"0 0 18px"}}>
              <strong style={{display:"block",fontSize:"17px",color:"#101a38",marginBottom:"5px"}}>🎉 Post FREE for your first 3 months</strong>
              <span style={{display:"block",fontSize:"14px",color:"#5f687b",lineHeight:1.5}}>Then one simple yearly fee for unlimited posts.</span>
            </div>
            <div style={{display:"flex",gap:"9px",flexWrap:"wrap"}}>
              <a href="/post-work" style={actionLink}>Post FREE</a>
              <a href="/work" style={{...actionLink,background:"#fff",color:"#5b4df5",border:"1px solid #cfcdfc"}}>Browse Posts</a>
            </div>
          </article>

          <article style={card}>
            <span style={kicker}>LIST YOUR SERVICE</span>
            <h3 style={{fontSize:"26px",margin:"0 0 12px",color:"#101a38"}}>Let customers find you.</h3>
            <p style={{color:"#667085",fontSize:"16px",lineHeight:1.65,margin:"0 0 18px"}}>Create one simple listing showing what you do, your availability, pricing and how customers can reach you.</p>
            <a href="/list-service" style={actionLink}>Create Your Listing</a>
          </article>
        </div>
      </div>
    </section>,
    mountNode
  );
}
