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

  return createPortal(
    <section style={{padding:"68px 20px",background:"#fafbff",borderTop:"1px solid #f0f1f5",borderBottom:"1px solid #f0f1f5"}}>
      <div style={{maxWidth:"1080px",margin:"0 auto"}}>
        <div style={{textAlign:"center",maxWidth:"760px",margin:"0 auto 36px"}}>
          <span style={{display:"inline-block",fontSize:"12px",fontWeight:900,letterSpacing:".12em",color:"#5b4df5",marginBottom:"10px"}}>NEED SOMEONE?</span>
          <h2 style={{fontSize:"clamp(32px,5vw,50px)",lineHeight:1.06,letterSpacing:"-.04em",margin:"0 0 14px",color:"#101a38"}}>Two simple ways to find the right person.</h2>
          <p style={{fontSize:"17px",lineHeight:1.65,color:"#667085",margin:0}}>Search people who already list what they do, or post exactly what you need and let interested people respond.</p>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:"20px",alignItems:"stretch"}}>
          <article style={{flex:"1 1 360px",background:"#fff",border:"1px solid #e6e9f0",borderRadius:"24px",padding:"clamp(26px,4vw,38px)",boxShadow:"0 14px 36px rgba(28,35,67,.06)"}}>
            <span style={{display:"inline-block",fontSize:"12px",fontWeight:900,letterSpacing:".1em",color:"#5b4df5",marginBottom:"12px"}}>SEARCH SERVICES</span>
            <h3 style={{fontSize:"28px",margin:"0 0 12px",color:"#101a38"}}>Find someone who is ready to work.</h3>
            <p style={{color:"#667085",fontSize:"16px",lineHeight:1.65,margin:"0 0 18px"}}>Search by service and location, see profiles and availability, and contact people directly — no account required to search.</p>
            <a href="#top" style={actionLink}>Search Services</a>
          </article>

          <article style={{flex:"1 1 360px",background:"#fff",border:"1px solid #dcd8ff",borderRadius:"24px",padding:"clamp(26px,4vw,38px)",boxShadow:"0 14px 36px rgba(28,35,67,.06)"}}>
            <span style={{display:"inline-block",fontSize:"12px",fontWeight:900,letterSpacing:".1em",color:"#5b4df5",marginBottom:"12px"}}>JOBS · GIGS · TASKS</span>
            <h3 style={{fontSize:"28px",margin:"0 0 12px",color:"#101a38"}}>Post what you need.</h3>
            <p style={{color:"#667085",fontSize:"16px",lineHeight:1.65,margin:"0 0 16px"}}>Need someone for an ongoing job, freelance gig or one-time task? Create a post and let people respond through YouListify.</p>
            <div style={{background:"#f5f3ff",border:"1px solid #dedaff",borderRadius:"16px",padding:"16px 18px",margin:"0 0 18px"}}>
              <strong style={{display:"block",fontSize:"18px",color:"#101a38",marginBottom:"5px"}}>🎉 Post FREE for your first 3 months</strong>
              <span style={{display:"block",color:"#5f687b",lineHeight:1.5}}>Post as many jobs, gigs & tasks as you need. Then one simple yearly fee for unlimited posts.</span>
            </div>
            <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
              <a href="/post-work" style={actionLink}>Post FREE</a>
              <a href="/work" style={{...actionLink,background:"#fff",color:"#5b4df5",border:"1px solid #cfcdfc"}}>Browse Jobs, Gigs & Tasks</a>
            </div>
          </article>
        </div>

        <p style={{textAlign:"center",margin:"26px 0 0",fontSize:"15px",lineHeight:1.6,color:"#7b8496"}}>Want people to find you instead? Keep scrolling to <strong style={{color:"#5b4df5"}}>List Your Service</strong> and create your own YouListify listing.</p>
      </div>
    </section>,
    mountNode
  );
}
