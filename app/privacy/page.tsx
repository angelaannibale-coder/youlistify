import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | YouListify",
  description: "How YouListify collects, uses, and protects information.",
};

export default function PrivacyPage() {
  return (
    <main style={{minHeight:"100vh",background:"#fbfcff",color:"#101a38",fontFamily:'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <header style={{height:82,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5.3vw",background:"white",borderBottom:"1px solid #eef0f5"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:11,textDecoration:"none",color:"#101a38",fontSize:22,fontWeight:850}}><span style={{display:"grid",placeItems:"center",width:40,height:40,borderRadius:13,background:"#5b4df5",color:"white",fontWeight:900}}>Y</span>YouListify</a>
        <a href="/" style={{color:"#5b4df5",textDecoration:"none",fontWeight:750}}>Back to home</a>
      </header>
      <article style={{maxWidth:900,margin:"0 auto",padding:"64px 22px 80px",lineHeight:1.72}}>
        <div style={{color:"#5b4df5",fontSize:12,fontWeight:900,letterSpacing:'.12em',textTransform:"uppercase"}}>Privacy</div>
        <h1 style={{fontSize:"clamp(38px,6vw,64px)",letterSpacing:"-.04em",margin:"10px 0 10px"}}>Privacy Policy</h1>
        <p style={{color:"#667085",marginBottom:36}}>Effective August 24, 2026</p>
        <p>YouListify is designed to help people discover and contact independent service providers. This policy explains the information we collect, why we use it, and the choices available to you.</p>
        <h2>Information you provide</h2><p>We may collect information you submit when creating an account or listing, including your name, business name, email address, phone number, location, service information, profile and gallery photos, pricing information, availability, contact preferences, and other listing details. We also collect information you choose to send through forms, messages, suggestions, support requests, or future job, gig, and task features.</p>
        <h2>Information collected automatically</h2><p>When you use YouListify, we may receive basic technical and usage information such as device and browser information, IP address, pages viewed, referring pages, and interactions with the service. We may use cookies or similar technologies for sign-in, security, preferences, performance, and analytics.</p>
        <h2>How we use information</h2><p>We use information to operate and improve YouListify, create and display provider listings, enable accounts and direct contact features, respond to requests, prevent abuse, maintain security, understand how the service is used, and communicate about the service. If opportunity notifications are offered, providers will be able to control whether they receive them.</p>
        <h2>Public listing information</h2><p>Information you choose to publish in a provider listing may be visible to anyone and may be discoverable through search engines. Do not place sensitive personal information in a public listing. You can edit your listing through your account.</p>
        <h2>Service providers</h2><p>We may use trusted technology providers to host the site and database, authenticate users, store files, deliver email, provide analytics, and support other platform functions. They may process information only as needed to provide those services and subject to their own applicable terms and privacy obligations.</p>
        <h2>Sharing and sale of information</h2><p>We do not sell your personal information for money. We may share information when necessary to operate the service, comply with law, protect users or YouListify, investigate fraud or misuse, or in connection with a business transaction such as a merger, financing, or acquisition.</p>
        <h2>Data retention and security</h2><p>We retain information for as long as reasonably necessary to operate the service, meet legal obligations, resolve disputes, and protect the platform. We use reasonable safeguards, but no internet service can guarantee absolute security.</p>
        <h2>Your choices</h2><p>You may update listing information through your account and may opt out of non-essential marketing or opportunity notifications when those features are available. You may also request help regarding account or privacy matters through the Contact & Support page.</p>
        <h2>Children</h2><p>YouListify is not intended for children under 13, and we do not knowingly collect personal information from children under 13.</p>
        <h2>Changes to this policy</h2><p>We may update this policy as YouListify develops. The effective date above will be updated when material changes are made.</p>
        <div style={{marginTop:36,padding:22,border:"1px solid #e7eaf0",borderRadius:18,background:"white"}}><strong>Questions about privacy?</strong><br/><a href="/support" style={{color:"#5b4df5",fontWeight:800}}>Visit Contact &amp; Support</a></div>
      </article>
    </main>
  );
}
