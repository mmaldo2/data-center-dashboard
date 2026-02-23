// ═══════════════════════════════════════════════════════════════════════
//  PUBLIC COMPANIES (financial data from Q4 2025 / Q3 FY2026 earnings)
// ═══════════════════════════════════════════════════════════════════════
export const COMPANIES = {
  VRT: { ticker:"VRT", name:"Vertiv Holdings", price:240.60, mcap:92.9, pe_fwd:40.0, fy26e_rev:13.5, fy26e_eps:6.02, fy26e_growth:28, op_margin:22.5, dc_pct:75, lc_growth:"+100%", backlog:"$15B", color:"#818cf8", role:"Power & Cooling Infrastructure", summary:"Pure-play DC infrastructure leader. NVIDIA co-dev partner for GB200 reference architectures. $15B backlog, 2.9x book-to-bill. Liquid cooling rev 2x YoY." },
  MOD: { ticker:"MOD", name:"Modine Manufacturing", price:199.48, mcap:10.4, pe_fwd:44.3, fy26e_rev:3.15, fy26e_eps:4.50, fy26e_growth:22, op_margin:14.9, dc_pct:35, lc_growth:"+78%", backlog:"Record", color:"#34d399", role:"Chillers & Climate Solutions", summary:"DC revenue +78% YoY. Spinning off PT segment to become pure-play climate. $2B DC rev target by FY28. Commissioning new chiller lines in MO, MS, TX." },
  ETN: { ticker:"ETN", name:"Eaton Corporation", price:347.00, mcap:137.8, pe_fwd:26.2, fy26e_rev:27.0, fy26e_eps:13.25, fy26e_growth:8, op_margin:24.0, dc_pct:18, lc_growth:"+200%", backlog:"$15.3B", color:"#f59e0b", role:"Power Management + Liquid Cooling", summary:"DC orders +200% YoY. Boyd Thermal acquisition ($9.5B, closing Q2 '26) adds $1.5B liquid cooling. Chip-to-grid solution. Mobility spin-off planned." },
  NVT: { ticker:"NVT", name:"nVent Electric", price:116.05, mcap:19.2, pe_fwd:36.5, fy26e_rev:4.36, fy26e_eps:3.18, fy26e_growth:12, op_margin:22.0, dc_pct:30, lc_growth:"+50%", backlog:"Growing", color:"#06b6d4", role:"Enclosures & Thermal Management", summary:"Siemens collaboration on hyperscale cooling+power architectures. Modular LC platform launch. ~30% DC exposure, highest among diversified players." },
  SMCI: { ticker:"SMCI", name:"Super Micro Computer", price:33.39, mcap:20.0, pe_fwd:11.9, fy26e_rev:40.0, fy26e_eps:2.80, fy26e_growth:70, op_margin:5.8, dc_pct:95, lc_growth:"+110%", backlog:"Expanding", color:"#f472b6", role:"AI Servers with Integrated DLC", summary:"DLC servers are the product — 98% heat capture. Raised FY26 rev guidance to $40B+. Blackwell 4U/2-OU liquid-cooled systems. Fastest to market." },
  SBGSY: { ticker:"SBGSY", name:"Schneider Electric", price:265.0, mcap:155.0, pe_fwd:30.0, fy26e_rev:40.0, fy26e_eps:8.80, fy26e_growth:10, op_margin:18.5, dc_pct:22, lc_growth:"+60%", backlog:"Strong", color:"#a78bfa", role:"End-to-End DC Infrastructure", summary:"Acquired Motivair for liquid cooling portfolio. Full-stack DC infrastructure: power, cooling, software. Galaxy UPS line for hyperscale." },
  NVDA: { ticker:"NVDA", name:"NVIDIA", price:131.0, mcap:3220.0, pe_fwd:28.5, fy26e_rev:200.0, fy26e_eps:4.60, fy26e_growth:55, op_margin:62.0, dc_pct:88, lc_growth:"N/A", backlog:"$30B+", color:"#76b900", role:"GPUs / AI Accelerators", summary:"GB200 NVL72 platform driving liquid cooling demand. 700W/chip thermal load. DC revenue $35.6B Q4 (+93% YoY). Rubin platform 2027." },
  ORCL: { ticker:"ORCL", name:"Oracle", price:172.0, mcap:480.0, pe_fwd:25.0, fy26e_rev:66.0, fy26e_eps:6.90, fy26e_growth:15, op_margin:30.0, dc_pct:35, lc_growth:"N/A", backlog:"$130B RPO", color:"#f43f5e", role:"Cloud Infrastructure / DC Developer", summary:"Building Stargate campuses. $300B+ OpenAI deal over 5 years. Purchasing 400K GB200 chips for Abilene. $130B remaining performance obligations." },
  AMZN: { ticker:"AMZN", name:"Amazon/AWS", price:225.0, mcap:2380.0, pe_fwd:32.0, fy26e_rev:700.0, fy26e_eps:7.00, fy26e_growth:12, op_margin:11.0, dc_pct:18, lc_growth:"N/A", backlog:"Large", color:"#ff9900", role:"Hyperscaler / DC Operator", summary:"Project Rainier for Anthropic ($11B). AWS Generative AI Innovation Center. $100B+ in DC expansion. Trainium 2 custom chips." },
  META: { ticker:"META", name:"Meta Platforms", price:700.0, mcap:1780.0, pe_fwd:24.0, fy26e_rev:195.0, fy26e_eps:29.0, fy26e_growth:16, op_margin:35.0, dc_pct:12, lc_growth:"N/A", backlog:"$65B capex guide", color:"#0668E1", role:"Hyperscaler / DC Operator", summary:"Prometheus (1 GW, OH), Hyperion (5 GW, LA). $65B capex guidance 2025. Entering electricity trading. 30th DC broke ground in WI." },
  MSFT: { ticker:"MSFT", name:"Microsoft", price:412.0, mcap:3060.0, pe_fwd:30.0, fy26e_rev:280.0, fy26e_eps:13.70, fy26e_growth:14, op_margin:44.0, dc_pct:15, lc_growth:"N/A", backlog:"$298B RPO", color:"#00a4ef", role:"Hyperscaler / DC Operator", summary:"131 DCs operational, 111 under construction. AI Superfactory in Atlanta. $20B PA investment. Sidekick liquid cooling for Azure Maia chips." },
};

// ═══════════════════════════════════════════════════════════════════════
//  DATA CENTER PROJECTS with linked companies
// ═══════════════════════════════════════════════════════════════════════
export const PROJECTS = [
  { id:1, name:"Stargate I — Abilene", state:"TX", lat:32.45, lng:-99.73, capacity:"1.2 GW", investment:"$100B+", status:"Under Construction", year:2026, type:"AI Training", operator:"OpenAI", elecRate:7.2,
    companies: [
      { ticker:"ORCL", role:"DC Developer & Cloud Provider", detail:"Building campus, purchasing 400K GB200 chips, $300B+ 5yr deal" },
      { ticker:"NVDA", role:"GPU Supplier", detail:"GB200 NVL72 platform, 700W/chip requiring liquid cooling" },
      { ticker:"VRT", role:"Power & Cooling Infrastructure", detail:"NVIDIA co-dev partner, 360AI platform, CDUs and liquid cooling" },
      { ticker:"SMCI", role:"AI Server Systems", detail:"Blackwell-ready DLC server racks, 98% heat capture" },
      { ticker:"ETN", role:"Power Distribution", detail:"UPS, switchgear, busbar. Boyd acquisition adds liquid cooling" },
    ]},
  { id:2, name:"Stargate — New Mexico", state:"NM", lat:35.08, lng:-106.65, capacity:"800 MW", investment:"$40B", status:"Announced", year:2027, type:"AI Training", operator:"OpenAI/Oracle", elecRate:7.6,
    companies: [
      { ticker:"ORCL", role:"DC Developer", detail:"Oracle-built campus as part of 4.5 GW expansion" },
      { ticker:"NVDA", role:"GPU Supplier", detail:"Next-gen GPU deployment for training workloads" },
      { ticker:"VRT", role:"Thermal & Power", detail:"Expected to supply reference architecture cooling" },
      { ticker:"SBGSY", role:"Electrical Infrastructure", detail:"Galaxy UPS, power distribution for hyperscale" },
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
      { ticker:"SBGSY", role:"Power Distribution", detail:"Schneider Galaxy UPS, busway, BMS software" },
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
      { ticker:"SBGSY", role:"Building Management", detail:"EcoStruxure BMS, power monitoring" },
      { ticker:"MOD", role:"Large-Scale Chillers", detail:"Modular chiller systems for phased build-out" },
    ]},
  { id:10, name:"Amazon Richmond County", state:"NC", lat:34.97, lng:-79.89, capacity:"500 MW", investment:"$10B", status:"Under Construction", year:2027, type:"Cloud/AI", operator:"Amazon/AWS", elecRate:7.5,
    companies: [
      { ticker:"AMZN", role:"Developer & Operator", detail:"20 buildings at full build-out, near Duke Energy 2.24GW plant" },
      { ticker:"VRT", role:"Cooling & Power", detail:"Thermal management for 200K+ sqft buildings" },
      { ticker:"SBGSY", role:"Power Distribution", detail:"Medium-voltage switchgear and UPS systems" },
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
      { ticker:"SBGSY", role:"Electrical Infrastructure", detail:"Medium/high voltage distribution" },
      { ticker:"MOD", role:"Industrial Cooling", detail:"Large-scale chiller systems for phased build" },
      { ticker:"NVT", role:"Protection Solutions", detail:"Enclosures and thermal management" },
    ]},
];

// ═══════════════════════════════════════════════════════════════════════
//  Development-time referential integrity check
// ═══════════════════════════════════════════════════════════════════════
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  PROJECTS.forEach(p => {
    p.companies.forEach(c => {
      if (!COMPANIES[c.ticker]) {
        console.error(`[dc-data] Project "${p.name}" (id:${p.id}) references unknown ticker "${c.ticker}"`);
      }
    });
  });
}
