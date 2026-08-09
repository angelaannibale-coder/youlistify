"use client";

import { useState } from "react";


export default function ListService() {

  

  const [form, setForm] = useState({
    name: "",
    business_name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    zip: "",
    bio: "",
  });

  return (
   <main style={{
  maxWidth: "760px",
  margin: "70px auto",
  padding: "48px",
  background: "white",
  borderRadius: "24px",
  boxShadow: "0 12px 40px rgba(0,0,0,0.08)"
}}>
  <div style={{ color: "#5b4cf0", fontWeight: "700", marginBottom: "12px" }}>
    JOIN YOULISTIFY
  </div>

  <h1 style={{
    fontSize: "56px",
    lineHeight: "1",
    margin: "0 0 18px",
    color: "#182033"
  }}>
    List your service
  </h1>

  <p style={{
    fontSize: "18px",
    color: "#667085",
    marginBottom: "32px"
  }}>
    Create your YouListify provider profile and start connecting with customers.
  </p>

      <form>
        <input
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Business name (optional)"
          value={form.business_name}
          onChange={(e) => setForm({ ...form, business_name: e.target.value })}
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <input
          placeholder="State"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        />

        <input
          placeholder="ZIP code"
          value={form.zip}
          onChange={(e) => setForm({ ...form, zip: e.target.value })}
        />

        <textarea
          placeholder="Tell customers about your services"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />

        <button type="submit">Continue</button>
      </form>
    </main>
  );
}
