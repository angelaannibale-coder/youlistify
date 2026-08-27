"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [claimMode, setClaimMode] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage(error.message); setLoading(false); return; }
    window.location.href = "/dashboard";
  }

  async function createAccountForListing(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setMessage("Enter the email used on your listing and choose a password."); return; }
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: "https://youlistify.com/dashboard" } });
    setLoading(false);
    if (error) { setMessage(error.message); return; }
    setMessage("Account created. Check your email to confirm it, then sign in. Your listing will be connected automatically using the same email address.");
  }

  const inputStyle = { width:"100%", padding:"15px", marginBottom:"14px", borderRadius:"10px", border:"1px solid #ddd", fontSize:"16px", boxSizing:"border-box" as const };

  return <main style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8f8fb",padding:"24px"}}>
    <div style={{width:"100%",maxWidth:"460px",background:"white",padding:"40px",borderRadius:"20px",boxShadow:"0 10px 35px rgba(0,0,0,.08)"}}>
      <h1 style={{fontSize:"36px",marginBottom:"10px"}}>{claimMode ? "Claim your listing" : "Welcome back"}</h1>
      <p style={{marginBottom:"28px",color:"#666",lineHeight:1.55}}>{claimMode ? "Already created a listing but didn't create your account? Use the same email address from your listing and choose a password." : "Sign in to your YouListify account."}</p>
      <form onSubmit={claimMode ? createAccountForListing : handleSignIn} autoComplete="on">
        <input type="email" name="email" autoComplete="email" inputMode="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required style={inputStyle}/>
        <input type="password" name="password" autoComplete={claimMode ? "new-password" : "current-password"} placeholder={claimMode ? "Choose a password" : "Password"} value={password} onChange={e=>setPassword(e.target.value)} required style={{...inputStyle,marginBottom:"18px"}}/>
        <button type="submit" disabled={loading} style={{width:"100%",padding:"15px",border:"none",borderRadius:"10px",background:"#4f46e5",color:"white",fontSize:"17px",fontWeight:"bold",cursor:"pointer"}}>{loading ? "Please wait..." : claimMode ? "Create My Free Account" : "Sign In"}</button>
      </form>
      {!claimMode && <button type="button" onClick={async()=>{if(!email){setMessage("Enter your email address first.");return;} const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:"https://youlistify.com/reset-password"}); setMessage(error?error.message:"Password reset email sent. Check your inbox.");}} style={{background:"none",border:"none",color:"#4f46e5",cursor:"pointer",fontSize:"15px",marginTop:"14px",padding:0,textDecoration:"underline"}}>Forgot password?</button>}
      <div style={{marginTop:"28px",paddingTop:"22px",borderTop:"1px solid #eee",textAlign:"center"}}>
        <p style={{color:"#667085",fontSize:"14px",marginBottom:"10px"}}>{claimMode ? "Already have an account?" : "Created a listing but haven't created your account yet?"}</p>
        <button type="button" onClick={()=>{setClaimMode(!claimMode);setMessage("");setPassword("");}} style={{background:"none",border:"none",color:"#4f46e5",fontWeight:700,cursor:"pointer",fontSize:"15px",textDecoration:"underline"}}>{claimMode ? "Back to Sign In" : "Create an account to manage my listing"}</button>
      </div>
      {message && <p style={{marginTop:"18px",color:message.startsWith("Account created")||message.startsWith("Password reset")?"#166534":"#b91c1c",lineHeight:1.5}}>{message}</p>}
    </div>
  </main>;
}
