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
  // ── New vendors & hyperscalers (Feb 2026) ──────────────────────────
  ANET: { ticker:"ANET", name:"Arista Networks", price:132.79, mcap:178.3, pe_fwd:43.0, fy26e_rev:11.25, fy26e_eps:3.41, fy26e_growth:25, op_margin:46.0, dc_pct:70, lc_growth:"N/A", backlog:"N/A", color:"#e06666", role:"DC Networking Switches", summary:"Dominant in 400G/800G Ethernet for AI clusters. 2026 revenue guidance raised to 25% growth (~$11.25B), with $3.25B AI data center networking target. Operating margins ~46%, best-in-class among networking peers." },
  AVGO: { ticker:"AVGO", name:"Broadcom", price:332.65, mcap:1570.0, pe_fwd:32.9, fy26e_rev:81.0, fy26e_eps:9.39, fy26e_growth:27, op_margin:66.0, dc_pct:55, lc_growth:"N/A", backlog:"$73B AI backlog", color:"#b91c1c", role:"Custom AI Chips & Networking ASICs", summary:"AI semiconductor revenue doubling YoY to $8.2B/quarter. $73B AI backlog across custom XPUs and Ethernet switches for hyperscalers. Non-GAAP operating margin 66%, with VMware software providing durable recurring revenue base." },
  PWR: { ticker:"PWR", name:"Quanta Services", price:436.00, mcap:61.6, pe_fwd:33.2, fy26e_rev:33.5, fy26e_eps:13.00, fy26e_growth:18, op_margin:8.5, dc_pct:10, lc_growth:"N/A", backlog:"$44B", color:"#e69138", role:"Electrical Construction & Grid Infrastructure", summary:"Largest US electrical contractor building transmission lines and substations feeding data centers. $44B total backlog with DC as fastest-growing segment. Key beneficiary of grid buildout required for multi-GW AI campuses." },
  GLW: { ticker:"GLW", name:"Corning", price:139.51, mcap:114.5, pe_fwd:31.5, fy26e_rev:18.7, fy26e_eps:3.08, fy26e_growth:20, op_margin:20.0, dc_pct:40, lc_growth:"N/A", backlog:"$6B Meta deal", color:"#f1c232", role:"Fiber Optic Cable & Connectivity", summary:"$6B Meta fiber-optic supply deal through 2030 anchors DC growth. Optical Communications segment grew 35% to $6.3B in 2025, with enterprise/DC sales up 61%. Springboard plan targets $4B+ in incremental annualized sales by end of 2026." },
  FIX: { ticker:"FIX", name:"Comfort Systems USA", price:1462.00, mcap:51.6, pe_fwd:41.5, fy26e_rev:10.6, fy26e_eps:35.20, fy26e_growth:16, op_margin:14.4, dc_pct:45, lc_growth:"N/A", backlog:"$11.9B", color:"#c27ba0", role:"HVAC & Mechanical Contractor", summary:"Data center HVAC now 45% of revenue, up from 33% a year ago. Record $11.9B backlog doubled YoY. Q4 2025 EPS of $9.37 crushed estimates by 39%. Industrial supercycle in DC mechanical/electrical construction driving multi-year visibility." },
  GEV: { ticker:"GEV", name:"GE Vernova", price:829.85, mcap:223.8, pe_fwd:48.4, fy26e_rev:44.5, fy26e_eps:13.95, fy26e_growth:12, op_margin:11.0, dc_pct:15, lc_growth:"N/A", backlog:"$59.3B orders", color:"#674ea7", role:"Gas Turbines & Grid Solutions", summary:"Provides 25% of world's power; critical enabler of behind-the-meter gas generation for data centers. Q4 2025 orders surged 65% YoY to $22.2B. 2026 revenue guided $44-45B with EBITDA margins of 11-13%." },
  CEG: { ticker:"CEG", name:"Constellation Energy", price:294.84, mcap:104.5, pe_fwd:30.7, fy26e_rev:24.4, fy26e_eps:9.34, fy26e_growth:8, op_margin:16.3, dc_pct:20, lc_growth:"N/A", backlog:"Long-term PPAs", color:"#3c78d8", role:"Nuclear Power PPAs for DCs", summary:"Largest US nuclear fleet operator, signing long-term carbon-free PPAs with hyperscalers. Calpine acquisition (~$16.4B) adds natural gas capacity. Microsoft TMI restart deal established the template for nuclear-powered data centers." },
  CIEN: { ticker:"CIEN", name:"Ciena", price:334.95, mcap:47.4, pe_fwd:50.8, fy26e_rev:5.9, fy26e_eps:5.25, fy26e_growth:24, op_margin:17.0, dc_pct:42, lc_growth:"N/A", backlog:"$5B", color:"#45818e", role:"Optical Networking & DCI", summary:"Data center interconnect demand surging as AI clusters scale across regions. FY2026 revenue guided to $5.7-6.1B with 17% adjusted operating margin. $5B backlog provides strong visibility. Direct cloud provider revenue 42% of total, growing 49% YoY." },
  EME: { ticker:"EME", name:"EMCOR Group", price:803.55, mcap:26.0, pe_fwd:27.1, fy26e_rev:17.2, fy26e_eps:27.42, fy26e_growth:6, op_margin:9.3, dc_pct:25, lc_growth:"N/A", backlog:"$12.6B RPO", color:"#a64d79", role:"Electrical & Mechanical DC Construction", summary:"Record backlog with Network & Communications RPO at $4.3B (+100% YoY), driven by data center electrical/mechanical construction. 9.3% operating margins sustained despite project scale-up. Pure-play beneficiary of DC buildout cycle." },
  BE: { ticker:"BE", name:"Bloom Energy", price:147.51, mcap:41.5, pe_fwd:107.0, fy26e_rev:3.2, fy26e_eps:1.38, fy26e_growth:52, op_margin:11.3, dc_pct:45, lc_growth:"N/A", backlog:"$20B total", color:"#7cb342", role:"On-Site Fuel Cell Power for DCs", summary:"Product backlog surged 140% YoY to ~$6B as hyperscalers adopt solid-oxide fuel cells for behind-the-meter DC power. 2026 revenue guided to $3.1-3.3B (+52% YoY). Solving grid interconnection bottleneck for AI campuses." },
  LUMN: { ticker:"LUMN", name:"Lumen Technologies", price:8.39, mcap:8.95, pe_fwd:"N/M", fy26e_rev:12.0, fy26e_eps:-0.26, fy26e_growth:-3, op_margin:-6.6, dc_pct:30, lc_growth:"N/A", backlog:"$13B PCF TCV", color:"#00b0f0", role:"Fiber Connectivity & Private Network Fabric", summary:"Secured ~$13B in Private Connectivity Fabric contracts with hyperscalers linking AI data centers. Turnaround play: negative margins today but $400-500M annual PCF revenue expected by 2028. Owns 500K+ route-miles of fiber critical for DC interconnection." },
  MRVL: { ticker:"MRVL", name:"Marvell Technology", price:79.98, mcap:69.2, pe_fwd:23.0, fy26e_rev:8.0, fy26e_eps:2.84, fy26e_growth:40, op_margin:36.3, dc_pct:73, lc_growth:"N/A", backlog:"18 XPU sockets", color:"#e91e63", role:"Custom AI Chips & DC Interconnect", summary:"Data center is 73% of revenue with custom silicon engagements across all four major hyperscalers. AI revenue exceeding $2.5B in FY26. 18 multigenerational custom XPU sockets provide deep competitive moat and long-term revenue visibility." },
  JCI: { ticker:"JCI", name:"Johnson Controls", price:143.79, mcap:88.0, pe_fwd:25.2, fy26e_rev:25.1, fy26e_eps:4.70, fy26e_growth:7, op_margin:13.2, dc_pct:15, lc_growth:"Growing", backlog:"$18B record", color:"#00897b", role:"DC Thermal Management & Building Controls", summary:"Record $18B backlog (+20% YoY) driven by multi-year data center and mission-critical facility projects. Acquired Alloy Enterprises to expand cooling portfolio. AI-driven HVAC optimization and chiller systems for hyperscale deployments." },
  CAT: { ticker:"CAT", name:"Caterpillar", price:774.20, mcap:323.7, pe_fwd:30.0, fy26e_rev:71.5, fy26e_eps:22.50, fy26e_growth:6, op_margin:17.2, dc_pct:15, lc_growth:"N/A", backlog:"$51B (+71% YoY)", color:"#ffab00", role:"Backup Power Generators & Gas Turbines", summary:"Power generation sales exceeded $10B in 2025 (+30% YoY), driven by AI data center demand. Record $51B backlog includes a 2 GW natural gas genset order. Dominant in large reciprocating gensets for DC backup and prime power." },
  CMI: { ticker:"CMI", name:"Cummins", price:593.28, mcap:80.5, pe_fwd:29.7, fy26e_rev:35.4, fy26e_eps:26.04, fy26e_growth:5, op_margin:11.2, dc_pct:10, lc_growth:"N/A", backlog:"Record PS backlog", color:"#d84315", role:"Backup Power Generators & Natural Gas Engines", summary:"Power Systems segment hit record $7.5B revenue with 22.7% EBITDA margin, powered by data center backup demand. 2026 power revenue guided +12-17%. Natural gas gensets increasingly preferred for DC prime power applications." },
  ABB: { ticker:"ABB", name:"ABB", price:90.51, mcap:164.2, pe_fwd:27.5, fy26e_rev:35.5, fy26e_eps:3.60, fy26e_growth:7, op_margin:18.2, dc_pct:15, lc_growth:"N/A", backlog:"$25.3B record", color:"#ff1744", role:"Power Distribution & UPS Systems", summary:"Record $25.3B backlog with data centers driving very strong double-digit order growth in Electrification segment. Full-stack DC power offering: MV/LV switchgear, transformers, UPS, and power quality. 2026 guided for 6-9% revenue growth with margin expansion." },
  AMD: { ticker:"AMD", name:"AMD", price:203.00, mcap:328.0, pe_fwd:30.6, fy26e_rev:46.8, fy26e_eps:6.64, fy26e_growth:35, op_margin:28.0, dc_pct:48, lc_growth:"N/A", backlog:"N/A", color:"#ed1c24", role:"GPUs & Server CPUs (Instinct/EPYC)", summary:"Record $16.6B DC revenue in FY2025 (+94% YoY) driven by Instinct MI300X/MI325X GPUs and EPYC server CPUs. EPYC Turin gaining hyperscaler share; MI350 launching mid-2026 to compete at NVIDIA's Blackwell tier." },
  COHR: { ticker:"COHR", name:"Coherent", price:248.00, mcap:40.7, pe_fwd:31.6, fy26e_rev:6.8, fy26e_eps:5.20, fy26e_growth:22, op_margin:20.0, dc_pct:70, lc_growth:"N/A", backlog:"Strong", color:"#00bfff", role:"Optical Transceivers (800G/1.6T)", summary:"AI datacenter backbone supplier — 800G transceivers in mass production, 1.6T ramping across multiple hyperscale customers. DC&Comms revenue $1.2B/quarter (+34% YoY). Non-GAAP op margin expanding to ~20% as mix shifts toward higher-value AI networking." },
  TSLA: { ticker:"TSLA", name:"Tesla", price:410.00, mcap:1370.0, pe_fwd:198.0, fy26e_rev:109.0, fy26e_eps:2.15, fy26e_growth:15, op_margin:7.2, dc_pct:13, lc_growth:"N/A", backlog:"Large", color:"#cc0000", role:"Battery Storage (Megapack)", summary:"Energy storage deployed 46.7 GWh in 2025 (+49% YoY), generating $12.8B revenue at 29.8% gross margin — nearly 2x auto margins. Megapack supplies DC campus backup and grid-scale storage. Sold $430M to Musk's xAI alone." },
  NEE: { ticker:"NEE", name:"NextEra Energy", price:91.50, mcap:193.0, pe_fwd:22.7, fy26e_rev:30.0, fy26e_eps:4.00, fy26e_growth:10, op_margin:29.0, dc_pct:15, lc_growth:"N/A", backlog:"6 GW DC pipeline", color:"#00a651", role:"Renewables & Nuclear Power for DCs", summary:"Largest global generator of wind and solar energy. ~6 GW DC power pipeline in backlog, targeting 15-30 GW of DC power hubs by 2035. Exploring 6 GW of new nuclear at existing sites. Front-of-meter PPAs with hyperscalers for carbon-free power." },
  OWL: { ticker:"OWL", name:"Blue Owl Capital", price:11.00, mcap:20.0, pe_fwd:15.4, fy26e_rev:3.2, fy26e_eps:0.80, fy26e_growth:13, op_margin:57.0, dc_pct:25, lc_growth:"N/A", backlog:"$34B infra capital", color:"#5c6bc0", role:"DC Infrastructure Financing", summary:"Alternative asset manager with $307B AUM. Closed $7B Digital Infrastructure Fund III (vs $4B target). Acquired IPI Partners adding 80+ global DCs and 1,000 design/build professionals. 58.5% FRE margin target for 2026." },
  GOOGL: { ticker:"GOOGL", name:"Alphabet/Google", price:315.00, mcap:3810.0, pe_fwd:27.3, fy26e_rev:455.0, fy26e_eps:11.24, fy26e_growth:13, op_margin:32.0, dc_pct:17, lc_growth:"N/A", backlog:"$175-185B capex guide", color:"#4285f4", role:"Hyperscaler / DC Operator", summary:"Google Cloud at $70B annualized run rate (+48% YoY), operating margin surging to 30.1%. Guiding $175-185B capex in 2026 (~2x 2025) for AI infrastructure and DC expansion. TPU v6 Trillium custom chips for internal and Cloud workloads." },
  CRWV: { ticker:"CRWV", name:"CoreWeave", price:88.00, mcap:46.5, pe_fwd:"N/M", fy26e_rev:12.0, fy26e_eps:-0.50, fy26e_growth:135, op_margin:-5.0, dc_pct:100, lc_growth:"N/A", backlog:"$56B contracted", color:"#7b2ff7", role:"GPU Cloud / DC Operator", summary:"Purpose-built GPU cloud with $56B contracted backlog and $50B RPO — fastest to $50B RPO in cloud history. Revenue tripling from ~$5.1B (2025) to ~$12B (2026E). 61% adjusted EBITDA margins but still GAAP-unprofitable due to massive capex." },
  VST: { ticker:"VST", name:"Vistra", price:163.00, mcap:58.0, pe_fwd:16.1, fy26e_rev:18.5, fy26e_eps:8.82, fy26e_growth:8, op_margin:21.0, dc_pct:20, lc_growth:"N/A", backlog:"20yr Comanche Peak PPA", color:"#f7931e", role:"Nuclear & Gas Power Generation", summary:"Second-largest US nuclear fleet with 6 reactors / 6.4 GW. Signed 20-year, 1.2 GW PPA from Comanche Peak nuclear to serve DC load. 2026 adj. EBITDA guided $6.8-7.6B. Aggressive $3B+ buyback program underway." },
  TLN: { ticker:"TLN", name:"Talen Energy", price:380.00, mcap:17.4, pe_fwd:20.8, fy26e_rev:3.5, fy26e_eps:20.51, fy26e_growth:50, op_margin:15.0, dc_pct:55, lc_growth:"N/A", backlog:"1.92 GW Amazon PPA", color:"#e63946", role:"Nuclear Power (Susquehanna)", summary:"Operates 90% of the 2.5 GW Susquehanna nuclear plant in PA — ground zero for DC power. Signed front-of-meter 1.92 GW PPA with Amazon through 2042 (~2x original deal). ~55% revenue now DC-linked." },
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
