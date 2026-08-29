"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Provider = {
id: number;
name: string | null;
last_name: string | null;
business_name: string | null;
phone: string | null;
email: string | null;
city: string | null;
state: string | null;
bio: string | null;
name_display?: string | null;
user_id: string | null;
contact_call?: boolean | null;
contact_text?: boolean | null;
contact_email?: boolean | null;
contact_youlistify?: boolean | null;
available_now?: boolean | null;
pricing_methods: string[] | null;
starting_price: number | null;
flat_price: number | null;
profile_photo?: string | null;
gallery_photos?: string[] | null;
};

export default function EditListingPage() {
const [providerId, setProviderId] = useState<number | null>(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");
const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
const [services, setServices] = useState<any[]>([]);
const [profilePhoto, setProfilePhoto] = useState("");
const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
const [form, setForm] = useState({
name: "",
last_name: "",
business_name: "",
phone: "",
email: "",
city: "",
state: "",
bio: "",
name_display: "full",
contact_call: false,
contact_text: false,
contact_email: false,
contact_youlistify: false,
available_now: false,
pricing_methods: [] as string[],
starting_price: "",
flat_price: "",
});

useEffect(() => {
async function loadProvider() {
const { data: allServices, error: servicesError } = await supabase
.from("services")
.select("id, name, category")
.order("category")
.order("name");

if (!servicesError && allServices) setServices(allServices);

const { data: { user } } = await supabase.auth.getUser();
if (!user) {
window.location.href = "/sign-in";
return;
}

const { data, error } = await supabase
.from("Providers")
.select("id,name,last_name,business_name,phone,email,city,state,bio,name_display,user_id,contact_call,contact_text,contact_email,contact_youlistify,available_now,pricing_methods,starting_price,flat_price,profile_photo,gallery_photos")
.eq("user_id", user.id)
.single();

if (error || !data) {
setMessage("We could not find your provider listing.");
setLoading(false);
return;
}

const provider = data as Provider;
setProviderId(provider.id);
setProfilePhoto(provider.profile_photo ?? "");
setGalleryPhotos(provider.gallery_photos ?? []);

const { data: serviceLinks, error: serviceError } = await supabase
.from("provider_services")
.select("service_id")
.eq("provider_id", provider.id);

if (!serviceError && serviceLinks) {
setSelectedServiceIds(serviceLinks.map((row: any) => row.service_id));
}

const normalizedPricingMethods=(provider.pricing_methods||[]).map((method)=>method==="hourly"?"Hourly rate":method==="flat"?"Flat rate":method==="contact"?"Contact for pricing":method);

setForm({
name: provider.name || "",
last_name: provider.last_name || "",
business_name: provider.business_name || "",
phone: provider.phone || "",
email: provider.email || "",
city: provider.city || "",
state: provider.state || "",
bio: provider.bio || "",
name_display: provider.name_display || "full",
contact_call: provider.contact_call ?? false,
contact_text: provider.contact_text ?? false,
contact_email: provider.contact_email ?? false,
contact_youlistify: provider.contact_youlistify ?? false,
available_now: provider.available_now ?? false,
pricing_methods: normalizedPricingMethods,
starting_price: provider.starting_price?.toString() || "",
flat_price: provider.flat_price?.toString() || "",
});

setLoading(false);
}
loadProvider();
}, []);

function updateField(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
setForm({ ...form, [e.target.name]: e.target.value });
}

async function uploadProfilePhoto(file: File | undefined) {
if (!file || !providerId) return;
setMessage("");
const fileExt = file.name.split(".").pop();
const fileName = `profile-photo-${crypto.randomUUID()}.${fileExt}`;
const filePath = `${providerId}/${fileName}`;
const { error } = await supabase.storage.from("provider-photos").upload(filePath, file);
if (error) {
setMessage("Profile photo could not be uploaded: " + error.message);
return;
}
const { data } = supabase.storage.from("provider-photos").getPublicUrl(filePath);
const publicUrl = data.publicUrl;
const { error: savePhotoError } = await supabase
.from("Providers")
.update({ profile_photo: publicUrl })
.eq("id", providerId);
if (savePhotoError) {
setMessage("Photo uploaded, but could not be saved to your listing: " + savePhotoError.message);
return;
}
setProfilePhoto(publicUrl);
setMessage("Profile photo updated.");
}

async function uploadGalleryPhotos(files: FileList | null) {
if (!files || !providerId) return;
const remaining = 6 - galleryPhotos.length;
const filesToUpload = Array.from(files).slice(0, remaining);
if (filesToUpload.length === 0) {
setMessage("You can add up to 6 photos.");
return;
}
const newUrls: string[] = [];
for (const file of filesToUpload) {
const fileExt = file.name.split(".").pop();
const fileName = `${crypto.randomUUID()}.${fileExt}`;
const filePath = `${providerId}/${fileName}`;
const { error } = await supabase.storage.from("provider-photos").upload(filePath, file);
if (error) {
setMessage("One of the photos could not be uploaded.");
continue;
}
const { data } = supabase.storage.from("provider-photos").getPublicUrl(filePath);
newUrls.push(data.publicUrl);
}
setGalleryPhotos((current) => [...current, ...newUrls]);
}

async function saveListing(e: React.FormEvent) {
e.preventDefault();
if (!providerId) return;
setSaving(true);
setMessage("");
const { error } = await supabase
.from("Providers")
.update({
name: form.name,
last_name: form.last_name,
business_name: form.business_name,
phone: form.phone,
email: form.email,
city: form.city,
state: form.state,
bio: form.bio,
name_display: form.name_display,
contact_call: form.contact_call,
contact_text: form.contact_text,
contact_email: form.contact_email,
contact_youlistify: form.contact_youlistify,
available_now: form.available_now,
pricing_methods: form.pricing_methods,
starting_price: form.starting_price === "" ? null : Number(form.starting_price),
flat_price: form.flat_price === "" ? null : Number(form.flat_price),
profile_photo: profilePhoto || null,
gallery_photos: galleryPhotos,
})
.eq("id", providerId);
if (error) {
setMessage("Could not save changes: " + error.message);
setSaving(false);
return;
}
const { error: deleteServicesError } = await supabase.from("provider_services").delete().eq("provider_id", providerId);
if (deleteServicesError) {
setMessage("Could not update services: " + deleteServicesError.message);
setSaving(false);
return;
}
if (selectedServiceIds.length > 0) {
const { error: insertServicesError } = await supabase.from("provider_services").insert(
selectedServiceIds.map((serviceId) => ({ provider_id: providerId, service_id: serviceId }))
);
if (insertServicesError) {
setMessage("Could not update services: " + insertServicesError.message);
setSaving(false);
return;
}
}
setMessage("Your listing has been updated!");
setSaving(false);
}

if (loading) return <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>Loading your listing...</main>;

const fieldStyle = { width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "16px", marginTop: "6px" };

return (
<main style={{minHeight:"100vh",background:"#f8f8fb",padding:"40px 20px",fontFamily:"Arial, sans-serif"}}>
<div style={{maxWidth:"760px",margin:"0 auto",background:"white",padding:"36px",borderRadius:"24px",boxShadow:"0 10px 35px rgba(0,0,0,.08)"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
<a href="/dashboard" style={{color:"#4f46e5",textDecoration:"none",fontWeight:"600"}}>← Back to Dashboard</a>
{providerId && <a href={`/provider/${providerId}`} style={{background:"#4f46e5",color:"white",textDecoration:"none",fontWeight:"600",padding:"10px 16px",borderRadius:"10px"}}>View My Profile →</a>}
</div>
<h1 style={{fontSize:"40px",color:"#182033",marginBottom:"8px"}}>Edit My Listing</h1>
<p style={{color:"#667085",marginBottom:"28px"}}>Update the information customers see on your YouListify profile.</p>
<form onSubmit={saveListing}>
<label>First name<input name="name" value={form.name} onChange={updateField} style={fieldStyle}/></label><div style={{height:"18px"}}/>
<label>Last name<input name="last_name" value={form.last_name} onChange={updateField} style={fieldStyle}/></label><div style={{height:"18px"}}/>
<label>Business name<input name="business_name" value={form.business_name} onChange={updateField} style={fieldStyle}/></label><div style={{height:"18px"}}/>
<label>Phone<input name="phone" value={form.phone} onChange={updateField} style={fieldStyle}/></label><div style={{height:"18px"}}/>
<label>Email<input name="email" type="email" value={form.email} onChange={updateField} style={fieldStyle}/></label><div style={{height:"18px"}}/>
<label>City<input name="city" value={form.city} onChange={updateField} style={fieldStyle}/></label><div style={{height:"18px"}}/>
<label>State<input name="state" value={form.state} onChange={updateField} style={fieldStyle}/></label><div style={{height:"18px"}}/>
<label>About your service<textarea name="bio" value={form.bio} onChange={updateField} rows={5} style={fieldStyle}/></label>
<div style={{height:"24px"}}/>
<label>Public name display<select name="name_display" value={form.name_display} onChange={updateField} style={fieldStyle}><option value="full">Full name</option><option value="initial">First name + last initial</option><option value="first">First name only</option></select></label>
<div style={{marginTop:"24px",marginBottom:"24px"}}><div style={{fontWeight:"600",marginBottom:"10px"}}>Profile photo</div><div style={{fontSize:"14px",color:"#667085",marginBottom:"12px"}}>This is the main photo customers will see on your public listing.</div>{profilePhoto && <img src={profilePhoto} alt="Profile" style={{width:"110px",height:"110px",objectFit:"cover",borderRadius:"24px",display:"block",marginBottom:"12px"}}/>}<input type="file" accept="image/*" onChange={(e)=>uploadProfilePhoto(e.target.files?.[0])}/></div>
<div style={{marginTop:"24px",marginBottom:"24px"}}><div style={{fontWeight:"600",marginBottom:"10px"}}>Availability</div><label style={{display:"block",marginBottom:"10px"}}><input type="radio" name="availability" checked={form.available_now===true} onChange={()=>setForm({...form,available_now:true})}/> Available now</label><label style={{display:"block"}}><input type="radio" name="availability" checked={form.available_now===false} onChange={()=>setForm({...form,available_now:false})}/> Not available now</label></div>
<div style={{marginTop:"24px",marginBottom:"24px"}}><div style={{fontWeight:"600",marginBottom:"10px"}}>Services</div><div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>{services.map((service:any)=><label key={service.id} style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 12px",border:"1px solid #ddd",borderRadius:"999px",cursor:"pointer"}}><input type="checkbox" checked={selectedServiceIds.includes(service.id)} onChange={(e)=>{if(e.target.checked){setSelectedServiceIds([...selectedServiceIds,service.id]);}else{setSelectedServiceIds(selectedServiceIds.filter((id)=>id!==service.id));}}}/>{service.name}</label>)}</div></div>
<div style={{marginTop:"24px",marginBottom:"24px"}}><div style={{fontWeight:"600",marginBottom:"10px"}}>Pricing</div><div style={{fontSize:"14px",color:"#667085",marginBottom:"10px"}}>Select all that apply. Dollar amounts are optional.</div><label style={{display:"block",marginBottom:"10px"}}><input type="checkbox" checked={form.pricing_methods.includes("Hourly rate")} onChange={(e)=>setForm({...form,pricing_methods:e.target.checked?[...form.pricing_methods,"Hourly rate"]:form.pricing_methods.filter((p)=>p!=="Hourly rate")})}/> Hourly rate</label>{form.pricing_methods.includes("Hourly rate")&&<input type="number" placeholder="Hourly rate $ (optional)" value={form.starting_price} onChange={(e)=>setForm({...form,starting_price:e.target.value})} style={{width:"100%",padding:"12px",marginBottom:"12px"}}/>}<label style={{display:"block",marginBottom:"10px"}}><input type="checkbox" checked={form.pricing_methods.includes("Flat rate")} onChange={(e)=>setForm({...form,pricing_methods:e.target.checked?[...form.pricing_methods,"Flat rate"]:form.pricing_methods.filter((p)=>p!=="Flat rate")})}/> Flat rate</label>{form.pricing_methods.includes("Flat rate")&&<input type="number" placeholder="Flat rate $ (optional)" value={form.flat_price} onChange={(e)=>setForm({...form,flat_price:e.target.value})} style={{width:"100%",padding:"12px",marginBottom:"12px"}}/>}<label style={{display:"block",marginBottom:"10px"}}><input type="checkbox" checked={form.pricing_methods.includes("Contact for pricing")} onChange={(e)=>setForm({...form,pricing_methods:e.target.checked?[...form.pricing_methods,"Contact for pricing"]:form.pricing_methods.filter((p)=>p!=="Contact for pricing")})}/> Contact for pricing</label></div>
<div style={{marginTop:"24px"}}><div style={{fontWeight:"600",marginBottom:"10px"}}>How would you like customers to contact you?</div><label style={{display:"block",marginBottom:"10px"}}><input type="checkbox" checked={form.contact_call} onChange={(e)=>setForm({...form,contact_call:e.target.checked})}/> Call me</label><label style={{display:"block",marginBottom:"10px"}}><input type="checkbox" checked={form.contact_text} onChange={(e)=>setForm({...form,contact_text:e.target.checked})}/> Text me</label><label style={{display:"block",marginBottom:"10px"}}><input type="checkbox" checked={form.contact_email} onChange={(e)=>setForm({...form,contact_email:e.target.checked})}/> Email me</label><label style={{display:"block",marginBottom:"10px"}}><input type="checkbox" checked={form.contact_youlistify} onChange={(e)=>setForm({...form,contact_youlistify:e.target.checked})}/> Contact through YouListify</label></div>
<div style={{marginTop:"28px"}}><div style={{fontWeight:"600",marginBottom:"10px"}}>Gallery photos</div><div style={{fontSize:"14px",color:"#667085",marginBottom:"12px"}}>Add up to 6 photos of your work, services, or business.</div><input type="file" accept="image/*" multiple onChange={(e)=>uploadGalleryPhotos(e.target.files)}/><div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"10px",marginTop:"16px"}}>{galleryPhotos.map((photo,index)=><img key={index} src={photo} alt={`Gallery photo ${index+1}`} style={{width:"100%",height:"120px",objectFit:"cover",borderRadius:"10px"}}/>)}</div></div>
{message && <p style={{marginTop:"18px",color:"#4f46e5",fontWeight:"600"}}>{message}</p>}
<button type="submit" disabled={saving} style={{width:"100%",marginTop:"28px",padding:"15px",border:"none",borderRadius:"12px",background:"#4f46e5",color:"white",fontWeight:"700",fontSize:"16px",cursor:"pointer"}}>{saving?"Saving...":"Save Listing"}</button>
<div style={{display:"flex",justifyContent:"center",gap:"14px",marginTop:"24px",flexWrap:"wrap"}}><a href="/dashboard" style={{color:"#4f46e5",fontWeight:"600",textDecoration:"none"}}>← Back to Dashboard</a>{providerId&&<a href={`/provider/${providerId}`} style={{color:"#4f46e5",fontWeight:"600",textDecoration:"none"}}>View My Profile →</a>}</div>
</form>
</div>
</main>
);
}