import { useState, useMemo } from "react";
import { STATES_GEO } from "./states-geo-data";
import { COMPANIES, PROJECTS } from "./dc-data";

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
                        <div style={{fontSize:9,color:"#475569"}}>{typeof co.pe_fwd==="number"?co.pe_fwd+"x fwd":"N/M"}</div>
                      </div>
                    </div>

                    <div style={{margin:"8px 0 0",padding:"6px 8px",background:"rgba(15,23,42,0.5)",borderRadius:6,border:"1px solid #111827"}}>
                      <div style={{fontSize:9,color:"#818cf8",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{c.role}</div>
                      <div style={{fontSize:10,color:"#94a3b8"}}>{c.detail}</div>
                    </div>

                    {isSel && (
                      <div style={{marginTop:8,animation:"fadeIn .2s ease"}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                          {[["Mkt Cap",typeof co.mcap==="number"?`$${co.mcap}B`:co.mcap],["FY26E Rev",typeof co.fy26e_rev==="number"?`$${co.fy26e_rev}B`:co.fy26e_rev],["Growth",typeof co.fy26e_growth==="number"?`${co.fy26e_growth>=0?"+":""}${co.fy26e_growth}%`:co.fy26e_growth],["FY26E EPS",typeof co.fy26e_eps==="number"?`$${co.fy26e_eps}`:co.fy26e_eps],["OPM",typeof co.op_margin==="number"?`${co.op_margin}%`:co.op_margin],["DC %Rev",typeof co.dc_pct==="number"?`${co.dc_pct}%`:co.dc_pct],["LC Growth",co.lc_growth],["Backlog",co.backlog],["Fwd P/E",typeof co.pe_fwd==="number"?`${co.pe_fwd}x`:"N/M"]].map(([k,v])=>(
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
                    <span>${co.price} · {typeof co.pe_fwd==="number"?co.pe_fwd+"x fwd":"N/M"} · {typeof co.mcap==="number"?`$${co.mcap}B mcap`:co.mcap}</span>
                  </div>
                  {isSel && (
                    <div style={{marginTop:8}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:8}}>
                        {[["FY26E Rev",typeof co.fy26e_rev==="number"?`$${co.fy26e_rev}B`:co.fy26e_rev],["Growth",typeof co.fy26e_growth==="number"?`${co.fy26e_growth>=0?"+":""}${co.fy26e_growth}%`:co.fy26e_growth],["OPM",typeof co.op_margin==="number"?`${co.op_margin}%`:co.op_margin],["DC %Rev",typeof co.dc_pct==="number"?`${co.dc_pct}%`:co.dc_pct],["LC Growth",co.lc_growth],["Backlog",co.backlog]].map(([k,v])=>(
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
