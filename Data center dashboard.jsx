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

// State map data — moderately detailed outlines
const SP = {
  AL:"M618,466 L628,466 L630,472 L630,485 L629,498 L628,510 L627,518 L624,518 L620,522 L614,527 L611,522 L612,516 L616,510 L617,498 L617,485 L617,474Z",
  AZ:"M195,415 L205,410 L230,408 L260,410 L265,420 L270,440 L272,460 L268,480 L265,500 L245,505 L220,505 L205,498 L195,480 L193,460 L195,440Z",
  AR:"M540,448 L555,446 L570,446 L585,447 L600,450 L602,460 L602,475 L600,490 L600,500 L582,503 L565,505 L548,505 L542,498 L540,480 L540,465Z",
  CA:"M100,300 L108,290 L120,285 L140,288 L160,290 L168,308 L175,330 L178,355 L175,380 L174,400 L172,420 L165,440 L155,460 L140,462 L125,460 L112,452 L105,435 L100,415 L98,395 L98,370 L98,345 L100,320Z",
  CO:"M285,320 L310,319 L335,319 L360,320 L370,320 L370,340 L370,360 L370,380 L370,390 L345,390 L320,390 L295,390 L285,390 L285,370 L285,350 L285,335Z",
  CT:"M808,220 L818,217 L828,215 L835,215 L838,222 L840,230 L840,235 L832,238 L822,240 L818,242 L812,236 L810,228Z",
  DE:"M775,293 L780,290 L785,290 L788,295 L790,305 L790,310 L786,315 L780,315 L778,310 L776,302Z",
  FL:"M638,530 L650,525 L665,518 L680,512 L695,510 L710,515 L720,525 L722,535 L718,548 L712,562 L708,575 L700,585 L690,592 L680,598 L668,595 L658,585 L650,572 L643,558 L638,545Z",
  GA:"M645,450 L658,445 L672,442 L688,440 L700,442 L708,455 L712,470 L710,488 L708,500 L700,512 L692,520 L680,522 L665,524 L652,520 L645,510 L642,495 L642,478 L643,462Z",
  ID:"M200,175 L210,170 L225,164 L240,160 L250,162 L258,178 L265,200 L265,220 L262,242 L258,262 L255,278 L248,284 L235,285 L222,284 L210,278 L204,262 L200,240 L198,215Z",
  IL:"M575,280 L585,278 L595,276 L608,275 L615,278 L618,295 L618,315 L618,335 L615,355 L610,372 L608,382 L600,388 L590,390 L582,385 L578,370 L576,350 L575,330 L575,310 L575,295Z",
  IN:"M615,280 L625,279 L635,279 L645,280 L647,295 L648,315 L648,335 L648,352 L648,360 L640,363 L630,365 L620,365 L618,355 L616,340 L615,320 L615,300Z",
  IA:"M498,250 L515,248 L535,246 L555,245 L570,245 L574,258 L575,275 L575,290 L575,305 L572,312 L555,314 L535,315 L515,315 L505,315 L502,305 L500,288 L498,270Z",
  KS:"M390,358 L415,356 L440,355 L465,355 L490,355 L490,370 L490,385 L490,400 L490,410 L465,412 L440,413 L415,414 L390,415 L390,400 L390,385 L390,370Z",
  KY:"M615,370 L635,367 L655,364 L675,362 L695,360 L700,362 L704,372 L705,385 L705,395 L705,400 L690,402 L670,404 L650,405 L630,405 L620,405 L617,395 L615,385Z",
  LA:"M545,510 L558,508 L572,506 L585,505 L595,508 L600,518 L602,530 L600,540 L595,548 L588,555 L578,560 L568,558 L558,552 L550,545 L545,535 L544,522Z",
  ME:"M825,115 L832,110 L840,104 L848,100 L855,102 L858,118 L860,138 L860,155 L858,168 L852,178 L845,185 L838,182 L832,172 L828,158 L826,140Z",
  MD:"M730,300 L742,296 L755,292 L768,290 L780,290 L786,298 L790,310 L790,318 L786,322 L775,325 L762,326 L750,325 L740,322 L734,316 L730,308Z",
  MA:"M812,200 L822,198 L832,196 L842,195 L850,196 L854,202 L855,208 L852,212 L845,215 L835,218 L825,218 L818,215 L814,208Z",
  MI:"M590,172 L600,168 L612,164 L625,161 L638,160 L648,168 L655,185 L660,205 L660,225 L656,245 L650,260 L645,270 L635,274 L622,275 L610,274 L602,268 L598,255 L596,240 L594,220 L592,200Z",
  MN:"M470,132 L482,130 L498,128 L515,126 L530,125 L540,126 L544,145 L545,170 L545,195 L545,215 L545,230 L532,232 L515,234 L498,235 L480,235 L475,232 L473,215 L472,195 L470,170 L470,150Z",
  MS:"M575,460 L585,458 L595,456 L605,455 L612,458 L615,472 L615,490 L615,508 L615,520 L612,525 L602,528 L592,530 L582,528 L575,522 L575,505 L575,488 L575,472Z",
  MO:"M505,350 L520,348 L540,346 L560,345 L575,345 L580,358 L582,375 L582,395 L582,410 L580,420 L570,428 L555,435 L540,440 L525,438 L512,432 L505,425 L505,410 L505,390 L505,370Z",
  MT:"M230,110 L258,108 L288,106 L318,105 L348,105 L355,115 L355,135 L355,155 L355,175 L355,185 L340,187 L310,188 L280,189 L250,190 L235,190 L232,175 L230,155 L230,135Z",
  NE:"M370,282 L395,280 L425,278 L455,276 L480,275 L484,288 L485,305 L485,322 L485,338 L484,342 L460,343 L435,344 L410,345 L385,345 L375,345 L373,332 L372,315 L370,298Z",
  NV:"M165,268 L175,262 L190,258 L205,256 L220,255 L225,275 L228,300 L230,330 L230,355 L230,370 L222,388 L210,405 L198,418 L185,420 L175,410 L168,392 L165,370 L165,345 L165,318 L165,292Z",
  NH:"M820,142 L826,139 L832,136 L838,135 L840,138 L842,155 L842,172 L842,188 L842,195 L838,198 L832,200 L826,198 L822,192 L822,175 L820,158Z",
  NJ:"M785,252 L790,248 L796,246 L800,245 L804,252 L805,265 L805,278 L805,288 L802,294 L798,298 L792,300 L788,298 L785,290 L785,275 L785,262Z",
  NM:"M265,410 L285,408 L305,406 L325,405 L340,405 L344,425 L345,450 L345,475 L345,495 L345,500 L325,502 L305,504 L285,505 L270,505 L268,485 L266,460 L265,435Z",
  NY:"M715,175 L730,172 L748,168 L768,162 L790,158 L808,155 L815,162 L820,178 L820,198 L820,215 L816,222 L805,232 L792,240 L780,245 L765,248 L748,250 L735,250 L725,245 L718,232 L715,215 L715,198Z",
  NC:"M660,390 L680,386 L700,382 L720,378 L740,374 L758,372 L770,372 L778,380 L780,392 L778,400 L770,408 L755,415 L738,420 L720,424 L700,426 L680,428 L665,430 L660,425 L660,412Z",
  ND:"M375,120 L398,118 L420,116 L442,115 L465,115 L468,130 L470,150 L470,170 L470,185 L468,190 L445,192 L420,193 L398,194 L380,195 L378,180 L376,162 L375,142Z",
  OH:"M648,272 L660,270 L675,267 L690,265 L705,265 L712,275 L715,292 L715,310 L715,328 L715,340 L708,346 L695,350 L680,352 L665,350 L655,346 L650,335 L648,318 L648,300Z",
  OK:"M380,418 L400,416 L425,413 L450,412 L475,410 L490,412 L498,425 L500,440 L500,450 L496,460 L490,468 L478,472 L460,475 L440,476 L420,475 L405,474 L395,468 L388,458 L385,445 L382,432Z",
  OR:"M115,165 L132,162 L152,158 L175,154 L195,151 L205,152 L210,168 L210,190 L210,210 L210,228 L205,232 L185,236 L162,238 L142,240 L130,238 L120,228 L115,212 L115,195Z",
  PA:"M715,240 L730,238 L748,235 L765,232 L782,231 L790,232 L794,242 L795,258 L795,272 L795,280 L788,284 L772,287 L755,289 L738,290 L725,290 L720,286 L718,272 L716,258Z",
  RI:"M835,215 L840,213 L845,212 L850,213 L852,218 L852,224 L852,228 L848,230 L842,231 L838,230 L836,225Z",
  SC:"M675,432 L688,428 L702,424 L718,420 L730,422 L738,432 L740,445 L738,458 L732,465 L720,468 L708,470 L695,468 L685,462 L678,453 L675,442Z",
  SD:"M375,195 L398,194 L420,192 L442,191 L465,190 L470,205 L472,225 L475,248 L475,265 L475,270 L455,272 L432,273 L410,274 L388,275 L380,275 L378,260 L376,240 L375,218Z",
  TN:"M600,400 L620,398 L645,395 L670,393 L695,391 L710,390 L714,398 L715,410 L715,420 L714,425 L695,427 L670,430 L645,432 L620,434 L608,435 L604,428 L602,418 L600,408Z",
  TX:"M335,442 L358,440 L385,436 L415,432 L445,430 L475,430 L490,432 L500,445 L508,465 L510,490 L510,515 L508,530 L500,548 L492,565 L480,578 L465,590 L448,598 L430,600 L412,595 L395,585 L378,572 L362,558 L350,542 L340,525 L335,508 L332,490 L332,470 L334,455Z",
  UT:"M230,272 L245,269 L262,266 L278,265 L290,265 L292,285 L294,310 L295,338 L295,362 L295,378 L292,382 L275,384 L258,385 L242,385 L235,382 L232,365 L230,340 L230,315 L230,292Z",
  VT:"M800,132 L806,129 L812,127 L818,125 L820,128 L822,148 L822,168 L822,182 L822,188 L818,190 L812,190 L806,188 L802,182 L802,165 L800,148Z",
  VA:"M670,335 L690,332 L712,326 L735,320 L755,316 L770,315 L778,325 L780,340 L780,355 L778,365 L770,374 L755,380 L738,384 L720,386 L700,388 L682,390 L670,388 L668,375 L668,358 L670,345Z",
  WA:"M120,95 L140,92 L160,89 L180,87 L200,85 L210,88 L214,105 L215,125 L215,145 L215,158 L210,162 L190,164 L168,165 L148,165 L135,162 L125,155 L120,140 L120,120Z",
  WV:"M690,312 L698,310 L708,307 L720,305 L730,306 L735,315 L738,328 L740,342 L740,355 L738,362 L732,368 L724,370 L715,370 L708,365 L702,355 L698,342 L694,330 L690,320Z",
  WI:"M525,142 L538,140 L552,137 L568,135 L582,135 L590,138 L596,155 L600,178 L600,205 L600,228 L600,240 L592,244 L578,245 L562,245 L548,245 L538,242 L530,232 L526,215 L525,195 L525,170Z",
  WY:"M270,202 L292,200 L318,198 L345,196 L362,195 L368,205 L370,225 L370,248 L370,268 L370,280 L355,282 L330,283 L305,284 L282,285 L275,284 L272,268 L270,245 L270,222Z"
};
const SL = {AL:{x:621,y:495},AZ:{x:232,y:457},AR:{x:568,y:475},CA:{x:138,y:375},CO:{x:328,y:355},CT:{x:825,y:228},DE:{x:783,y:302},FL:{x:678,y:555},GA:{x:675,y:482},ID:{x:232,y:225},IL:{x:595,y:332},IN:{x:632,y:322},IA:{x:536,y:280},KS:{x:440,y:385},KY:{x:660,y:385},LA:{x:572,y:530},ME:{x:843,y:142},MD:{x:760,y:308},MA:{x:835,y:207},MI:{x:625,y:215},MN:{x:508,y:180},MS:{x:595,y:492},MO:{x:542,y:388},MT:{x:292,y:147},NE:{x:428,y:310},NV:{x:198,y:340},NH:{x:831,y:168},NJ:{x:795,y:272},NM:{x:305,y:455},NY:{x:765,y:202},NC:{x:720,y:400},ND:{x:422,y:155},OH:{x:682,y:308},OK:{x:440,y:445},OR:{x:163,y:197},PA:{x:755,y:260},RI:{x:845,y:220},SC:{x:708,y:448},SD:{x:425,y:233},TN:{x:656,y:415},TX:{x:420,y:515},UT:{x:262,y:325},VT:{x:812,y:158},VA:{x:725,y:355},WA:{x:168,y:125},WV:{x:715,y:340},WI:{x:562,y:190},WY:{x:320,y:242}};

const ELEC = {AL:7.8,AZ:8.2,AR:7.1,CA:17.5,CO:8.9,CT:18.2,DE:10.1,FL:9.4,GA:7.3,ID:6.5,IL:8.6,IN:8.2,IA:7.4,KS:8.8,KY:6.8,LA:6.2,ME:14.1,MD:10.8,MA:19.8,MI:9.5,MN:9.1,MS:7.0,MO:7.9,MT:7.2,NE:8.0,NV:7.8,NH:16.5,NJ:12.4,NM:7.6,NY:14.8,NC:7.5,ND:7.1,OH:7.9,OK:6.4,OR:7.0,PA:8.5,RI:18.9,SC:6.9,SD:8.5,TN:7.6,TX:7.2,UT:7.1,VT:13.2,VA:7.8,WA:5.8,WV:7.2,WI:9.3,WY:6.9};

// Data parsing & scaling utilities
const parseMW = (s) => { const m = s.match(/([\d.]+)\s*(GW|MW)/i); if (!m) return 500; return parseFloat(m[1]) * (m[2].toUpperCase() === 'GW' ? 1000 : 1); };
const parseInvestment = (s) => { const m = s.match(/\$([\d.]+)B/i); return m ? parseFloat(m[1]) : 10; };
const capacityRadius = (mw) => 4 + (Math.sqrt(mw) - Math.sqrt(150)) / (Math.sqrt(5000) - Math.sqrt(150)) * 10;
const investStroke = (b) => 0.8 + (Math.sqrt(b) - Math.sqrt(2)) / (Math.sqrt(100) - Math.sqrt(2)) * 3.2;

// Anchor dots to known state label positions + geo offset within state
const STATE_CENTERS = {TX:[31,-99],LA:[31,-92],NM:[34.5,-106],OH:[40.5,-82.5],WI:[44,-89.5],IN:[40,-86],GA:[33,-83.5],NC:[35.5,-80],PA:[41,-77.5],NY:[43,-75.5],TN:[35.5,-86]};
const geoSvg = (lat,lng,state) => {
  const sl = SL[state]; if(!sl) return {x:400,y:300};
  const sc = STATE_CENTERS[state]; if(!sc) return sl;
  return { x: sl.x + (lng - sc[1]) * 9, y: sl.y - (lat - sc[0]) * 13 };
};
const elecCol = r => r<=6.5?"#0d9488":r<=7.5?"#2dd4bf":r<=8.5?"#86efac":r<=10?"#fde68a":r<=13?"#fb923c":r<=17?"#ef4444":"#991b1b";
const statCol = s => s==="Operational"?"#10b981":s==="Under Construction"?"#f59e0b":s==="Announced"?"#6366f1":s==="Planned"?"#94a3b8":"#64748b";
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
            {["all","Operational","Under Construction","Announced","Planned"].map(s=>(
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
              const mw=parseMW(p.capacity); const inv=parseInvestment(p.investment);
              const baseR=capacityRadius(mw); const r=isSel?baseR+3:baseR;
              const iRing=investStroke(inv); const labelY=pos.y-(r+10+6);
              return <g key={p.id} style={{cursor:"pointer"}} onClick={()=>{setSel(isSel?null:p.id);setSelCompany(null);setCompanyView(false)}}>
                <circle cx={pos.x} cy={pos.y} r={r+10} fill={c} opacity={.08}/>
                <circle cx={pos.x} cy={pos.y} r={r+6} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={iRing}/>
                <circle cx={pos.x} cy={pos.y} r={r+4} fill={c} opacity={.15}/>
                <circle cx={pos.x} cy={pos.y} r={r} fill={c} stroke={isSel?"#fff":c} strokeWidth={isSel?2.5:1.5} opacity={.9}/>
                {isSel && <>
                  <rect x={pos.x-60} y={labelY} width={120} height={18} rx={4} fill="#0a0e17ee" stroke={c} strokeWidth={0.5}/>
                  <text x={pos.x} y={labelY+11} textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="700" fontFamily={F}>{p.name.substring(0,22)}</text>
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
              {["Operational","Under Construction","Announced","Planned"].map(s=>
                <span key={s} style={{display:"flex",alignItems:"center",gap:3}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:statCol(s)}}/>
                  <span style={{fontSize:8,color:"#64748b"}}>{s}</span>
                </span>
              )}
            </div>
            {/* Capacity & Investment legend */}
            <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(10,14,23,0.85)",padding:"4px 10px",borderRadius:6,border:"1px solid #1e293b"}}>
              <span style={{fontSize:9,color:"#475569"}}>Size:</span>
              {[["150 MW",capacityRadius(150)],["1 GW",capacityRadius(1000)],["5 GW",capacityRadius(5000)]].map(([label,r])=>
                <span key={label} style={{display:"flex",alignItems:"center",gap:3}}>
                  <svg width={r*2+2} height={r*2+2}><circle cx={r+1} cy={r+1} r={r} fill="#6366f1" opacity={0.7}/></svg>
                  <span style={{fontSize:8,color:"#64748b"}}>{label}</span>
                </span>
              )}
              <span style={{fontSize:9,color:"#475569",marginLeft:4}}>Ring:</span>
              {[["$2B",0.8],["$100B",4]].map(([label,sw])=>
                <span key={label} style={{display:"flex",alignItems:"center",gap:3}}>
                  <svg width={22} height={22}><circle cx={11} cy={11} r={8} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={sw}/><circle cx={11} cy={11} r={5} fill="#6366f1" opacity={0.7}/></svg>
                  <span style={{fontSize:8,color:"#64748b"}}>{label}</span>
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
