"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignInPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

async function handleSignIn(e: React.FormEvent) {
e.preventDefault();
setLoading(true);
setMessage("");

const { error } = await supabase.auth.signInWithPassword({
email,
password,
});

if (error) {
setMessage(error.message);
setLoading(false);
return;
}

window.location.href = "/dashboard";
}

return (
<main
style={{
minHeight: "100vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
background: "#f8f8fb",
padding: "24px",
}}
>
<div
style={{
width: "100%",
maxWidth: "460px",
background: "white",
padding: "40px",
borderRadius: "20px",
boxShadow: "0 10px 35px rgba(0,0,0,.08)",
}}
>
<h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
Welcome back
</h1>

<p style={{ marginBottom: "28px", color: "#666" }}>
Sign in to your YouListify account.
</p>

<form onSubmit={handleSignIn}>
<input
type="email"
placeholder="Email address"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
style={{
width: "100%",
padding: "15px",
marginBottom: "14px",
borderRadius: "10px",
border: "1px solid #ddd",
fontSize: "16px",
}}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
style={{
width: "100%",
padding: "15px",
marginBottom: "18px",
borderRadius: "10px",
border: "1px solid #ddd",
fontSize: "16px",
}}
/>

<button
type="submit"
disabled={loading}
style={{
width: "100%",
padding: "15px",
border: "none",
borderRadius: "10px",
background: "#4f46e5",
color: "white",
fontSize: "17px",
fontWeight: "bold",
cursor: "pointer",
}}
>
{loading ? "Signing in..." : "Sign In"}
</button>
</form>
  <button
type="button"
onClick={async () => {
if (!email) {
setMessage("Enter your email address first.");
return;
}

const { error } = await supabase.auth.resetPasswordForEmail(email, {
redirectTo: "https://youlistify.com/reset-password",
});

if (error) {
setMessage(error.message);
} else {
setMessage("Password reset email sent. Check your inbox.");
}
}}
style={{
background: "none",
border: "none",
color: "#4f46e5",
cursor: "pointer",
fontSize: "15px",
marginTop: "14px",
padding: "0",
textDecoration: "underline",
}}
>
Forgot password?
</button>

{message && (
<p style={{ marginTop: "18px", color: "#b91c1c" }}>{message}</p>
)}
</div>
</main>
);
}
