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
    <main style={{ maxWidth: "700px", margin: "60px auto", padding: "24px" }}>
      <h1>List your service</h1>
      <p>Create your YouListify provider profile.</p>

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
