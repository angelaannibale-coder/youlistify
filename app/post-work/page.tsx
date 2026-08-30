"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const states = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
const draftKey = "youlistify-work-post-draft";

export default function PostWorkPage() {
  const [userId,setUserId]=useState("");
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({post_type:"task",title:"",description:"",category:"",city:"",state:"",zip_code:"",remote:false,pay_type:"contact",pay_amount:"",contact_call:false,contact_text:false,contact_email:true,contact_youlistify:true,contact_phone:"",contact_email_address:"",application_url:""});

  useEffect(()=>{
    let saved:any=null;
    try { const raw=sessionStorage.getItem(draftKey); if(raw) saved=JSON.parse(raw); } catch {}
    supabase.auth.getSession().then(({data})=>{
      const user=data.session?.user;
      setUserId(user?.id||"");
      setForm(v=>({...v,...(saved||{}),contact_email_address:(saved?.contact_email_address||user?.email||v.contact_email_address)}));
    });
  },[]);

  const set=(key:string,value:any)=>setForm(v=>({...v,[key]:value}));

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!form.contact_call&&!form.contact_text&&!form.contact_email&&!form.contact_youlistify&&!form.application_url.trim()){alert("Choose at least one way for people to respond.");return;}

    if(!userId){
      sessionStorage.setItem(draftKey,JSON.stringify(form));
      window.location.href="/sign-in?next=/post-work&posting=1";
      return;
    }

    setSaving(true);
    const {data,error}=await supabase.from("work_posts").insert({...form,user_id:userId,pay_amount:form.pay_amount?Number(form.pay_amount):null,contact_phone:form.contact_phone.trim()||null,contact_email_address:form.contact_email_address.trim()||null,application_url:form.application_url.trim()||null}).select("id").single();
    setSaving(false);
    if(error){console.error(error);alert(error.message.includes("work_posts")?"The Jobs / Gigs / Tasks database step still needs to be completed in Supabase.":error.message);return;}
    sessionStorage.removeItem(draftKey);
    window.location.href=`/work/${data.id}`;
  }

  const input={width:"100%",padding:"14px 15px",border:"1px solid #d9dce7",borderRadius:12,fontSize:16,boxSizing:"border-box" as const};
  const check={display:"flex",gap:10,alignItems:"center",padding:"12px 0"};
  return <main style={{minHeight:"100vh",background:"#f8f8fb",padding:"40px 18px",fontFamily:"Arial,sans-serif"}}><form onSubmit={submit} style={{maxWidth:760,margin:"0 auto",background:"white",borderRadius:24,padding:"clamp(24px,5vw,42px)",boxShadow:"0 10px 35px rgba(0,0,0,.07)"}}><a href="/work" style={{color:"#5b4df5",textDecoration:"none",fontWeight:700}}>← Jobs, Gigs & Tasks</a><h1 style={{fontSize:"clamp(34px,6vw,48px)",marginBottom:8,color:"#171b36"}}>Post work on YouListify</h1><p style={{color:"#667085",lineHeight:1.6,marginBottom:28}}>Tell people what you need. Posting is free during launch. You can fill everything out first — we’ll only ask you to sign in or create your free account when you’re ready to post.</p>
  <label style={{fontWeight:800}}>What are you posting?</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,margin:"10px 0 24px"}}>{[["job","Job"],["gig","Gig"],["task","Task"]].map(([v,l])=><button key={v} type="button" onClick={()=>set("post_type",v)} style={{padding:"14px 8px",borderRadius:12,border:form.post_type===v?"2px solid #5b4df5":"1px solid #d9dce7",background:form.post_type===v?"#f1efff":"white",fontWeight:800,cursor:"pointer"}}>{l}</button>)}</div>
  <div style={{display:"grid",gap:16}}><input required style={input} placeholder="Title — e.g. Social Media Manager" value={form.title} onChange={e=>set("title",e.target.value)}/><input style={input} placeholder="Category — e.g. Marketing & Social Media" value={form.category} onChange={e=>set("category",e.target.value)}/><textarea required style={{...input,minHeight:150,resize:"vertical"}} placeholder="Describe what you need, responsibilities, timing, experience, or anything else people should know." value={form.description} onChange={e=>set("description",e.target.value)}/></div>
  <h2 style={{marginTop:30}}>Where?</h2><label style={check}><input type="checkbox" checked={form.remote} onChange={e=>set("remote",e.target.checked)}/> Remote / can be done from anywhere</label><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}><input style={input} placeholder="City" value={form.city} onChange={e=>set("city",e.target.value)}/><select style={input} value={form.state} onChange={e=>set("state",e.target.value)}><option value="">State</option>{states.map(s=><option key={s}>{s}</option>)}</select><input style={input} placeholder="ZIP" value={form.zip_code} onChange={e=>set("zip_code",e.target.value)}/></div>
  <h2 style={{marginTop:30}}>Pay</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><select style={input} value={form.pay_type} onChange={e=>set("pay_type",e.target.value)}><option value="contact">Discuss pay</option><option value="hourly">Hourly</option><option value="flat">Flat amount</option><option value="salary">Salary</option></select>{form.pay_type!=="contact"&&<input style={input} type="number" min="0" step="0.01" placeholder="Amount ($)" value={form.pay_amount} onChange={e=>set("pay_amount",e.target.value)}/>}</div>
  <h2 style={{marginTop:30}}>How can people respond?</h2><label style={check}><input type="checkbox" checked={form.contact_call} onChange={e=>set("contact_call",e.target.checked)}/> Call</label><label style={check}><input type="checkbox" checked={form.contact_text} onChange={e=>set("contact_text",e.target.checked)}/> Text</label>{(form.contact_call||form.contact_text)&&<input style={input} placeholder="Phone number" value={form.contact_phone} onChange={e=>set("contact_phone",e.target.value)}/>}<label style={check}><input type="checkbox" checked={form.contact_email} onChange={e=>set("contact_email",e.target.checked)}/> Email</label>{form.contact_email&&<input style={input} type="email" placeholder="Contact email" value={form.contact_email_address} onChange={e=>set("contact_email_address",e.target.value)}/>}<label style={check}><input type="checkbox" checked={form.contact_youlistify} onChange={e=>set("contact_youlistify",e.target.checked)}/> Contact through YouListify</label><input style={input} placeholder="Application / website link (optional)" value={form.application_url} onChange={e=>set("application_url",e.target.value)}/>
  <button disabled={saving} style={{width:"100%",marginTop:30,padding:16,border:0,borderRadius:13,background:"#5b4df5",color:"white",fontWeight:900,fontSize:17,cursor:"pointer"}}>{saving?"Posting...":"Post It Free"}</button></form></main>;
}
