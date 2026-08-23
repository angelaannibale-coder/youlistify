"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function LaunchPolish() {
  const pathname = usePathname();
  const [serviceMode, setServiceMode] = useState("local");
  const [providerId, setProviderId] = useState<number | null>(null);
  const [modeMessage, setModeMessage] = useState("");
  const [savingMode, setSavingMode] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (pathname !== "/dashboard/edit") return;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase.from("Providers").select("id,service_mode").eq("user_id", auth.user.id).single();
      if (data) {
        setProviderId(data.id);
        setServiceMode(data.service_mode || "local");
      }
    })();
  }, [pathname]);

  useEffect(() => {
    if (!pathname.startsWith("/provider/")) return;
    const intercept = (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest("button");
      if (button?.textContent?.includes("Contact through YouListify")) {
        event.preventDefault();
        event.stopPropagation();
        setStatus("");
        setContactOpen(true);
      }
    };
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [pathname]);

  async function saveMode() {
    if (!providerId) return setModeMessage("We could not find your listing.");
    setSavingMode(true);
    const { error } = await supabase.from("Providers").update({ service_mode: serviceMode }).eq("id", providerId);
    setSavingMode(false);
    setModeMessage(error ? "Could not save this change." : "Service type saved!");
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const id = Number(pathname.split("/").filter(Boolean).pop());
    if (!id || !name.trim() || !email.trim() || !message.trim()) return setStatus("Please complete your name, email, and message.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setStatus("Please enter a valid email address.");
    setSending(true);
    setStatus("");
    const { error } = await supabase.functions.invoke("send-provider-message", { body: { providerId: id, customerName: name.trim(), customerEmail: email.trim(), message: message.trim() } });
    setSending(false);
    if (error) return setStatus("Your message could not be sent. Please try again.");
    setName(""); setEmail(""); setMessage(""); setStatus("Message sent!");
  }

  return <>
    {pathname === "/dashboard/edit" && <section style={{background:"#f8f8fb",padding:"0 20px 40px"}}>
      <div style={{maxWidth:"760px",margin:"0 auto",background:"white",padding:"28px 36px",borderRadius:"24px",boxShadow:"0 10px 35px rgba(0,0,0,.08)"}}>
        <div style={{fontWeight:700,fontSize:"18px",marginBottom:"6px"}}>How do you provide your service?</div>
        <div style={{color:"#667085",fontSize:"14px",marginBottom:"14px"}}>You can change this anytime.</div>
        <select value={serviceMode} onChange={e=>setServiceMode(e.target.value)} style={{width:"100%",padding:"14px",border:"1px solid #ddd",borderRadius:"10px",fontSize:"16px"}}>
          <option value="local">Local / In-person</option><option value="remote">Remote / Online / Phone</option><option value="both">Local + Remote</option>
        </select>
        <button type="button" onClick={saveMode} disabled={savingMode} style={{width:"100%",marginTop:"14px",padding:"14px",border:0,borderRadius:"12px",background:"#4f46e5",color:"white",fontWeight:700,cursor:"pointer"}}>{savingMode?"Saving...":"Save Service Type"}</button>
        {modeMessage && <p style={{margin:"12px 0 0"}}>{modeMessage}</p>}
      </div>
    </section>}

    {contactOpen && <div onClick={()=>setContactOpen(false)} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(12,16,35,.56)",display:"grid",placeItems:"center",padding:"20px"}}>
      <form onSubmit={sendMessage} onClick={e=>e.stopPropagation()} style={{width:"min(100%,560px)",background:"white",borderRadius:"24px",padding:"30px",boxShadow:"0 35px 100px rgba(0,0,0,.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:"16px"}}><h2 style={{margin:"0 0 18px"}}>Contact through YouListify</h2><button type="button" onClick={()=>setContactOpen(false)} style={{border:0,background:"transparent",fontSize:"26px",cursor:"pointer"}}>×</button></div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{width:"100%",padding:"13px 14px",border:"1px solid #d9dce5",borderRadius:"12px",marginBottom:"12px"}} />
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email" style={{width:"100%",padding:"13px 14px",border:"1px solid #d9dce5",borderRadius:"12px",marginBottom:"12px"}} />
        <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Your message" style={{width:"100%",minHeight:"120px",padding:"13px 14px",border:"1px solid #d9dce5",borderRadius:"12px",marginBottom:"14px",resize:"vertical",font:"inherit"}} />
        <button type="submit" disabled={sending} style={{width:"100%",padding:"14px",border:0,borderRadius:"12px",background:"#4f46e5",color:"white",fontWeight:700,cursor:"pointer"}}>{sending?"Sending...":"Send Message"}</button>
        {status && <p style={{margin:"14px 0 0",textAlign:"center",color:status==="Message sent!"?"#15803d":"#b91c1c"}}>{status}</p>}
      </form>
    </div>}
  </>;
}
