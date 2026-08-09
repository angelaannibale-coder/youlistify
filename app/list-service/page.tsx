"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ListService() {

  
const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    business_name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    zip_code: "",
    bio: "",
    service_ids: [] as number []
  });

  
useEffect(() => {
  async function loadServices() {
    const { data, error } = await supabase
      .from("services")
      .select("id, name, category")
      .order("category")
      .order("name");

    if (!error && data) {
      setServices(data);
    }
  }

  loadServices();
}, []);
  
async function saveProvider(e: React.FormEvent) {
  e.preventDefault();

  if (form.service_ids.length === 0
    ) {
    alert("Please choose a service.");
    return;
  }

  const { service_ids, ...providerData } = form;

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
      service_ids.map((serviceId => ({
        provider_id: newProvider.id,
        service_id: serviceid,
      }))
    );

  if (serviceError) {
    alert("Provider saved, but service could not be added: " + serviceError.message);
    return;
  }

  alert("Your provider profile was saved!");
}
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

     <form onSubmit={saveProvider}
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  }}
>
  <input
    placeholder="Your name"
    value={form.name}
    onChange={(e) => setForm({ ...form, name: e.target.value })}
    style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ddd" }}
  />

  <input
    placeholder="Business name (optional)"
    value={form.business_name}
    onChange={(e) => setForm({ ...form, business_name: e.target.value })}
    style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ddd" }}
  />

  <input
    placeholder="Phone"
    value={form.phone}
    onChange={(e) => setForm({ ...form, phone: e.target.value })}
    style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ddd" }}
  />

  <input
    placeholder="Email"
    value={form.email}
    onChange={(e) => setForm({ ...form, email: e.target.value })}
    style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ddd" }}
  />

  <input
    placeholder="City"
    value={form.city}
    onChange={(e) => setForm({ ...form, city: e.target.value })}
    style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ddd" }}
  />

  <input
    placeholder="State"
    value={form.state}
    onChange={(e) => setForm({ ...form, state: e.target.value })}
    style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ddd" }}
  />

  <input
    placeholder="ZIP code"
    value={form.zip_code}
    onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
    style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ddd" }}
  />
<select
  multiple
  value={form.service_ids.map(String)}
  onChange={(e) =>
    setForm({
      ...form,
      service_ids: Array.from(
        e.target.selectedOptions,
        (option) => Number(option.value)
      ),
    })
  }
  style={{
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    minHeight: "140px",
  }}
>
  {services.map((service: any) => (
    <option key={service.id} value={service.id}>
      {service.name}
    </option>
  ))}
</select>
      

  <textarea
    placeholder="Tell customers about your services"
    value={form.bio}
    onChange={(e) => setForm({ ...form, bio: e.target.value })}
    style={{
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      minHeight: "100px",
    }}
  />

  <button
    type="submit"
    style={{
      gridColumn: "1 / -1",
      padding: "16px",
      border: "none",
      borderRadius: "12px",
      background: "#5b4cf0",
      color: "white",
      fontWeight: "700",
      fontSize: "16px",
      cursor: "pointer",
    }}
  >
    Continue
  </button>
</form> 
    </main>
  );
}
