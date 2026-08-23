"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const badgeColors = [
  "linear-gradient(135deg,#5b5bf7,#8b5cf6)",
  "linear-gradient(135deg,#2563eb,#3b82f6)",
  "linear-gradient(135deg,#0f766e,#2dd4bf)",
  "linear-gradient(135deg,#ea580c,#fb923c)",
  "linear-gradient(135deg,#be185d,#ec4899)",
  "linear-gradient(135deg,#dc2626,#f87171)",
  "linear-gradient(135deg,#475569,#64748b)",
  "linear-gradient(135deg,#4d7c0f,#84cc16)"
];

function colorFor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return badgeColors[hash % badgeColors.length];
}

function makeMount(id: string, after: HTMLElement) {
  const existing = document.getElementById(id);
  if (existing) return existing;
  const mount = document.createElement("div");
  mount.id = id;
  after.insertAdjacentElement("afterend", mount);
  return mount;
}

export default function LaunchPolish() {
  const pathname = usePathname();
  const [serviceMode, setServiceMode] = useState("local");
  const [providerId, setProviderId] = useState<number | null>(null);
  const [modeMessage, setModeMessage] = useState("");
  const [savingMode, setSavingMode] = useState(false);
  const [serviceTarget, setServiceTarget] = useState<HTMLElement | null>(null);
  const [profileTarget, setProfileTarget] = useState<HTMLElement | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [uploadingProfile, setUploadingProfile] = useState(false);
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
        const { data: files } = await supabase.storage.from("provider-photos").list(String(data.id), { search: "profile-photo" });
        if (files?.some((file) => file.name === "profile-photo")) {
          const { data: publicData } = supabase.storage.from("provider-photos").getPublicUrl(`${data.id}/profile-photo`);
          setProfilePhotoUrl(`${publicData.publicUrl}?v=${Date.now()}`);
        }
      }
    })();

    const findTargets = () => {
      const serviceHeading = Array.from(document.querySelectorAll<HTMLElement>("div")).find((el) => el.textContent?.trim() === "Services");
      if (serviceHeading?.parentElement) setServiceTarget(makeMount("youlistify-service-mode-mount", serviceHeading.parentElement));
      const galleryHeading = Array.from(document.querySelectorAll<HTMLElement>("label,div")).find((el) => el.textContent?.trim() === "Gallery Photos (optional)");
      if (galleryHeading?.parentElement) setProfileTarget(makeMount("youlistify-profile-photo-mount", galleryHeading.parentElement));
    };
    findTargets();
    const observer = new MutationObserver(findTargets);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const recolor = () => {
      document.querySelectorAll<HTMLElement>(".avatar").forEach((avatar) => {
        const key = avatar.textContent?.trim() || "YouListify";
        avatar.style.background = colorFor(key);
      });
      if (pathname.startsWith("/provider/")) {
        const h1 = document.querySelector("main h1");
        const avatar = h1?.parentElement?.previousElementSibling as HTMLElement | null;
        const raw = pathname.split("/").filter(Boolean).pop() || "";
        const id = raw.split("-").pop() || "";
        if (avatar) {
          avatar.style.background = colorFor(id || avatar.textContent?.trim() || "YouListify");
          if (id) {
            const { data } = supabase.storage.from("provider-photos").getPublicUrl(`${id}/profile-photo`);
            const img = new Image();
            img.onload = () => {
              avatar.style.backgroundImage = `url(${data.publicUrl})`;
              avatar.style.backgroundSize = "cover";
              avatar.style.backgroundPosition = "center";
              avatar.textContent = "";
            };
            img.src = `${data.publicUrl}?v=1`;
          }
        }
      }
    };
    recolor();
    const observer = new MutationObserver(recolor);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!pathname.startsWith("/provider/")) return;
    const intercept = (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest("button");
      if (button?.textContent?.includes("Contact through YouListify")) {
        event.preventDefault(); event.stopPropagation(); setStatus(""); setContactOpen(true);
      }
    };
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [pathname]);

  async function saveMode() {
    if (!providerId) return setModeMessage("We could not find your listing.");
    setSavingMode(true); setModeMessage("");
    const { error } = await supabase.from("Providers").update({ service_mode: serviceMode }).eq("id", providerId);
    setSavingMode(false); setModeMessage(error ? "Could not save this change." : "Saved!");
  }

  async function uploadProfilePhoto(file: File | undefined) {
    if (!file || !providerId) return;
    setUploadingProfile(true); setProfileMessage("");
    const { error } = await supabase.storage.from("provider-photos").upload(`${providerId}/profile-photo`, file, { upsert: true, contentType: file.type || "image/jpeg" });
    setUploadingProfile(false);
    if (error) return setProfileMessage("Could not upload profile photo. Please try again.");
    const { data } = supabase.storage.from("provider-photos").getPublicUrl(`${providerId}/profile-photo`);
    setProfilePhotoUrl(`${data.publicUrl}?v=${Date.now()}`);
    setProfileMessage("Profile photo saved!");
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const raw = pathname.split("/").filter(Boolean).pop() || "";
    const id = Number(raw.split("-").pop());
    if (!id || !name.trim() || !email.trim() || !message.trim()) return setStatus("Please complete your name, email, and message.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setStatus("Please enter a valid email address.");
    setSending(true); setStatus("");
    const { error } = await supabase.functions.invoke("send-provider-message", { body: { providerId: id, customerName: name.trim(), customerEmail: email.trim(), message: message.trim() } });
    setSending(false);
    if (error) return setStatus("Your message could not be sent. Please try again.");
    setName(""); setEmail(""); setMessage(""); setStatus("Message sent!");
  }

  const serviceModeBlock = <div style={{ margin:"10px 0 24px",padding:"14px 16px",background:"#f8f8fb",border:"1px solid #e7e9f0",borderRadius:"14px" }}>
    <div style={{fontWeight:700,marginBottom:"4px"}}>How do you provide your service?</div>
    <div style={{fontSize:"13px",color:"#667085",marginBottom:"10px"}}>Local, remote, or both.</div>
    <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
      <select value={serviceMode} onChange={e=>setServiceMode(e.target.value)} style={{flex:"1 1 260px",padding:"10px 12px",border:"1px solid #ddd",borderRadius:"10px",fontSize:"15px",background:"white"}}><option value="local">Local / In-person</option><option value="remote">Remote / Online / Phone</option><option value="both">Local + Remote</option></select>
      <button type="button" onClick={saveMode} disabled={savingMode} style={{padding:"10px 18px",border:0,borderRadius:"10px",background:"#4f46e5",color:"white",fontWeight:700,cursor:"pointer"}}>{savingMode?"Saving...":"Save"}</button>
    </div>{modeMessage&&<div style={{fontSize:"13px",marginTop:"8px",color:"#667085"}}>{modeMessage}</div>}
  </div>;

  const profilePhotoBlock = <div style={{margin:"18px 0 24px",paddingTop:"18px",borderTop:"1px solid #eceef2"}}>
    <div style={{fontWeight:700,fontSize:"17px",marginBottom:"5px"}}>Profile Photo (optional)</div>
    <div style={{fontSize:"14px",color:"#667085",marginBottom:"12px"}}>Add one if you want. If not, YouListify will show your initials.</div>
    <div style={{display:"flex",alignItems:"center",gap:"14px",flexWrap:"wrap"}}>
      {profilePhotoUrl&&<img src={profilePhotoUrl} alt="Profile preview" style={{width:"72px",height:"72px",objectFit:"cover",borderRadius:"18px",border:"1px solid #e5e7eb"}} />}
      <div><input type="file" accept="image/*" onChange={e=>uploadProfilePhoto(e.target.files?.[0])}/><div style={{fontSize:"13px",color:"#667085",marginTop:"6px"}}>{uploadingProfile?"Uploading...":"You can add or replace this anytime."}</div></div>
    </div>
    {profileMessage&&<div style={{marginTop:"9px",fontSize:"13px",color:profileMessage.includes("saved")?"#15803d":"#b91c1c"}}>{profileMessage}</div>}
  </div>;

  return <>
    {serviceTarget&&pathname==="/dashboard/edit"&&createPortal(serviceModeBlock,serviceTarget)}
    {profileTarget&&pathname==="/dashboard/edit"&&createPortal(profilePhotoBlock,profileTarget)}
    {contactOpen&&<div onClick={()=>setContactOpen(false)} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(12,16,35,.56)",display:"grid",placeItems:"center",padding:"20px"}}><form onSubmit={sendMessage} onClick={e=>e.stopPropagation()} style={{width:"min(100%,560px)",background:"white",borderRadius:"24px",padding:"30px",boxShadow:"0 35px 100px rgba(0,0,0,.25)"}}><div style={{display:"flex",justifyContent:"space-between",gap:"16px"}}><h2 style={{margin:"0 0 18px"}}>Contact through YouListify</h2><button type="button" onClick={()=>setContactOpen(false)} style={{border:0,background:"transparent",fontSize:"26px",cursor:"pointer"}}>×</button></div><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{width:"100%",padding:"13px 14px",border:"1px solid #d9dce5",borderRadius:"12px",marginBottom:"12px"}}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email" style={{width:"100%",padding:"13px 14px",border:"1px solid #d9dce5",borderRadius:"12px",marginBottom:"12px"}}/><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Your message" style={{width:"100%",minHeight:"120px",padding:"13px 14px",border:"1px solid #d9dce5",borderRadius:"12px",marginBottom:"14px",resize:"vertical",font:"inherit"}}/><button type="submit" disabled={sending} style={{width:"100%",padding:"14px",border:0,borderRadius:"12px",background:"#4f46e5",color:"white",fontWeight:700,cursor:"pointer"}}>{sending?"Sending...":"Send Message"}</button>{status&&<p style={{margin:"14px 0 0",textAlign:"center",color:status==="Message sent!"?"#15803d":"#b91c1c"}}>{status}</p>}</form></div>}
  </>;
}
