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
    node.id = "youlistify-three-ways";
    categoriesSection.parentElement.insertBefore(node, categoriesSection);
    setMountNode(node);
    return () => node.remove();
  }, []);

  if (!mountNode) return null;

  const card: React.CSSProperties = {
    flex:"1 1 250px", minWidth:0, background:"#fff", border:"1px solid #e6e9f0",
    borderRadius:"22px", padding:"28px", textAlign:"left", boxShadow:"0 14px 36px rgba(28,35,67,.06)"
  };
  const number: React.CSSProperties = {
    display:"grid", placeItems:"center", width:"38px", height:"38px", borderRadius:"12px",
    background:"#f1efff", color:"#5b4df5", fontWeight:900, marginBottom:"18px"
  };
  const link: React.CSSProperties = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", minHeight:"44px", padding:"0 16px",
    borderRadius:"12px", background:"#5b4df5", color:"#fff", textDecoration:"none", fontWeight:800, marginTop:"10px"
  };

  return createPortal(
    <section style={{padding:"64px 20px",background:"#fafbff",borderTop:"1px solid #f0f1f5",borderBottom:"1px solid #f0f1f5"}}>
      <div style={{maxWidth:"1120px",margin:"0 auto"}}>
        <div style={{textAlign:"center",maxWidth:"760px",margin:"0 auto 34px"}}>
          <span style={{display:"inline-block",fontSize:"12px",fontWeight:900,letterSpacing:".12em",color:"#5b4df5",marginBottom:"10px"}}>THREE SIMPLE WAYS TO USE YOULISTIFY</span>
          <h2 style={{fontSize:"clamp(32px,5vw,52px)",lineHeight:1.06,letterSpacing:"-.04em",margin:"0 0 14px",color:"#101a38"}}>Find someone. Post what you need. Get found.</h2>
          <p style={{fontSize:"17px",lineHeight:1.65,color:"#667085",margin:0}}>Search people who are ready to work, post a job, gig or task and let people respond, or create your own service listing so customers can find you.</p>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:"18px"}}>
          <article style={card}>
            <span style={number}>01</span>
            <h3 style={{fontSize:"24px",margin:"0 0 10px",color:"#101a38"}}>Find a Service</h3>
            <p style={{color:"#667085",lineHeight:1.6,margin:"0 0 12px"}}>Search by service and location, see who is available, and contact the right person directly.</p>
            <a href="#top" style={link}>Search Services</a>
          </article>

          <article style={card}>
            <span style={number}>02</span>
            <h3 style={{fontSize:"24px",margin:"0 0 10px",color:"#101a38"}}>Post a Job, Gig or Task</h3>
            <p style={{color:"#667085",lineHeight:1.6,margin:"0 0 12px"}}>Tell people what you need and let interested people respond through YouListify.</p>
            <div style={{display:"flex",gap:"9px",flexWrap:"wrap"}}>
              <a href="/post-work" style={link}>Post Work Free</a>
              <a href="/work" style={{...link,background:"#fff",color:"#5b4df5",border:"1px solid #cfcdfc"}}>Browse Posts</a>
            </div>
          </article>

          <article style={card}>
            <span style={number}>03</span>
            <h3 style={{fontSize:"24px",margin:"0 0 10px",color:"#101a38"}}>List Your Services</h3>
            <p style={{color:"#667085",lineHeight:1.6,margin:"0 0 12px"}}>Create one simple listing showing what you do, your availability, pricing and how customers can reach you.</p>
            <a href="/list-service" style={link}>Create Your Listing</a>
          </article>
        </div>

        <p style={{textAlign:"center",margin:"24px 0 0",fontSize:"14px",color:"#7b8496"}}>Browse and search without an account. One YouListify account can be used to list services, post work and manage responses.</p>
      </div>
    </section>,
    mountNode
  );
}
