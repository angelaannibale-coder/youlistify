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
phone: string | null;
email: string | null;
city: string | null;
state: string | null;
bio: string | null;
name_display?: string | null;
user_id: string | null;
  contact_call?: boolean | null;
contact_text?: boolean | null;
contact_email?: boolean | null;
contact_youlistify?: boolean | null;
};

export default function EditListingPage() {
const [providerId, setProviderId] = useState<number | null>(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");

const [form, setForm] = useState({
name: "",
last_name: "",
business_name: "",
phone: "",
email: "",
city: "",
state: "",
bio: "",
name_display: "full",
  contact_call: false,
contact_text: false,
contact_email: false,
contact_youlistify: false,
});

useEffect(() => {
async function loadProvider() {
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
  "id,name,last_name,business_name,phone,email,city,state,bio,name_display,user_id,contact_call,contact_text,contact_email,contact_youlistify"
)
.eq("user_id", user.id)
.single();

if (error || !data) {
setMessage("We could not find your provider listing.");
setLoading(false);
return;
}

const provider = data as Provider;

setProviderId(provider.id);

setForm({
name: provider.name || "",
last_name: provider.last_name || "",
business_name: provider.business_name || "",
phone: provider.phone || "",
email: provider.email || "",
city: provider.city || "",
state: provider.state || "",
bio: provider.bio || "",
name_display: provider.name_display || "full",
  contact_call: provider.contact_call ?? false,
contact_text: provider.contact_text ?? false,
contact_email: provider.contact_email ?? false,
contact_youlistify: provider.contact_youlistify ?? false,
});

setLoading(false);
}

loadProvider();
}, []);

function updateField(
e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) {
setForm({
...form,
[e.target.name]: e.target.value,
});
}

async function saveListing(e: React.FormEvent) {
e.preventDefault();

if (!providerId) return;

setSaving(true);
setMessage("");

const { data: updatedProvider, error } = await supabase
.from("Providers")
.update({
name: form.name,
last_name: form.last_name,
business_name: form.business_name,
phone: form.phone,
email: form.email,
city: form.city,
state: form.state,
bio: form.bio,
  name_display: form.name_display,
  contact_call: form.contact_call,
contact_text: form.contact_text,
contact_email: form.contact_email,
contact_youlistify: form.contact_youlistify,
})
.eq("id", providerId)
  .select("name_display,contact_call,contact_text,contact_email,contact_youlistify")
.single();

if (error) {
setMessage("Could not save changes: " + error.message);
setSaving(false);
return;
}

setMessage(
`Your listing has been updated! Saved as: ${updatedProvider?.name_display}`
);
setSaving(false);
}

if (loading) {
return (
<main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
Loading your listing...
</main>
);
}

const fieldStyle = {
width: "100%",
padding: "14px",
borderRadius: "10px",
border: "1px solid #ddd",
fontSize: "16px",
marginTop: "6px",
};

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
maxWidth: "760px",
margin: "0 auto",
background: "white",
padding: "36px",
borderRadius: "24px",
boxShadow: "0 10px 35px rgba(0,0,0,.08)",
}}
>
<a
href="/dashboard"
style={{
color: "#4f46e5",
textDecoration: "none",
fontWeight: "600",
}}
>
← Back to Dashboard
</a>

<h1
style={{
fontSize: "40px",
color: "#182033",
marginBottom: "8px",
}}
>
Edit My Listing
</h1>

<p style={{ color: "#667085", marginBottom: "28px" }}>
Update the information customers see on your YouListify profile.
</p>

<form onSubmit={saveListing}>
<label>
First name
<input
name="name"
value={form.name}
onChange={updateField}
style={fieldStyle}
/>
</label>

<div style={{ height: "18px" }} />

<label>
Last name
<input
name="last_name"
value={form.last_name}
onChange={updateField}
style={fieldStyle}
/>
</label>

<div style={{ height: "18px" }} />

<label>
Business name
<input
name="business_name"
value={form.business_name}
onChange={updateField}
style={fieldStyle}
/>
</label>

<div style={{ height: "18px" }} />

<label>
Phone
<input
name="phone"
value={form.phone}
onChange={updateField}
style={fieldStyle}
/>
</label>

<div style={{ height: "18px" }} />

<label>
Email
<input
name="email"
type="email"
value={form.email}
onChange={updateField}
style={fieldStyle}
/>
</label>

<div style={{ height: "18px" }} />

<label>
City
<input
name="city"
value={form.city}
onChange={updateField}
style={fieldStyle}
/>
</label>

<div style={{ height: "18px" }} />

<label>
State
<input
name="state"
value={form.state}
onChange={updateField}
style={fieldStyle}
/>
</label>

<div style={{ height: "18px" }} />

<label>
About your service
<textarea
name="bio"
value={form.bio}
onChange={updateField}
rows={5}
style={fieldStyle}
/>
</label>

<div style={{ height: "24px" }} />

<label>
Public name display
<select
name="name_display"
value={form.name_display}
onChange={updateField}
style={fieldStyle}
>
<option value="full">Full name</option>
<option value="initial">First name + last initial</option>
<option value="first">First name only</option>
</select>
</label>
<div style={{ marginTop: "24px" }}>
<div style={{ fontWeight: "600", marginBottom: "10px" }}>
How would you like customers to contact you?
</div>

<label style={{ display: "block", marginBottom: "10px" }}>
<input
type="checkbox"
checked={form.contact_call}
onChange={(e) =>
setForm({ ...form, contact_call: e.target.checked })
}
/>{" "}
Call me
</label>

<label style={{ display: "block", marginBottom: "10px" }}>
<input
type="checkbox"
checked={form.contact_text}
onChange={(e) =>
setForm({ ...form, contact_text: e.target.checked })
}
/>{" "}
Text me
</label>

<label style={{ display: "block", marginBottom: "10px" }}>
<input
type="checkbox"
checked={form.contact_email}
onChange={(e) =>
setForm({ ...form, contact_email: e.target.checked })
}
/>{" "}
Email me
</label>

<label style={{ display: "block", marginBottom: "10px" }}>
<input
type="checkbox"
checked={form.contact_youlistify}
onChange={(e) =>
setForm({ ...form, contact_youlistify: e.target.checked })
}
/>{" "}
Contact me through YouListify
</label>

<div style={{ fontSize: "14px", color: "#667085", marginTop: "6px" }}>
Messages sent through YouListify will be delivered to your email without
displaying your email address to the customer.
</div>
</div>

<button
type="submit"
disabled={saving}
style={{
width: "100%",
marginTop: "22px",
padding: "16px",
border: "none",
borderRadius: "12px",
background: "#4f46e5",
color: "white",
fontSize: "17px",
fontWeight: "700",
cursor: "pointer",
}}
>
{saving ? "Saving..." : "Save Changes"}
</button>
</form>

{message && (
<p style={{ marginTop: "18px", color: "#182033" }}>{message}</p>
)}
</div>
</main>
);
}
