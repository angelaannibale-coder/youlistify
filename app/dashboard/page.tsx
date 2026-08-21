"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Provider = {
id: number;
name: string | null;
last_name: string | null;
business_name: string | null;
email: string | null;
phone: string | null;
city: string | null;
state: string | null;
bio: string | null;
  name_display?: string | null;
user_id: string | null;
};

export default function DashboardPage() {
const [provider, setProvider] = useState<Provider | null>(null);
const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");

useEffect(() => {
async function loadDashboard() {
const {
data: { user },
} = await supabase.auth.getUser();

if (!user) {
window.location.href = "/sign-in";
return;
}

const { data, error } = await supabase
.from("Providers")
.select(
"id,name,last_name,business_name,email,phone,city,state,bio,name_display,user_id"
)
.eq("user_id", user.id)
.single();

if (error) {
setMessage("We could not find your provider listing yet.");
setLoading(false);
return;
}

setProvider(data);
setLoading(false);
}

loadDashboard();
}, []);

async function handleSignOut() {
await supabase.auth.signOut();
window.location.href = "/";
}

if (loading) {
return (
<main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
Loading your account...
</main>
);
}

return (
<main
style={{
minHeight: "100vh",
background: "#f8f8fb",
padding: "40px 20px",
fontFamily: "Arial, sans-serif",
}}
>
<div
style={{
maxWidth: "900px",
margin: "0 auto",
background: "white",
borderRadius: "24px",
padding: "36px",
boxShadow: "0 10px 35px rgba(0,0,0,.08)",
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: "20px",
marginBottom: "28px",
}}
>
<div>
<div
style={{
color: "#5b4cf0",
fontWeight: "700",
marginBottom: "8px",
}}
>
YOULISTIFY PROVIDER
</div>

<h1
style={{
fontSize: "40px",
margin: "0",
color: "#182033",
}}
>
My Dashboard
</h1>
</div>

<a
href="/dashboard/edit"
style={{
background: "#4f46e5",
color: "white",
padding: "12px 18px",
borderRadius: "10px",
textDecoration: "none",
fontWeight: "600",
marginRight: "10px",
}}
>
Edit My Listing
</a> 
<a
href={`/provider/${provider?.id}`}
style={{
background: "#4f46e5",
color: "white",
padding: "12px 18px",
borderRadius: "10px",
textDecoration: "none",
fontWeight: "600",
marginRight: "10px",
}}
>
View My Profile
</a>
  <button
onClick={handleSignOut}
style={{
border: "1px solid #ddd",
background: "white",
padding: "12px 18px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "600",
}}
>
Sign Out
</button>
</div>

{message && (
<div
style={{
padding: "18px",
borderRadius: "12px",
background: "#fff7ed",
marginBottom: "24px",
}}
>
{message}
</div>
)}

{provider && (
<>
<h2 style={{ color: "#182033" }}>
Welcome, {provider.name || "Provider"}
</h2>

<p style={{ color: "#667085", marginBottom: "28px" }}>
This is where you’ll manage how your YouListify listing appears.
</p>

<div
style={{
display: "grid",
gap: "16px",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
}}
>
<div
style={{
border: "1px solid #eee",
borderRadius: "16px",
padding: "20px",
}}
>
<strong>Listing name</strong>
<div style={{ marginTop: "8px", color: "#667085" }}>
{provider.business_name || provider.name || "Not added"}
</div>
</div>

<div
style={{
border: "1px solid #eee",
borderRadius: "16px",
padding: "20px",
}}
>
<strong>Location</strong>
<div style={{ marginTop: "8px", color: "#667085" }}>
{[provider.city, provider.state].filter(Boolean).join(", ") ||
"Not added"}
</div>
</div>

<div
style={{
border: "1px solid #eee",
borderRadius: "16px",
padding: "20px",
}}
>
<strong>Email</strong>
<div style={{ marginTop: "8px", color: "#667085" }}>
{provider.email || "Not added"}
</div>
</div>

<div
style={{
border: "1px solid #eee",
borderRadius: "16px",
padding: "20px",
}}
>
<strong>Phone</strong>
<div style={{ marginTop: "8px", color: "#667085" }}>
{provider.phone || "Not added"}
</div>
</div>
</div>

<div
style={{
marginTop: "28px",
padding: "22px",
borderRadius: "16px",
background: "#f7f6ff",
}}
>
<strong>Name display</strong>
<p style={{ marginBottom: "0", color: "#667085" }}>
{provider.name_display === "initial"
? "First name + last initial"
: provider.name_display === "first"
? "First name only"
: "Full name"}
</p>
</div>
</>
<a
href="/"
style={{
display: "inline-block",
marginTop: "28px",
color: "#4f46e5",
textDecoration: "none",
fontWeight: "600",
}}
>
← Back to YouListify
</a>
)}
</div>
</main>
);
}
