"use client";

import { FormEvent, useMemo, useState } from "react";

type Provider = {
  name: string;
  category: string;
  city: string;
  rating: number;
  reviews: number;
  response: string;
  initials: string;
  phone: string;
  specialties: string[];
};

const categories = [
  ["🔧","Handyman"],["🎧","DJ"],["🧹","House Cleaning"],["📦","Movers"],
  ["📸","Photographer"],["🎓","Tutor"],["🐾","Pet Care"],["🛠️","Contractor"]
];

const providers: Provider[] = [
  {name:"BrightSide Home Services",category:"Handyman",city:"Boynton Beach, FL",rating:4.9,reviews:127,response:"Usually answers in 3 min",initials:"BH",phone:"(555) 013-2048",specialties:["Furniture assembly","Minor repairs","Mounting"]},
  {name:"Pulse Event DJs",category:"DJ",city:"West Palm Beach, FL",rating:5.0,reviews:84,response:"Usually answers in 2 min",initials:"PD",phone:"(555) 013-5872",specialties:["Weddings","Parties","Corporate events"]},
  {name:"Fresh Start Cleaning",category:"House Cleaning",city:"Boca Raton, FL",rating:4.8,reviews:203,response:"Usually answers in 5 min",initials:"FS",phone:"(555) 013-9024",specialties:["Deep cleaning","Move-out cleaning","Recurring service"]},
  {name:"MoveQuick Local",category:"Movers",city:"Delray Beach, FL",rating:4.9,reviews:61,response:"Usually answers in 4 min",initials:"MQ",phone:"(555) 013-7731",specialties:["Local moves","Furniture moving","Same-day help"]}
];

export default function Home() {
  const [service,setService] = useState("");
  const [location,setLocation] = useState("");
  const [searched,setSearched] = useState(false);
  const [selected,setSelected] = useState<Provider|null>(null);

  const filtered = useMemo(() => {
    const s=service.trim().toLowerCase(), l=location.trim().toLowerCase();
    return providers.filter(p => {
      const ms=!s || p.category.toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || p.specialties.some(x=>x.toLowerCase().includes(s));
      const ml=!l || p.city.toLowerCase().includes(l);
      return ms && ml;
    });
  }, [service,location]);

  function runSearch(e?: FormEvent) {
    e?.preventDefault();
    setSearched(true);
    setTimeout(()=>document.getElementById("results")?.scrollIntoView({behavior:"smooth"}),50);
  }

  return <main>
    <header className="site-header">
      <a className="brand" href="#top"><span className="brand-mark">Y</span><span>You<span className="brand-l">L</span>istify</span></a>
      <nav><a href="#how">How it works</a><a href="#categories">Categories</a><a href="#results">Available now</a></nav>
      <a className="button button-small button-outline" href="#providers">List your service</a>
    </header>

    <section className="hero" id="top">
      <div className="hero-content">
        <div className="eyebrow"><span className="status-dot"/> Local professionals ready to work</div>
        <h1>Find the right person.<span>Call them in minutes.</span></h1>
        <p className="hero-subtitle">Search local services, see who is available, and connect directly—without long forms or waiting around.</p>
        <form className="search-panel" onSubmit={runSearch}>
          <label><span>What do you need?</span><div className="input-wrap"><b>⌕</b><input value={service} onChange={e=>setService(e.target.value)} placeholder="Handyman, DJ, cleaner..." /></div></label>
          <label><span>Where?</span><div className="input-wrap"><b>⌖</b><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="City or ZIP code" /></div></label>
          <button className="button button-primary search-button" type="submit">Search now</button>
        </form>
        <div className="trust-row"><span>✓ Direct contact</span><span>✓ Availability badges</span><span>✓ Local professionals</span></div>
      </div>

      <div className="hero-card">
        <div className="hero-card-top">
          <div className="avatar">AM</div><div><strong>Alex Morgan</strong><span>Home Services</span></div>
          <div className="available-pill"><span className="status-dot"/> Available now</div>
        </div>
        <div className="hero-card-photo"><div className="photo-symbol">🛠️</div></div>
        <div className="hero-card-info"><div><strong>★★★★★ 4.9</strong><span>96 reviews</span></div><button onClick={()=>setSelected(providers[0])}>View profile</button></div>
      </div>
    </section>

    <section className="section" id="categories">
      <div className="section-heading"><div><span className="section-kicker">Popular categories</span><h2>What can we help you get done?</h2></div><a href="#results">Browse available providers →</a></div>
      <div className="category-grid">
        {categories.map(([icon,name])=><button className="category-card" key={name} onClick={()=>{setService(name);setSearched(true);setTimeout(()=>document.getElementById("results")?.scrollIntoView({behavior:"smooth"}),50)}}><span className="category-icon">{icon}</span><strong>{name}</strong><span>Explore local options</span></button>)}
      </div>
    </section>

    <section className="section section-tint" id="results">
      <div className="section-heading"><div><span className="section-kicker">{searched?"Search results":"Ready when you are"}</span><h2>{searched?`${filtered.length} match${filtered.length===1?"":"es"} found`:"Available now near you"}</h2></div><span className="live-note"><span className="status-dot"/> Live preview</span></div>
      <div className="provider-grid">
        {(searched?filtered:providers.slice(0,3)).map(p=><article className="provider-card" key={p.name}>
          <div className="provider-cover"><span>{p.initials}</span><div className="available-pill"><span className="status-dot"/> Available now</div></div>
          <div className="provider-content"><span className="provider-category">{p.category}</span><h3>{p.name}</h3><p>⌖ {p.city}</p>
          <div className="provider-meta"><span>★ {p.rating.toFixed(1)} ({p.reviews})</span><span>{p.response}</span></div>
          <div className="provider-actions"><button className="button button-primary" onClick={()=>setSelected(p)}>View profile</button><button className="button button-light" onClick={()=>alert("Messaging will be enabled when provider accounts launch.")}>Message</button></div></div>
        </article>)}
        {searched && filtered.length===0 && <div className="empty-state"><span>⌕</span><h3>No preview matches yet</h3><p>Try another service or location. The full provider database is the next step.</p></div>}
      </div>
    </section>

    <section className="section" id="how">
      <div className="center-heading"><span className="section-kicker">Simple by design</span><h2>Search. Connect. Get it done.</h2><p>YouListify is designed to move people from searching to speaking with the right professional quickly.</p></div>
      <div className="steps-grid">
        <article><span>01</span><div className="step-icon">⌕</div><h3>Search what you need</h3><p>Choose a service and enter your location.</p></article>
        <article><span>02</span><div className="step-icon">✓</div><h3>See who is ready</h3><p>Compare profiles, ratings, specialties, and availability.</p></article>
        <article><span>03</span><div className="step-icon">☎</div><h3>Call and get it done</h3><p>Connect directly instead of submitting a request and waiting.</p></article>
      </div>
    </section>

    <section className="provider-cta" id="providers">
      <div><span className="section-kicker light">For local professionals</span><h2>Your own mini-site on YouListify.</h2><p>Create a profile, show your services, set your availability, and let nearby customers contact you directly.</p><div className="provider-benefits"><span>✓ Provider profile</span><span>✓ Availability control</span><span>✓ Direct customer contact</span></div></div>
      <div className="coming-card"><div className="brand-mark large">Y</div><h3>Provider accounts are next</h3><p>The next build connects YouListify to a real database so providers can create and manage their own profiles.</p><strong>Next milestone: Supabase + provider sign-up</strong></div>
    </section>

    <footer>
      <a className="brand footer-brand" href="#top"><span className="brand-mark">Y</span><span>You<span className="brand-l">L</span>istify</span></a>
      <p>Find the right person. Call them in minutes. Get the job done.</p>
      <div><a href="#how">How it works</a><a href="#categories">Categories</a><a href="#providers">List your service</a></div>
      <small>© {new Date().getFullYear()} YouListify. All rights reserved.</small>
    </footer>

    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}>
      <div className="profile-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={()=>setSelected(null)}>×</button>
        <div className="profile-head"><div className="avatar big">{selected.initials}</div><div><div className="available-pill"><span className="status-dot"/> Available now</div><h2>{selected.name}</h2><p>{selected.category} · {selected.city}</p></div></div>
        <div className="profile-rating">★ {selected.rating.toFixed(1)} · {selected.reviews} reviews</div>
        <div className="specialties">{selected.specialties.map(s=><span key={s}>{s}</span>)}</div>
        <p className="profile-copy">This previews the provider mini-site experience. Real providers will manage their photos, services, service areas, availability, phone, and reviews.</p>
        <div className="profile-actions"><a className="button button-primary" href={`tel:${selected.phone.replace(/\D/g,"")}`}>☎ Call {selected.phone}</a><button className="button button-light" onClick={()=>alert("Messaging will be enabled in the connected marketplace version.")}>Message</button></div>
      </div>
    </div>}
  </main>;
}
