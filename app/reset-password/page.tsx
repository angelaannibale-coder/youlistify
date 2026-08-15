"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

  useEffect(() => {
const {
data: { subscription },
} = supabase.auth.onAuthStateChange((event) => {
if (event === "PASSWORD_RECOVERY") {
setMessage("");
}
});

return () => {
subscription.unsubscribe();
};
}, []);

async function handleReset(e: React.FormEvent) {
e.preventDefault();

if (password !== confirmPassword) {
setMessage("Passwords do not match.");
return;
}

if (password.length < 6) {
setMessage("Password must be at least 6 characters.");
return;
}

setLoading(true);
setMessage("");

const { error } = await supabase.auth.updateUser({
password,
});

if (error) {
setMessage(error.message);
setLoading(false);
return;
}

setMessage("Password updated! You can now sign in.");
setLoading(false);

setTimeout(() => {
window.location.href = "/sign-in";
}, 1500);
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
Reset your password
</h1>

<p style={{ marginBottom: "28px", color: "#666" }}>
Enter a new password for your YouListify account.
</p>

<form onSubmit={handleReset}>
<input
type="password"
placeholder="New password"
value={password}
onChange={(e) => setPassword(e.target.value)}
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
placeholder="Confirm new password"
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
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
{loading ? "Updating..." : "Set New Password"}
</button>
</form>

{message && (
<p style={{ marginTop: "18px" }}>{message}</p>
)}
</div>
</main>
);
}
