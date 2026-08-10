"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ListService() {

  
const [services, setServices] = useState<any[]>([]);
  const [serviceSearch, setSearch] = useState("");
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
    flat_price:"",
service_ids: [] as number[]
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
      service_ids.map((serviceId) => ({
        provider_id: newProvider.id,
        service_id: serviceId,
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
  placeholder="First name"
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
  style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ddd" }}
/>

<input
  placeholder="Last name"
  value={form.last_name}
  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
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

  <select
  value={form.state}
  onChange={(e) => setForm({ ...form, state: e.target.value })}
  style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ddd" }}
>
  <option value="">Select state</option>
  <option value="AL">Alabama</option>
  <option value="AK">Alaska</option>
  <option value="AZ">Arizona</option>
  <option value="AR">Arkansas</option>
  <option value="CA">California</option>
  <option value="CO">Colorado</option>
  <option value="CT">Connecticut</option>
  <option value="DE">Delaware</option>
  <option value="FL">Florida</option>
  <option value="GA">Georgia</option>
  <option value="HI">Hawaii</option>
  <option value="ID">Idaho</option>
  <option value="IL">Illinois</option>
  <option value="IN">Indiana</option>
  <option value="IA">Iowa</option>
  <option value="KS">Kansas</option>
  <option value="KY">Kentucky</option>
  <option value="LA">Louisiana</option>
  <option value="ME">Maine</option>
  <option value="MD">Maryland</option>
  <option value="MA">Massachusetts</option>
  <option value="MI">Michigan</option>
  <option value="MN">Minnesota</option>
  <option value="MS">Mississippi</option>
  <option value="MO">Missouri</option>
  <option value="MT">Montana</option>
  <option value="NE">Nebraska</option>
  <option value="NV">Nevada</option>
  <option value="NH">New Hampshire</option>
  <option value="NJ">New Jersey</option>
  <option value="NM">New Mexico</option>
  <option value="NY">New York</option>
  <option value="NC">North Carolina</option>
  <option value="ND">North Dakota</option>
  <option value="OH">Ohio</option>
  <option value="OK">Oklahoma</option>
  <option value="OR">Oregon</option>
  <option value="PA">Pennsylvania</option>
  <option value="RI">Rhode Island</option>
  <option value="SC">South Carolina</option>
  <option value="SD">South Dakota</option>
  <option value="TN">Tennessee</option>
  <option value="TX">Texas</option>
  <option value="UT">Utah</option>
  <option value="VT">Vermont</option>
  <option value="VA">Virginia</option>
  <option value="WA">Washington</option>
  <option value="WV">West Virginia</option>
  <option value="WI">Wisconsin</option>
  <option value="WY">Wyoming</option>
  <option value="DC">Washington, DC</option>
</select>

  <input
  placeholder="ZIP code"
  value={form.zip_code}
  onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
  style={{
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    width: "160px",
    maxWidth: "100%"
  }}
/>
    <select
  value={form.service_mode}
  onChange={(e) => setForm({ ...form, service_mode: e.target.value })}
  style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ddd" }}
>
  <option value="local">Local / In-person</option>
  <option value="remote">Remote / Online</option>
  <option value="both">Local + Remote</option>
</select>
         
<div style={{ display: "grid", gap: "10px", gridColumn: "1 / -1" }}>
  <div style={{ fontWeight: "600" }}>
    What services do you offer? Select all that apply.
  </div>
 <input
  type="text"
  placeholder="Search services..."
  value={serviceSearch}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    width: "100%"
  }}
/>
  {services.filter((service: any) =>
serviceSearch.trim()
? service.name.toLowerCase().includes(serviceSearch.toLowerCase())
: form.service_ids.includes(Number(service.id))
).map((service: any) => (
    <label
      key={service.id}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={form.service_ids.includes(Number(service.id))}
        onChange={(e) => {
          const serviceId = Number(service.id);

          setForm({
            ...form,
            service_ids: e.target.checked
              ? [...form.service_ids, serviceId]
              : form.service_ids.filter((id) => id !== serviceId),
          });
        }}
      />

      {service.name}
    </label>
  ))}
</div>
      

  <div style={{ gridColumn: "1 / -1" }}>
<div style={{ fontWeight: "600", marginBottom: "6px" }}>
About your services
</div>

<div style={{ fontSize: "14px", color: "#667085", marginBottom: "10px" }}>
Tell customers what you do, your experience, and what makes your service stand out.
</div>

<textarea
placeholder="Describe your services..."
value={form.bio}
maxLength={750}
onChange={(e) => setForm({ ...form, bio: e.target.value })}
style={{
width: "100%",
padding: "14px",
borderRadius: "10px",
border: "1px solid #ddd",
minHeight: "150px",
resize: "vertical"
}}
/>
</div>

       <div style={{ gridColumn: "1 / -1" }}>
<div style={{ fontWeight: "600", marginBottom: "6px" }}>
How do you charge?
</div>

<div style={{ fontSize: "14px", color: "#667085", marginBottom: "10px" }}>
Select all that apply. Adding a price is optional.
</div>

{["Hourly rate", "Flat rate", "Contact for pricing"].map((method) => (
<label
key={method}
style={{
display: "flex",
alignItems: "center",
gap: "10px",
marginBottom: "10px",
}}
>
<input
type="checkbox"
checked={form.pricing_methods.includes(method)}
onChange={(e) =>
setForm({
...form,
pricing_methods: e.target.checked
? [...form.pricing_methods, method]
: form.pricing_methods.filter((item) => item !== method),
})
}
/>
{method}
</label>
))}

{form.pricing_methods.includes("Hourly rate") && (
<input
type="number"
min="0"
step="0.01"
placeholder="Hourly rate (optional)"
value={form.starting_price}
onChange={(e) =>
setForm({ ...form, starting_price: e.target.value })
}
style={{
width: "100%",
padding: "14px",
borderRadius: "10px",
border: "1px solid #ddd",
marginTop: "4px",
}}
/>
)}

{form.pricing_methods.includes("Flat rate") && (
<input
type="number"
min="0"
step="0.01"
placeholder="Flat rate (optional)"
  value={form.flat_price}
onChange={(e) =>
setForm({ ...form, flat_price: e.target.value })
}
style={{
width: "100%",
padding: "14px",
borderRadius: "10px",
border: "1px solid #ddd",
marginTop: "8px",
}}
/>
)}
</div>

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
