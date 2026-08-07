"use client";

import { FormEvent, useMemo, useState } from "react";

type Provider = {
  name:string; category:string; city:string; rating:number; reviews:number;
  response:string; initials:string; phone:string; specialties:string[];
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

  const filtered = useMemo(()=>{
    const s=service.trim().toLowerCase(), l=location.trim().toLowerCase();
    return providers.filter(p=>{
      const ms=!s || p.category.toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || p.specialties.some(x=>x.toLowerCase().includes(s));
      const ml=!l || p.city.toLowerCase().includes(l);
      return ms && ml;
    });
  },[service,location]);

  function runSearch(e?:FormEvent){
    e?.preventDefault();
    setSearched(true);
    setTimeout(()=>document.getElementById("results")?.scrollIntoView({behavior:"smooth"}),50);
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
        <a className="list-link" href="#providers">List your service</a>
        <button className="sign-in" onClick={()=>alert("Sign in will be enabled with provider and customer accounts.")}>Sign in</button>
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
          <div className="provider-visual"><span>{p.initials}</span><div className="availability"><span className="green-dot"/> Available now</div></div>
          <div className="provider-body"><span className="tag">{p.category}</span><h3>{p.name}</h3><p>⌖ {p.city}</p><div className="meta"><span>★ {p.rating.toFixed(1)} ({p.reviews})</span><span>{p.response}</span></div>
          <div className="provider-actions"><button onClick={()=>setSelected(p)}>View profile</button><button className="secondary" onClick={()=>alert("Messaging will be enabled with accounts.")}>Message</button></div></div>
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
        <div className="modal-head"><div className="avatar large">{selected.initials}</div><div><div className="availability"><span className="green-dot"/> Available now</div><h2>{selected.name}</h2><p>{selected.category} · {selected.city}</p></div></div>
        <div className="modal-rating">★ {selected.rating.toFixed(1)} · {selected.reviews} reviews</div>
        <div className="chips">{selected.specialties.map(s=><span key={s}>{s}</span>)}</div>
        <p className="modal-copy">This is a preview of the provider mini-site experience. Real providers will manage their own services, photos, availability, and contact information.</p>
        <a className="call-action" href={`tel:${selected.phone.replace(/\D/g,"")}`}>☎ Call {selected.phone}</a>
      </div>
    </div>}
  </main>
}
