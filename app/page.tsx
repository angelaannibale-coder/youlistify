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
service_mode?: string;
zip_code?: string;
};



const providers: Provider[] = [
  {name:"Alex Morgan",category:"Home Services",city:"Boynton Beach, FL",rating:4.9,reviews:96,response:"Usually answers in 3 min",initials:"AM",phone:"(555) 013-2048",specialties:["Minor repairs","Furniture assembly","Mounting"]},
  {name:"Pulse Event DJs",category:"Events",city:"West Palm Beach, FL",rating:5.0,reviews:84,response:"Usually answers in 2 min",initials:"PD",phone:"(555) 013-5872",specialties:["Weddings","Parties","Corporate events"]},
  {name:"Fresh Start Cleaning",category:"Cleaning",city:"Boca Raton, FL",rating:4.8,reviews:203,response:"Usually answers in 5 min",initials:"FS",phone:"(555) 013-9024",specialties:["Deep cleaning","Move-out cleaning","Recurring service"]}
];

export default function Home(){
  const [service,setService]=useState("");
  const [location,setLocation]=useState("");
  const [remoteSearch, setRemoteSearch] = useState(false);
  const [searched,setSearched]=useState(false);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const categories = useMemo(() => {
const categoryMap: Record<string, string> = {
"Home Services": "Home Repair & Improvement",
"Lawn & Outdoor": "Lawn, Garden & Outdoor",
"Moving": "Moving, Hauling & Delivery",
"Events": "Events & Entertainment",
"Technology": "Technology & Digital",
"Professional Services": "Business & Professional Services",
"Lessons & Tutoring": "Lessons, Coaching & Tutoring",
"Personal & Local Help": "Personal, Family & Local Help",
};

const names = Array.from(
new Set(
allServices
.map((item: any) => categoryMap[item.category] || item.category)
.filter(Boolean)
)
);

return names.map((name) => ["✦", name]);
}, [allServices]);
const [selectedCategory, setSelectedCategory] = useState("");
  const [selected,setSelected]=useState<Provider|null>(null);
  const [contactOpen,setContactOpen]=useState(false);
  const [contactName,setContactName]=useState("");
const [contactEmail,setContactEmail]=useState("");
const [contactMessage,setContactMessage]=useState("");
  const [dbProviders, setDbProviders] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
useEffect(() => {
async function checkAuth() {
const { data } = await supabase.auth.getUser();
setIsSignedIn(!!data.user);
}

checkAuth();
}, []);
async function handleSignOut() {
await supabase.auth.signOut();
setIsSignedIn(false);
}
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

useEffect(() => {
async function loadServices() {
const { data, error } = await supabase
.from("services")
.select("id, name, category")
.order("category", { ascending: true })
.order("name", { ascending: true });

if (error) {
console.error("Error loading services:", error);
return;
}

setAllServices(data || []);
}

loadServices();
}, []);
const searchableProviders: Provider[] = dbProviders.length
  ? dbProviders.map((p: any) => ({
      id: p.id,
      slug: `${(p.name || "provider").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${p.id}`,
    name: p.business_name || (p.name_display === "first" ? (p.name || "Provider") : p.name_display === "initial" ? `${p.name || "Provider"}${p.last_name ? " " + p.last_name.charAt(0) + "." : ""}` : ([p.name, p.last_name].filter(Boolean).join(" ") || "Provider")),
      category: p.category || "",
      city: [p.city, p.state].filter(Boolean).join(", "),
      service_mode: p.service_mode || "",
      zip_code: p.zip_code || "",
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
  const locationSuggestions = Array.from(
new Set(
searchableProviders
.map((p) =>
p.zip_code ? `${p.city} ${p.zip_code}` : p.city
)
.filter(Boolean)
)
);
  const filtered = useMemo(()=>{
    const s=service.trim().toLowerCase(), l=location.trim().toLowerCase();
    return searchableProviders.filter(p=>{
      const ms=!s || p.category.toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || p.specialties.some(x=>x.toLowerCase().includes(s));
      const mode = (p.service_mode || "").toLowerCase();

const localMatch =
!!l &&
(mode === "local" || mode === "both") &&
(
`${p.city} ${p.zip_code || ""}`
.toLowerCase()
.includes(l)
);

const remoteMatch =
remoteSearch &&
(mode === "remote" || mode === "both");

const ml = localMatch || remoteMatch;

return ms && ml;
    });
  },[service,location, remoteSearch, dbProviders]);

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
       {isSignedIn ? (
<>
<a className="sign-in" href="/dashboard">My Dashboard</a>
<button
type="button"
onClick={handleSignOut}
style={{
background: "none",
border: "none",
color: "#4f46e5",
fontWeight: "600",
cursor: "pointer",
}}
>
Sign out
</button>
</>
) : (
<a className="sign-in" href="/sign-in">Sign in</a>
)}
      </div>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow"><span className="green-dot"/> Local professionals ready to work</div>
        <h1>Find the right<br/>person.<br/><span>Call them in<br/>minutes.</span></h1>
        <p>Search local services, see who is available, and connect directly—without filling out long forms or waiting for multiple quotes.</p>

        <form className="search-card" onSubmit={runSearch}>
          <label style={{ position: "relative" }}>
<span>WHAT DO YOU NEED?</span>

<div className="input-shell">
<b>⌕</b>
<input
value={service}
onChange={(e) => {
setService(e.target.value);
setShowServiceSuggestions(true);
}}
onFocus={() => setShowServiceSuggestions(true)}
placeholder="Handyman, DJ, cleaner..."
/>
</div>

{showServiceSuggestions && service.trim() && (
<div
style={{
position: "absolute",
top: "100%",
left: 0,
right: 0,
zIndex: 20,
background: "white",
border: "1px solid #e6e9f0",
borderRadius: "14px",
marginTop: "6px",
maxHeight: "260px",
overflowY: "auto",
boxShadow: "0 12px 30px rgba(0,0,0,.12)",
}}
>
{allServices
.filter((item: any) =>
item.name
.toLowerCase()
.split(/\s+/)
.some((word: string) =>
word.startsWith(service.trim().toLowerCase())
)
)
.slice(0, 10)
.map((item: any) => (
<button
key={item.id}
type="button"
onClick={() => {
setService(item.name);
setShowServiceSuggestions(false);
}}
style={{
display: "block",
width: "100%",
textAlign: "left",
padding: "11px 14px",
border: 0,
background: "white",
cursor: "pointer",
}}
>
{item.name}
</button>
))}
</div>
)}
</label>
<label style={{ position: "relative" }}>
          
<span>WHERE?</span>
<div className="input-shell" style={{ position: "relative" }}>
<b>✦</b>
<input
value={location}
onChange={(e) => {
setLocation(e.target.value);
setShowLocationSuggestions(true);
}}
onFocus={() => setShowLocationSuggestions(true)}
placeholder="City or ZIP code"
/>
</div>
{showLocationSuggestions && location.trim() && (
<div
style={{
position: "absolute",
top: "100%",
left: 0,
right: 0,
zIndex: 20,
background: "white",
border: "1px solid #e6e9f0",
borderRadius: "14px",
marginTop: "6px",
padding: "10px 14px",
boxShadow: "0 12px 30px rgba(0,0,0,.12)",
}}
>
{locationSuggestions
.filter((loc) =>
loc.toLowerCase().includes(location.trim().toLowerCase())
)
.slice(0, 8)
.map((loc) => (
<button
key={loc}
type="button"
onClick={() => {
setLocation(loc);
setShowLocationSuggestions(false);
}}
style={{
display: "block",
width: "100%",
textAlign: "left",
padding: "10px 4px",
border: 0,
background: "white",
cursor: "pointer",
}}
>
{loc}
</button>
))}
</div>
)}
</label>

          <label
style={{
display: "flex",
alignItems: "center",
gap: "8px",
fontWeight: "600",
whiteSpace: "nowrap",
}}
>
<input
type="checkbox"
checked={remoteSearch}
onChange={(e) => setRemoteSearch(e.target.checked)}
/>
Remote / Online / Phone
</label>
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
      <div className="category-head"><h2>Browse services</h2><a href="#results">View all categories</a></div>
      <p>Find the type of help you need.</p>
      <div className="category-row">
        {categories.map(([icon,name])=><button key={name} className="category"onClick={() => setSelectedCategory(name)}> 
          <span className="category-icon">{icon}</span><span>{name}</span>
        </button>)}
      </div>
      {selectedCategory && (
<div style={{ marginTop: "36px" }}>
<h3 style={{ marginBottom: "18px" }}>{selectedCategory}</h3>

<div
style={{
display: "flex",
flexWrap: "wrap",
gap: "10px",
}}
>
{allServices
.filter((item: any) => {
const categoryMap: Record<string, string> = {
"Home Services": "Home Repair & Improvement",
"Lawn & Outdoor": "Lawn, Garden & Outdoor",
"Moving": "Moving, Hauling & Delivery",
"Events": "Events & Entertainment",
"Technology": "Technology & Digital",
"Professional Services": "Business & Professional Services",
"Lessons & Tutoring": "Lessons, Coaching & Tutoring",
"Personal & Local Help": "Personal, Family & Local Help",
};

return (
(categoryMap[item.category] || item.category) ===
selectedCategory
);
})
.map((item: any) => (
<button
key={item.id}
type="button"
onClick={() => {
setService(item.name);
document
.getElementById("top")
?.scrollIntoView({ behavior: "smooth" });
}}
style={{
padding: "10px 14px",
borderRadius: "999px",
border: "1px solid #e6e9f0",
background: "white",
cursor: "pointer",
fontWeight: "600",
}}
>
{item.name}
</button>
))}
</div>
</div>
)}
    </section>

    <section className="results" id="results">
      <div className="section-title">
        <div><span className="kicker">Ready when you are</span><h2>{searched?`${filtered.length} match${filtered.length===1?"":"es"} found`:"Available now near you"}</h2></div>
        <span className="live"><span className="green-dot"/> Live preview</span>
      </div>
      <div className="provider-grid">
        {(searched?filtered:providers).map(p=><article className="provider" key={p.id ?? p.slug ?? p.name}>
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
      <div className="cta-card">
<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
<div className="brand-icon big">Y</div>
<span className="brand-word">
<span>You</span><span className="capital-l">L</span><span>istify</span>
</span>
</div>

<h3>One simple listing. Everything customers need to reach you.</h3>
<p>Get found. Get contacted. Get to work.</p>
</div>
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
