import { useState, useMemo } from "react";
import { STATES_GEO } from "./states-geo-data";

// ═══════════════════════════════════════════════════════════════════════
//  PUBLIC COMPANIES (financial data from Q4 2025 / Q3 FY2026 earnings)
// ═══════════════════════════════════════════════════════════════════════
const COMPANIES = {
  VRT: { ticker:"VRT", name:"Vertiv Holdings", price:240.60, mcap:92.9, pe_fwd:40.0, fy26e_rev:13.5, fy26e_eps:6.02, fy26e_growth:28, op_margin:22.5, dc_pct:75, lc_growth:"+100%", backlog:"$15B", color:"#818cf8", role:"Power & Cooling Infrastructure", summary:"Pure-play DC infrastructure leader. NVIDIA co-dev partner for GB200 reference architectures. $15B backlog, 2.9x book-to-bill. Liquid cooling rev 2x YoY." },
  MOD: { ticker:"MOD", name:"Modine Manufacturing", price:199.48, mcap:10.4, pe_fwd:44.3, fy26e_rev:3.15, fy26e_eps:4.50, fy26e_growth:22, op_margin:14.9, dc_pct:35, lc_growth:"+78%", backlog:"Record", color:"#34d399", role:"Chillers & Climate Solutions", summary:"DC revenue +78% YoY. Spinning off PT segment to become pure-play climate. $2B DC rev target by FY28. Commissioning new chiller lines in MO, MS, TX." },
  ETN: { ticker:"ETN", name:"Eaton Corporation", price:347.00, mcap:137.8, pe_fwd:26.2, fy26e_rev:27.0, fy26e_eps:13.25, fy26e_growth:8, op_margin:24.0, dc_pct:18, lc_growth:"+200%", backlog:"$15.3B", color:"#f59e0b", role:"Power Management + Liquid Cooling", summary:"DC orders +200% YoY. Boyd Thermal acquisition ($9.5B, closing Q2 '26) adds $1.5B liquid cooling. Chip-to-grid solution. Mobility spin-off planned." },
  NVT: { ticker:"NVT", name:"nVent Electric", price:116.05, mcap:19.2, pe_fwd:36.5, fy26e_rev:4.36, fy26e_eps:3.18, fy26e_growth:12, op_margin:22.0, dc_pct:30, lc_growth:"+50%", backlog:"Growing", color:"#06b6d4", role:"Enclosures & Thermal Management", summary:"Siemens collaboration on hyperscale cooling+power architectures. Modular LC platform launch. ~30% DC exposure, highest among diversified players." },
  SMCI: { ticker:"SMCI", name:"Super Micro Computer", price:33.39, mcap:20.0, pe_fwd:11.9, fy26e_rev:40.0, fy26e_eps:2.80, fy26e_growth:70, op_margin:5.8, dc_pct:95, lc_growth:"+110%", backlog:"Expanding", color:"#f472b6", role:"AI Servers with Integrated DLC", summary:"DLC servers are the product — 98% heat capture. Raised FY26 rev guidance to $40B+. Blackwell 4U/2-OU liquid-cooled systems. Fastest to market." },
  SE: { ticker:"SE.PA", name:"Schneider Electric", price:265.0, mcap:155.0, pe_fwd:30.0, fy26e_rev:40.0, fy26e_eps:8.80, fy26e_growth:10, op_margin:18.5, dc_pct:22, lc_growth:"+60%", backlog:"Strong", color:"#a78bfa", role:"End-to-End DC Infrastructure", summary:"Acquired Motivair for liquid cooling portfolio. Full-stack DC infrastructure: power, cooling, software. Galaxy UPS line for hyperscale." },
  NVDA: { ticker:"NVDA", name:"NVIDIA", price:131.0, mcap:3220.0, pe_fwd:28.5, fy26e_rev:200.0, fy26e_eps:4.60, fy26e_growth:55, op_margin:62.0, dc_pct:88, lc_growth:"N/A", backlog:"$30B+", color:"#76b900", role:"GPUs / AI Accelerators", summary:"GB200 NVL72 platform driving liquid cooling demand. 700W/chip thermal load. DC revenue $35.6B Q4 (+93% YoY). Rubin platform 2027." },
  ORCL: { ticker:"ORCL", name:"Oracle", price:172.0, mcap:480.0, pe_fwd:25.0, fy26e_rev:66.0, fy26e_eps:6.90, fy26e_growth:15, op_margin:30.0, dc_pct:35, lc_growth:"N/A", backlog:"$130B RPO", color:"#f43f5e", role:"Cloud Infrastructure / DC Developer", summary:"Building Stargate campuses. $300B+ OpenAI deal over 5 years. Purchasing 400K GB200 chips for Abilene. $130B remaining performance obligations." },
  AMZN: { ticker:"AMZN", name:"Amazon/AWS", price:225.0, mcap:2380.0, pe_fwd:32.0, fy26e_rev:700.0, fy26e_eps:7.00, fy26e_growth:12, op_margin:11.0, dc_pct:18, lc_growth:"N/A", backlog:"Large", color:"#ff9900", role:"Hyperscaler / DC Operator", summary:"Project Rainier for Anthropic ($11B). AWS Generative AI Innovation Center. $100B+ in DC expansion. Trainium 2 custom chips." },
  META: { ticker:"META", name:"Meta Platforms", price:700.0, mcap:1780.0, pe_fwd:24.0, fy26e_rev:195.0, fy26e_eps:29.0, fy26e_growth:16, op_margin:35.0, dc_pct:12, lc_growth:"N/A", backlog:"$65B capex guide", color:"#0668E1", role:"Hyperscaler / DC Operator", summary:"Prometheus (1 GW, OH), Hyperion (5 GW, LA). $65B capex guidance 2025. Entering electricity trading. 30th DC broke ground in WI." },
  MSFT: { ticker:"MSFT", name:"Microsoft", price:412.0, mcap:3060.0, pe_fwd:30.0, fy26e_rev:280.0, fy26e_eps:13.70, fy26e_growth:14, op_margin:44.0, dc_pct:15, lc_growth:"N/A", backlog:"$298B RPO", color:"#00a4ef", role:"Hyperscaler / DC Operator", summary:"131 DCs operational, 111 under construction. AI Superfactory in Atlanta. $20B PA investment. Sidekick liquid cooling for Azure Maia chips." },
};

// ═══════════════════════════════════════════════════════════════════════
//  DATA CENTER PROJECTS with linked companies
// ═══════════════════════════════════════════════════════════════════════
const PROJECTS = [
  { id:1, name:"Stargate I — Abilene", state:"TX", lat:32.45, lng:-99.73, capacity:"1.2 GW", investment:"$100B+", status:"Under Construction", year:2026, type:"AI Training", operator:"OpenAI", elecRate:7.2,
    companies: [
      { ticker:"ORCL", role:"DC Developer & Cloud Provider", detail:"Building campus, purchasing 400K GB200 chips, $300B+ 5yr deal" },
      { ticker:"NVDA", role:"GPU Supplier", detail:"GB200 NVL72 platform, 700W/chip requiring liquid cooling" },
      { ticker:"VRT", role:"Power & Cooling Infrastructure", detail:"NVIDIA co-dev partner, 360AI platform, CDUs and liquid cooling" },
      { ticker:"SMCI", role:"AI Server Systems", detail:"Blackwell-ready DLC server racks, 98% heat capture" },
      { ticker:"ETN", role:"Power Distribution", detail:"UPS, switchgear, busbar. Boyd acquisition adds liquid cooling" },
    ]},
  { id:2, name:"Stargate — New Mexico", state:"NM", lat:35.08, lng:-106.65, capacity:"800 MW", investment:"$40B", status:"Announced", year:2027, type:"AI Training", operator:"OpenAI/Oracle",  elecRate:7.6,
    companies: [
      { ticker:"ORCL", role:"DC Developer", detail:"Oracle-built campus as part of 4.5 GW expansion" },
      { ticker:"NVDA", role:"GPU Supplier", detail:"Next-gen GPU deployment for training workloads" },
      { ticker:"VRT", role:"Thermal & Power", detail:"Expected to supply reference architecture cooling" },
      { ticker:"SE", role:"Electrical Infrastructure", detail:"Galaxy UPS, power distribution for hyperscale" },
    ]},
  { id:3, name:"Stargate — Ohio", state:"OH", lat:40.45, lng:-83.1, capacity:"600 MW", investment:"$30B", status:"Announced", year:2027, type:"AI Training", operator:"OpenAI/SoftBank", elecRate:7.9,
    companies: [
      { ticker:"ORCL", role:"DC Developer", detail:"Part of multi-state Stargate expansion" },
      { ticker:"NVDA", role:"GPU Supplier", detail:"Blackwell and next-gen platform deployment" },
      { ticker:"VRT", role:"Cooling Infrastructure", detail:"Liquid cooling CDUs, SmartRun prefab solutions" },
      { ticker:"ETN", role:"Power Infrastructure", detail:"Electrical Americas segment, power management" },
    ]},
  { id:4, name:"Stargate — Wisconsin (Lighthouse)", state:"WI", lat:43.78, lng:-88.26, capacity:"600 MW", investment:"$30B", status:"Under Construction", year:2028, type:"AI Training", operator:"Oracle/Vantage", elecRate:9.3,
    companies: [
      { ticker:"ORCL", role:"DC Developer & Operator", detail:"Partnership with Vantage, 'Lighthouse' project" },
      { ticker:"VRT", role:"Power & Cooling", detail:"MegaMod HDX up to 10MW, rack densities 50-100kW+" },
      { ticker:"MOD", role:"Chillers & HVAC", detail:"New Franklin, WI facility producing AHUs and modular DC units" },
      { ticker:"NVT", role:"Enclosures & Thermal", detail:"Rack enclosures, cable management, cooling solutions" },
    ]},
  { id:5, name:"Project Rainier", state:"IN", lat:39.95, lng:-86.4, capacity:"2.2 GW", investment:"$11B", status:"Under Construction", year:2026, type:"AI Training", operator:"Amazon/Anthropic", elecRate:8.2,
    companies: [
      { ticker:"AMZN", role:"Developer & Operator", detail:"1,200 acres, 7 of 30 DCs built. Trainium 2 custom chips" },
      { ticker:"VRT", role:"Cooling & Power", detail:"Multi-megawatt cooling for hyperscale GPU clusters" },
      { ticker:"SE", role:"Power Distribution", detail:"Schneider Galaxy UPS, busway, BMS software" },
      { ticker:"MOD", role:"Chilled Water Systems", detail:"Airedale chillers for high-density compute cooling" },
    ]},
  { id:6, name:"Microsoft Mount Pleasant", state:"WI", lat:42.55, lng:-88.5, capacity:"500 MW", investment:"$3B", status:"Under Construction", year:2026, type:"Cloud/AI", operator:"Microsoft", elecRate:9.3,
    companies: [
      { ticker:"MSFT", role:"Developer & Operator", detail:"315 acres, zero-water evaporation, closed-loop cooling" },
      { ticker:"VRT", role:"Thermal Management", detail:"Liebert cooling systems, rack PDUs" },
      { ticker:"ETN", role:"Power Infrastructure", detail:"UPS, switchgear, PDUs for cloud infrastructure" },
      { ticker:"NVT", role:"Enclosures", detail:"Rack and enclosure systems, thermal solutions" },
    ]},
  { id:7, name:"Microsoft AI Superfactory (ATL)", state:"GA", lat:33.75, lng:-84.39, capacity:"400 MW", investment:"$3B", status:"Operational", year:2025, type:"AI Superfactory", operator:"Microsoft", elecRate:7.3,
    companies: [
      { ticker:"MSFT", role:"Developer & Operator", detail:"First AI superfactory, hundreds of thousands of GPUs" },
      { ticker:"NVDA", role:"GPU Supplier", detail:"Advanced GPU deployment for AI workloads" },
      { ticker:"VRT", role:"Cooling Infrastructure", detail:"Sidekick-class liquid cooling for Azure Maia chips" },
      { ticker:"ETN", role:"Power Management", detail:"Critical power distribution and protection" },
    ]},
  { id:8, name:"Prometheus", state:"OH", lat:39.72, lng:-82.55, capacity:"1 GW", investment:"$10B+", status:"Under Construction", year:2026, type:"AI Training", operator:"Meta", elecRate:7.9,
    companies: [
      { ticker:"META", role:"Developer & Operator", detail:"First gigawatt DC. 200MW on-site natural gas by Nov 2026" },
      { ticker:"NVDA", role:"GPU Supplier", detail:"Millions of AI chips in expanded NVIDIA deal" },
      { ticker:"VRT", role:"Cooling & Power", detail:"Hyperscale thermal management, prefab modules" },
      { ticker:"MOD", role:"Precision Cooling", detail:"Chillers and CDUs for high-density AI racks" },
    ]},
  { id:9, name:"Hyperion", state:"LA", lat:30.48, lng:-91.19, capacity:"5 GW", investment:"$50B+", status:"Planned", year:2028, type:"AI Mega Campus", operator:"Meta", elecRate:6.2,
    companies: [
      { ticker:"META", role:"Developer & Operator", detail:"Manhattan-sized. 10 DCs, 1,200 acres. 3 gas plants ($3B)" },
      { ticker:"NVDA", role:"GPU Supplier", detail:"Multi-million GPU deployment over build-out" },
      { ticker:"VRT", role:"Cooling Infrastructure", detail:"Largest potential single-site cooling deployment" },
      { ticker:"ETN", role:"Power + Liquid Cooling", detail:"Boyd liquid cooling + Eaton power from chip to grid" },
      { ticker:"SE", role:"Building Management", detail:"EcoStruxure BMS, power monitoring" },
      { ticker:"MOD", role:"Large-Scale Chillers", detail:"Modular chiller systems for phased build-out" },
    ]},
  { id:10, name:"Amazon Richmond County", state:"NC", lat:34.97, lng:-79.89, capacity:"500 MW", investment:"$10B", status:"Under Construction", year:2027, type:"Cloud/AI", operator:"Amazon/AWS", elecRate:7.5,
    companies: [
      { ticker:"AMZN", role:"Developer & Operator", detail:"20 buildings at full build-out, near Duke Energy 2.24GW plant" },
      { ticker:"VRT", role:"Cooling & Power", detail:"Thermal management for 200K+ sqft buildings" },
      { ticker:"SE", role:"Power Distribution", detail:"Medium-voltage switchgear and UPS systems" },
    ]},
  { id:11, name:"Microsoft PA — Salem Township", state:"PA", lat:41.08, lng:-76.53, capacity:"800 MW", investment:"$20B", status:"Under Construction", year:2027, type:"Cloud/AI", operator:"Microsoft", elecRate:8.5,
    companies: [
      { ticker:"MSFT", role:"Developer & Operator", detail:"Adjacent to Susquehanna nuclear plant, direct power connection" },
      { ticker:"VRT", role:"Cooling Infrastructure", detail:"Pre-engineered AI cooling solutions" },
      { ticker:"ETN", role:"Power Distribution", detail:"Fibrebond modular power enclosures" },
      { ticker:"NVT", role:"Enclosures & Protection", detail:"IT rack systems and cable management" },
    ]},
  { id:12, name:"Anthropic/FluidStack TX", state:"TX", lat:30.27, lng:-97.74, capacity:"500 MW", investment:"$25B", status:"Announced", year:2027, type:"AI Training", operator:"Anthropic", elecRate:7.2,
    companies: [
      { ticker:"VRT", role:"Cooling & Power", detail:"Expected primary cooling infrastructure vendor" },
      { ticker:"SMCI", role:"AI Server Systems", detail:"Liquid-cooled server racks for training clusters" },
      { ticker:"NVDA", role:"GPU Supplier", detail:"Next-gen GPU deployment" },
      { ticker:"ETN", role:"Power Management", detail:"Electrical distribution and protection" },
    ]},
  { id:13, name:"Anthropic/FluidStack NY", state:"NY", lat:43.0, lng:-75.5, capacity:"500 MW", investment:"$25B", status:"Announced", year:2027, type:"AI Training", operator:"Anthropic", elecRate:14.8,
    companies: [
      { ticker:"VRT", role:"Cooling Infrastructure", detail:"Thermal management for training facility" },
      { ticker:"SMCI", role:"Server Infrastructure", detail:"DLC server systems" },
      { ticker:"NVDA", role:"GPU Supplier", detail:"AI accelerator deployment" },
    ]},
  { id:14, name:"Colossus", state:"TN", lat:35.15, lng:-90.05, capacity:"150 MW", investment:"$3B", status:"Operational", year:2025, type:"AI Training", operator:"xAI", elecRate:7.6,
    companies: [
      { ticker:"NVDA", role:"GPU Supplier", detail:"100,000 H100 GPUs, built in 122 days" },
      { ticker:"SMCI", role:"Server Infrastructure", detail:"Rapid-deploy liquid-cooled server racks" },
      { ticker:"VRT", role:"Cooling Systems", detail:"CDUs and liquid cooling for dense GPU clusters" },
    ]},
  { id:15, name:"Vantage Port Washington", state:"WI", lat:43.15, lng:-87.2, capacity:"1 GW", investment:"$15B", status:"Under Construction", year:2027, type:"Colocation", operator:"Vantage", elecRate:9.3,
    companies: [
      { ticker:"VRT", role:"Cooling & Power", detail:"Primary thermal and power infrastructure" },
      { ticker:"ETN", role:"Power Distribution", detail:"Switchgear, UPS, busbar systems" },
      { ticker:"MOD", role:"Chiller Systems", detail:"Climate Solutions segment products" },
      { ticker:"NVT", role:"Enclosures", detail:"Rack systems and protection solutions" },
    ]},
  { id:16, name:"Meta Beaver Dam", state:"WI", lat:43.80, lng:-89.3, capacity:"300 MW", investment:"$2B", status:"Under Construction", year:2026, type:"AI Training", operator:"Meta", elecRate:9.3,
    companies: [
      { ticker:"META", role:"Developer & Operator", detail:"30th data center, supporting AI and digital infra" },
      { ticker:"VRT", role:"Cooling", detail:"Thermal management systems" },
      { ticker:"MOD", role:"Chillers", detail:"Nearby Franklin WI facility supplying cooling units" },
    ]},
  { id:17, name:"Homer City GW Campus", state:"PA", lat:40.54, lng:-79.16, capacity:"4.5 GW", investment:"$30B+", status:"Under Construction", year:2028, type:"AI Mega Campus", operator:"Various", elecRate:8.5,
    companies: [
      { ticker:"VRT", role:"Cooling Infrastructure", detail:"Massive cooling deployment for 3,200-acre campus" },
      { ticker:"ETN", role:"Power + Cooling", detail:"Boyd liquid cooling + power distribution" },
      { ticker:"SE", role:"Electrical Infrastructure", detail:"Medium/high voltage distribution" },
      { ticker:"MOD", role:"Industrial Cooling", detail:"Large-scale chiller systems for phased build" },
      { ticker:"NVT", role:"Protection Solutions", detail:"Enclosures and thermal management" },
    ]},
];

// ═══════════════════════════════════════════════════════════════════════
//  ALBERS USA EQUAL-AREA CONIC PROJECTION
// ═══════════════════════════════════════════════════════════════════════
const albersUsa = (() => {
  const RAD = Math.PI / 180;
  const phi1 = 29.5 * RAD, phi2 = 45.5 * RAD;
  const phi0 = 38.5 * RAD, lam0 = -96 * RAD;
  const n = (Math.sin(phi1) + Math.sin(phi2)) / 2;
  const C = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
  const r0 = Math.sqrt(C - 2 * n * Math.sin(phi0)) / n;
  const S = 1070, TX = 480, TY = 260;
  return (lng, lat) => {
    const phi = lat * RAD, theta = n * (lng * RAD - lam0);
    const r = Math.sqrt(C - 2 * n * Math.sin(phi)) / n;
    return { x: S * r * Math.sin(theta) + TX, y: TY - S * (r0 - r * Math.cos(theta)) };
  };
})();

const ringToPath = (ring) =>
  ring.map(([lng, lat], i) => {
    const { x, y } = albersUsa(lng, lat);
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join('') + 'Z';

const geoToPath = (st) => {
  if (st.type === 'Polygon') return st.coords.map(ringToPath).join('');
  if (st.type === 'MultiPolygon') return st.coords.flat().map(ringToPath).join('');
  return '';
};

// Pre-compute projected SVG paths once — these never change
const STATE_PATHS = STATES_GEO.map(st => ({ abbr: st.abbr, name: st.name, d: geoToPath(st) }));

// Data parsing & scaling utilities
const parseMW = (s) => { const m = s.match(/([\d.]+)\s*(GW|MW)/i); if (!m) return 500; return parseFloat(m[1]) * (m[2].toUpperCase() === 'GW' ? 1000 : 1); };
const capacityRadius = (mw) => 5 + (Math.sqrt(mw) - Math.sqrt(150)) / (Math.sqrt(5000) - Math.sqrt(150)) * 11;
const statCol = s => s==="Operational"?"#10b981":s==="Under Construction"?"#f59e0b":s==="Announced"?"#6366f1":s==="Planned"?"#94a3b8":"#64748b";
const F = "'JetBrains Mono','Fira Code',monospace";
const D = "'Syne','Space Grotesk',sans-serif";

// ═══════════════════════════════════════════════════════════════════════
export default function FusedDashboard() {
  const [sel, setSel] = useState(null);
  const [hov, setHov] = useState(null);
  const [fSt, setFSt] = useState("all");
  const [selCompany, setSelCompany] = useState(null);
  const [companyView, setCompanyView] = useState(false);

  const filtered = useMemo(() => PROJECTS.filter(p => fSt==="all" || p.status===fSt), [fSt]);
  const project = sel ? PROJECTS.find(p=>p.id===sel) : null;
  const linkedCompanies = project ? project.companies.map(c=>({...COMPANIES[c.ticker],...c})) : [];

  // Company aggregate: how many projects each company appears in
  const companyProjects = useMemo(() => {
    const map = {};
    PROJECTS.forEach(p => p.companies.forEach(c => {
      if (!map[c.ticker]) map[c.ticker] = [];
      map[c.ticker].push(p);
    }));
    return map;
  }, []);

  const S = {
    card: {background:"rgba(10,14,23,0.9)",border:"1px solid #1e293b",borderRadius:10,padding:14,backdropFilter:"blur(8px)"},
    badge: c => ({display:"inline-block",padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:700,background:`${c}18`,color:c,border:`1px solid ${c}33`,letterSpacing:"0.5px",textTransform:"uppercase"}),
    btn: a => ({padding:"5px 11px",borderRadius:5,border:a?"1px solid #6366f1":"1px solid #1e293b",background:a?"rgba(99,102,241,0.12)":"transparent",color:a?"#a5b4fc":"#475569",cursor:"pointer",fontFamily:F,fontSize:10,fontWeight:600,transition:"all .12s"}),
  };

  return (
    <div style={{minHeight:"100vh",background:"#060a13",color:"#cbd5e1",fontFamily:F,fontSize:12,lineHeight:1.5}}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{padding:"16px 20px",borderBottom:"1px solid #1e293b",background:"linear-gradient(135deg,#080c18,#0d1330,#080c18)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div>
            <h1 style={{fontFamily:D,fontSize:22,fontWeight:800,margin:0,background:"linear-gradient(135deg,#e2e8f0,#818cf8,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>AI Data Center Investment Map</h1>
            <p style={{color:"#475569",fontSize:10,margin:"3px 0 0",letterSpacing:1.5,textTransform:"uppercase"}}>Click a project marker to view linked public companies & financials</p>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {["all","Operational","Under Construction","Announced","Planned"].map(s=>(
              <button key={s} style={S.btn(fSt===s)} onClick={()=>setFSt(s)}>{s==="all"?"All":s}</button>
            ))}
            <button style={{...S.btn(companyView),background:companyView?"rgba(52,211,153,0.12)":"transparent",borderColor:companyView?"#34d399":"#1e293b",color:companyView?"#34d399":"#475569"}} onClick={()=>{setCompanyView(!companyView);setSel(null);setSelCompany(null)}}>
              {companyView ? "Companies View" : "Companies"}
            </button>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:companyView?"1fr":"1fr 380px",gap:0,height:"calc(100vh - 62px)"}}>
        {/* ═══ MAP ═══ */}
        <div style={{padding:12,overflow:"hidden",position:"relative"}}>
          <svg viewBox="0 0 960 600" style={{width:"100%",height:"100%",maxHeight:"calc(100vh - 86px)"}} onClick={(e)=>{if(e.target.tagName==='svg'||e.target.tagName==='path'){setSel(null);setSelCompany(null)}}}>
            {/* STATE OUTLINES — GeoJSON projected through Albers USA */}
            {STATE_PATHS.map(st => (
              <path key={st.abbr} d={st.d} fill={hov===st.abbr?"#1e293b":"#131b2e"} stroke={hov===st.abbr?"#475569":"#1e293b"} strokeWidth={hov===st.abbr?1.2:0.5} style={{cursor:"pointer",transition:"fill .15s, stroke .15s, stroke-width .15s"}} aria-label={st.name} onMouseEnter={()=>setHov(st.abbr)} onMouseLeave={()=>setHov(null)}/>
            ))}
            {/* PROJECT MARKERS — Graduated symbols with capacity labels */}
            {filtered.map(p=>{
              const {x,y} = albersUsa(p.lng, p.lat);
              const c = statCol(p.status);
              const isSel = sel===p.id;
              const mw = parseMW(p.capacity);
              const baseR = capacityRadius(mw);
              const r = isSel ? baseR + 4 : baseR;
              return (
                <g key={p.id} style={{cursor:"pointer"}} onClick={()=>{setSel(isSel?null:p.id);setSelCompany(null);setCompanyView(false)}}>
                  <circle cx={x} cy={y} r={Math.max(r+6,12)} fill="transparent"/>
                  {isSel && <circle cx={x} cy={y} r={r+8} fill={c} opacity={0.15}/>}
                  <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} stroke={isSel?"#fff":"rgba(0,0,0,0.3)"} strokeWidth={isSel?2:1}/>
                  <text x={x+r+4} y={y+1} fill="#e2e8f0" fontSize="8" fontWeight="600" fontFamily={F} style={{pointerEvents:"none"}}>{p.capacity}</text>
                  {isSel && (
                    <text x={x} y={y-r-6} textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="700" fontFamily={F} style={{pointerEvents:"none"}}>
                      {p.name.length > 25 ? p.name.substring(0,25)+'...' : p.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {/* LEGEND — Vertical panel, top-right */}
          <div style={{position:"absolute",top:16,right:16,background:"rgba(10,14,23,0.92)",border:"1px solid #1e293b",borderRadius:8,padding:"12px 14px",display:"flex",flexDirection:"column",gap:6,backdropFilter:"blur(8px)"}}>
            <div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Status</div>
            {["Operational","Under Construction","Announced","Planned"].map(s=>(
              <div key={s} style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:statCol(s),flexShrink:0}}/>
                <span style={{fontSize:10,color:"#94a3b8"}}>{s}</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid #1e293b",paddingTop:8,marginTop:2}}>
              <div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:6}}>Capacity</div>
              {[["150 MW",150],["1 GW",1000],["5 GW",5000]].map(([label,mw])=>{
                const r = capacityRadius(mw);
                return (
                  <div key={label} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <svg width={r*2+2} height={r*2+2} style={{flexShrink:0}}><circle cx={r+1} cy={r+1} r={r} fill="#6366f1" opacity={0.85}/></svg>
                    <span style={{fontSize:10,color:"#94a3b8"}}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ SIDEBAR ═══ */}
        {!companyView && (
          <div style={{borderLeft:"1px solid #1e293b",overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:10}}>
            {/* Project detail */}
            {project ? (<>
              <button onClick={()=>{setSel(null);setSelCompany(null)}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 10px",borderRadius:6,border:"1px solid #1e293b",background:"rgba(15,23,42,0.5)",color:"#94a3b8",cursor:"pointer",fontFamily:F,fontSize:11,fontWeight:600,width:"100%",textAlign:"left",transition:"all .12s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#6366f1"} onMouseLeave={e=>e.currentTarget.style.borderColor="#1e293b"}>
                <span style={{fontSize:14}}>←</span> Back to all projects
              </button>
              <div style={{...S.card,borderColor:`${statCol(project.status)}33`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <h2 style={{margin:0,fontFamily:D,fontSize:16,fontWeight:800,color:"#e2e8f0"}}>{project.name}</h2>
                  <span style={S.badge(statCol(project.status))}>{project.status}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px",marginBottom:10}}>
                  {[["Operator",project.operator],["Capacity",project.capacity],["Investment",project.investment],["Target Year",project.year],["Type",project.type],["Elec. Rate",`${project.elecRate}¢/kWh`]].map(([k,v])=>(
                    <div key={k}><div style={{fontSize:9,color:"#475569",textTransform:"uppercase"}}>{k}</div><div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{v}</div></div>
                  ))}
                </div>
                <div style={{padding:"6px 8px",borderRadius:6,background:project.elecRate<=7.5?"rgba(16,185,129,0.08)":project.elecRate<=9?"rgba(251,191,36,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${project.elecRate<=7.5?"#10b98122":project.elecRate<=9?"#fbbf2422":"#ef444422"}`}}>
                  <span style={{fontSize:10,color:project.elecRate<=7.5?"#10b981":project.elecRate<=9?"#fbbf24":"#ef4444",fontWeight:600}}>
                    {project.elecRate<=7.5?"Low-cost energy state":(project.elecRate<=9?"Moderate":"High")+" energy cost"}
                  </span>
                </div>
              </div>

              {/* LINKED COMPANIES */}
              <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,fontWeight:700,padding:"0 2px"}}>
                Linked Public Companies ({linkedCompanies.length})
              </div>

              {linkedCompanies.map(c => {
                const co = COMPANIES[c.ticker];
                const isSel = selCompany === c.ticker;
                return (
                  <div key={c.ticker} style={{...S.card,borderColor:isSel?`${co.color}55`:"#1e293b",cursor:"pointer",transition:"all .12s"}} onClick={()=>setSelCompany(isSel?null:c.ticker)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:4,height:32,borderRadius:2,background:co.color}}/>
                        <div>
                          <div style={{fontWeight:700,fontSize:13,color:co.color}}>{co.ticker}</div>
                          <div style={{fontSize:9,color:"#64748b"}}>{co.name}</div>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0"}}>${co.price}</div>
                        <div style={{fontSize:9,color:"#475569"}}>{co.pe_fwd}x fwd</div>
                      </div>
                    </div>

                    <div style={{margin:"8px 0 0",padding:"6px 8px",background:"rgba(15,23,42,0.5)",borderRadius:6,border:"1px solid #111827"}}>
                      <div style={{fontSize:9,color:"#818cf8",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{c.role}</div>
                      <div style={{fontSize:10,color:"#94a3b8"}}>{c.detail}</div>
                    </div>

                    {isSel && (
                      <div style={{marginTop:8,animation:"fadeIn .2s ease"}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                          {[["Mkt Cap",`$${co.mcap}B`],["FY26E Rev",`$${co.fy26e_rev}B`],["Growth",`+${co.fy26e_growth}%`],["FY26E EPS",`$${co.fy26e_eps}`],["OPM",`${co.op_margin}%`],["DC %Rev",`${co.dc_pct}%`],["LC Growth",co.lc_growth],["Backlog",co.backlog],["Fwd P/E",`${co.pe_fwd}x`]].map(([k,v])=>(
                              <div key={k} style={{padding:"3px 5px",background:"rgba(15,23,42,0.6)",borderRadius:4}}>
                                <div style={{fontSize:8,color:"#475569"}}>{k}</div>
                                <div style={{fontSize:11,fontWeight:600,color:"#e2e8f0"}}>{v}</div>
                              </div>
                            ))}
                        </div>
                        <div style={{fontSize:10,color:"#94a3b8",lineHeight:1.5}}>{co.summary}</div>
                        <div style={{marginTop:6,fontSize:9,color:"#475569"}}>
                          Appears in <strong style={{color:"#a5b4fc"}}>{(companyProjects[co.ticker]||[]).length}</strong> tracked projects
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>) : (
              /* PROJECT LIST */
              <>
                <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>
                  Projects ({filtered.length}) — Click a marker or list item
                </div>
                {filtered.map(p=>(
                  <div key={p.id} style={{...S.card,cursor:"pointer",borderColor:sel===p.id?`${statCol(p.status)}44`:"#1e293b"}} onClick={()=>{setSel(p.id);setSelCompany(null)}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontWeight:600,fontSize:11,color:"#e2e8f0"}}>{p.name}</span>
                      <span style={S.badge(statCol(p.status))}>{p.status.split(" ")[0]}</span>
                    </div>
                    <div style={{fontSize:9,color:"#475569",marginTop:3}}>
                      {p.operator} · {p.capacity} · {p.investment} · {p.companies.length} companies
                    </div>
                    <div style={{display:"flex",gap:3,marginTop:4,flexWrap:"wrap"}}>
                      {p.companies.map(c=>(
                        <span key={c.ticker} style={{fontSize:8,padding:"1px 5px",borderRadius:3,background:`${COMPANIES[c.ticker]?.color}15`,color:COMPANIES[c.ticker]?.color,border:`1px solid ${COMPANIES[c.ticker]?.color}22`,fontWeight:600}}>{c.ticker}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ═══ COMPANY AGGREGATE VIEW ═══ */}
        {companyView && (
          <div style={{borderLeft:"1px solid #1e293b",overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>
              Company Exposure Across All Projects
            </div>
            {Object.entries(COMPANIES).sort((a,b)=>(companyProjects[b[0]]||[]).length-(companyProjects[a[0]]||[]).length).map(([ticker,co])=>{
              const projs = companyProjects[ticker]||[];
              if(projs.length===0) return null;
              const isSel = selCompany===ticker;
              return (
                <div key={ticker} style={{...S.card,borderColor:isSel?`${co.color}44`:"#1e293b",cursor:"pointer"}} onClick={()=>setSelCompany(isSel?null:ticker)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:4,height:28,borderRadius:2,background:co.color}}/>
                      <div>
                        <span style={{fontWeight:700,color:co.color,fontSize:13}}>{ticker}</span>
                        <span style={{color:"#475569",fontSize:10,marginLeft:6}}>{co.name}</span>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16,fontWeight:800,color:"#e2e8f0"}}>{projs.length}</span>
                      <span style={{fontSize:9,color:"#475569"}}>projects</span>
                    </div>
                  </div>
                  {/* Mini bar showing project count */}
                  <div style={{marginTop:6,height:6,background:"#111827",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(projs.length/PROJECTS.length)*100}%`,background:`linear-gradient(90deg,${co.color}88,${co.color})`,borderRadius:3}}/>
                  </div>
                  <div style={{display:"flex",gap:6,marginTop:6,fontSize:10,color:"#94a3b8"}}>
                    <span>${co.price} · {co.pe_fwd}x fwd · ${co.mcap}B mcap</span>
                  </div>
                  {isSel && (
                    <div style={{marginTop:8}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:8}}>
                        {[["FY26E Rev",`$${co.fy26e_rev}B`],["Growth",`+${co.fy26e_growth}%`],["OPM",`${co.op_margin}%`],["DC %Rev",`${co.dc_pct}%`],["LC Growth",co.lc_growth],["Backlog",co.backlog]].map(([k,v])=>(
                          <div key={k} style={{padding:"3px 5px",background:"rgba(15,23,42,0.6)",borderRadius:4}}>
                            <div style={{fontSize:8,color:"#475569"}}>{k}</div>
                            <div style={{fontSize:11,fontWeight:600,color:"#e2e8f0"}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{fontSize:10,color:"#94a3b8",marginBottom:6}}>{co.summary}</div>
                      <div style={{fontSize:9,color:"#64748b",fontWeight:700,marginBottom:4}}>PROJECT INVOLVEMENT:</div>
                      {projs.map(p=>{
                        const link = p.companies.find(c=>c.ticker===ticker);
                        return (
                          <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 6px",background:"rgba(15,23,42,0.4)",borderRadius:4,marginBottom:3,cursor:"pointer"}} onClick={e=>{e.stopPropagation();setSel(p.id);setCompanyView(false);setSelCompany(ticker)}}>
                            <div>
                              <span style={{fontSize:10,fontWeight:600,color:"#e2e8f0"}}>{p.name}</span>
                              <span style={{fontSize:9,color:"#475569",marginLeft:6}}>{p.state} · {p.capacity}</span>
                            </div>
                            <span style={S.badge(statCol(p.status))}>{p.status.split(" ")[0]}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
