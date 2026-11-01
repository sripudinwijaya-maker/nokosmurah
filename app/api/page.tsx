 "use client";
import {useCallback,useEffect,useMemo,useState} from "react";

type Service={code:string;name:string};
type Country={id:string|number;eng?:string;rus?:string;name?:string};
type Activation={activationId:string|number;phoneNumber:string;activationCost?:string|number;countryCode?:string;activationOperator?:string};
type Provider={id:string;price:number;count:number};
const pretty=(v:unknown)=>typeof v==="string"?v:JSON.stringify(v);
const errText=(v:any)=>v?.error || v?.data || "Terjadi kesalahan";
const countryName=(c:Country)=>c.eng||c.name||c.rus||`Country ${c.id}`;

export default function Home(){
 const [services,setServices]=useState<Service[]>([]);
 const [countries,setCountries]=useState<Country[]>([]);
 const [service,setService]=useState("go");
 const [country,setCountry]=useState("");
 const [search,setSearch]=useState("");
 const [balance,setBalance]=useState("");
 const [providers,setProviders]=useState<Provider[]>([]);
 const [provider,setProvider]=useState("");
 const [maxPrice,setMaxPrice]=useState("");
 const [activation,setActivation]=useState<Activation|null>(null);
 const [sms,setSms]=useState("");
 const [status,setStatus]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("Hubungkan akun SMSBower untuk mulai.");
 const [tab,setTab]=useState<"buy"|"active">("buy");

 const api=useCallback(async(action:string,extra:Record<string,unknown>={})=>{
   const r=await fetch("/api/smsbower",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action,...extra})});
   const j=await r.json();
   if(!r.ok || j.error) throw new Error(errText(j));
   if(typeof j.data==="string" && /^(BAD_|NO_|ERROR|EARLY_|WRONG_|BAD)/.test(j.data)) throw new Error(j.data);
   return j.data;
 },[]);
 const loadBasics=useCallback(async()=>{
   setBusy(true);
   try{
     const [s,c,b]=await Promise.all([api("getServicesList"),api("getCountries"),api("getBalance")]);
     const list=Array.isArray(s)?s:(s?.services||[]);
     setServices(list);
     const cs=Array.isArray(c)?c:Object.values(c||{});
     setCountries(cs as Country[]);
     if(!country && cs.length) setCountry(String((cs[0] as any).id));
     setBalance(String(b).replace("ACCESS_BALANCE:",""));
     setMessage("Terhubung. Pilih layanan dan negara.");
   }catch(e){setMessage(e instanceof Error?e.message:"Gagal memuat data.");}
   finally{setBusy(false);}
 },[api,country]);
 useEffect(()=>{loadBasics();},[loadBasics]);
 const loadProviders=useCallback(async()=>{
   if(!service||!country)return;
   try{
     const data=await api("getPricesV3",{service,country});
     const root=data?.[country]||data?.[String(country)]||data;
     const svc=root?.[service]||{};
     const arr=Object.entries(svc).map(([id,v]:[string,any])=>({id:String(v.provider_id??id),price:Number(v.price),count:Number(v.count)}))
       .filter(x=>Number.isFinite(x.price)&&Number.isFinite(x.count)).sort((a,b)=>a.price-b.price);
     setProviders(arr);
     setProvider("");
   }catch(e){setProviders([]);setMessage(e instanceof Error?e.message:"Gagal memuat harga/provider.");}
 },[api,service,country]);
 useEffect(()=>{loadProviders();},[loadProviders]);
 const filtered=useMemo(()=>countries.filter(c=>countryName(c).toLowerCase().includes(search.toLowerCase())||String(c.id).includes(search)),[countries,search]);
 const selectedCountry= countries.find(c=>String(c.id)===String(country));
 async function buy(){
   if(!service||!country){setMessage("Pilih layanan dan negara dulu.");return;}
   setBusy(true);setMessage("Meminta nomor...");
   try{
     const data=await api("getNumberV2",{service,country,...(maxPrice?{maxPrice}:{}),...(provider?{providerIds:provider}:{})});
     if(typeof data==="string") throw new Error(data);
     if(!data?.activationId||!data?.phoneNumber) throw new Error(pretty(data));
     setActivation(data);setSms("");setStatus("Menunggu SMS");setTab("active");
     setMessage("Nomor berhasil dipesan. Tunggu SMS masuk.");
     const b=await api("getBalance").catch(()=>null);if(b)setBalance(String(b).replace("ACCESS_BALANCE:",""));
   }catch(e){setMessage(e instanceof Error?e.message:"Gagal membeli nomor.");}
   finally{setBusy(false);}
 }
 async function checkSms(){
   if(!activation)return;
   setBusy(true);
   try{
     const data=await api("getStatus",{id:activation.activationId});
     const value=String(data);
     setStatus(value);
     if(value.startsWith("STATUS_OK:")){setSms(value.split(":").slice(1).join(":"));setMessage("Kode SMS diterima.");}
     else if(value==="STATUS_WAIT_CODE"||value.startsWith("STATUS_WAIT_RETRY"))setMessage("Belum ada kode. Coba periksa lagi.");
     else setMessage(value);
   }catch(e){setMessage(e instanceof Error?e.message:"Gagal cek SMS.");}
   finally{setBusy(false);}
 }
 async function setActivationStatus(n:number){
   if(!activation)return;
   setBusy(true);
   try{
     const data=await api("setStatus",{id:activation.activationId,status:n});
     setMessage(String(data));
     if(n===6||n===8){setActivation(null);setSms("");setStatus("");}
   }catch(e){setMessage(e instanceof Error?e.message:"Gagal mengubah status.");}
   finally{setBusy(false);}
 }
 return <main className="shell">
  <header className="top"><div className="brand"><div className="logo">S</div><div><b>SMSBOWER</b><small>PERSONAL CLIENT · V3</small></div></div><div className="balance"><small>Saldo akun</small><strong>{balance?`$${balance}`:"—"}</strong><button className="refresh" onClick={loadBasics} disabled={busy}>↻</button></div></header>
  <section className="hero"><div><span className="eyebrow">API DASHBOARD</span><h1>Terima SMS<br/><em>lebih praktis.</em></h1><p>Kelola pesanan nomor dan kode SMS dari satu halaman.</p></div><div className="heroMark">✳</div></section>
  <nav className="tabs"><button className={tab==="buy"?"chosen":""} onClick={()=>setTab("buy")}>01 · Beli nomor</button><button className={tab==="active"?"chosen":""} onClick={()=>setTab("active")}>02 · Aktivasi {activation?"●":""}</button></nav>
  {tab==="buy"?<section className="panel">
   <div className="sectionHead"><div><span className="step">LANGKAH 01</span><h2>Pilih layanan</h2></div><span className="count">{services.length} layanan</span></div>
   <div className="serviceGrid">{services.map(s=><button key={s.code} className={`service ${service===s.code?"selected":""}`} onClick={()=>setService(s.code)}><span className="serviceIcon">{s.name.slice(0,1).toUpperCase()}</span><span>{s.name}</span></button>)}</div>
   <div className="sectionHead countryHead"><div><span className="step">LANGKAH 02</span><h2>Pilih negara</h2></div></div>
   <input className="search" placeholder="⌕  Cari nama negara atau kode..." value={search} onChange={e=>setSearch(e.target.value)}/>
   <div className="countryList">{filtered.map(c=><button key={String(c.id)} onClick={()=>setCountry(String(c.id))} className={`country ${String(c.id)===String(country)?"countrySelected":""}`}><span className="flag">🌐</span><span className="countryText"><b>{countryName(c)}</b><small>ID negara: {c.id}</small></span><span className="radioDot">{String(c.id)===String(country)?"✓":""}</span></button>)}</div>
   <div className="sectionHead countryHead"><div><span className="step">LANGKAH 03</span><h2>Harga & provider</h2></div><span className="count">{providers.length} tersedia</span></div>
   <p className="hint">Data harga dan stok langsung dari getPricesV3. Pilih provider tertentu atau biarkan otomatis.</p>
   <div className="providerList">{providers.length?providers.map(v=><button key={v.id} className={`provider ${provider===v.id?"providerSelected":""}`} onClick={()=>setProvider(provider===v.id?"":v.id)}><span><b>Provider #{v.id}</b><small>{v.count} stok tersedia</small></span><strong>${v.price.toFixed(3)}</strong><span className="radioDot">{provider===v.id?"✓":""}</span></button>):<div className="empty">Pilih layanan dan negara untuk melihat harga/provider.</div>}</div>
   <label className="fieldLabel">Batas harga maksimal (opsional)</label><input className="search" inputMode="decimal" placeholder="Contoh: 0.15" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/>
   <button className="buyButton" disabled={busy||!country||!service} onClick={buy}>{busy?"Memproses...":"BELI NOMOR SEKARANG  →"}</button>
   <p className="hint center">Provider otomatis digunakan jika tidak ada provider yang dipilih.</p>
  </section>:<section className="panel activePanel">
   <div className="sectionHead"><div><span className="step">AKTIVASI</span><h2>Nomor & kode SMS</h2></div><span className="liveDot">● LIVE</span></div>
   {activation?<><div className="numberCard"><small>NOMOR TELEPON</small><strong>{activation.phoneNumber}</strong><small>ID Aktivasi: {activation.activationId}</small>{activation.activationCost!==undefined&&<small>Biaya: ${activation.activationCost}</small>}</div><div className="smsCard"><small>KODE SMS</small><strong>{sms||"— — — — — —"}</strong><span>{status||"Menunggu pesan masuk"}</span></div><button className="buyButton" disabled={busy} onClick={checkSms}>↻ PERIKSA SMS</button><div className="actionGrid"><button onClick={()=>setActivationStatus(6)} disabled={busy}>Selesaikan (6)</button><button onClick={()=>setActivationStatus(8)} disabled={busy}>Batalkan (8)</button></div><button className="secondaryButton" onClick={()=>setActivationStatus(3)} disabled={busy}>Minta SMS berikutnya (3)</button></>:<div className="empty largeEmpty">Belum ada aktivasi aktif.<br/>Beli nomor dari tab sebelumnya.</div>}
  </section>}
  <div className="notice"><span>i</span><p>{message}</p></div>
  <footer>SMSBower Personal Client · API key disimpan di server Vercel, bukan di browser.</footer>
 </main>;
}