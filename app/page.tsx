"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Provider = {
 id?:number;
 slug?: string;
  name:string; category:string; city:string; rating:number; reviews:number;
  response:string; initials:string; phone:string; email?:string; specialties:string[];
available_now?: boolean;
  contact_call?: boolean;
contact_text?: boolean;
contact_email?: boolean;
contact_youlistify?: boolean;
pricing_methods?: string[];
starting_price?: number | null;
flat_price?: number | null;
};

const categories = [
  ["⌂","Home Services"],["✧","Cleaning"],["⌕","Handyman"],["▣","Moving"],
  ["□","Events"],["♡","Wellness"],["···","More"]
];

const providers: Provider[] = [
  {name:"Alex Morgan",category:"Home Services",city:"Boynton Beach, FL",rating:4.9,reviews:96,response:"Usually answers in 3 min",initials:"AM",phone:"(555) 013-2048",specialties:["Minor repairs","Furniture assembly","Mounting"]},
  {name:"Pulse Event DJs",category:"Events",city:"West Palm Beach, FL",rating:5.0,reviews:84,response:"Usually answers in 2 min",initials:"PD",phone:"(555) 013-5872",specialties:["Weddings","Parties","Corporate events"]},
  {name:"Fresh Start Cleaning",category:"Cleaning",city:"Boca Raton, FL",rating:4.8,reviews:203,response:"Usually answers in 5 min",initials:"FS",phone:"(555) 013-9024",specialties:["Deep cleaning","Move-out cleaning","Recurring service"]}
];

export default function Home(){
  const [service,setService]=useState("");
  const [location,setLocation]=useState("");
  const [searched,setSearched]=useState(false);
  const [selected,setSelected]=useState<Provider|null>(null);
  const [contactOpen,setContactOpen]=useState(false);
  const [contactName,setContactName]=useState("");
const [contactEmail,setContactEmail]=useState("");
const [contactMessage,setContactMessage]=useState("");
  const [dbProviders, setDbProviders] = useState<any[]>([]);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

useEffect(() => {
  async function loadProviders() {
    const { data, error } = await supabase
      .from("Providers")
      .select(`
*,
provider_services (
services (
name
)
)
`);

    if (error) {
      console.error("Error loading providers:", error);
      return;
    }

    setDbProviders(data || []);
  }

  loadProviders();
}, []);
const searchableProviders: Provider[] = dbProviders.length
  ? dbProviders.map((p: any) => ({
      id: p.id,
      slug: `${(p.name || "provider").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${p.id}`,
    name: p.business_name || (p.name_display === "first" ? (p.name || "Provider") : p.name_display === "initial" ? `${p.name || "Provider"}${p.last_name ? " " + p.last_name.charAt(0) + "." : ""}` : ([p.name, p.last_name].filter(Boolean).join(" ") || "Provider")),
      category: p.category || "",
      city: [p.city, p.state].filter(Boolean).join(", "),
      rating: 0,
      reviews: 0,
      response: p.bio || "",
      initials: (p.name || "P")
        .split(" ")
        .map((x: string) => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      phone: p.phone || "",
    email: p.email || "",
    available_now: p.available_now ?? false,
    contact_call: p.contact_call ?? false,
contact_text: p.contact_text ?? false,
contact_email: p.contact_email ?? false,
contact_youlistify: p.contact_youlistify ?? false,
pricing_methods: p.pricing_methods || [],
starting_price: p.starting_price ?? null,
flat_price: p.flat_price ?? null,
      specialties:
p.provider_services?.map((ps: any) => ps.services?.name).filter(Boolean) || [],
    }))
  : providers;
  const filtered = useMemo(()=>{
    const s=service.trim().toLowerCase(), l=location.trim().toLowerCase();
    return searchableProviders.filter(p=>{
      const ms=!s || p.category.toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || p.specialties.some(x=>x.toLowerCase().includes(s));
      const ml=!l || p.city.toLowerCase().includes(l);
      return ms && ml;
    });
  },[service,location, dbProviders]);

  function runSearch(e?:FormEvent){
    e?.preventDefault();
    setSearched(true);
    setTimeout(()=>document.getElementById("results")?.scrollIntoView({behavior:"smooth"}),50);
  }
async function sendProviderMessage() {
if (!selected?.id) {
alert("Unable to identify this provider.");
return;
}

if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
alert("Please complete your name, email, and message.");
return;
}
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(contactEmail.trim())) {
alert("Please enter a valid email address.");
return;
}
const { data, error } = await supabase.functions.invoke(
"send-provider-message",
{
body: {
providerId: selected.id,
customerName: contactName,
customerEmail: contactEmail,
message: contactMessage,
},
}
);

if (error) {
console.error(error);
alert("Your message could not be sent. Please try again.");
return;
}

alert("Message sent!");
setContactName("");
setContactEmail("");
setContactMessage("");
setContactOpen(false);
}
  return <main>
  
  
    <header className="topbar">
      <a className="brand" href="#top" aria-label="YouListify home">
        <span className="brand-icon">Y</span>
        <span className="brand-word"><span>You</span><span className="capital-l">L</span><span>istify</span></span>
      </a>
      <nav className="nav">
        <a href="#how">How it works</a>
        <a href="#categories">Categories</a>
        <a href="#results">Available now</a>
      </nav>
      <div className="header-actions">
        <a className="list-link" href="/list-service">List your service</a>
       <a className="sign-in" href="/sign-in">Sign in</a>
      </div>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow"><span className="green-dot"/> Local professionals ready to work</div>
        <h1>Find the right<br/>person.<br/><span>Call them in<br/>minutes.</span></h1>
        <p>Search local services, see who is available, and connect directly—without filling out long forms or waiting for multiple quotes.</p>

        <form className="search-card" onSubmit={runSearch}>
          <label><span>WHAT DO YOU NEED?</span><div className="input-shell"><b>⌕</b><input value={service} onChange={e=>setService(e.target.value)} placeholder="Handyman, DJ, cleaner..." /></div></label>
          <label><span>WHERE?</span><div className="input-shell"><b>⌖</b><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="City or ZIP code" /></div></label>
          <button type="submit" className="search-btn">Search now</button>
        </form>

        <div className="trust"><span>✓ Direct contact</span><span>✓ Availability badges</span><span>✓ Local professionals</span></div>
      </div>

      <div className="profile-card">
        <div className="profile-top">
          <div className="avatar">AM</div>
          <div className="profile-title"><strong>Alex Morgan</strong><span>Home Services</span></div>
          <div className="availability"><span className="green-dot"/> Available now</div>
        </div>
        <div className="profile-image"><div className="tool-icon">🛠️</div></div>
        <div className="profile-bottom">
          <div className="rating"><strong>★★★★★ 4.9</strong><span>Based on 96 reviews</span></div>
          <button onClick={()=>setSelected(providers[0])}>☎ Call now</button>
        </div>
      </div>
    </section>

    <section className="categories" id="categories">
      <div className="category-head"><h2>Popular categories</h2><a href="#results">View all categories</a></div>
      <div className="category-row">
        {categories.map(([icon,name])=><button key={name} className="category" onClick={()=>{setService(name==="More"?"":name);setSearched(true);setTimeout(()=>document.getElementById("results")?.scrollIntoView({behavior:"smooth"}),50)}}>
          <span className="category-icon">{icon}</span><span>{name}</span>
        </button>)}
      </div>
    </section>

    <section className="results" id="results">
      <div className="section-title">
        <div><span className="kicker">Ready when you are</span><h2>{searched?`${filtered.length} match${filtered.length===1?"":"es"} found`:"Available now near you"}</h2></div>
        <span className="live"><span className="green-dot"/> Live preview</span>
      </div>
      <div className="provider-grid">
        {(searched?filtered:providers).map(p=><article className="provider" key={p.name}>
         <div className="provider-visual">
<span>{p.initials}</span>
{p.available_now && (
<div className="availability">
<span className="green-dot" /> Available now
</div>
)}
</div>
          <div className="provider-body">
{p.specialties?.length > 0 && (
<div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
{[...new Set(p.specialties)].map((service: string) => (
<span
key={service}
style={{
background: "#f3f4f6",
borderRadius: "999px",
padding: "6px 10px",
fontSize: "13px",
}}
>
{service}
</span>
))}
</div>
)}

            <span className="tag">{p.category}</span><h3>{p.name}</h3><p>⌖ {p.city}</p><div className="meta"><span>★ {p.rating.toFixed(1)} ({p.reviews})</span><span>{p.response}</span></div>
          {p.pricing_methods && p.pricing_methods.length > 0 && (
<div className="pricing-display">
{p.pricing_methods.includes("hourly") && (
  <span>{p.starting_price != null ? `$${p.starting_price}/hour` : "Hourly rate"} | </span>
)}

{p.pricing_methods.includes("flat") && (
<span>{p.flat_price != null ? `Flat rate: $${p.flat_price}` : "Flat rate"} | </span>
)}

{p.pricing_methods.includes("contact") && (
<span>Contact for pricing</span>
)}
</div>
)}
          <div className="provider-actions"><button onClick={()=>setSelected(p)}>View profile</button>{p.contact_youlistify && (
<button
className="secondary"
onClick={() => {
setSelected(p);
setContactOpen(true);
}}
>
Message
</button>
)}</div></div>
        </article>)}
        {searched && filtered.length===0 && <div className="empty"><h3>No preview matches yet</h3><p>Try a different service or location.</p></div>}
      </div>
    </section>

    <section className="how" id="how">
      <div className="center-head"><span className="kicker">Simple by design</span><h2>Search. Connect. Get it done.</h2><p>YouListify is designed to move people from searching to speaking with the right professional quickly.</p></div>
      <div className="steps">
        <article><span>01</span><h3>Search what you need</h3><p>Choose a service and enter your location.</p></article>
        <article><span>02</span><h3>See who is ready</h3><p>Compare profiles, ratings, specialties, and availability.</p></article>
        <article><span>03</span><h3>Call and get it done</h3><p>Connect directly instead of submitting a request and waiting.</p></article>
      </div>
    </section>

    <section className="provider-cta" id="providers">
      <div><span className="kicker light">For local professionals</span><h2>Your own mini-site on YouListify.</h2><p>Create a profile, show your services, set your availability, and let nearby customers contact you directly.</p></div>
      <div className="cta-card"><div className="brand-icon big">Y</div><h3>Provider accounts are next</h3><p>Next build: real provider sign-up, profile editing, availability, and search powered by a database.</p></div>
    </section>

    <footer>
      <a className="brand" href="#top"><span className="brand-icon">Y</span><span className="brand-word"><span>You</span><span className="capital-l">L</span><span>istify</span></span></a>
      <p>Find the right person. Call them in minutes. Get the job done.</p>
      <small>© {new Date().getFullYear()} YouListify. All rights reserved.</small>
    </footer>

    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <button className="close" onClick={()=>setSelected(null)}>×</button>
        <div className="modal-head"><div className="avatar large">{selected.initials}</div><div>{selected.available_now && (
<div className="availability"><span className="green-dot"/> Available now</div>
)}<h2>{selected.name}</h2><p>{selected.category} · {selected.city}</p></div></div>
        <div className="modal-rating">★ {selected.rating.toFixed(1)} · {selected.reviews} reviews</div>
        {selected.pricing_methods && selected.pricing_methods.length > 0 && (
<div className="pricing-display" style={{ marginTop: "10px", marginBottom: "10px" }}>
{selected.pricing_methods.includes("hourly") && selected.starting_price != null && (
<span>${selected.starting_price}/hour | </span>
)}

{selected.pricing_methods.includes("flat") && selected.flat_price != null && (
<span>Flat rate: ${selected.flat_price} | </span>
)}

{selected.pricing_methods.includes("contact") && (
<span>Contact for pricing</span>
)}
</div>
)}
        <div className="chips">{[...new Set(selected.specialties)].map((s: string)=><span key={s}>{s}</span>)}</div>
        <p className="modal-copy">{selected.response || "No description provided yet."}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
{selected.contact_call && selected.phone && (
<a className="call-action" href={`tel:${selected.phone.replace(/\D/g,"")}`}>
☎ Call {selected.phone}
</a>
)}

{selected.contact_text && selected.phone && (
<a className="call-action" href={`sms:${selected.phone.replace(/\D/g,"")}`}>
💬 Text
</a>
)}

{selected.contact_email && selected.email && (
<a className="call-action" href={`mailto:${selected.email}`}>
✉ Email
</a>
)}

{selected.contact_youlistify && (
<button
className="call-action"
type="button"
onClick={() => setContactOpen(true)}
>
✉ Contact through YouListify
</button>
)}
<button
className="call-action"
type="button"
onClick={async () => {
const url = `https://youlistify.com/provider/${selected.slug}`;
if (navigator.share) {
await navigator.share({
title: `${selected.name} on YouListify`,
url,
});
} else {
await navigator.clipboard.writeText(url);
alert("Profile link copied!");
}
}}
>
↗ Share profile
</button>
</div>
    <a
href={`/provider/${selected.slug}`}
className="call-action"
style={{
display: "block",
width: "100%",
textAlign: "center",
marginTop: "14px",
fontSize: "17px",
fontWeight: "700",
textDecoration: "none",
}}
>
View Full Listing
</a> 
     
      </div>
    </div>}
    {contactOpen && selected && (
<div className="modal-backdrop" onClick={() => setContactOpen(false)}>
<div className="modal" onClick={(e) => e.stopPropagation()}>
<button className="close" onClick={() => setContactOpen(false)}>×</button>

<h2>Contact {selected.name}</h2>
<p>Send a private message through YouListify.</p>

<input
type="text"
placeholder="Your name"
value={contactName}
onChange={(e) => setContactName(e.target.value)}
/>

<input
type="email"
placeholder="Your email"
value={contactEmail}
onChange={(e) => setContactEmail(e.target.value)}
/>

<textarea
placeholder="Your message"
value={contactMessage}
onChange={(e) => setContactMessage(e.target.value)}
></textarea>

<button className="call-action" type="button" onClick={sendProviderMessage}>
Send message
</button>
</div>
</div>
)}
  </main>
}
