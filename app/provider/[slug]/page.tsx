"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

export default function ProviderProfile() {
const params = useParams();
const slug = params.slug as string;

const [provider, setProvider] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [currentUserId, setCurrentUserId] = useState<string | null>(null);

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
useEffect(() => {
async function getCurrentUser() {
const { data } = await supabase.auth.getUser();
setCurrentUserId(data.user?.id ?? null);
}

getCurrentUser();
}, []);
useEffect(() => {
async function loadProvider() {
const id = slug.split("-").pop();

const { data, error } = await supabase
.from("Providers")
.select(`
*,
provider_services (
services (
name
)
)
`)
.eq("id", id)
.single();

if (!error && data) {
    setProvider({
...data,
specialties:
Array.from(
new Set(
data.provider_services?.map((ps: any) => ps.services?.name).filter(Boolean) || []
)
),
});
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
? `${provider.name} ${provider.last_name?.charAt(0) || ""}.`
: `${provider.name} ${provider.last_name || ""}`.trim());

return (
<main
style={{
minHeight: "100vh",
background: "#f6f7fb",
padding: "40px 20px",
}}
>
<div style={{ maxWidth: "760px", margin: "0 auto" }}>
{currentUserId && provider.user_id === currentUserId ? (
<a
href="/dashboard/edit"
style={{
color: "#4f46e5",
textDecoration: "none",
fontWeight: "600",
}}
>
← Back to Edit Listing
</a>
) : (
<a
href="/"
style={{
color: "#4f46e5",
textDecoration: "none",
fontWeight: "600",
}}
>
← Back to YouListify
</a>
)}
<div
style={{
background: "white",
borderRadius: "28px",
padding: "32px",
marginTop: "24px",
boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
}}
>
<div
style={{
display: "flex",
alignItems: "center",
gap: "18px",
marginBottom: "22px",
}}
>
<div
style={{
width: "82px",
height: "82px",
borderRadius: "24px",
background: "linear-gradient(135deg, #5b5bf7, #8b5cf6)",
color: "white",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "28px",
fontWeight: "700",
flexShrink: 0,
}}
>
{displayName?.charAt(0).toUpperCase()}
</div>

<div>
<h1
style={{
margin: 0,
fontSize: "36px",
lineHeight: 1.1,
}}
>
{displayName}
</h1>

<p style={{ margin: "8px 0 0", color: "#6b7280" }}>
{provider.city}
{provider.state ? `, ${provider.state}` : ""}
</p>

{provider.available_now && (
<div
style={{
marginTop: "10px",
display: "inline-block",
background: "#ecfdf3",
color: "#15803d",
borderRadius: "999px",
padding: "6px 12px",
fontWeight: "600",
}}
>
● Available now
</div>
)}
</div>
</div>



{provider.bio && (
<div style={{ marginTop: "24px" }}>
<h3 style={{ marginBottom: "8px" }}>About</h3>
<p
style={{
color: "#4b5563",
lineHeight: 1.7,
margin: 0,
}}
>
{provider.bio}
</p>
</div>
)}



{provider.specialties?.length > 0 && (
<div style={{ marginTop: "26px" }}>
<h3 style={{ marginBottom: "10px" }}>Services</h3>
<div
style={{
display: "flex",
flexWrap: "wrap",
gap: "8px",
}}
>
{provider.specialties.map((service: string) => (
<span
key={service}
style={{
background: "#f3f4f6",
borderRadius: "999px",
padding: "8px 12px",
fontSize: "14px",
}}
>
{service}
</span>
))}
</div>
</div>
)}

{provider.pricing_methods?.length > 0 && (
<div style={{ marginTop: "26px" }}>
<h3 style={{ marginBottom: "10px" }}>Pricing</h3>

<div
style={{
display: "flex",
flexWrap: "wrap",
gap: "10px",
}}
>
{provider.pricing_methods.includes("hourly") &&
 (
<span
style={{
background: "#f5f3ff",
padding: "9px 12px",
borderRadius: "10px",
fontWeight: "600",
}}
>
{provider.starting_price != null
? `$${provider.starting_price}/hour`
: "Hourly rate"}
</span>
)}

{provider.pricing_methods.includes("flat") &&
 (
<span
style={{
background: "#f5f3ff",
padding: "9px 12px",
borderRadius: "10px",
fontWeight: "600",
}}
>
{provider.flat_price != null ? `Flat rate: $${provider.flat_price}` : "Flat rate"}
</span>
)}

{provider.pricing_methods.includes("contact") && (
<span
style={{
background: "#f5f3ff",
padding: "9px 12px",
borderRadius: "10px",
fontWeight: "600",
}}
>
Contact for pricing
</span>
)}
</div>
</div>
)}

<div
style={{
display: "flex",
flexWrap: "wrap",
gap: "10px",
justifyContent: "center",
marginTop: "30px",
}}
>
{provider.contact_call && provider.phone && (
<a
href={`tel:${provider.phone}`}
style={{
background: "#4f46e5",
color: "white",
padding: "12px 18px",
borderRadius: "10px",
textDecoration: "none",
fontWeight: "600",
}}
>
☎ Call {provider.phone}
</a>
)}

{provider.contact_text && provider.phone && (
<a
href={`sms:${provider.phone}`}
style={{
background: "#4f46e5",
color: "white",
padding: "12px 18px",
borderRadius: "10px",
textDecoration: "none",
fontWeight: "600",
}}
>
💬 Text
</a>
)}

{provider.contact_email && provider.email && (
<a
href={`mailto:${provider.email}`}
style={{
background: "#4f46e5",
color: "white",
padding: "12px 18px",
borderRadius: "10px",
textDecoration: "none",
fontWeight: "600",
}}
>
✉ Email
</a>
)}
{provider.contact_youlistify && (
<button
type="button"
onClick={() => alert("YouListify messaging coming soon!")}
style={{
background: "#4f46e5",
color: "white",
padding: "12px 18px",
borderRadius: "10px",
border: "none",
fontWeight: "600",
cursor: "pointer",
}}
>
✉ Contact through YouListify
</button>
)}
<button
type="button"
onClick={async () => {
const url = window.location.href;

if (navigator.share) {
await navigator.share({
title: `${displayName} on YouListify`,
url,
});
} else {
await navigator.clipboard.writeText(url);
alert("Profile link copied!");
}
}}
style={{
background: "#4f46e5",
color: "white",
padding: "12px 18px",
borderRadius: "10px",
border: "none",
fontWeight: "600",
cursor: "pointer",
}}
>
↗ Share profile
</button>
</div>
{provider.gallery_photos?.length > 0 && (
<div style={{ marginTop: "26px" }}>
<h3 style={{ marginBottom: "12px" }}>Photos</h3>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(3, 1fr)",
gap: "10px",
}}
>
{provider.gallery_photos.map((photo: string, index: number) => (
<img
key={index}
src={photo}
alt={`${displayName} photo ${index + 1}`}
style={{
width: "100%",
height: "180px",
objectFit: "cover",
borderRadius: "12px",
}}
/>
))}
</div>
</div>
)}
</div>
</div>
</main>
);
}