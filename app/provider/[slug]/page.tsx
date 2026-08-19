"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

export default function ProviderProfile() {
const params = useParams();
const slug = params.slug as string;

const [provider, setProvider] = useState<any>(null);
const [loading, setLoading] = useState(true);

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

useEffect(() => {
async function loadProvider() {
const id = slug.split("-").pop();

const { data, error } = await supabase
.from("providers")
.select("*")
.eq("id", id)
.single();

if (!error && data) {
setProvider(data);
}

setLoading(false);
}

if (slug) loadProvider();
}, [slug]);

if (loading) {
return <main style={{ padding: "40px" }}>Loading profile...</main>;
}

if (!provider) {
return <main style={{ padding: "40px" }}>Provider not found.</main>;
}

const displayName =
provider.business_name ||
(provider.name_display === "first"
? provider.name
: provider.name_display === "initial"
? `${provider.name?.split(" ")[0]} ${provider.name?.split(" ")[1]?.[0] || ""}.`
: provider.name);

return (
<main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
<a href="/" style={{ textDecoration: "none" }}>
← Back to YouListify
</a>

<div style={{ marginTop: "30px" }}>
<h1>{displayName}</h1>

<p>
{provider.city}
{provider.state ? `, ${provider.state}` : ""}
</p>

{provider.available_now && <p>🟢 Available now</p>}

{provider.bio && <p>{provider.bio}</p>}

{provider.specialties?.length > 0 && (
<div>
<h3>Services</h3>
<p>{provider.specialties.join(" • ")}</p>
</div>
)}

{provider.pricing_methods?.length > 0 && (
<div>
<h3>Pricing</h3>

{provider.pricing_methods.includes("hourly") &&
provider.starting_price != null && (
<p>${provider.starting_price}/hour</p>
)}

{provider.pricing_methods.includes("flat") &&
provider.flat_price != null && (
<p>Flat rate: ${provider.flat_price}</p>
)}

{provider.pricing_methods.includes("contact") && (
<p>Contact for pricing</p>
)}
</div>
)}

<div
style={{
display: "flex",
flexWrap: "wrap",
gap: "10px",
marginTop: "25px",
}}
>
{provider.contact_call && provider.phone && (
<a href={`tel:${provider.phone}`}>Call {provider.phone}</a>
)}

{provider.contact_text && provider.phone && (
<a href={`sms:${provider.phone}`}>Text</a>
)}

{provider.contact_email && provider.email && (
<a href={`mailto:${provider.email}`}>Email</a>
)}
</div>
</div>
</main>
);
}