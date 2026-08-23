"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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
  const [profileTarget, setProfileTarget] = useState<HTMLElement | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [uploadingProfile, setUploadingProfile] = useState(false);

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
        if (files?.some((f) => f.name === "profile-photo")) {
          const { data: publicData } = supabase.storage.from("provider-photos").getPublicUrl(`${data.id}/profile-photo`);
          setProfilePhotoUrl(`${publicData.publicUrl}?v=${Date.now()}`);
        }
      }
    })();

    const timer = window.setInterval(() => {
      const labels = Array.from(document.querySelectorAll("div"));
      const galleryLabel = labels.find((el) => el.textContent?.trim() === "Gallery Photos (optional)");
      const galleryBlock = galleryLabel?.parentElement as HTMLElement | null;
      if (galleryBlock) {
        setProfileTarget(galleryBlock);
        window.clearInterval(timer);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [pathname]);

  useEffect(() => {
    const recolor = () => {
      document.querySelectorAll<HTMLElement>(".avatar").forEach((avatar) => {
        const key = avatar.textContent?.trim() || "YouListify";
        avatar.style.background = colorFor(key);
      });

      if (pathname.startsWith("/provider/")) {
        const h1 = document.querySelector("main h1");
        const info = h1?.parentElement;
        const avatar = info?.previousElementSibling as HTMLElement | null;
        const id = pathname.split("/").filter(Boolean).pop()?.split("-").pop() || "";
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
    if (pathname !== "/") return;
    const applyProfilePhotos = () => {
      document.querySelectorAll<HTMLElement>(".avatar").forEach((avatar) => {
        const card = avatar.closest("article, .provider-card, .card, div");
        const profileLink = card?.querySelector<HTMLAnchorElement>('a[href^="/provider/"]');
        const id = profileLink?.getAttribute("href")?.split("/").filter(Boolean).pop()?.split("-").pop();
        if (!id || avatar.dataset.profileChecked === id) return;
        avatar.dataset.profileChecked = id;
        const { data } = supabase.storage.from("provider-photos").getPublicUrl(`${id}/profile-photo`);
        const img = new Image();
        img.onload = () => {
          avatar.style.backgroundImage = `url(${data.publicUrl})`;
          avatar.style.backgroundSize = "cover";
          avatar.style.backgroundPosition = "center";
          avatar.textContent = "";
        };
        img.src = `${data.publicUrl}?v=1`;
      });
    };
    applyProfilePhotos();
    const observer = new MutationObserver(applyProfilePhotos);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
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

  async function uploadProfilePhoto(file: File | undefined) {
    if (!file || !providerId) return;
    setUploadingProfile(true);
    setProfileMessage("");

    const { error } = await supabase.storage
      .from("provider-photos")
      .upload(`${providerId}/profile-photo`, file, { upsert: true, contentType: file.type || "image/jpeg" });

    setUploadingProfile(false);
    if (error) {
      setProfileMessage("Could not upload profile photo. Please try again.");
      return;
    }

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
    setSending(true);
    setStatus("");
    const { error } = await supabase.functions.invoke("send-provider-message", { body: { providerId: id, customerName: name.trim(), customerEmail: email.trim(), message: message.trim() } });
    setSending(false);
    if (error) return setStatus("Your message could not be sent. Please try again.");
    setName(""); setEmail(""); setMessage(""); setStatus("Message sent!");
  }

  const profilePhotoBlock = (
    <div style={{marginTop:"24px",paddingTop:"22px",borderTop:"1px solid #eceef2"}}>
      <div style={{fontWeight:700,fontSize:"17px",marginBottom:"6px"}}>Profile Photo (optional)</div>
      <div style={{fontSize:"14px",color:"#667085",marginBottom:"12px"}}>Add a profile photo if you want one. If not, YouListify will use your initials.</div>
      <div style={{display:"flex",alignItems:"center",gap:"16px",flexWrap:"wrap"}}>
        {profilePhotoUrl ? (
          <img src={profilePhotoUrl} alt="Profile preview" style={{width:"76px",height:"76px",objectFit:"cover",borderRadius:"20px",border:"1px solid #e5e7eb"}} />
        ) : (
          <div style={{width:"76px",height:"76px",borderRadius:"20px",display:"grid",placeItems:"center",background:colorFor(String(providerId || "YouListify")),color:"white",fontWeight:800,fontSize:"24px"}}>Y</div>
        )}
        <div>
          <input type="file" accept="image/*" onChange={(e)=>uploadProfilePhoto(e.target.files?.[0])} />
          <div style={{fontSize:"13px",color:"#667085",marginTop:"7px"}}>{uploadingProfile ? "Uploading..." : "You can add or replace this anytime."}</div>
        </div>
      </div>
      {profileMessage && <p style={{margin:"10px 0 0",fontSize:"14px",color:profileMessage.includes("saved")?"#15803d":"#b91c1c"}}>{profileMessage}</p>}
    </div>
  );

  return <>
    {profileTarget && pathname === "/dashboard/edit" && createPortal(profilePhotoBlock, profileTarget)}

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
