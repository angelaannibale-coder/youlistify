"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const states = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
const categories=["Automotive","Beauty & Personal Care","Business & Professional Services","Cleaning","Creative & Media","Events & Entertainment","Fitness & Wellness","Home Repair & Improvement","Lawn, Garden & Outdoor","Lessons, Coaching & Tutoring","Moving, Hauling & Delivery","Personal, Family & Local Help","Pet Services","Real Estate & Property Services","Repairs, Crafts & Specialty Services","Technology & Digital"];
function getCategorySuggestions(value:string,categoryOptions:string[],serviceCatalog:{name:string;category:string}[]){const query=value.trim().toLowerCase();const options=categoryOptions.length?categoryOptions:categories;if(!query)return options.slice(0,16);const direct=options.filter(category=>category.toLowerCase().includes(query));const fromServices=serviceCatalog.filter(service=>service.name?.toLowerCase().includes(query)||service.category?.toLowerCase().includes(query)).map(service=>service.category).filter(Boolean);return Array.from(new Set([...direct,...fromServices])).slice(0,16);}
const draftKey = "youlistify-work-post-draft";

export default function PostWorkPage() {
  const [userId,setUserId]=useState("");
  const [saving,setSaving]=useState(false);
  const [showCategorySuggestions,setShowCategorySuggestions]=useState(false);
  const [showCitySuggestions,setShowCitySuggestions]=useState(false);
  const [citySuggestions,setCitySuggestions]=useState<{city:string;state:string}[]>([]);
  const [serviceCatalog,setServiceCatalog]=useState<{name:string;category:string}[]>([]);
  const [locationMode,setLocationMode]=useState<"local"|"remote"|"both">("local");
  const [form,setForm]=useState({post_type:"task",title:"",description:"",category:"",city:"",state:"",zip_code:"",remote:false,pay_type:"contact",pay_amount:"",contact_call:false,contact_text:false,contact_email:true,contact_youlistify:true,contact_phone:"",contact_email_address:"",application_url:""});
  const categoryBox=useRef<HTMLDivElement|null>(null);
  const cityBox=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    let saved:any=null;
    try { const raw=localStorage.getItem(draftKey); if(raw) saved=JSON.parse(raw); } catch {}
    supabase.auth.getSession().then(({data})=>{
      const user=data.session?.user;
      setUserId(user?.id||"");
      if(saved?.remote)setLocationMode("both");
      setForm(v=>({...v,...(saved||{}),contact_email_address:(saved?.contact_email_address||user?.email||v.contact_email_address)}));
    });
  },[]);

  useEffect(()=>{async function loadServiceCatalog(){const {data,error}=await supabase.from("services").select("name, category").order("category").order("name");if(!error&&data)setServiceCatalog(data as {name:string;category:string}[]);}void loadServiceCatalog();},[]);
  useEffect(()=>{function close(e:MouseEvent){if(categoryBox.current&&!categoryBox.current.contains(e.target as Node))setShowCategorySuggestions(false);if(cityBox.current&&!cityBox.current.contains(e.target as Node))setShowCitySuggestions(false);}document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close);},[]);
  useEffect(()=>{const value=form.city.trim();if(value.length<2){setCitySuggestions([]);return;}const timer=setTimeout(async()=>{try{const response=await fetch(`/api/cities?q=${encodeURIComponent(value)}`);const data=await response.json();setCitySuggestions(Array.isArray(data?.locations)?data.locations:[]);setShowCitySuggestions(true);}catch{setCitySuggestions([]);}},220);return()=>clearTimeout(timer);},[form.city]);
  useEffect(()=>{const zip=form.zip_code.replace(/\D/g,"");if(zip.length!==5)return;const timer=setTimeout(async()=>{try{const response=await fetch(`/api/cities?zip=${zip}`);const data=await response.json();const match=Array.isArray(data?.locations)?data.locations[0]:null;if(match?.city&&match?.state){setForm(v=>({...v,city:match.city,state:match.state}));setShowCitySuggestions(false);}}catch{}},220);return()=>clearTimeout(timer);},[form.zip_code]);

  const set=(key:string,value:any)=>setForm(v=>({...v,[key]:value}));
  const setLocationChoice=(mode:"local"|"remote"|"both")=>{setLocationMode(mode);setForm(v=>({...v,remote:mode!=="local"}));};
  const categoryOptions=Array.from(new Set(serviceCatalog.map(service=>service.category).filter(Boolean)));
  const categorySuggestions=getCategorySuggestions(form.category,categoryOptions,serviceCatalog);

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!form.contact_call&&!form.contact_text&&!form.contact_email&&!form.contact_youlistify&&!form.application_url.trim()){alert("Choose at least one way for people to respond.");return;}
    const missingLocation=[!form.city.trim()&&"city",!form.state.trim()&&"state",!form.zip_code.trim()&&"ZIP code"].filter(Boolean);
    if(missingLocation.length>0){alert(`Please fill in the ${missingLocation.join(", ")} above before posting. Even remote posts need a base city, state, and ZIP code so people know where the post is connected to.`);return;}

    if(!userId){
      localStorage.setItem(draftKey,JSON.stringify(form));
      window.location.href="/sign-in?next=/post-work&posting=1";
      return;
    }

    localStorage.setItem(draftKey,JSON.stringify(form));
    setSaving(true);
    const {data,error}=await supabase.from("work_posts").insert({...form,user_id:userId,pay_amount:form.pay_amount?Number(form.pay_amount):null,contact_phone:form.contact_phone.trim()||null,contact_email_address:form.contact_email_address.trim()||null,application_url:form.application_url.trim()||null}).select("id").single();
    setSaving(false);
    if(error){
      console.error("Work post publish error",error);
      alert(`We couldn't publish this yet. Your post is still saved.\n\n${error.message}${error.code?`\n\nCode: ${error.code}`:""}`);
      return;
    }
    localStorage.removeItem(draftKey);
    window.location.href=`/work/${data.id}`;
  }

  const input={width:"100%",padding:"14px 15px",border:"1px solid #d9dce7",borderRadius:12,fontSize:16,boxSizing:"border-box" as const};
  const check={display:"flex",gap:10,alignItems:"center",padding:"12px 0"};
  return <main style={{minHeight:"100vh",background:"#f8f8fb",padding:"40px 18px",fontFamily:"Arial,sans-serif"}}><form onSubmit={submit} style={{maxWidth:760,margin:"0 auto",background:"white",borderRadius:24,padding:"clamp(24px,5vw,42px)",boxShadow:"0 10px 35px rgba(0,0,0,.07)"}}><a href="/work" style={{color:"#5b4df5",textDecoration:"none",fontWeight:700}}>← Jobs, Gigs & Tasks</a><h1 style={{fontSize:"clamp(34px,6vw,48px)",marginBottom:8,color:"#171b36"}}>Post work on YouListify</h1><p style={{color:"#667085",lineHeight:1.6,marginBottom:28}}>Tell people what you need. Posting is free during launch. You can fill everything out first — we’ll only ask you to sign in or create your free account when you’re ready to post.</p>
  <label style={{fontWeight:800}}>What are you posting?</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,margin:"10px 0 24px"}}>{[["job","Job"],["gig","Gig"],["task","Task"]].map(([v,l])=><button key={v} type="button" onClick={()=>set("post_type",v)} style={{padding:"14px 8px",borderRadius:12,border:form.post_type===v?"2px solid #5b4df5":"1px solid #d9dce7",background:form.post_type===v?"#f1efff":"white",fontWeight:800,cursor:"pointer"}}>{l}</button>)}</div>
  <div style={{display:"grid",gap:16}}><input required style={input} placeholder="Title — e.g. Social Media Manager" value={form.title} onChange={e=>set("title",e.target.value)}/><div ref={categoryBox} style={{position:"relative"}}><input style={input} placeholder="Category — e.g. Marketing & Social Media" value={form.category} onFocus={()=>setShowCategorySuggestions(true)} onChange={e=>{set("category",e.target.value);setShowCategorySuggestions(true);}} autoComplete="off"/>{showCategorySuggestions&&categorySuggestions.length>0&&<div style={{position:"absolute",zIndex:20,top:"calc(100% + 6px)",left:0,right:0,background:"white",border:"1px solid #e2e4ea",borderRadius:12,boxShadow:"0 10px 28px rgba(0,0,0,.12)",maxHeight:260,overflowY:"auto"}}>{categorySuggestions.map((cat,i)=><button key={cat} type="button" onClick={()=>{set("category",cat);setShowCategorySuggestions(false);}} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 14px",background:"white",border:0,borderBottom:i<categorySuggestions.length-1?"1px solid #f0f1f4":"none",cursor:"pointer",fontSize:15,color:"#171b36"}}>{cat}</button>)}</div>}</div><textarea required style={{...input,minHeight:150,resize:"vertical"}} placeholder="Describe what you need, responsibilities, timing, experience, or anything else people should know." value={form.description} onChange={e=>set("description",e.target.value)}/></div>
  <h2 style={{marginTop:30,marginBottom:10}}>Where?</h2><p style={{color:"#667085",lineHeight:1.5,margin:"0 0 10px"}}>Check what applies, then enter the post's base location.</p><div style={{display:"grid",gap:4,marginBottom:14}}><label style={{...check,padding:"6px 0",cursor:"pointer",fontWeight:800}}><input type="checkbox" checked={locationMode!=="remote"} onChange={e=>setLocationChoice(e.target.checked?(locationMode==="remote"?"both":"local"):(locationMode==="both"?"remote":"local"))}/><span>Local / tied to this city</span></label><label style={{...check,padding:"6px 0",cursor:"pointer",fontWeight:800}}><input type="checkbox" checked={locationMode!=="local"} onChange={e=>setLocationChoice(e.target.checked?(locationMode==="local"?"both":"remote"):(locationMode==="both"?"local":"remote"))}/><span>Remote / can be done from anywhere</span></label></div><div style={{display:"grid",gridTemplateColumns:"minmax(0,2fr) minmax(88px,1fr) minmax(100px,1fr)",gap:10}}><div ref={cityBox} style={{position:"relative"}}><input style={input} placeholder="City" value={form.city} onFocus={()=>citySuggestions.length&&setShowCitySuggestions(true)} onChange={e=>{set("city",e.target.value);setShowCitySuggestions(true);}} autoComplete="off"/>{showCitySuggestions&&citySuggestions.length>0&&<div style={{position:"absolute",zIndex:20,top:"calc(100% + 6px)",left:0,right:0,background:"white",border:"1px solid #e2e4ea",borderRadius:12,boxShadow:"0 10px 28px rgba(0,0,0,.12)",maxHeight:240,overflowY:"auto"}}>{citySuggestions.map((s,i)=><button key={`${s.city}-${s.state}-${i}`} type="button" onClick={()=>{setForm(v=>({...v,city:s.city,state:s.state}));setShowCitySuggestions(false);}} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 14px",background:"white",border:0,borderBottom:i<citySuggestions.length-1?"1px solid #f0f1f4":"none",cursor:"pointer",fontSize:15,color:"#171b36"}}>{s.city}, {s.state}</button>)}</div>}</div><select style={input} value={form.state} onChange={e=>set("state",e.target.value)}><option value="">State</option>{states.map(s=><option key={s}>{s}</option>)}</select><input style={input} placeholder="ZIP" inputMode="numeric" value={form.zip_code} onChange={e=>set("zip_code",e.target.value)}/></div>
  <h2 style={{marginTop:30}}>Pay</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><select style={input} value={form.pay_type} onChange={e=>set("pay_type",e.target.value)}><option value="contact">Discuss pay</option><option value="hourly">Hourly</option><option value="flat">Flat amount</option><option value="salary">Salary</option></select>{form.pay_type!=="contact"&&<input style={input} type="number" min="0" step="0.01" placeholder="Amount ($)" value={form.pay_amount} onChange={e=>set("pay_amount",e.target.value)}/>}</div>
  <h2 style={{marginTop:30}}>How can people respond?</h2><label style={check}><input type="checkbox" checked={form.contact_call} onChange={e=>set("contact_call",e.target.checked)}/> Call</label><label style={check}><input type="checkbox" checked={form.contact_text} onChange={e=>set("contact_text",e.target.checked)}/> Text</label>{(form.contact_call||form.contact_text)&&<input style={input} placeholder="Phone number" value={form.contact_phone} onChange={e=>set("contact_phone",e.target.value)}/>}<label style={check}><input type="checkbox" checked={form.contact_email} onChange={e=>set("contact_email",e.target.checked)}/> Email</label>{form.contact_email&&<input style={input} type="email" placeholder="Contact email" value={form.contact_email_address} onChange={e=>set("contact_email_address",e.target.value)}/>}<label style={check}><input type="checkbox" checked={form.contact_youlistify} onChange={e=>set("contact_youlistify",e.target.checked)}/> Contact through YouListify</label><input style={input} placeholder="Application / website link (optional)" value={form.application_url} onChange={e=>set("application_url",e.target.value)}/>
  <button disabled={saving} style={{width:"100%",marginTop:30,padding:16,border:0,borderRadius:13,background:"#5b4df5",color:"white",fontWeight:900,fontSize:17,cursor:"pointer"}}>{saving?"Posting...":"Post It Free"}</button></form></main>;
}
