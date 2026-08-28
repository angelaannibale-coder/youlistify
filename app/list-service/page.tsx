"use client";

import "./mobile.css";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"],
  ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"],
  ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
  ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
  ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
  ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"],
  ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
  ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
  ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"],
  ["WI", "Wisconsin"], ["WY", "Wyoming"], ["DC", "Washington, DC"]
] as const;

const fieldStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #ddd"
} as const;

export default function ListService() {
  const [services, setServices] = useState<any[]>([]);
  const [serviceSearch, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [password, setPassword] = useState("");
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    last_name: "",
    business_name: "",
    phone: "",
    email: "",
    service_mode: "local",
    city: "",
    state: "",
    zip_code: "",
    bio: "",
    pricing_methods: [] as string[],
    starting_price: "",
    flat_price: "",
    service_ids: [] as number[]
  });

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, category")
        .order("category")
        .order("name");
      if (!error && data) setServices(data);
    }
    void loadServices();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      setCityOptions([]);
      setCityOpen(false);
      if (!form.state) return;

      setCityLoading(true);
      try {
        const response = await fetch(`/api/cities?state=${encodeURIComponent(form.state)}`);
        const data = await response.json();
        if (!cancelled) {
          setCityOptions(Array.isArray(data.cities) ? data.cities : []);
        }
      } catch {
        if (!cancelled) setCityOptions([]);
      } finally {
        if (!cancelled) setCityLoading(false);
      }
    }

    void loadCities();
    return () => {
      cancelled = true;
    };
  }, [form.state]);

  const filteredCities = useMemo(() => {
    const query = form.city.trim().toLowerCase();
    if (!query) return [];
    return cityOptions
      .filter((name) => name.toLowerCase().startsWith(query))
      .slice(0, 10);
  }, [cityOptions, form.city]);

  async function createAccount() {
    if (!form.email || !password) {
      alert("Please enter a password.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password
    });

    if (error) {
      alert("Could not create account: " + error.message);
      return;
    }

    alert("Account created! Please check your email to confirm your account.");
  }

  async function saveProvider(e: React.FormEvent) {
    e.preventDefault();

    if (form.service_ids.length === 0) {
      alert("Please choose a service.");
      return;
    }

    const { service_ids, ...rest } = form;
    const providerData = {
      ...rest,
      city: form.city.trim(),
      starting_price: form.starting_price === "" ? null : Number(form.starting_price),
      flat_price: form.flat_price === "" ? null : Number(form.flat_price)
    };

    const { data: newProvider, error: providerError } = await supabase
      .from("Providers")
      .insert([providerData])
      .select("id")
      .single();

    if (providerError) {
      alert("Something went wrong: " + providerError.message);
      return;
    }

    const { error: serviceError } = await supabase
      .from("provider_services")
      .insert(
        service_ids.map((serviceId) => ({
          provider_id: newProvider.id,
          service_id: serviceId
        }))
      );

    if (serviceError) {
      alert("Provider saved, but service could not be added: " + serviceError.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted && !showAccountForm) {
    return (
      <main style={{ maxWidth: "760px", margin: "70px auto", padding: "48px", background: "white", borderRadius: "24px", boxShadow: "0 12px 40px rgba(0,0,0,0.08)", textAlign: "center" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
        <h1 style={{ fontSize: "42px", marginBottom: "16px", color: "#182033" }}>Your listing has been created!</h1>
        <p style={{ fontSize: "18px", color: "#667085", lineHeight: "1.6" }}>Welcome to YouListify! Your service listing is now saved.</p>
        <p style={{ fontSize: "18px", color: "#667085", lineHeight: "1.6" }}>Create your free provider account to manage your listing, make updates, add photos, and keep your information current.</p>
        <button type="button" onClick={() => setShowAccountForm(true)} style={{ width: "100%", padding: "16px", marginTop: "20px", border: "none", borderRadius: "12px", background: "#5b4cf0", color: "white", fontWeight: "700", fontSize: "16px", cursor: "pointer" }}>Create My Account</button>
      </main>
    );
  }

  if (showAccountForm) {
    return (
      <main style={{ maxWidth: "760px", margin: "70px auto", padding: "48px", background: "white", borderRadius: "24px", boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "12px", color: "#182033" }}>Create your account</h1>
        <p style={{ fontSize: "18px", color: "#667085", lineHeight: "1.6", marginBottom: "28px" }}>You're almost done! Create your free provider account to manage your listing, add photos, and make updates anytime.</p>
        <input type="email" value={form.email} readOnly style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "14px" }} />
        <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "18px" }} />
        <button type="button" onClick={createAccount} style={{ width: "100%", padding: "16px", border: "none", borderRadius: "12px", background: "#5b4cf0", color: "white", fontWeight: "700", fontSize: "16px", cursor: "pointer" }}>Create My Account</button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "760px", margin: "70px auto", padding: "48px", background: "white", borderRadius: "24px", boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}>
      <div style={{ color: "#5b4cf0", fontWeight: "700", marginBottom: "12px" }}>JOIN YOULISTIFY</div>
      <h1 style={{ fontSize: "56px", lineHeight: "1", margin: "0 0 18px", color: "#182033" }}>List your service</h1>
      <p style={{ fontSize: "18px", color: "#667085", marginBottom: "32px" }}>Create your YouListify provider profile and start connecting with customers.</p>

      <form onSubmit={saveProvider} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <input placeholder="First name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={fieldStyle} />
        <input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} style={fieldStyle} />
        <input placeholder="Business name (optional)" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} style={fieldStyle} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={fieldStyle} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={fieldStyle} />

        <select
          value={form.state}
          autoComplete="address-level1"
          onChange={(e) => {
            setForm({ ...form, state: e.target.value, city: "" });
            setCityOpen(false);
          }}
          style={fieldStyle}
        >
          <option value="">Select state</option>
          {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>

        <div style={{ position: "relative", width: "100%" }}>
          <input
            placeholder={form.state ? "City" : "Select a state first"}
            value={form.city}
            disabled={!form.state}
            autoComplete="off"
            onFocus={() => setCityOpen(true)}
            onChange={(e) => {
              setForm({ ...form, city: e.target.value });
              setCityOpen(true);
            }}
            onBlur={() => window.setTimeout(() => setCityOpen(false), 180)}
            style={{ ...fieldStyle, width: "100%", boxSizing: "border-box", opacity: form.state ? 1 : 0.65 }}
          />

          {cityLoading && form.state && (
            <div style={{ fontSize: "13px", color: "#667085", marginTop: "6px" }}>Loading cities…</div>
          )}

          {cityOpen && filteredCities.length > 0 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 4px)", zIndex: 100, background: "white", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 10px 25px rgba(0,0,0,.12)", maxHeight: "240px", overflowY: "auto" }}>
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.currentTarget.focus()}
                  onClick={() => {
                    setForm({ ...form, city });
                    setCityOpen(false);
                  }}
                  style={{ display: "block", width: "100%", padding: "12px 14px", border: 0, borderBottom: "1px solid #eee", background: "white", textAlign: "left", cursor: "pointer", fontSize: "16px", color: "#182033" }}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        <input placeholder="ZIP code" value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} style={{ ...fieldStyle, width: "160px", maxWidth: "100%" }} />

        <select value={form.service_mode} onChange={(e) => setForm({ ...form, service_mode: e.target.value })} style={fieldStyle}>
          <option value="local">Local / In-person</option>
          <option value="remote">Remote / Online</option>
          <option value="both">Local + Remote</option>
        </select>

        <div style={{ display: "grid", gap: "10px", gridColumn: "1 / -1" }}>
          <div style={{ fontWeight: "600" }}>What services do you offer? Select all that apply.</div>
          <input type="text" placeholder="Search services..." value={serviceSearch} onChange={(e) => setSearch(e.target.value)} style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd", width: "100%" }} />
          {services
            .filter((service: any) => serviceSearch.trim() ? service.name.toLowerCase().includes(serviceSearch.toLowerCase()) : form.service_ids.includes(Number(service.id)))
            .map((service: any) => (
              <label key={service.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.service_ids.includes(Number(service.id))}
                  onChange={(e) => {
                    const serviceId = Number(service.id);
                    setForm({ ...form, service_ids: e.target.checked ? [...form.service_ids, serviceId] : form.service_ids.filter((id) => id !== serviceId) });
                  }}
                />
                {service.name}
              </label>
            ))}
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontWeight: "600", marginBottom: "6px" }}>About your services</div>
          <div style={{ fontSize: "14px", color: "#667085", marginBottom: "10px" }}>Tell customers what you do, your experience, and what makes your service stand out.</div>
          <textarea placeholder="Describe your services..." value={form.bio} maxLength={750} onChange={(e) => setForm({ ...form, bio: e.target.value })} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #ddd", minHeight: "150px", resize: "vertical" }} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontWeight: "600", marginBottom: "6px" }}>How do you charge?</div>
          <div style={{ fontSize: "14px", color: "#667085", marginBottom: "10px" }}>Select all that apply. You can add rates if you'd like, but pricing is optional.</div>
          {["Hourly rate", "Flat rate", "Contact for pricing"].map((method) => (
            <label key={method} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.pricing_methods.includes(method)}
                onChange={(e) => setForm({ ...form, pricing_methods: e.target.checked ? [...form.pricing_methods, method] : form.pricing_methods.filter((m) => m !== method) })}
              />
              {method}
            </label>
          ))}

          {form.pricing_methods.includes("Hourly rate") && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "14px", marginBottom: "6px" }}>Hourly rate (optional)</div>
              <input placeholder="Example: 75" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd", width: "180px" }} />
            </div>
          )}

          {form.pricing_methods.includes("Flat rate") && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "14px", marginBottom: "6px" }}>Flat rate (optional)</div>
              <input placeholder="Example: 250" value={form.flat_price} onChange={(e) => setForm({ ...form, flat_price: e.target.value })} style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd", width: "180px" }} />
            </div>
          )}
        </div>

        <button type="submit" style={{ gridColumn: "1 / -1", padding: "16px", border: "none", borderRadius: "12px", background: "#5b4cf0", color: "white", fontWeight: "700", fontSize: "16px", cursor: "pointer", marginTop: "8px" }}>Create my listing</button>
      </form>
    </main>
  );
}
