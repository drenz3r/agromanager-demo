import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════
   DATE & CONSTANTE
══════════════════════════════════════════════════════════ */
const PARCELE = [
  { id: "RO-DJ-1247", cultura: "Grâu",            icon: "🌾", suprafataOficiala: 45.32, bloc: "BL-2241", judet: "Dolj", culoare: "#c9a227" },
  { id: "RO-DJ-1248", cultura: "Porumb",           icon: "🌽", suprafataOficiala: 32.68, bloc: "BL-2242", judet: "Dolj", culoare: "#d45f1a" },
  { id: "RO-DJ-1249", cultura: "Floarea Soarelui", icon: "🌻", suprafataOficiala: 28.10, bloc: "BL-2243", judet: "Dolj", culoare: "#c8b700" },
];

const TRATAMENTE_BAZA = [
  { nr:1, data:"12.03.2026", parcela:"RO-DJ-1247 · Grâu",            produs:"Funguran OH 50 WP", doza:"2.5 kg/ha", tip:"Fungicid",  operator:"Ion Popescu",   status:"valid" },
  { nr:2, data:"18.03.2026", parcela:"RO-DJ-1248 · Porumb",           produs:"Actellic 50 EC",    doza:"1.0 L/ha",  tip:"Insecticid",operator:"Ion Popescu",   status:"valid" },
  { nr:3, data:"22.03.2026", parcela:"RO-DJ-1249 · Floarea Soarelui", produs:"Roundup 360 SL",    doza:"3.0 L/ha",  tip:"Erbicid",   operator:"Maria Ionescu", status:"valid" },
];

/* Precipitații lunare simulate (l/m²) – Apr 2025 → Mar 2026 */
const PRECIPITATII = [
  { luna:"Apr '25", val:42,  sezon:"primavara" },
  { luna:"Mai '25", val:68,  sezon:"primavara" },
  { luna:"Iun '25", val:55,  sezon:"vara"      },
  { luna:"Iul '25", val:22,  sezon:"vara"      },
  { luna:"Aug '25", val:18,  sezon:"vara"      },
  { luna:"Sep '25", val:35,  sezon:"toamna"    },
  { luna:"Oct '25", val:50,  sezon:"toamna"    },
  { luna:"Nov '25", val:44,  sezon:"toamna"    },
  { luna:"Dec '25", val:38,  sezon:"iarna"     },
  { luna:"Ian '26", val:29,  sezon:"iarna"     },
  { luna:"Feb '26", val:33,  sezon:"iarna"     },
  { luna:"Mar '26", val:47,  sezon:"primavara" },
];

const CULORI_SEZON = {
  primavara: { bar:"#4caf50", light:"#e8f5e9" },
  vara:      { bar:"#ff9800", light:"#fff3e0" },
  toamna:    { bar:"#795548", light:"#efebe9" },
  iarna:     { bar:"#42a5f5", light:"#e3f2fd" },
};

/* Date financiare per cultură */
const FINANTE = [
  {
    parcela: PARCELE[0],
    costuri: { seminte: 420, motorina: 310, substante: 280, manopera: 190 },
    productieHa: 7.2,   // tone/ha
    pretTona: 950,       // RON/tonă
    culturaOpt: "Grâu panificabil cls. II",
  },
  {
    parcela: PARCELE[1],
    costuri: { seminte: 380, motorina: 290, substante: 210, manopera: 170 },
    productieHa: 9.5,
    pretTona: 780,
    culturaOpt: "Porumb siloz/boabe",
  },
  {
    parcela: PARCELE[2],
    costuri: { seminte: 340, motorina: 260, substante: 195, manopera: 160 },
    productieHa: 3.1,
    pretTona: 2100,
    culturaOpt: "Floarea Soarelui High Oleic",
  },
];

/* ══════════════════════════════════════════════════════════
   COMPONENTE REUTILIZABILE
══════════════════════════════════════════════════════════ */
function Badge({ children, variant = "green" }) {
  const v = {
    green:  { bg:"#e6f4ea", color:"#1b5e20", border:"#a5d6a7" },
    red:    { bg:"#fdecea", color:"#b71c1c", border:"#ef9a9a" },
    orange: { bg:"#fff3e0", color:"#e65100", border:"#ffcc80" },
    blue:   { bg:"#e3f2fd", color:"#0d47a1", border:"#90caf9" },
    gray:   { bg:"#f5f5f5", color:"#424242", border:"#bdbdbd" },
    teal:   { bg:"#e0f2f1", color:"#00695c", border:"#80cbc4" },
  };
  const s = v[variant] || v.gray;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"3px 10px", borderRadius:6,
      fontSize:12, fontWeight:700, letterSpacing:0.4,
      background:s.bg, color:s.color, border:`1.5px solid ${s.border}`,
    }}>{children}</span>
  );
}

function Alert({ type="error", title, children, onClose }) {
  const cfg = {
    error:   { bg:"#fdecea", border:"#c62828", icon:"🚨", titleC:"#b71c1c" },
    warning: { bg:"#fff8e1", border:"#f9a825", icon:"⚠️",  titleC:"#e65100" },
    success: { bg:"#e8f5e9", border:"#2e7d32", icon:"✅",  titleC:"#1b5e20" },
    info:    { bg:"#e3f2fd", border:"#1565c0", icon:"ℹ️",  titleC:"#0d47a1" },
  };
  const c = cfg[type];
  return (
    <div style={{
      background:c.bg, border:`2px solid ${c.border}`,
      borderLeft:`6px solid ${c.border}`,
      borderRadius:10, padding:"14px 18px",
      display:"flex", gap:12, alignItems:"flex-start",
      animation:"slideDown 0.3s ease",
    }}>
      <span style={{ fontSize:22, flexShrink:0 }}>{c.icon}</span>
      <div style={{ flex:1 }}>
        {title && <div style={{ fontWeight:800, color:c.titleC, fontSize:15, marginBottom:3 }}>{title}</div>}
        <div style={{ color:"#333", fontSize:14, lineHeight:1.5 }}>{children}</div>
      </div>
      {onClose && <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#999", padding:0 }}>✕</button>}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, badge }) {
  return (
    <div style={{ marginBottom:20, borderBottom:"2px solid #d6e8c4", paddingBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        <h2 style={{ margin:0, fontSize:20, fontWeight:900, color:"#1b3a0e", letterSpacing:-0.3 }}>{title}</h2>
        {badge && <Badge variant="blue">{badge}</Badge>}
      </div>
      {subtitle && <p style={{ margin:"6px 0 0 32px", fontSize:13, color:"#6a7a5a" }}>{subtitle}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB METEO
══════════════════════════════════════════════════════════ */
function TabMeteo() {
  const [animated, setAnimated] = useState(false);
  const maxVal = Math.max(...PRECIPITATII.map(p => p.val));
  const totalAnual = PRECIPITATII.reduce((s, p) => s + p.val, 0);
  const mediaLunara = Math.round(totalAnual / PRECIPITATII.length);
  const ultimele3 = PRECIPITATII.slice(-3).reduce((s, p) => s + p.val, 0);
  const rezervaStatus = ultimele3 >= 100 ? "optima" : "scazuta";

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const prognoza = [
    { zi:"Lun", icon:"⛅", min:6,  max:14, prec:12 },
    { zi:"Mar", icon:"🌧️", min:5,  max:11, prec:28 },
    { zi:"Mie", icon:"🌦️", min:7,  max:13, prec:18 },
    { zi:"Joi", icon:"☀️", min:8,  max:17, prec:0  },
    { zi:"Vin", icon:"☀️", min:9,  max:19, prec:0  },
    { zi:"Sam", icon:"⛅", min:7,  max:16, prec:5  },
    { zi:"Dum", icon:"🌧️", min:5,  max:12, prec:22 },
  ];

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <SectionHeader
        icon="🌦️"
        title="Meteo & Apă — Dolj · Craiova"
        subtitle="Date climatice simulate pentru zona de câmpie · Sursa: ANM · Actualizat 30.03.2026 · 07:00"
        badge="ANM · Live"
      />

      {/* KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Total 12 luni",     value:`${totalAnual} l/m²`, icon:"🌧️", color:"#1565c0", sub:"Apr 2025 – Mar 2026" },
          { label:"Medie lunară",       value:`${mediaLunara} l/m²`, icon:"📊", color:"#2d5a1b", sub:"Normală climatică" },
          { label:"Ultimele 90 zile",   value:`${ultimele3} l/m²`,   icon:"🗓️", color:"#6a1a1a", sub:"Ian-Mar 2026" },
          {
            label:"Rezervă apă în sol",
            value: rezervaStatus === "optima" ? "✅ Optimă" : "⚠️ Scăzută",
            icon: rezervaStatus === "optima" ? "💧" : "🏜️",
            color: rezervaStatus === "optima" ? "#1b5e20" : "#b71c1c",
            sub: rezervaStatus === "optima" ? "Condiții favorabile" : "Irigații recomandate",
            highlight: true,
          },
        ].map((k,i) => (
          <div key={i} style={{
            background:"#fff", borderRadius:14,
            padding:"18px 16px",
            border: k.highlight
              ? `2.5px solid ${rezervaStatus === "optima" ? "#4caf50" : "#ef5350"}`
              : "2px solid #e0ecd4",
            borderLeft:`6px solid ${k.color}`,
            boxShadow:"0 3px 12px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize:26 }}>{k.icon}</div>
            <div style={{ fontSize:22, fontWeight:900, color:k.color, marginTop:6, lineHeight:1 }}>{k.value}</div>
            <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:0.7, color:"#888", marginTop:4 }}>{k.label}</div>
            <div style={{ fontSize:12, color:"#aaa", marginTop:2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Rezervă apă alert */}
      <div style={{ marginBottom:20 }}>
        {rezervaStatus === "optima" ? (
          <Alert type="success" title="Rezervă apă în sol: OPTIMĂ — Condiții favorabile vegetației">
            Precipitațiile cumulate din ultimele 90 de zile ({ultimele3} l/m²) asigură umiditate suficientă în sol.
            Nu sunt necesare irigații în această perioadă. Cultura de grâu se află în condiții optime de vegetație.
          </Alert>
        ) : (
          <Alert type="warning" title="Rezervă apă în sol: SCĂZUTĂ — Irigații recomandate">
            Precipitațiile din ultimele 90 de zile ({ultimele3} l/m²) sunt sub pragul optim (100 l/m²).
            Se recomandă irigații pentru culturile de porumb și floarea-soarelui. Contactați sistemul de irigații Dolj-Vest.
          </Alert>
        )}
      </div>

      {/* Grafic bare precipitatii */}
      <div style={{ background:"#fff", borderRadius:16, padding:"24px 24px 16px", border:"2px solid #d6e8c4", marginBottom:20, boxShadow:"0 3px 14px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontWeight:900, fontSize:16, color:"#1b3a0e" }}>Precipitații lunare (l/m²)</div>
            <div style={{ fontSize:12, color:"#888", marginTop:2 }}>Ultimele 12 luni · Zona Dolj · Câmpie</div>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {Object.entries(CULORI_SEZON).map(([sezon, c]) => (
              <div key={sezon} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#666" }}>
                <div style={{ width:12, height:12, borderRadius:3, background:c.bar }} />
                <span style={{ textTransform:"capitalize" }}>{sezon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grafic */}
        <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:180, paddingBottom:8 }}>
          {PRECIPITATII.map((p, i) => {
            const pct = animated ? (p.val / maxVal) * 100 : 0;
            const c = CULORI_SEZON[p.sezon];
            const isLast = i === PRECIPITATII.length - 1;
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", height:"100%" }}>
                {/* valoare deasupra */}
                <div style={{ fontSize:11, fontWeight:700, color:c.bar, marginBottom:4, opacity: animated ? 1 : 0, transition:`opacity 0.4s ${i*0.05}s` }}>
                  {p.val}
                </div>
                {/* bara */}
                <div style={{ flex:1, width:"100%", display:"flex", alignItems:"flex-end" }}>
                  <div style={{
                    width:"100%",
                    height:`${pct}%`,
                    background: isLast
                      ? `repeating-linear-gradient(45deg, ${c.bar}, ${c.bar} 4px, ${c.light} 4px, ${c.light} 8px)`
                      : c.bar,
                    borderRadius:"5px 5px 0 0",
                    transition:`height 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i*0.06}s`,
                    position:"relative",
                    minHeight: animated ? 4 : 0,
                  }}>
                    {/* media line indicator */}
                    {p.val === Math.round(totalAnual / PRECIPITATII.length) && (
                      <div style={{ position:"absolute", top:-2, left:-2, right:-2, height:3, background:"#1b3a0e", borderRadius:2 }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Etichete luni */}
        <div style={{ display:"flex", gap:6, marginTop:6 }}>
          {PRECIPITATII.map((p, i) => (
            <div key={i} style={{
              flex:1, textAlign:"center", fontSize:10, color:"#888",
              fontWeight: i === PRECIPITATII.length-1 ? 800 : 500,
              color: i === PRECIPITATII.length-1 ? "#1b3a0e" : "#888",
              borderTop: i === PRECIPITATII.length-1 ? "2px solid #2d5a1b" : "none",
              paddingTop: i === PRECIPITATII.length-1 ? 3 : 0,
            }}>
              {p.luna.split(" ")[0]}
            </div>
          ))}
        </div>
        <div style={{ marginTop:8, fontSize:12, color:"#aaa", textAlign:"right" }}>
          ▨ Linie haşurată = luna curentă (în desfășurare)
        </div>
      </div>

      {/* Prognoza 7 zile */}
      <div style={{ background:"#fff", borderRadius:16, padding:20, border:"2px solid #d6e8c4", boxShadow:"0 3px 14px rgba(0,0,0,0.06)", marginBottom:20 }}>
        <div style={{ fontWeight:900, fontSize:15, color:"#1b3a0e", marginBottom:14 }}>
          📅 Prognoză 7 Zile — Craiova / Dolj
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {prognoza.map((z, i) => (
            <div key={i} style={{
              flex:1, textAlign:"center",
              padding:"12px 6px",
              background: i === 0 ? "#f0f4ec" : "#fafdf7",
              borderRadius:10,
              border: i === 0 ? "2px solid #2d5a1b" : "1.5px solid #e8f0e0",
            }}>
              <div style={{ fontSize:11, fontWeight:800, color:i===0?"#1b3a0e":"#888", textTransform:"uppercase", letterSpacing:0.5 }}>{z.zi}</div>
              <div style={{ fontSize:26, margin:"6px 0" }}>{z.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#1b3a0e" }}>{z.max}°</div>
              <div style={{ fontSize:11, color:"#aaa" }}>{z.min}°</div>
              {z.prec > 0 && (
                <div style={{ fontSize:11, color:"#1565c0", fontWeight:700, marginTop:4 }}>💧 {z.prec}mm</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Indici agro */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        {[
          { label:"Indice de ariditate (Martonne)", value:"28.4", status:"Semi-arid", color:"#e65100", icon:"🌡️" },
          { label:"Evapotranspirație potențială", value:"580 mm/an", status:"Moderată", color:"#2d5a1b", icon:"💨" },
          { label:"Zile cu îngheț (iarna)", value:"42 zile", status:"Normal", color:"#1565c0", icon:"❄️" },
        ].map((ind, i) => (
          <div key={i} style={{ background:"#fff", borderRadius:12, padding:"16px 18px", border:"1.5px solid #e0ecd4" }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{ind.icon}</div>
            <div style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:0.6, marginBottom:4 }}>{ind.label}</div>
            <div style={{ fontSize:20, fontWeight:900, color:ind.color }}>{ind.value}</div>
            <div style={{ fontSize:12, color:"#aaa", marginTop:2 }}>{ind.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB FINANTE
══════════════════════════════════════════════════════════ */
function TabFinante() {
  const [expanded, setExpanded] = useState(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const totalVenituri = FINANTE.reduce((s, f) => {
    const venHa = f.productieHa * f.pretTona;
    return s + venHa * f.parcela.suprafataOficiala;
  }, 0);

  const totalCosturi = FINANTE.reduce((s, f) => {
    const costHa = Object.values(f.costuri).reduce((a,b)=>a+b,0);
    return s + costHa * f.parcela.suprafataOficiala;
  }, 0);

  const profitTotal = totalVenituri - totalCosturi;

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <SectionHeader
        icon="💰"
        title="Finanțe Fermă — Analiză Profitabilitate 2026"
        subtitle="Costuri și venituri estimate per cultură · Prețuri CMVL Dolj · Mar 2026 · Calcul la suprafața oficială LPIS"
        badge="Estimare 2026"
      />

      {/* Sumar financiar fermă */}
      <div style={{
        background:"linear-gradient(135deg, #1b3a0e 0%, #2d5a1b 60%, #3d7224 100%)",
        borderRadius:16, padding:"22px 28px", marginBottom:24,
        boxShadow:"0 8px 28px rgba(27,58,14,0.32)", color:"#fff",
      }}>
        <div style={{ fontSize:13, opacity:0.65, textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>
          📊 Sumar Financiar — Toată Ferma · 106.10 ha
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {[
            { label:"Costuri totale estimate", value: `${Math.round(totalCosturi).toLocaleString("ro-RO")} RON`, icon:"📉", color:"#ef9a9a" },
            { label:"Venituri totale estimate", value: `${Math.round(totalVenituri).toLocaleString("ro-RO")} RON`, icon:"📈", color:"#a5d6a7" },
            {
              label:"PROFIT NET ESTIMAT",
              value: `${profitTotal >= 0 ? "+" : ""}${Math.round(profitTotal).toLocaleString("ro-RO")} RON`,
              icon: profitTotal >= 0 ? "✅" : "❌",
              color: profitTotal >= 0 ? "#69f0ae" : "#ff5252",
              big: true,
            },
          ].map((s,i) => (
            <div key={i} style={{ borderLeft: i>0 ? "1px solid rgba(255,255,255,0.15)" : "none", paddingLeft: i>0 ? 20 : 0 }}>
              <div style={{ fontSize:13, opacity:0.6 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: s.big ? 26 : 22, fontWeight:900, color:s.color, marginTop:4, letterSpacing:-0.5 }}>
                {s.value}
              </div>
              {s.big && <div style={{ fontSize:11, opacity:0.5, marginTop:2 }}>≈ {Math.round(profitTotal/106.10).toLocaleString("ro-RO")} RON/ha medie</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Carduri per cultură */}
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        {FINANTE.map((f, idx) => {
          const totalCostHa = Object.values(f.costuri).reduce((a,b)=>a+b,0);
          const venitHa = f.productieHa * f.pretTona;
          const profitHa = venitHa - totalCostHa;
          const profitTotal = profitHa * f.parcela.suprafataOficiala;
          const profitPct = Math.round((profitHa / venitHa) * 100);
          const isOpen = expanded === idx;
          const barMax = venitHa;
          const p = f.parcela;

          const costuriArr = [
            { label:"🌱 Semințe & tratam. sămânță", val: f.costuri.seminte,   color:"#66bb6a" },
            { label:"⛽ Motorină & mecanizare",      val: f.costuri.motorina,  color:"#ffa726" },
            { label:"🧪 Substanțe fitosanitare",     val: f.costuri.substante, color:"#ab47bc" },
            { label:"👷 Manoperă & recoltare",        val: f.costuri.manopera,  color:"#26c6da" },
          ];

          return (
            <div key={idx} style={{
              background:"#fff", borderRadius:16,
              border:`2px solid ${p.culoare}44`,
              borderLeft:`6px solid ${p.culoare}`,
              boxShadow:"0 4px 16px rgba(0,0,0,0.07)",
              overflow:"hidden",
            }}>
              {/* Header card */}
              <div
                onClick={() => setExpanded(isOpen ? null : idx)}
                style={{ padding:"20px 24px", cursor:"pointer", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}
              >
                <span style={{ fontSize:40 }}>{p.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <div style={{ fontSize:22, fontWeight:900, color:"#1b3a0e" }}>{p.cultura}</div>
                    <Badge variant="gray">{p.id}</Badge>
                    <span style={{ fontSize:13, color:"#888" }}>{p.suprafataOficiala} ha · {f.culturaOpt}</span>
                  </div>
                  {/* Mini progress bar costuri vs venituri */}
                  <div style={{ marginTop:10, display:"flex", gap:4, alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"#888", minWidth:70 }}>Cost/ha</span>
                    <div style={{ flex:1, height:10, background:"#f0f0f0", borderRadius:5, overflow:"hidden" }}>
                      <div style={{
                        height:"100%",
                        width: animated ? `${(totalCostHa/barMax)*100}%` : "0%",
                        background:"#ef9a9a",
                        borderRadius:5,
                        transition:`width 0.8s cubic-bezier(0.34,1.2,0.64,1) ${idx*0.15}s`,
                      }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:"#c62828", minWidth:85, textAlign:"right" }}>{totalCostHa.toLocaleString("ro-RO")} RON</span>
                  </div>
                  <div style={{ marginTop:4, display:"flex", gap:4, alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"#888", minWidth:70 }}>Venit/ha</span>
                    <div style={{ flex:1, height:10, background:"#f0f0f0", borderRadius:5, overflow:"hidden" }}>
                      <div style={{
                        height:"100%",
                        width: animated ? "100%" : "0%",
                        background:"#a5d6a7",
                        borderRadius:5,
                        transition:`width 0.8s cubic-bezier(0.34,1.2,0.64,1) ${idx*0.15+0.1}s`,
                      }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:"#1b5e20", minWidth:85, textAlign:"right" }}>{venitHa.toLocaleString("ro-RO")} RON</span>
                  </div>
                </div>

                {/* Profit indicator */}
                <div style={{
                  textAlign:"center", minWidth:140,
                  padding:"14px 18px", borderRadius:12,
                  background: profitHa >= 0 ? "#e8f5e9" : "#fdecea",
                  border: `2.5px solid ${profitHa >= 0 ? "#4caf50" : "#ef5350"}`,
                }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:0.6, marginBottom:4 }}>
                    Profit Net / ha
                  </div>
                  <div style={{ fontSize:24, fontWeight:900, color: profitHa >= 0 ? "#1b5e20" : "#b71c1c", lineHeight:1 }}>
                    {profitHa >= 0 ? "+" : ""}{Math.round(profitHa).toLocaleString("ro-RO")}
                  </div>
                  <div style={{ fontSize:12, color:"#888", marginTop:2 }}>RON/ha</div>
                  <div style={{ marginTop:6 }}>
                    <Badge variant={profitHa >= 0 ? "green" : "red"}>
                      {profitHa >= 0 ? `▲ ${profitPct}% marjă` : `▼ Pierdere`}
                    </Badge>
                  </div>
                </div>

                <div style={{ fontSize:20, color:"#ccc", transition:"transform 0.3s", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</div>
              </div>

              {/* Detalii expandate */}
              {isOpen && (
                <div style={{ borderTop:"2px solid #f0f4ec", padding:"20px 24px", animation:"fadeIn 0.25s ease" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>

                    {/* Stânga: breakdown costuri */}
                    <div>
                      <div style={{ fontWeight:800, fontSize:14, color:"#1b3a0e", marginBottom:14 }}>
                        📊 Breakdown Costuri (RON/ha)
                      </div>
                      {costuriArr.map((c, ci) => (
                        <div key={ci} style={{ marginBottom:12 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <span style={{ fontSize:13, color:"#444" }}>{c.label}</span>
                            <span style={{ fontSize:13, fontWeight:800, color:"#1b3a0e" }}>{c.val.toLocaleString("ro-RO")} RON</span>
                          </div>
                          <div style={{ height:8, background:"#f5f5f5", borderRadius:4, overflow:"hidden" }}>
                            <div style={{
                              height:"100%",
                              width:`${(c.val / totalCostHa) * 100}%`,
                              background:c.color,
                              borderRadius:4,
                              transition:"width 0.6s ease",
                            }} />
                          </div>
                          <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>
                            {Math.round((c.val / totalCostHa) * 100)}% din cost total
                          </div>
                        </div>
                      ))}
                      <div style={{
                        marginTop:14, padding:"10px 14px",
                        background:"#f0f4ec", borderRadius:8,
                        display:"flex", justifyContent:"space-between",
                      }}>
                        <span style={{ fontWeight:800, fontSize:14, color:"#1b3a0e" }}>TOTAL COSTURI/ha</span>
                        <span style={{ fontWeight:900, fontSize:16, color:"#c62828" }}>{totalCostHa.toLocaleString("ro-RO")} RON</span>
                      </div>
                      <div style={{ fontSize:12, color:"#888", marginTop:6 }}>
                        Total fermă ({p.suprafataOficiala} ha): <strong>{Math.round(totalCostHa * p.suprafataOficiala).toLocaleString("ro-RO")} RON</strong>
                      </div>
                    </div>

                    {/* Dreapta: productie & venituri */}
                    <div>
                      <div style={{ fontWeight:800, fontSize:14, color:"#1b3a0e", marginBottom:14 }}>
                        📈 Producție & Venit Estimat
                      </div>

                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                        {[
                          { label:"Producție estimată", value:`${f.productieHa} t/ha`, icon:"🌾", color:"#2d5a1b" },
                          { label:"Preț piață",          value:`${f.pretTona.toLocaleString("ro-RO")} RON/t`, icon:"💹", color:"#1565c0" },
                          { label:"Venit brut/ha",        value:`${venitHa.toLocaleString("ro-RO")} RON`, icon:"💵", color:"#1b5e20" },
                          { label:"Producție totală",    value:`${(f.productieHa * p.suprafataOficiala).toFixed(1)} tone`, icon:"🏗️", color:"#6a1a1a" },
                        ].map((r,ri) => (
                          <div key={ri} style={{ background:"#fafdf7", borderRadius:10, padding:"12px 14px", border:"1.5px solid #e0ecd4" }}>
                            <div style={{ fontSize:18 }}>{r.icon}</div>
                            <div style={{ fontSize:15, fontWeight:900, color:r.color, marginTop:4 }}>{r.value}</div>
                            <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{r.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Profit final */}
                      <div style={{
                        padding:"16px 18px", borderRadius:12,
                        background: profitHa >= 0
                          ? "linear-gradient(135deg, #e8f5e9, #f1f8e9)"
                          : "linear-gradient(135deg, #fdecea, #fce4ec)",
                        border:`2.5px solid ${profitHa >= 0 ? "#4caf50" : "#ef5350"}`,
                      }}>
                        <div style={{ fontSize:12, fontWeight:800, color:"#888", textTransform:"uppercase", letterSpacing:0.7, marginBottom:6 }}>
                          💰 Profit Net Estimat
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:8 }}>
                          <div>
                            <div style={{ fontSize:28, fontWeight:900, color: profitHa >= 0 ? "#1b5e20" : "#b71c1c", lineHeight:1 }}>
                              {profitHa >= 0 ? "+" : ""}{Math.round(profitHa).toLocaleString("ro-RO")} RON
                            </div>
                            <div style={{ fontSize:13, color:"#888", marginTop:4 }}>per hectar</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:20, fontWeight:900, color: profitTotal >= 0 ? "#1b5e20" : "#b71c1c" }}>
                              {profitTotal >= 0 ? "+" : ""}{Math.round(profitTotal).toLocaleString("ro-RO")} RON
                            </div>
                            <div style={{ fontSize:12, color:"#888" }}>total parcelă ({p.suprafataOficiala} ha)</div>
                          </div>
                        </div>
                        <div style={{ marginTop:10, fontSize:12, color:"#666", background:"rgba(255,255,255,0.6)", borderRadius:6, padding:"6px 10px" }}>
                          {profitHa >= 0
                            ? `✅ Marjă de profitabilitate: ${profitPct}% · Investiție recuperată + surplus`
                            : `❌ Pierdere estimată · Analizați reducerea costurilor sau renegocierea prețului`
                          }
                        </div>
                      </div>

                      <div style={{ marginTop:12, fontSize:12, color:"#aaa" }}>
                        ⚠️ Estimările sunt orientative. Prețuri CMVL Dolj, Mar 2026. Producția poate varia cu ±15% funcție de condițiile meteo.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grafic comparativ simplificat */}
      <div style={{ background:"#fff", borderRadius:16, padding:"22px 24px", marginTop:20, border:"2px solid #d6e8c4", boxShadow:"0 3px 14px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight:900, fontSize:15, color:"#1b3a0e", marginBottom:16 }}>
          ⚖️ Comparație Profitabilitate — RON/ha per cultură
        </div>
        <div style={{ display:"flex", gap:20, alignItems:"flex-end" }}>
          {FINANTE.map((f, i) => {
            const totalCostHa = Object.values(f.costuri).reduce((a,b)=>a+b,0);
            const venitHa = f.productieHa * f.pretTona;
            const profitHa = venitHa - totalCostHa;
            const maxBar = 4000;
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#888", textAlign:"center", marginBottom:4 }}>{f.parcela.cultura}</div>
                {/* Venit */}
                <div style={{ position:"relative", height:120 }}>
                  <div style={{ position:"absolute", bottom:0, left:0, right:0 }}>
                    <div style={{ marginBottom:2 }}>
                      <div style={{ fontSize:11, color:"#a5d6a7", textAlign:"center", marginBottom:2 }}>Venit: {venitHa.toLocaleString("ro-RO")}</div>
                      <div style={{
                        height: animated ? Math.round((venitHa/maxBar)*110) : 0,
                        background:"#a5d6a7",
                        borderRadius:"5px 5px 0 0",
                        transition:`height 0.8s cubic-bezier(0.34,1.2,0.64,1) ${i*0.15}s`,
                        position:"relative",
                      }}>
                        <div style={{
                          position:"absolute", bottom:0, left:0, right:0,
                          height: animated ? Math.round((totalCostHa/maxBar)*110) : 0,
                          background:"#ef9a9a",
                          transition:`height 0.8s cubic-bezier(0.34,1.2,0.64,1) ${i*0.15+0.1}s`,
                          borderRadius: profitHa >= 0 ? 0 : "5px 5px 0 0",
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:"center", fontSize:12, fontWeight:900, color: profitHa >= 0 ? "#1b5e20" : "#b71c1c" }}>
                  {profitHa >= 0 ? "+" : ""}{Math.round(profitHa).toLocaleString("ro-RO")} RON/ha
                </div>
                <div style={{ display:"flex", justifyContent:"center" }}>
                  <Badge variant={profitHa >= 0 ? "green" : "red"}>{profitHa >= 0 ? "Profit" : "Pierdere"}</Badge>
                </div>
                <div style={{ fontSize:10, color:"#aaa", textAlign:"center" }}>{f.parcela.suprafataOficiala} ha</div>
              </div>
            );
          })}
          {/* Legenda */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, paddingBottom:40, paddingLeft:10, borderLeft:"1.5px solid #eee" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#666" }}>
              <div style={{ width:14, height:14, background:"#a5d6a7", borderRadius:3 }} /> Venituri
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#666" }}>
              <div style={{ width:14, height:14, background:"#ef9a9a", borderRadius:3 }} /> Costuri
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPONENTA PRINCIPALĂ
══════════════════════════════════════════════════════════ */
const labelStyle = { display:"block", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:0.6, color:"#5a6a4a", marginBottom:6 };
const inputStyle = { width:"100%", padding:"12px 14px", border:"2px solid #d6e8c4", borderRadius:10, fontSize:15, fontFamily:"Georgia, serif", color:"#1a1a0e", background:"#fafdf7", boxSizing:"border-box", outline:"none", transition:"border-color 0.2s" };

export default function AgroManagerV3() {
  const [activeTab, setActiveTab]       = useState("parcele");
  const [stocMotorina, setStocMotorina] = useState(1200);

  const [ocrPhase, setOcrPhase]                   = useState("idle");
  const [facturiInregistrate, setFacturiInregistrate] = useState([]);
  const [ultimaFactura, setUltimaFactura]         = useState(null);

  const [tratamentForm, setTratamentForm]     = useState({ parcela:"", produs:"", doza:"", data:"2026-03-26" });
  const [tratamenteSalvate, setTratamenteSalvate] = useState(TRATAMENTE_BAZA);

  const [dosarPhase, setDosarPhase] = useState("idle");
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const serieFactura = "AGRO-77";
  const handleOCR = () => {
    if (facturiInregistrate.includes(serieFactura)) { setOcrPhase("duplicate"); return; }
    setOcrPhase("scanning");
    setTimeout(() => {
      setOcrPhase("done");
      setFacturiInregistrate(p => [...p, serieFactura]);
      setStocMotorina(p => p + 500);
      setUltimaFactura({ serie: serieFactura, furnizor:"AgroTotal SRL", cantitate:500, data:"25.03.2026", valoare:"3.650 RON" });
      showToast("✅ Factură AGRO-77 înregistrată. +500L motorină.");
    }, 2400);
  };

  const dozaNum = parseFloat(tratamentForm.doza);
  const dozaDepasita = !isNaN(dozaNum) && dozaNum > 3.0;
  const formValid = tratamentForm.parcela && tratamentForm.produs && tratamentForm.doza && !dozaDepasita;

  const handleSalvaTratament = () => {
    if (!formValid) return;
    setTratamenteSalvate(p => [...p, {
      nr: p.length+1,
      data: tratamentForm.data.split("-").reverse().join("."),
      parcela: tratamentForm.parcela,
      produs: tratamentForm.produs,
      doza: `${tratamentForm.doza} L/ha`,
      tip:"Manual", operator:"Ion Popescu", status:"valid",
    }]);
    setTratamentForm({ parcela:"", produs:"", doza:"", data:"2026-03-26" });
    showToast("✅ Tratament înregistrat și validat APIA.");
  };

  const tabs = [
    { key:"parcele",   label:"📍 Parcele Oficiale" },
    { key:"ocr",       label:"🧾 Facturi OCR"      },
    { key:"tratament", label:"💊 Tratamente"        },
    { key:"dosar",     label:"📁 Dosar APIA"        },
    { key:"meteo",     label:"🌦️ Meteo & Apă"      },
    { key:"finante",   label:"💰 Finanțe Fermă"     },
  ];

  return (
    <div style={{ fontFamily:"'Georgia','Palatino Linotype',serif", minHeight:"100vh", background:"#f2efe8", color:"#1a1a0e" }}>

      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999, background: toast.type==="success"?"#1b5e20":"#b71c1c", color:"#fff", padding:"14px 22px", borderRadius:12, fontSize:15, fontWeight:700, boxShadow:"0 8px 32px rgba(0,0,0,0.28)", animation:"slideDown 0.35s ease", maxWidth:360 }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:"linear-gradient(135deg,#1b3a0e 0%,#2d5a1b 55%,#3d7224 100%)", color:"#fff", padding:"0 28px", boxShadow:"0 4px 20px rgba(27,58,14,0.45)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"22px 0 0" }}>
            <div>
              <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", opacity:0.6, marginBottom:4 }}>Ministerul Agriculturii · Sistem Digital</div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:32 }}>🌿</span>
                <div>
                  <h1 style={{ margin:0, fontSize:24, fontWeight:900, letterSpacing:-0.5, lineHeight:1 }}>AgroManager România</h1>
                  <div style={{ fontSize:12, opacity:0.6, marginTop:2 }}>Platformă Integrată Management Agricol · APIA 2026 · v3.0</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end", marginBottom:6 }}>
                <div style={{ width:8, height:8, background:"#4caf50", borderRadius:"50%", animation:"pulse 2s infinite" }} />
                <span style={{ fontSize:12, opacity:0.75 }}>Conectat la IPA Online</span>
              </div>
              <div style={{ fontWeight:800, fontSize:16 }}>Ion Popescu</div>
              <div style={{ fontSize:12, opacity:0.6 }}>APIA ID: RO-23041982-DJ · Dolj</div>
            </div>
          </div>
          <div style={{ display:"flex", marginTop:18, borderTop:"1px solid rgba(255,255,255,0.12)" }}>
            {[
              { label:"Suprafață", value:"106.10 ha", icon:"🗺️" },
              { label:"Motorină", value:`${stocMotorina} L`, icon:"⛽" },
              { label:"Tratamente", value:`${tratamenteSalvate.length} înreg.`, icon:"💊" },
              { label:"Facturi", value:`${facturiInregistrate.length} proc.`, icon:"🧾" },
              { label:"Status APIA", value:"Sincronizat ✅", icon:"📡" },
              { label:"Rezervă apă", value:"Optimă 💧", icon:"🌱" },
            ].map((s,i) => (
              <div key={i} style={{ flex:1, padding:"10px 12px", borderRight:i<5?"1px solid rgba(255,255,255,0.1)":"none" }}>
                <div style={{ fontSize:10, opacity:0.5, textTransform:"uppercase", letterSpacing:0.8 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize:15, fontWeight:900, marginTop:2 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav style={{ background:"#fff", borderBottom:"2px solid #d6e8c4", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", overflowX:"auto" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flex:1, padding:"15px 8px", minWidth:100,
              background:"none", border:"none",
              borderBottom: activeTab===t.key ? "4px solid #2d5a1b" : "4px solid transparent",
              color: activeTab===t.key ? "#1b3a0e" : "#777",
              fontWeight: activeTab===t.key ? 800 : 600,
              fontSize:13, cursor:"pointer",
              transition:"all 0.2s", fontFamily:"inherit",
              whiteSpace:"nowrap",
              background: t.key==="meteo" || t.key==="finante" ? (activeTab===t.key ? "#f5fff5" : "none") : "none",
            }}>
              {t.label}
              {(t.key==="meteo"||t.key==="finante") && (
                <span style={{ marginLeft:4, fontSize:9, background:"#2d5a1b", color:"#fff", padding:"1px 5px", borderRadius:4, verticalAlign:"middle" }}>NEW</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENT */}
      <main style={{ maxWidth:1100, margin:"0 auto", padding:"28px 20px" }}>

        {/* ── PARCELE ── */}
        {activeTab === "parcele" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <SectionHeader icon="📍" title="Parcele Oficiale (Sync APIA)" subtitle="Date extrase din Registrul Agricol Național · Sincronizate cu IPA Online." badge="IPA Online · LIVE" />
            <Alert type="success" title="Sincronizare completă cu IPA Online">
              Toate parcelele corespund cu Registrul LPIS. Ultima sincronizare: <strong>26.03.2026 · 08:14</strong>
            </Alert>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, marginTop:20 }}>
              {PARCELE.map(p => (
                <div key={p.id} style={{ background:"#fff", borderRadius:16, border:"2px solid #d6e8c4", borderTop:`5px solid ${p.culoare}`, overflow:"hidden", boxShadow:"0 3px 14px rgba(0,0,0,0.07)" }}>
                  <div style={{ padding:"18px 20px", borderBottom:"1.5px solid #eef4e8" }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:38 }}>{p.icon}</span>
                      <Badge variant="green">✅ Sincronizat</Badge>
                    </div>
                    <div style={{ fontSize:22, fontWeight:900, color:"#1b3a0e", marginTop:10 }}>{p.cultura}</div>
                  </div>
                  <div style={{ padding:"16px 20px" }}>
                    {[{label:"ID Oficial",value:p.id,mono:true},{label:"Bloc fizic",value:p.bloc},{label:"Județ",value:p.judet}].map(r => (
                      <div key={r.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontSize:12, color:"#888", textTransform:"uppercase", letterSpacing:0.5 }}>{r.label}</span>
                        <span style={{ fontSize:13, fontWeight:700, fontFamily:r.mono?"monospace":"inherit", background:r.mono?"#f0f4ec":"none", padding:r.mono?"2px 8px":0, borderRadius:r.mono?6:0 }}>{r.value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:14, background:"#f0f4ec", border:"2px solid #c5deb0", borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontSize:11, color:"#6a7a5a", textTransform:"uppercase", letterSpacing:0.8, marginBottom:4 }}>🔒 Suprafață oficială (blocată)</div>
                      <div style={{ fontSize:28, fontWeight:900, color:p.culoare, lineHeight:1 }}>{p.suprafataOficiala.toFixed(2)} <span style={{ fontSize:15, color:"#888" }}>ha</span></div>
                      <div style={{ fontSize:11, color:"#999", marginTop:4 }}>Conform LPIS · Nu poate fi modificată</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── OCR ── */}
        {activeTab === "ocr" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <SectionHeader icon="🧾" title="Modul OCR cu Protecție Antifraudă" subtitle="Sistem anti-duplicat activ · Hash SHA-256 per factură" badge="Protecție Activă" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div style={{ background:"#fff", borderRadius:16, padding:24, border:"2px solid #d6e8c4", boxShadow:"0 3px 14px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#1b3a0e", marginBottom:4 }}>📷 Scanare Factură Nouă</div>
                <div style={{ fontSize:13, color:"#777", marginBottom:20 }}>
                  Factură cu seria <code style={{ background:"#f0f4ec", padding:"2px 6px", borderRadius:4, fontWeight:700 }}>AGRO-77</code>
                </div>
                {ocrPhase==="duplicate" && <div style={{ marginBottom:18 }}><Alert type="error" title="⚠️ ALERTĂ DUPLICAT: Această factură a fost deja înregistrată!" onClose={()=>setOcrPhase("idle")}>Seria <strong>AGRO-77</strong> a fost deja procesată pe <strong>25.03.2026</strong>. Înregistrarea a fost blocată automat.</Alert></div>}
                {ocrPhase==="scanning" && (
                  <div style={{ marginBottom:18, background:"#f0f4ec", borderRadius:10, padding:16, textAlign:"center" }}>
                    <div style={{ fontSize:32, animation:"spin 1s linear infinite", display:"inline-block" }}>⏳</div>
                    <div style={{ fontWeight:700, color:"#2d5a1b", marginTop:8 }}>Se procesează OCR...</div>
                    <div style={{ background:"#ddd", height:6, borderRadius:3, marginTop:14, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:"#2d5a1b", borderRadius:3, animation:"progress 2.4s ease forwards" }} />
                    </div>
                  </div>
                )}
                <button onClick={handleOCR} disabled={ocrPhase==="scanning"} style={{ width:"100%", background: ocrPhase==="scanning"?"#ccc":ocrPhase==="duplicate"?"#b71c1c":"linear-gradient(135deg,#e8722a,#c85a10)", color:"#fff", border:"none", borderRadius:14, padding:"20px 0", fontSize:20, fontWeight:900, cursor:ocrPhase==="scanning"?"not-allowed":"pointer", boxShadow:ocrPhase!=="scanning"?"0 5px 20px rgba(232,114,42,0.4)":"none", transition:"all 0.25s" }}>
                  {ocrPhase==="scanning" ? "⏳ Se procesează..." : "📷 Adaugă Factură (OCR)"}
                </button>
                <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                  <Badge variant="gray">🔍 Anti-duplicat</Badge><Badge variant="gray">📊 Verificare TVA</Badge><Badge variant="gray">🔐 SHA-256</Badge>
                </div>
              </div>
              <div>
                {ultimaFactura && (
                  <div style={{ background:"#e8f5e9", border:"2px solid #4caf50", borderRadius:16, padding:20, marginBottom:16 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:"#1b5e20", marginBottom:12 }}>✅ Factură Procesată cu Succes</div>
                    {[["Serie",ultimaFactura.serie],["Furnizor",ultimaFactura.furnizor],["Data",ultimaFactura.data],["Cantitate",`${ultimaFactura.cantitate}L motorină`],["Valoare",ultimaFactura.valoare],["Status TVA","Verificat ✅"]].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #c8e6c9" }}>
                        <span style={{ fontSize:13, color:"#555" }}>{k}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:"#1b5e20" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ background:"#fff", borderRadius:12, padding:16, border:"1.5px solid #e0e0e0" }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#555", marginBottom:10, textTransform:"uppercase", letterSpacing:0.8 }}>📋 Log Facturi</div>
                  {facturiInregistrate.length===0
                    ? <div style={{ color:"#bbb", fontSize:13, textAlign:"center", padding:"20px 0" }}>Nicio factură procesată.</div>
                    : facturiInregistrate.map((s,i)=>(
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", background:"#f9f9f9", borderRadius:8, marginBottom:6 }}>
                        <span style={{ fontFamily:"monospace", fontWeight:700, color:"#2d5a1b" }}>{s}</span>
                        <Badge variant="green">Înregistrată</Badge>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TRATAMENTE ── */}
        {activeTab === "tratament" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <SectionHeader icon="💊" title="Înregistrare Tratamente cu Validare Legală" subtitle="Doză maximă admisă: 3.0 L/ha · Reg. (CE) 1107/2009" badge="Conf. APIA" />
            <div style={{ background:"#fff", borderRadius:16, padding:24, border:"2px solid #d6e8c4", marginBottom:24 }}>
              <div style={{ fontWeight:800, fontSize:16, color:"#1b3a0e", marginBottom:18 }}>➕ Tratament Nou</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                <div>
                  <label style={labelStyle}>📍 Parcelă</label>
                  <select value={tratamentForm.parcela} onChange={e=>setTratamentForm(f=>({...f,parcela:e.target.value}))} style={inputStyle}>
                    <option value="">— Selectați —</option>
                    {PARCELE.map(p=><option key={p.id} value={`${p.id} · ${p.cultura}`}>{p.id} · {p.cultura}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>📅 Data</label>
                  <input type="date" value={tratamentForm.data} onChange={e=>setTratamentForm(f=>({...f,data:e.target.value}))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>🧪 Produs</label>
                  <input type="text" placeholder="ex: Roundup 360 SL" value={tratamentForm.produs} onChange={e=>setTratamentForm(f=>({...f,produs:e.target.value}))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>⚖️ Doză (L/ha)</label>
                  <input type="number" placeholder="ex: 2.5" step="0.1" min="0" value={tratamentForm.doza} onChange={e=>setTratamentForm(f=>({...f,doza:e.target.value}))} style={{...inputStyle, borderColor:dozaDepasita?"#c62828":inputStyle.borderColor, background:dozaDepasita?"#fdecea":inputStyle.background}} />
                  {dozaDepasita && <div style={{ color:"#b71c1c", fontSize:13, fontWeight:800, marginTop:6 }}>❌ Depășire Doză Maximă Admisă (Conformitate APIA în pericol!)</div>}
                </div>
              </div>
              {dozaDepasita && <div style={{ marginBottom:16 }}><Alert type="error" title="Depășire Doză Maximă Legală">Doza <strong>{dozaNum} L/ha</strong> depășește limita de <strong>3.0 L/ha</strong>. Salvarea este blocată.</Alert></div>}
              <button onClick={handleSalvaTratament} disabled={!formValid} style={{ background:!formValid?"#ccc":"linear-gradient(135deg,#2d5a1b,#4a7c2f)", color:"#fff", border:"none", borderRadius:14, padding:"18px 40px", fontSize:18, fontWeight:900, cursor:!formValid?"not-allowed":"pointer", boxShadow:formValid?"0 5px 18px rgba(45,90,27,0.38)":"none", transition:"all 0.2s" }}>
                {!formValid?(dozaDepasita?"🔒 Salvare Blocată — Doză Ilegală":"💾 Completați câmpurile"):"💾 Salvează Tratament"}
              </button>
            </div>
            <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", border:"2px solid #d6e8c4" }}>
              <div style={{ background:"#1b3a0e", padding:"14px 20px", color:"#fff", fontWeight:800, fontSize:15, display:"flex", justifyContent:"space-between" }}>
                <span>📋 Registru Tratamente ({tratamenteSalvate.length})</span>
                <Badge variant="green">✅ Toate validate</Badge>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
                <thead>
                  <tr style={{ background:"#f0f4ec" }}>
                    {["Nr.","Data","Parcelă","Produs","Doză","Tip","Operator","Status"].map(h=>(
                      <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:11, textTransform:"uppercase", letterSpacing:0.7, color:"#5a6a4a", fontWeight:800 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tratamenteSalvate.map((t,i)=>(
                    <tr key={i} style={{ borderBottom:"1.5px solid #eef4e8", background:i%2===0?"#fff":"#fafdf7" }}>
                      <td style={{ padding:"12px 14px", color:"#aaa", fontWeight:700 }}>{t.nr}</td>
                      <td style={{ padding:"12px 14px", fontWeight:700 }}>{t.data}</td>
                      <td style={{ padding:"12px 14px", fontFamily:"monospace", fontSize:13 }}>{t.parcela}</td>
                      <td style={{ padding:"12px 14px", fontWeight:700, color:"#2d5a1b" }}>{t.produs}</td>
                      <td style={{ padding:"12px 14px" }}>{t.doza}</td>
                      <td style={{ padding:"12px 14px" }}><Badge variant={t.tip==="Fungicid"?"green":t.tip==="Insecticid"?"orange":t.tip==="Erbicid"?"red":"blue"}>{t.tip}</Badge></td>
                      <td style={{ padding:"12px 14px", color:"#666" }}>{t.operator}</td>
                      <td style={{ padding:"12px 14px" }}><Badge variant="green">✅ Valid</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DOSAR APIA ── */}
        {activeTab === "dosar" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <SectionHeader icon="📁" title="Generare Dosar APIA Smart" subtitle="Compilare Registru Tratamente · Validare IPA Online · Export XML" />
            {dosarPhase==="idle" && (
              <div style={{ background:"linear-gradient(135deg,#1b3a0e,#2d5a1b,#3d7224)", borderRadius:20, padding:"44px 36px", textAlign:"center", color:"#fff", boxShadow:"0 10px 40px rgba(27,58,14,0.4)" }}>
                <div style={{ fontSize:56, marginBottom:16 }}>📁</div>
                <div style={{ fontSize:22, fontWeight:900, marginBottom:32 }}>Dosar APIA · Campania 2026 · {tratamenteSalvate.length} tratamente</div>
                <button onClick={()=>{setDosarPhase("generating");setTimeout(()=>setDosarPhase("done"),2200);}} style={{ background:"#fff", color:"#1b3a0e", border:"none", borderRadius:18, padding:"24px 60px", fontSize:22, fontWeight:900, cursor:"pointer", boxShadow:"0 6px 24px rgba(0,0,0,0.2)", transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)"}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>
                  📋 Generează Dosar APIA Smart
                </button>
              </div>
            )}
            {dosarPhase==="generating" && (
              <div style={{ background:"#fff", borderRadius:16, padding:40, textAlign:"center", border:"2px solid #d6e8c4" }}>
                <div style={{ fontSize:48, animation:"spin 1.5s linear infinite", display:"inline-block", marginBottom:16 }}>⚙️</div>
                <div style={{ fontWeight:800, fontSize:20, color:"#1b3a0e" }}>Se generează dosarul...</div>
              </div>
            )}
            {dosarPhase==="done" && (
              <div style={{ animation:"fadeIn 0.4s ease" }}>
                <div style={{ background:"#e8f5e9", border:"3px solid #2e7d32", borderRadius:16, padding:24, marginBottom:20 }}>
                  <div style={{ fontSize:20, fontWeight:900, color:"#1b5e20", marginBottom:6 }}>✅ Validare Finală IPA Online — Dosar Complet</div>
                  <div style={{ fontSize:15, color:"#2e7d32", fontWeight:700 }}>Toate datele coincid cu IPA Online. Gata de Export XML.</div>
                  <div style={{ display:"flex", gap:10, marginTop:16 }}>
                    <button onClick={()=>window.print()} style={{ background:"#1b5e20", color:"#fff", border:"none", borderRadius:12, padding:"14px 24px", fontSize:16, fontWeight:800, cursor:"pointer" }}>🖨️ Printează</button>
                    <button style={{ background:"#2e7d32", color:"#fff", border:"none", borderRadius:12, padding:"14px 24px", fontSize:16, fontWeight:800, cursor:"pointer" }}>📤 Export XML</button>
                    <button onClick={()=>setDosarPhase("idle")} style={{ background:"#f5f0e8", color:"#666", border:"2px solid #ddd", borderRadius:12, padding:"14px 16px", fontWeight:700, cursor:"pointer" }}>✕</button>
                  </div>
                </div>
                <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", border:"2px solid #d6e8c4" }}>
                  <div style={{ background:"#1b3a0e", padding:"18px 24px", color:"#fff" }}>
                    <div style={{ fontSize:18, fontWeight:900 }}>REGISTRUL DE TRATAMENTE · Campania 2026</div>
                    <div style={{ fontSize:13, opacity:0.7, marginTop:4 }}>Fermier: Ion Popescu · APIA ID: RO-23041982-DJ · Generat: 26.03.2026</div>
                  </div>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
                    <thead><tr style={{ background:"#f0f4ec" }}>{["Nr.","Data","Parcelă","Produs","Doză","Tip","Operator","Validare"].map(h=><th key={h} style={{ padding:"13px 14px", textAlign:"left", fontSize:11, textTransform:"uppercase", letterSpacing:0.6, color:"#5a6a4a", fontWeight:800 }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {tratamenteSalvate.map((t,i)=>(
                        <tr key={i} style={{ borderBottom:"1.5px solid #eef4e8", background:i%2===0?"#fff":"#fafdf7" }}>
                          <td style={{ padding:"13px 14px", color:"#aaa" }}>{t.nr}</td>
                          <td style={{ padding:"13px 14px", fontWeight:700 }}>{t.data}</td>
                          <td style={{ padding:"13px 14px", fontFamily:"monospace", fontSize:13, color:"#2d5a1b" }}>{t.parcela}</td>
                          <td style={{ padding:"13px 14px", fontWeight:700 }}>{t.produs}</td>
                          <td style={{ padding:"13px 14px" }}>{t.doza}</td>
                          <td style={{ padding:"13px 14px" }}><Badge variant={t.tip==="Fungicid"?"green":t.tip==="Insecticid"?"orange":t.tip==="Erbicid"?"red":"blue"}>{t.tip}</Badge></td>
                          <td style={{ padding:"13px 14px", color:"#666" }}>{t.operator}</td>
                          <td style={{ padding:"13px 14px" }}><Badge variant="green">✅ LPIS</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── METEO ── */}
        {activeTab === "meteo" && <TabMeteo />}

        {/* ── FINANTE ── */}
        {activeTab === "finante" && <TabFinante />}

      </main>

      <footer style={{ background:"#1b3a0e", color:"#6b8c5a", textAlign:"center", padding:"16px 24px", fontSize:12, marginTop:40 }}>
        AgroManager România v3.0 · APIA 2026 · IPA Online · LPIS · ANSVSA · ANM ·{" "}
        <span style={{ color:"#4a7c2f" }}>Certificat MADR</span>
      </footer>

      <style>{`
        @keyframes fadeIn    { from { opacity:0; transform:translateY(8px); }  to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin      { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
        @keyframes pulse     { 0%,100%{ opacity:1; } 50%{ opacity:0.4; } }
        @keyframes progress  { from { width:0%; } to { width:100%; } }
        select option { font-family: inherit; }
        @media print {
          nav, header, button, footer { display:none !important; }
          body { background:white !important; }
        }
      `}</style>
    </div>
  );
}
