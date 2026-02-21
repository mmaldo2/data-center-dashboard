import { useState, useMemo } from "react";

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
  { id:3, name:"Stargate — Ohio", state:"OH", lat:40.08, lng:-82.91, capacity:"600 MW", investment:"$30B", status:"Announced", year:2027, type:"AI Training", operator:"OpenAI/SoftBank", elecRate:7.9,
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
  { id:6, name:"Microsoft Mount Pleasant", state:"WI", lat:42.72, lng:-87.88, capacity:"500 MW", investment:"$3B", status:"Under Construction", year:2026, type:"Cloud/AI", operator:"Microsoft", elecRate:9.3,
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
  { id:8, name:"Prometheus", state:"OH", lat:40.08, lng:-82.81, capacity:"1 GW", investment:"$10B+", status:"Under Construction", year:2026, type:"AI Training", operator:"Meta", elecRate:7.9,
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
  { id:15, name:"Vantage Port Washington", state:"WI", lat:43.39, lng:-87.88, capacity:"1 GW", investment:"$15B", status:"Under Construction", year:2027, type:"Colocation", operator:"Vantage", elecRate:9.3,
    companies: [
      { ticker:"VRT", role:"Cooling & Power", detail:"Primary thermal and power infrastructure" },
      { ticker:"ETN", role:"Power Distribution", detail:"Switchgear, UPS, busbar systems" },
      { ticker:"MOD", role:"Chiller Systems", detail:"Climate Solutions segment products" },
      { ticker:"NVT", role:"Enclosures", detail:"Rack systems and protection solutions" },
    ]},
  { id:16, name:"Meta Beaver Dam", state:"WI", lat:43.46, lng:-88.84, capacity:"300 MW", investment:"$2B", status:"Under Construction", year:2026, type:"AI Training", operator:"Meta", elecRate:9.3,
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

// State map data
const SP = {
  AL:"M628,466 L627,518 L622,518 L612,527 L611,520 L616,514 L617,466Z",
  AZ:"M205,410 L260,410 L270,460 L265,500 L220,505 L195,480 L195,440Z",
  AR:"M545,450 L600,450 L600,500 L545,505 L540,480Z",
  CA:"M120,290 L160,290 L175,340 L175,420 L155,460 L120,460 L100,400 L100,340Z",
  CO:"M285,320 L370,320 L370,390 L285,390Z",
  CT:"M810,220 L835,215 L840,235 L818,242Z",
  DE:"M775,295 L785,290 L790,310 L778,315Z",
  FL:"M640,530 L700,510 L720,530 L710,580 L680,600 L650,580 L635,555Z",
  GA:"M650,450 L700,440 L710,500 L690,520 L650,525 L640,500Z",
  ID:"M210,170 L250,160 L265,220 L255,280 L220,285 L200,240Z",
  IL:"M580,280 L610,275 L618,340 L610,380 L585,390 L575,350Z",
  IN:"M615,280 L645,280 L648,360 L618,365 L615,340Z",
  IA:"M500,250 L570,245 L575,310 L505,315Z",
  KS:"M390,360 L490,355 L490,410 L390,415Z",
  KY:"M615,370 L700,360 L705,400 L620,405Z",
  LA:"M545,510 L590,505 L600,540 L575,560 L545,545Z",
  ME:"M830,110 L855,100 L860,170 L840,185 L825,160Z",
  MD:"M735,300 L780,290 L790,320 L750,325 L730,315Z",
  MA:"M815,200 L850,195 L855,210 L820,218Z",
  MI:"M590,170 L640,160 L660,230 L640,270 L600,275 L595,240Z",
  MN:"M470,130 L540,125 L545,230 L475,235Z",
  MS:"M580,460 L610,455 L615,525 L590,530 L575,500Z",
  MO:"M505,350 L575,345 L582,420 L540,440 L505,430Z",
  MT:"M230,110 L350,105 L355,185 L235,190Z",
  NE:"M370,280 L480,275 L485,340 L375,345Z",
  NV:"M175,260 L220,255 L230,370 L185,420 L165,360Z",
  NH:"M820,140 L840,135 L842,195 L822,200Z",
  NJ:"M785,250 L800,245 L805,290 L785,300Z",
  NM:"M265,410 L340,405 L345,500 L270,505Z",
  NY:"M720,170 L810,155 L820,220 L780,245 L730,250 L715,215Z",
  NC:"M660,390 L770,370 L780,400 L710,425 L660,430Z",
  ND:"M375,120 L465,115 L470,190 L380,195Z",
  OH:"M650,270 L710,265 L715,340 L660,350 L648,310Z",
  OK:"M380,415 L490,410 L500,450 L490,470 L400,475 L385,445Z",
  OR:"M120,160 L205,150 L210,230 L140,240 L115,210Z",
  PA:"M715,240 L790,230 L795,280 L720,290Z",
  RI:"M835,215 L850,212 L852,228 L838,230Z",
  SC:"M680,430 L730,420 L740,460 L700,470 L675,455Z",
  SD:"M375,195 L470,190 L475,270 L380,275Z",
  TN:"M600,400 L710,390 L715,425 L605,435Z",
  TX:"M340,440 L490,430 L510,530 L480,580 L420,600 L360,570 L330,510Z",
  UT:"M230,270 L290,265 L295,380 L240,385Z",
  VT:"M800,130 L820,125 L822,185 L802,190Z",
  VA:"M680,330 L770,315 L780,365 L730,385 L670,390Z",
  WA:"M130,90 L210,85 L215,160 L140,165 L120,130Z",
  WV:"M695,310 L730,305 L740,360 L710,370 L690,345Z",
  WI:"M530,140 L590,135 L600,240 L545,245 L525,210Z",
  WY:"M270,200 L365,195 L370,280 L275,285Z"
};
const SL = {AL:{x:621,y:490},AZ:{x:230,y:455},AR:{x:565,y:475},CA:{x:135,y:375},CO:{x:325,y:355},CT:{x:825,y:228},DE:{x:783,y:302},FL:{x:672,y:555},GA:{x:670,y:480},ID:{x:230,y:225},IL:{x:593,y:330},IN:{x:632,y:320},IA:{x:535,y:280},KS:{x:435,y:385},KY:{x:660,y:385},LA:{x:568,y:530},ME:{x:843,y:140},MD:{x:760,y:312},MA:{x:835,y:207},MI:{x:625,y:210},MN:{x:505,y:180},MS:{x:595,y:490},MO:{x:540,y:385},MT:{x:290,y:145},NE:{x:425,y:310},NV:{x:192,y:340},NH:{x:831,y:168},NJ:{x:795,y:270},NM:{x:300,y:455},NY:{x:760,y:200},NC:{x:720,y:405},ND:{x:420,y:155},OH:{x:680,y:305},OK:{x:440,y:445},OR:{x:160,y:195},PA:{x:750,y:260},RI:{x:845,y:220},SC:{x:705,y:445},SD:{x:420,y:230},TN:{x:650,y:415},TX:{x:415,y:510},UT:{x:260,y:325},VT:{x:812,y:158},VA:{x:725,y:355},WA:{x:165,y:120},WV:{x:715,y:340},WI:{x:555,y:190},WY:{x:315,y:240}};

const ELEC = {AL:7.8,AZ:8.2,AR:7.1,CA:17.5,CO:8.9,CT:18.2,DE:10.1,FL:9.4,GA:7.3,ID:6.5,IL:8.6,IN:8.2,IA:7.4,KS:8.8,KY:6.8,LA:6.2,ME:14.1,MD:10.8,MA:19.8,MI:9.5,MN:9.1,MS:7.0,MO:7.9,MT:7.2,NE:8.0,NV:7.8,NH:16.5,NJ:12.4,NM:7.6,NY:14.8,NC:7.5,ND:7.1,OH:7.9,OK:6.4,OR:7.0,PA:8.5,RI:18.9,SC:6.9,SD:8.5,TN:7.6,TX:7.2,UT:7.1,VT:13.2,VA:7.8,WA:5.8,WV:7.2,WI:9.3,WY:6.9};

// Anchor dots to known state label positions + geo offset within state
const STATE_CENTERS = {TX:[31,-99],LA:[31,-92],NM:[34.5,-106],OH:[40.5,-82.5],WI:[44,-89.5],IN:[40,-86],GA:[33,-83.5],NC:[35.5,-80],PA:[41,-77.5],NY:[43,-75.5],TN:[35.5,-86]};
const geoSvg = (lat,lng,state) => {
  const sl = SL[state]; if(!sl) return {x:400,y:300};
  const sc = STATE_CENTERS[state]; if(!sc) return sl;
  return { x: sl.x + (lng - sc[1]) * 9, y: sl.y - (lat - sc[0]) * 13 };
};
const elecCol = r => r<=6.5?"#0d9488":r<=7.5?"#2dd4bf":r<=8.5?"#86efac":r<=10?"#fde68a":r<=13?"#fb923c":r<=17?"#ef4444":"#991b1b";
const statCol = s => s==="Operational"?"#10b981":s==="Under Construction"?"#f59e0b":s==="Announced"?"#6366f1":"#94a3b8";
const F = "'JetBrains Mono','Fira Code',monospace";
const D = "'Syne','Space Grotesk',sans-serif";

// ═══════════════════════════════════════════════════════════════════════
export default function FusedDashboard() {
  const [sel, setSel] = useState(null); // selected project
  const [hov, setHov] = useState(null); // hovered state
  const [fSt, setFSt] = useState("all");
  const [showElec, setShowElec] = useState(true);
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
            <h1 style={{fontFamily:D,fontSize:22,fontWeight:800,margin:0,background:"linear-gradient(135deg,#e2e8f0,#818cf8,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>⚡ AI Data Center Investment Map</h1>
            <p style={{color:"#475569",fontSize:10,margin:"3px 0 0",letterSpacing:1.5,textTransform:"uppercase"}}>Click a project marker → View linked public companies & financials</p>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            <button style={S.btn(showElec)} onClick={()=>setShowElec(!showElec)}>⚡ Electricity</button>
            {["all","Operational","Under Construction","Announced"].map(s=>(
              <button key={s} style={S.btn(fSt===s)} onClick={()=>setFSt(s)}>{s==="all"?"All":s}</button>
            ))}
            <button style={{...S.btn(companyView),background:companyView?"rgba(52,211,153,0.12)":"transparent",borderColor:companyView?"#34d399":"#1e293b",color:companyView?"#34d399":"#475569"}} onClick={()=>{setCompanyView(!companyView);setSel(null);setSelCompany(null)}}>
              {companyView ? "📊 Companies View" : "📊 Companies"}
            </button>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:companyView?"1fr":"1fr 380px",gap:0,height:"calc(100vh - 62px)"}}>
        {/* ═══ MAP ═══ */}
        <div style={{padding:12,overflow:"hidden",position:"relative"}}>
          <svg viewBox="50 60 850 570" style={{width:"100%",height:"100%",maxHeight:"calc(100vh - 86px)"}} onClick={(e)=>{if(e.target.tagName==='svg'||e.target.tagName==='path'){setSel(null);setSelCompany(null)}}}>
            {Object.entries(SP).map(([st,d])=>{
              const rate=ELEC[st]; const fill=showElec?elecCol(rate):"#1e293b";
              return <path key={st} d={d} fill={fill} fillOpacity={showElec?(hov===st?.6:.4):(hov===st?.5:.25)} stroke={hov===st?"#64748b":"#1a2335"} strokeWidth={hov===st?1.5:0.8} style={{cursor:"pointer",transition:"all .12s"}} onMouseEnter={()=>setHov(st)} onMouseLeave={()=>setHov(null)}/>;
            })}
            {Object.entries(SL).map(([st,p])=>(
              <text key={st} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill={hov===st?"#cbd5e1":"#334155"} fontSize="8" fontWeight="600" fontFamily={F} style={{pointerEvents:"none"}}>{st}</text>
            ))}
            {/* PROJECT MARKERS */}
            {filtered.map(p=>{
              const pos=geoSvg(p.lat,p.lng,p.state); const c=statCol(p.status); const isSel=sel===p.id;
              const r=isSel?10:6;
              return <g key={p.id} style={{cursor:"pointer"}} onClick={()=>{setSel(isSel?null:p.id);setSelCompany(null);setCompanyView(false)}}>
                <circle cx={pos.x} cy={pos.y} r={r+10} fill={c} opacity={.08}/>
                <circle cx={pos.x} cy={pos.y} r={r+5} fill={c} opacity={.15}/>
                <circle cx={pos.x} cy={pos.y} r={r} fill={c} stroke={isSel?"#fff":c} strokeWidth={isSel?2.5:1.5} opacity={.9}/>
                {isSel && <>
                  <rect x={pos.x-60} y={pos.y-28} width={120} height={18} rx={4} fill="#0a0e17ee" stroke={c} strokeWidth={0.5}/>
                  <text x={pos.x} y={pos.y-17} textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="700" fontFamily={F}>{p.name.substring(0,22)}</text>
                </>}
              </g>;
            })}
          </svg>
          {/* LEGEND */}
          <div style={{position:"absolute",bottom:16,left:16,display:"flex",gap:16,flexWrap:"wrap"}}>
            {showElec && <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(10,14,23,0.85)",padding:"4px 8px",borderRadius:6,border:"1px solid #1e293b"}}>
              <span style={{fontSize:9,color:"#475569"}}>¢/kWh:</span>
              {[["≤6.5","#0d9488"],["7.5","#2dd4bf"],["8.5","#86efac"],["10","#fde68a"],["13","#fb923c"],["17+","#ef4444"]].map(([l,c])=>
                <span key={l} style={{display:"flex",alignItems:"center",gap:2}}>
                  <span style={{width:8,height:8,borderRadius:2,background:c}}/>
                  <span style={{fontSize:8,color:"#64748b"}}>{l}</span>
                </span>
              )}
            </div>}
            <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(10,14,23,0.85)",padding:"4px 8px",borderRadius:6,border:"1px solid #1e293b"}}>
              {["Operational","Under Construction","Announced"].map(s=>
                <span key={s} style={{display:"flex",alignItems:"center",gap:3}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:statCol(s)}}/>
                  <span style={{fontSize:8,color:"#64748b"}}>{s}</span>
                </span>
              )}
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
                    {project.elecRate<=7.5?"✓ Low-cost energy state":"⚠ "+(project.elecRate<=9?"Moderate":"High")+" energy cost"}
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
