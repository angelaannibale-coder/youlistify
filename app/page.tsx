"use client";

import { FormEvent, useMemo, useState } from "react";

const categories = [
  { icon: "🔧", name: "Handyman" },
  { icon: "🎧", name: "DJ" },
  { icon: "🧹", name: "House Cleaning" },
  { icon: "📦", name: "Movers" },
  { icon: "📸", name: "Photographer" },
  { icon: "🎓", name: "Tutor" },
  { icon: "🐾", name: "Pet Care" },
  { icon: "🛠️", name: "Contractor" }
];

const providers = [
  {
    name: "BrightSide Home Services",
    category: "Handyman",
    city: "Boynton Beach, FL",
    rating: "4.9",
    reviews: "127",
    response: "Usually answers in 3 min",
    initials: "BH"
  },
  {
    name: "Pulse Event DJs",
    category: "DJ",
    city: "West Palm Beach, FL",
    rating: "5.0",
    reviews: "84",
    response: "Usually answers in 2 min",
    initials: "PD"
  },
  {
    name: "Fresh Start Cleaning",
    category: "House Cleaning",
    city: "Boca Raton, FL",
    rating: "4.8",
    reviews: "203",
    response: "Usually answers in 5 min",
    initials: "FS"
  }
];

export default function Home() {
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [providerMessage, setProviderMessage] = useState("");

  const filteredProviders = useMemo(() => {
    const s = service.trim().toLowerCase();
    const l = location.trim().toLowerCase();
    return providers.filter((provider) => {
      const matchesService =
        !s ||
        provider.category.toLowerCase().includes(s) ||
        provider.name.toLowerCase().includes(s);
      const matchesLocation = !l || provider.city.toLowerCase().includes(l);
      return matchesService && matchesLocation;
    });
  }, [service, location]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    document.getElementById("available")?.scrollIntoView({ behavior: "smooth" });
    setMessage(
      filteredProviders.length
        ? `${filteredProviders.length} provider${filteredProviders.length === 1 ? "" : "s"} found in this preview.`
        : "No preview providers match yet. More listings are coming soon."
    );
  }

  function handleProviderSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProviderMessage("Thanks — your early provider interest has been recorded for this preview.");
    event.currentTarget.reset();
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Youlistify home">
          <span className="brand-mark">Y</span>
          <span>Youlistify</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#categories">Categories</a>
          <a href="#available">Available now</a>
        </nav>
        <a className="button button-small button-outline" href="#list-service">
          List your service
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-content">
          <div className="eyebrow">
            <span className="status-dot" />
            Local professionals ready to work
          </div>
          <h1>
            Find the right person.
            <span>Call them in minutes.</span>
          </h1>
          <p className="hero-subtitle">
            Search local services, see who is available, and connect directly—without
            filling out long forms or waiting for multiple quotes.
          </p>

          <form className="search-panel" onSubmit={handleSearch}>
            <label>
              <span>What do you need?</span>
              <div className="input-wrap">
                <span aria-hidden="true">⌕</span>
                <input
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  placeholder="Handyman, DJ, cleaner..."
                />
              </div>
            </label>
            <label>
              <span>Where?</span>
              <div className="input-wrap">
                <span aria-hidden="true">⌖</span>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City or ZIP code"
                />
              </div>
            </label>
            <button className="button button-primary search-button" type="submit">
              Search now
            </button>
          </form>
          {message && <p className="form-message" role="status">{message}</p>}

          <div className="trust-row">
            <span>✓ Direct contact</span>
            <span>✓ Availability badges</span>
            <span>✓ Local professionals</span>
          </div>
        </div>

        <div className="hero-card" aria-label="Example available provider card">
          <div className="hero-card-top">
            <div className="avatar">AM</div>
            <div>
              <strong>Alex Morgan</strong>
              <span>Home Services</span>
            </div>
            <div className="available-pill">
              <span className="status-dot" />
              Available now
            </div>
          </div>
          <div className="hero-card-photo">
            <div className="photo-symbol">🛠️</div>
          </div>
          <div className="hero-card-info">
            <div>
              <strong>★★★★★ 4.9</strong>
              <span>Based on 96 reviews</span>
            </div>
            <button type="button" onClick={() => alert("Calling features will be enabled when provider accounts launch.")}>
              ☎ Call now
            </button>
          </div>
        </div>
      </section>

      <section className="section" id="categories">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Popular categories</span>
            <h2>What can we help you get done?</h2>
          </div>
          <a href="#available">Browse available providers →</a>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <button
              type="button"
              className="category-card"
              key={category.name}
              onClick={() => {
                setService(category.name);
                document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="category-icon">{category.icon}</span>
              <strong>{category.name}</strong>
              <span>Explore local options</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section section-tint" id="available">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Ready when you are</span>
            <h2>Available now near you</h2>
          </div>
          <span className="live-note">
            <span className="status-dot" /> Preview listings
          </span>
        </div>

        <div className="provider-grid">
          {filteredProviders.length ? (
            filteredProviders.map((provider) => (
              <article className="provider-card" key={provider.name}>
                <div className="provider-cover">
                  <span>{provider.initials}</span>
                  <div className="available-pill">
                    <span className="status-dot" />
                    Available now
                  </div>
                </div>
                <div className="provider-content">
                  <span className="provider-category">{provider.category}</span>
                  <h3>{provider.name}</h3>
                  <p>⌖ {provider.city}</p>
                  <div className="provider-meta">
                    <span>★ {provider.rating} ({provider.reviews})</span>
                    <span>{provider.response}</span>
                  </div>
                  <div className="provider-actions">
                    <button type="button" className="button button-primary" onClick={() => alert("Direct calling will be enabled after provider profiles launch.")}>
                      ☎ Call
                    </button>
                    <button type="button" className="button button-light" onClick={() => alert("Messaging will be enabled in the marketplace version.")}>
                      Message
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <span>⌕</span>
              <h3>No preview matches yet</h3>
              <p>Try another service or location. The full provider marketplace is coming soon.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="center-heading">
          <span className="section-kicker">Simple by design</span>
          <h2>Get help without the runaround</h2>
          <p>Youlistify is designed to move people from searching to speaking with the right professional quickly.</p>
        </div>
        <div className="steps-grid">
          <article>
            <span>01</span>
            <div className="step-icon">⌕</div>
            <h3>Search what you need</h3>
            <p>Choose a service and enter your location to see relevant professionals.</p>
          </article>
          <article>
            <span>02</span>
            <div className="step-icon">✓</div>
            <h3>See who is ready</h3>
            <p>Compare profiles, ratings, specialties, and live availability at a glance.</p>
          </article>
          <article>
            <span>03</span>
            <div className="step-icon">☎</div>
            <h3>Call and get it done</h3>
            <p>Connect directly instead of submitting a request and waiting for replies.</p>
          </article>
        </div>
      </section>

      <section className="provider-cta" id="list-service">
        <div>
          <span className="section-kicker light">For local professionals</span>
          <h2>Ready to get discovered?</h2>
          <p>
            Create a profile, show when you are available, and let nearby customers call you directly.
          </p>
          <div className="provider-benefits">
            <span>✓ No long lead forms</span>
            <span>✓ Control your availability</span>
            <span>✓ Direct customer contact</span>
          </div>
        </div>
        <form onSubmit={handleProviderSignup}>
          <h3>Join the early provider list</h3>
          <label>
            Business or provider name
            <input required name="name" placeholder="Your business name" />
          </label>
          <label>
            Email address
            <input required type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Main service
            <input required name="service" placeholder="Cleaning, DJ, handyman..." />
          </label>
          <button className="button button-accent" type="submit">Join the list</button>
          {providerMessage && <p className="provider-message" role="status">{providerMessage}</p>}
        </form>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">Y</span>
          <span>Youlistify</span>
        </a>
        <p>Find the right person. Call them in minutes. Get the job done.</p>
        <div>
          <a href="#how-it-works">How it works</a>
          <a href="#categories">Categories</a>
          <a href="#list-service">List your service</a>
        </div>
        <small>© {new Date().getFullYear()} Youlistify. All rights reserved.</small>
      </footer>
    </main>
  );
}
