"use client";

export default function SampleProviderPage() {
  const sampleNotice = () => alert("This is a sample YouListify profile. Real provider listings let customers contact providers directly and share their profile link.");

  return (
    <main style={{minHeight:"100vh",background:"#f6f7fb",padding:"28px 16px 48px"}}>
      <div style={{maxWidth:760,margin:"0 auto"}}>
        <a href="/" style={{color:"#4f46e5",fontWeight:700,textDecoration:"none"}}>← Back to YouListify</a>
        <div style={{background:"white",borderRadius:28,padding:"clamp(22px,5vw,34px)",marginTop:18,boxShadow:"0 18px 50px rgba(0,0,0,.08)"}}>
          <div style={{display:"block",background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",padding:"12px 16px",borderRadius:14,fontSize:14,fontWeight:900,textAlign:"center",letterSpacing:".05em",boxShadow:"0 8px 20px rgba(79,70,229,.2)"}}>SAMPLE PROFILE · DEMO ONLY</div>
          <div style={{display:"flex",alignItems:"center",gap:18,marginTop:18,flexWrap:"wrap"}}>
            <div style={{width:86,height:86,borderRadius:24,background:"linear-gradient(135deg,#5b5bf7,#8b5cf6)",color:"white",display:"grid",placeItems:"center",fontSize:28,fontWeight:800}}>AM</div>
            <div><h1 style={{margin:0,fontSize:"clamp(34px,8vw,46px)"}}>Alex Morgan</h1><p style={{color:"#667085",margin:"7px 0"}}>Handyman · Pittsburgh, PA</p><span style={{background:"#ecfdf3",color:"#15803d",padding:"6px 11px",borderRadius:999,fontWeight:700}}>● Available now</span></div>
          </div>
          <section style={{marginTop:28}}><h2>About</h2><p style={{color:"#4b5563",lineHeight:1.7}}>Reliable handyman help for everyday repairs, furniture assembly, wall mounting, shelving, small home projects and punch-list work. Clear communication, flexible scheduling and straightforward pricing.</p></section>
          <section style={{marginTop:24}}><h2>Services</h2><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{["Minor repairs","Furniture assembly","TV & wall mounting","Shelving","Door adjustments","Small home projects"].map(x=><span key={x} style={{background:"#f3f4f6",padding:"8px 12px",borderRadius:999}}>{x}</span>)}</div></section>
          <section style={{marginTop:24}}><h2>Pricing</h2><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><span style={{background:"#f5f3ff",padding:"9px 12px",borderRadius:10,fontWeight:700}}>Starting at $75/hour</span><span style={{background:"#f5f3ff",padding:"9px 12px",borderRadius:10,fontWeight:700}}>Flat-rate jobs available</span></div></section>
          <section style={{marginTop:24}}><h2>Availability</h2><p style={{color:"#4b5563"}}>Weekday and weekend appointments available. Same-day availability may be offered for smaller jobs.</p></section>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",marginTop:28}}>
            {['☎ Call','💬 Text','✉ Email','✉ Contact through YouListify'].map(x=><button key={x} onClick={sampleNotice} style={{background:"#4f46e5",color:"white",padding:"12px 16px",borderRadius:10,border:0,fontWeight:700}}>{x}</button>)}
            <button onClick={sampleNotice} style={{background:"#f5f3ff",color:"#4f46e5",padding:"12px 16px",borderRadius:10,border:"1px solid #ddd6fe",fontWeight:700}}>🔗 Copy Profile Link</button>
          </div>
          <div style={{marginTop:32,padding:20,borderRadius:18,background:"#faf9ff",textAlign:"center"}}><strong>Example of a full YouListify provider profile</strong><p style={{color:"#667085",lineHeight:1.6}}>Providers can show their services, pricing, availability and contact options in one shareable profile.</p><a href="/list-service" style={{display:"inline-block",background:"#5b4df5",color:"white",padding:"12px 18px",borderRadius:11,textDecoration:"none",fontWeight:800}}>Create Your Listing</a></div>
        </div>
      </div>
    </main>
  );
}
