const API_URL = "https://smsbower.page/stubs/handler_api.php";
const ALLOWED = new Set(["getBalance","getServicesList","getCountries","getPrices","getPricesV2","getPricesV3","getTopCountriesByService","getNumberV2","getNumber","getStatus","setStatus"]);
module.exports = async (req, res) => {
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const key=process.env.SMSBOWER_API_KEY;
  if(!key) return res.status(503).json({error:"API key belum dipasang di Environment Variables Vercel."});
  try{
    const body=typeof req.body==="string"?JSON.parse(req.body):req.body||{};
    const action=String(body.action||"");
    if(!ALLOWED.has(action)) return res.status(400).json({error:"Action tidak diizinkan."});
    const params=new URLSearchParams({api_key:key,action});
    for(const name of ["service","country","id","status","maxPrice","minPrice","providerIds","exceptProviderIds","phoneException"]){
      if(body[name]!==undefined && body[name]!==null && String(body[name]).trim()!=="") params.set(name,String(body[name]));
    }
    const upstream=await fetch(API_URL,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded","accept":"application/json,text/plain,*/*"},body:params.toString(),cache:"no-store"});
    const raw=await upstream.text(); let data=raw; try{data=JSON.parse(raw)}catch{}
    return res.status(200).json({ok:upstream.ok,data,httpStatus:upstream.status});
  }catch(e){return res.status(500).json({error:e.message||"Request gagal"});}
};