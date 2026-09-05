"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type Provider = {id:number;name:string|null;last_name:string|null;business_name:string|null;email:string|null;phone:string|null;city:string|null;state:string|null;bio:string|null;name_display?:string|null;user_id:string|null;};
type WorkPost = {id:number;post_type:string;title:string;category:string|null;status:string;created_at:string;};
type WorkMessage = {id:number;work_post_id:number;sender_name:string;sender_email:string;message:string;created_at:string;};
type ProviderMessage = {id:string;provider_id:number;sender_name:string;sender_email:string;message:string;created_at:string;};

export default function DashboardPage() {
  const [provider,setProvider]=useState<Provider|null>(null);
  const [posts,setPosts]=useState<WorkPost[]>([]);
  const [messages,setMessages]=useState<WorkMessage[]>([]);
  const [providerMessages,setProviderMessages]=useState<ProviderMessage[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const [userEmail,setUserEmail]=useState("");

  async function loadProviderMessages(providerId:number){
    const {data,error}=await supabase.from("provider_messages").select("id,provider_id,sender_name,sender_email,message,created_at").eq("provider_id",providerId).order("created_at",{ascending:false});
    if(!error)setProviderMessages((data||[]) as ProviderMessage[]);
  }

  async function loadDashboard(){
    const {data:{session}}=await supabase.auth.getSession();
    if(!session?.user){window.location.href="/sign-in";return;}
    setUserEmail(session.user.email||"");

    const {data:workPosts}=await supabase.from("work_posts").select("id,post_type,title,category,status,created_at").eq("user_id",session.user.id).order("created_at",{ascending:false});
    const ownedPosts=(workPosts||[]) as WorkPost[];
    setPosts(ownedPosts);

    if(ownedPosts.length>0){
      const ids=ownedPosts.map(p=>p.id);
      const {data:workMessages,error:messagesError}=await supabase.from("work_post_messages").select("id,work_post_id,sender_name,sender_email,message,created_at").in("work_post_id",ids).order("created_at",{ascending:false});
      if(!messagesError)setMessages((workMessages||[]) as WorkMessage[]);
    }

    const selectFields="id,name,last_name,business_name,email,phone,city,state,bio,name_display,user_id";
    const {data:owned}=await supabase.from("Providers").select(selectFields).eq("user_id",session.user.id).maybeSingle();
    if(owned){setProvider(owned as Provider);await loadProviderMessages((owned as Provider).id);setLoading(false);return;}

    try{
      const response=await fetch("/api/claim-listing",{method:"POST",headers:{Authorization:`Bearer ${session.access_token}`}});
      const result=await response.json();
      if(response.ok&&result.provider){setProvider(result.provider as Provider);await loadProviderMessages((result.provider as Provider).id);setLoading(false);return;}
      if(response.status===409){setMessage("We found more than one unclaimed listing using this email. Please contact YouListify support so we can safely connect the correct listing.");}
      else if(ownedPosts.length===0){setMessage("You don’t have a service listing yet. You can create one anytime, or use this account just for Jobs, Gigs & Tasks.");}
    }catch{}
    setLoading(false);
  }

  useEffect(()=>{loadDashboard();},[]);

  async function setStatus(id:number,status:string){const {error}=await supabase.from("work_posts").update({status,updated_at:new Date().toISOString()}).eq("id",id);if(error){alert(error.message);return;}setPosts(v=>v.map(p=>p.id===id?{...p,status}:p));}
  async function removePost(id:number){if(!window.confirm("Delete this post? This cannot be undone."))return;const {error}=await supabase.from("work_posts").delete().eq("id",id);if(error){alert(error.message);return;}setPosts(v=>v.filter(p=>p.id!==id));setMessages(v=>v.filter(m=>m.work_post_id!==id));}
  async function handleSignOut(){await supabase.auth.signOut();window.location.href="/";}

  if(loading)return <main style={{padding:40,fontFamily:"Arial,sans-serif"}}>Loading your dashboard...</main>;
  const hasPosts=posts.length>0;
  const postTitle=(id:number)=>posts.find(p=>p.id===id)?.title||"Work post";

  return <main style={{minHeight:"100vh",background:"#f8f8fb",padding:"40px 20px",fontFamily:"Arial,sans-serif"}}><div style={{maxWidth:960,margin:"0 auto",background:"white",borderRadius:24,padding:"36px",boxShadow:"0 10px 35px rgba(0,0,0,.08)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,flexWrap:"wrap",marginBottom:28}}><div><div style={{color:"#5b4cf0",fontWeight:700,marginBottom:8}}>YOULISTIFY ACCOUNT</div><h1 style={{fontSize:40,margin:0,color:"#182033"}}>My Dashboard</h1><div style={{color:"#667085",marginTop:8}}>{userEmail}</div></div><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{hasPosts&&<a href="/post-work" style={primary}>Post a Job / Gig / Task</a>}{provider&&<a href="/dashboard/edit" style={primary}>Edit My Listing</a>}{provider&&!hasPosts&&<a href="/work" style={secondary}>View Job Posts</a>}{!provider&&hasPosts&&<a href="/list-service" style={secondary}>List My Services</a>}{!provider&&!hasPosts&&<><a href="/list-service" style={primary}>List My Service</a><a href="/post-work" style={primary}>Post a Job / Gig / Task</a></>}</div></div>
    {message&&<div style={{padding:18,borderRadius:12,background:"#fff7ed",marginBottom:24,lineHeight:1.5}}>{message}</div>}

    {provider&&<section style={{marginBottom:34}}><h2 style={{color:"#182033"}}>My Service Listing</h2><p style={{color:"#667085"}}>Manage the service listing connected to this account.</p><div style={{display:"grid",gap:16,gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))"}}><div style={card}><strong>Listing name</strong><div style={muted}>{provider.business_name||provider.name||"Not added"}</div></div><div style={card}><strong>Location</strong><div style={muted}>{[provider.city,provider.state].filter(Boolean).join(", ")||"Not added"}</div></div><div style={card}><strong>Email</strong><div style={muted}>{provider.email||"Not added"}</div></div><div style={card}><strong>Phone</strong><div style={muted}>{provider.phone||"Not added"}</div></div></div><div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:16}}><a href="/dashboard/edit" style={secondary}>Edit Listing</a><a href={`/provider/${provider.id}`} style={secondary}>View Listing</a></div></section>}

    {!provider&&!hasPosts&&<section style={{marginBottom:34,padding:22,borderRadius:16,background:"#f7f6ff"}}><h2 style={{marginTop:0,color:"#182033"}}>What would you like to do?</h2><p style={{color:"#667085",lineHeight:1.6}}>Create a service listing or post a Job, Gig, or Task.</p><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><a href="/list-service" style={secondary}>List My Service</a><a href="/post-work" style={secondary}>Post a Job / Gig / Task</a></div></section>}

    {provider&&<section style={{marginBottom:34}}><div><h2 style={{color:"#182033",marginBottom:6}}>Listing Messages</h2><p style={{color:"#667085",marginTop:0}}>Inquiries sent through Contact through YouListify on your service listing.</p></div>{providerMessages.length===0?<div style={{padding:22,border:"1px solid #eee",borderRadius:16,color:"#667085"}}>No listing messages yet.</div>:<div style={{display:"grid",gap:14}}>{providerMessages.map(m=>{const subject=encodeURIComponent(`Re: Your YouListify service listing`);return <div key={m.id} style={{border:"1px solid #ececf2",borderRadius:16,padding:20,background:"#fbfbfe"}}><h3 style={{margin:"0 0 4px",color:"#182033"}}>{m.sender_name}</h3><a href={`mailto:${m.sender_email}`} style={{color:"#4f46e5",fontWeight:700,textDecoration:"none",wordBreak:"break-all"}}>{m.sender_email}</a><p style={{color:"#454b60",lineHeight:1.6,whiteSpace:"pre-wrap",marginBottom:8}}>{m.message}</p><div style={{color:"#98a2b3",fontSize:13,marginBottom:14}}>{new Date(m.created_at).toLocaleString()}</div><a href={`mailto:${m.sender_email}?subject=${subject}`} style={{...smallBtn,background:"#4f46e5",color:"white"}}>Reply by Email</a></div>})}</div>}</section>}

    {provider&&!hasPosts&&<section style={{marginBottom:34,padding:22,borderRadius:16,background:"#f7f6ff"}}><h2 style={{marginTop:0,color:"#182033"}}>Want to post something?</h2><p style={{color:"#667085",lineHeight:1.6}}>Post a Job, Gig, or Task. Because you’re already signed in, it will connect to this account automatically.</p><a href="/post-work" style={primary}>Post a Job / Gig / Task</a></section>}\n\n    {hasPosts&&<><section style={{marginBottom:34}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}><div><h2 style={{color:"#182033",marginBottom:6}}>My Work Posts</h2><p style={{color:"#667085",marginTop:0}}>Jobs, Gigs & Tasks posted from this account.</p></div><a href="/post-work" style={primary}>+ Post New</a></div>
    {!hasPosts?<div style={{padding:22,border:"1px solid #eee",borderRadius:16,color:"#667085"}}>No work posts yet.</div>:<div style={{display:"grid",gap:14}}>{posts.map(p=><div key={p.id} style={{border:"1px solid #ececf2",borderRadius:16,padding:20}}><div style={{display:"flex",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}><div><div style={{color:"#5b4cf0",fontWeight:900,textTransform:"uppercase",fontSize:13}}>{p.post_type} · {p.status}</div><h3 style={{margin:"7px 0 4px",fontSize:22,color:"#182033"}}>{p.title}</h3>{p.category&&<div style={{color:"#667085"}}>{p.category}</div>}</div><div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-start"}}><a href={`/work/${p.id}`} style={smallBtn}>View</a><a href={`/work/${p.id}/edit`} style={smallBtn}>Edit</a>{p.status==="active"?<button onClick={()=>setStatus(p.id,"paused")} style={smallBtn}>Pause</button>:<button onClick={()=>setStatus(p.id,"active")} style={smallBtn}>Activate</button>}<button onClick={()=>setStatus(p.id,"closed")} style={smallBtn}>Close</button><button onClick={()=>removePost(p.id)} style={{...smallBtn,color:"#b42318"}}>Delete</button></div></div></div>)}</div>}
    </section>

    <section><div><h2 style={{color:"#182033",marginBottom:6}}>Messages</h2><p style={{color:"#667085",marginTop:0}}>Responses sent through YouListify to your work posts.</p></div>
    {messages.length===0?<div style={{padding:22,border:"1px solid #eee",borderRadius:16,color:"#667085"}}>No YouListify messages yet.</div>:<div style={{display:"grid",gap:14}}>{messages.map(m=>{
      const subject=encodeURIComponent(`Re: ${postTitle(m.work_post_id)} on YouListify`);
      return <div key={m.id} style={{border:"1px solid #ececf2",borderRadius:16,padding:20,background:"#fbfbfe"}}><div style={{color:"#5b4cf0",fontWeight:800,fontSize:13,textTransform:"uppercase"}}>About: {postTitle(m.work_post_id)}</div><h3 style={{margin:"8px 0 4px",color:"#182033"}}>{m.sender_name}</h3><a href={`mailto:${m.sender_email}`} style={{color:"#4f46e5",fontWeight:700,textDecoration:"none",wordBreak:"break-all"}}>{m.sender_email}</a><p style={{color:"#454b60",lineHeight:1.6,whiteSpace:"pre-wrap",marginBottom:8}}>{m.message}</p><div style={{color:"#98a2b3",fontSize:13,marginBottom:14}}>{new Date(m.created_at).toLocaleString()}</div><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><a href={`/work/${m.work_post_id}`} style={smallBtn}>View Post</a><a href={`mailto:${m.sender_email}?subject=${subject}`} style={{...smallBtn,background:"#4f46e5",color:"white"}}>Reply by Email</a></div></div>})}</div>}
    </section></>}

    <a href="/" style={{display:"inline-block",marginTop:28,color:"#4f46e5",textDecoration:"none",fontWeight:600}}>← Back to YouListify</a><button onClick={handleSignOut} style={{display:"block",marginTop:18,border:"1px solid #ddd",background:"white",padding:"12px 18px",borderRadius:10,cursor:"pointer",fontWeight:600}}>Sign Out</button>
  </div></main>;
}
const primary={background:"#4f46e5",color:"white",padding:"12px 18px",borderRadius:10,textDecoration:"none",fontWeight:700};
const secondary={display:"inline-block",background:"#f5f3ff",color:"#4f46e5",padding:"11px 16px",borderRadius:10,textDecoration:"none",fontWeight:700,border:"1px solid #ddd6fe"};
const smallBtn={background:"white",color:"#4f46e5",padding:"9px 12px",borderRadius:9,textDecoration:"none",fontWeight:700,border:"1px solid #d9dce7",cursor:"pointer"};
const card={border:"1px solid #eee",borderRadius:16,padding:20};
const muted={marginTop:8,color:"#667085"};
