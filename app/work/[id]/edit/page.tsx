"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const states=["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

export default function EditWorkPostPage(){
  const params=useParams();
  const id=String(params.id||"");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [form,setForm]=useState<any>(null);

  useEffect(()=>{async function load(){
    const {data:{session}}=await supabase.auth.getSession();
    if(!session?.user){window.location.href=`/sign-in?next=/work/${id}/edit`;return;}
    const {data,error}=await supabase.from("work_posts").select("*").eq("id",id).eq("user_id",session.user.id).maybeSingle();
    if(error||!data){setMessage("We couldn't find a work post from this account with that ID.");setLoading(false);return;}
    setForm({...data,pay_amount:data.pay_amount??""});setLoading(false);
  }load();},[id]);

  const set=(key:string,value:any)=>setForm((v:any)=>({...v,[key]:value}));
  async function save(e:FormEvent){e.preventDefault();if(!form)return;if(!form.contact_call&&!form.contact_text&&!form.contact_email&&!form.contact_youlistify&&!String(form.application_url||"").trim()){alert("Choose at least one way for people to respond.");return;}setSaving(true);setMessage("");const payload={post_type:form.post_type,title:form.title,description:form.description,category:form.category||null,city:form.city||null,state:form.state||null,zip_code:form.zip_code||null,remote:!!form.remote,pay_type:form.pay_type,pay_amount:form.pay_amount!==""&&form.pay_amount!=null?Number(form.pay_amount):null,contact_call:!!form.contact_call,contact_text:!!form.contact_text,contact_email:!!form.contact_email,contact_youlistify:!!form.contact_youlistify,contact_phone:String(form.contact_phone||"").trim()||null,contact_email_address:String(form.contact_email_address||"").trim()||null,application_url:String(form.application_url||"").trim()||null,updated_at:new Date().toISOString()};const {error}=await supabase.from("work_posts").update(payload).eq("id",id);setSaving(false);if(error){setMessage(error.message);return;}window.location.href=`/work/${id}`;}

  if(loading)return <main style={{padding:40,fontFamily:"Arial,sans-serif"}}>Loading post...</main>;
  if(!form)return <main style={{padding:40,fontFamily:"Arial,sans-serif"}}><h1>Post not available</h1><p>{message}</p><a href="/dashboard">Back to Dashboard</a></main>;

  const input={width:"100%",padding:"14px 15px",border:"1px solid #d9dce7",borderRadius:12,fontSize:16,boxSizing:"border-box" as const};
  const check={display:"flex",gap:10,alignItems:"center",padding:"12px 0"};
  return <main style={{minHeight:"100vh",background:"#f8f8fb",padding:"40px 18px",fontFamily:"Arial,sans-serif"}}><form onSubmit={save} style={{maxWidth:760,margin:"0 auto",background:"white",borderRadius:24,padding:"clamp(24px,5vw,42px)",boxShadow:"0 10px 35px rgba(0,0,0,.07)"}}><a href="/dashboard" style={{color:"#5b4df5",textDecoration:"none",fontWeight:700}}>← Back to Dashboard</a><h1 style={{fontSize:"clamp(34px,6vw,48px)",marginBottom:8,color:"#171b36"}}>Edit your post</h1><p style={{color:"#667085",lineHeight:1.6,marginBottom:28}}>Update the details below, then save your changes.</p>
  <label style={{fontWeight:800}}>Post type</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,margin:"10px 0 24px"}}>{[["job","Job"],["gig","Gig"],["task","Task"]].map(([v,l])=><button key={v} type="button" onClick={()=>set("post_type",v)} style={{padding:"14px 8px",borderRadius:12,border:form.post_type===v?"2px solid #5b4df5":"1px solid #d9dce7",background:form.post_type===v?"#f1efff":"white",fontWeight:800,cursor:"pointer"}}>{l}</button>)}</div>
  <div style={{display:"grid",gap:16}}><input required style={input} placeholder="Title" value={form.title||""} onChange={e=>set("title",e.target.value)}/><input style={input} placeholder="Category" value={form.category||""} onChange={e=>set("category",e.target.value)}/><textarea required style={{...input,minHeight:150,resize:"vertical"}} placeholder="Description" value={form.description||""} onChange={e=>set("description",e.target.value)}/></div>
  <h2 style={{marginTop:30}}>Where?</h2><label style={check}><input type="checkbox" checked={!!form.remote} onChange={e=>set("remote",e.target.checked)}/> Remote / can be done from anywhere</label><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10}}><input style={input} placeholder="City" value={form.city||""} onChange={e=>set("city",e.target.value)}/><select style={input} value={form.state||""} onChange={e=>set("state",e.target.value)}><option value="">State</option>{states.map(s=><option key={s}>{s}</option>)}</select><input style={input} placeholder="ZIP" value={form.zip_code||""} onChange={e=>set("zip_code",e.target.value)}/></div>
  <h2 style={{marginTop:30}}>Pay</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><select style={input} value={form.pay_type||"contact"} onChange={e=>set("pay_type",e.target.value)}><option value="contact">Discuss pay</option><option value="hourly">Hourly</option><option value="flat">Flat amount</option><option value="salary">Salary</option></select>{form.pay_type!=="contact"&&<input style={input} type="number" min="0" step="0.01" placeholder="Amount ($)" value={form.pay_amount??""} onChange={e=>set("pay_amount",e.target.value)}/>}</div>
  <h2 style={{marginTop:30}}>How can people respond?</h2><label style={check}><input type="checkbox" checked={!!form.contact_call} onChange={e=>set("contact_call",e.target.checked)}/> Call</label><label style={check}><input type="checkbox" checked={!!form.contact_text} onChange={e=>set("contact_text",e.target.checked)}/> Text</label>{(form.contact_call||form.contact_text)&&<input style={input} placeholder="Phone number" value={form.contact_phone||""} onChange={e=>set("contact_phone",e.target.value)}/>}<label style={check}><input type="checkbox" checked={!!form.contact_email} onChange={e=>set("contact_email",e.target.checked)}/> Email</label>{form.contact_email&&<input style={input} type="email" placeholder="Contact email" value={form.contact_email_address||""} onChange={e=>set("contact_email_address",e.target.value)}/>}<label style={check}><input type="checkbox" checked={!!form.contact_youlistify} onChange={e=>set("contact_youlistify",e.target.checked)}/> Contact through YouListify</label><input style={input} placeholder="Application / website link (optional)" value={form.application_url||""} onChange={e=>set("application_url",e.target.value)}/>
  {message&&<p style={{color:"#b91c1c",lineHeight:1.5}}>{message}</p>}<button disabled={saving} style={{width:"100%",marginTop:30,padding:16,border:0,borderRadius:13,background:"#5b4df5",color:"white",fontWeight:900,fontSize:17,cursor:"pointer"}}>{saving?"Saving...":"Save Changes"}</button></form></main>;
}
