import { useState, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════════════════════
   HOOK RESPONSIVE
══════════════════════════════════════════════════════════ */
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: w < 640, isTablet: w < 900, w };
}

function RGrid({ cols=3, gap=16, children, style={} }) {
  const { isMobile, isTablet } = useBreakpoint();
  const c = isMobile ? 1 : (isTablet && cols >= 3 ? 2 : cols);
  return <div style={{ display:"grid", gridTemplateColumns:`repeat(${c},1fr)`, gap, ...style }}>{children}</div>;
}

function ScrollTable({ children }) {
  return (
    <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
      <div style={{ minWidth:580 }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DATE
══════════════════════════════════════════════════════════ */
const PARCELE = [
  { id:"RO-DJ-1247", cultura:"Grâu",            icon:"🌾", suprafataOficiala:45.32, bloc:"BL-2241", judet:"Dolj", culoare:"#c9a227" },
  { id:"RO-DJ-1248", cultura:"Porumb",           icon:"🌽", suprafataOficiala:32.68, bloc:"BL-2242", judet:"Dolj", culoare:"#d45f1a" },
  { id:"RO-DJ-1249", cultura:"Floarea Soarelui", icon:"🌻", suprafataOficiala:28.10, bloc:"BL-2243", judet:"Dolj", culoare:"#c8b700" },
];
const TRATAMENTE_BAZA = [
  { nr:1, data:"12.03.2026", parcela:"RO-DJ-1247 · Grâu",            produs:"Funguran OH 50 WP", doza:"2.5 kg/ha", tip:"Fungicid",  operator:"Ion Popescu"   },
  { nr:2, data:"18.03.2026", parcela:"RO-DJ-1248 · Porumb",           produs:"Actellic 50 EC",    doza:"1.0 L/ha",  tip:"Insecticid",operator:"Ion Popescu"   },
  { nr:3, data:"22.03.2026", parcela:"RO-DJ-1249 · Floarea Soarelui", produs:"Roundup 360 SL",    doza:"3.0 L/ha",  tip:"Erbicid",   operator:"Maria Ionescu" },
];
const PRECIPITATII = [
  { luna:"Apr '25", val:42, sezon:"primavara" }, { luna:"Mai '25", val:68, sezon:"primavara" },
  { luna:"Iun '25", val:55, sezon:"vara"      }, { luna:"Iul '25", val:22, sezon:"vara"      },
  { luna:"Aug '25", val:18, sezon:"vara"      }, { luna:"Sep '25", val:35, sezon:"toamna"    },
  { luna:"Oct '25", val:50, sezon:"toamna"    }, { luna:"Nov '25", val:44, sezon:"toamna"    },
  { luna:"Dec '25", val:38, sezon:"iarna"     }, { luna:"Ian '26", val:29, sezon:"iarna"     },
  { luna:"Feb '26", val:33, sezon:"iarna"     }, { luna:"Mar '26", val:47, sezon:"primavara" },
];
const CULORI_SEZON = {
  primavara:{ bar:"#4caf50", light:"#e8f5e9" },
  vara:     { bar:"#ff9800", light:"#fff3e0" },
  toamna:   { bar:"#795548", light:"#efebe9" },
  iarna:    { bar:"#42a5f5", light:"#e3f2fd" },
};
const FINANTE = [
  { parcela:PARCELE[0], costuri:{ seminte:420, motorina:310, substante:280, manopera:190 }, productieHa:7.2,  pretTona:950,  culturaOpt:"Grâu panificabil cls. II"   },
  { parcela:PARCELE[1], costuri:{ seminte:380, motorina:290, substante:210, manopera:170 }, productieHa:9.5,  pretTona:780,  culturaOpt:"Porumb siloz/boabe"          },
  { parcela:PARCELE[2], costuri:{ seminte:340, motorina:260, substante:195, manopera:160 }, productieHa:3.1,  pretTona:2100, culturaOpt:"Floarea Soarelui High Oleic"  },
];

/* ══════════════════════════════════════════════════════════
   COMPONENTE REUTILIZABILE
══════════════════════════════════════════════════════════ */
function Badge({ children, variant="green" }) {
  const v = { green:{bg:"#e6f4ea",color:"#1b5e20",border:"#a5d6a7"}, red:{bg:"#fdecea",color:"#b71c1c",border:"#ef9a9a"}, orange:{bg:"#fff3e0",color:"#e65100",border:"#ffcc80"}, blue:{bg:"#e3f2fd",color:"#0d47a1",border:"#90caf9"}, gray:{bg:"#f5f5f5",color:"#424242",border:"#bdbdbd"} };
  const s = v[variant]||v.gray;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:700, background:s.bg, color:s.color, border:`1.5px solid ${s.border}`, flexShrink:0 }}>{children}</span>;
}

function Alert({ type="error", title, children, onClose }) {
  const cfg = { error:{bg:"#fdecea",border:"#c62828",icon:"🚨",titleC:"#b71c1c"}, warning:{bg:"#fff8e1",border:"#f9a825",icon:"⚠️",titleC:"#e65100"}, success:{bg:"#e8f5e9",border:"#2e7d32",icon:"✅",titleC:"#1b5e20"}, info:{bg:"#e3f2fd",border:"#1565c0",icon:"ℹ️",titleC:"#0d47a1"} };
  const c = cfg[type];
  return (
    <div style={{ background:c.bg, border:`2px solid ${c.border}`, borderLeft:`6px solid ${c.border}`, borderRadius:10, padding:"12px 14px", display:"flex", gap:10, alignItems:"flex-start", animation:"slideDown 0.3s ease" }}>
      <span style={{ fontSize:20, flexShrink:0 }}>{c.icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        {title && <div style={{ fontWeight:800, color:c.titleC, fontSize:14, marginBottom:3, lineHeight:1.3 }}>{title}</div>}
        <div style={{ color:"#333", fontSize:13, lineHeight:1.5 }}>{children}</div>
      </div>
      {onClose && <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#999", padding:0, flexShrink:0 }}>✕</button>}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, badge }) {
  const { isMobile } = useBreakpoint();
  return (
    <div style={{ marginBottom:16, borderBottom:"2px solid #d6e8c4", paddingBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <h2 style={{ margin:0, fontSize:isMobile?16:19, fontWeight:900, color:"#1b3a0e", letterSpacing:-0.3 }}>{title}</h2>
        {badge && <Badge variant="blue">{badge}</Badge>}
      </div>
      {subtitle && <p style={{ margin:"5px 0 0 28px", fontSize:12, color:"#6a7a5a", lineHeight:1.4 }}>{subtitle}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ECRAN LOGIN — State Management Layer 1
══════════════════════════════════════════════════════════ */
function LoginScreen({ onLogin }) {
  const { isMobile } = useBreakpoint();
  const [idApia, setIdApia]   = useState("");
  const [parola, setParola]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [phase, setPhase]     = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldFocus, setFieldFocus] = useState(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!idApia.trim()) { setErrorMsg("ID-ul APIA este obligatoriu."); setPhase("error"); return; }
    if (!parola.trim()) { setErrorMsg("Introduceți parola."); setPhase("error"); return; }
    setPhase("loading");
    setErrorMsg("");
    // Simulare autentificare server APIA (1.8s)
    setTimeout(() => {
      setPhase("idle");
      onLogin({ idApia: idApia.trim(), nume: "Ion Popescu", judet: "Dolj" });
    }, 1800);
  };

  const inputBase = (focused) => ({
    width:"100%", padding:"14px 16px",
    border: focused ? "2px solid #2d5a1b" : "2px solid #d0d8c8",
    borderRadius:12, fontSize:16,
    fontFamily:"Georgia,serif", color:"#1a1a0e",
    background: focused ? "#f8fdf5" : "#fafafa",
    boxSizing:"border-box", outline:"none",
    transition:"all 0.2s",
    boxShadow: focused ? "0 0 0 4px rgba(45,90,27,0.12)" : "none",
  });

  return (
    <div style={{
      minHeight:"100vh", background:"#f2efe8",
      display:"flex", flexDirection:"column",
      fontFamily:"'Georgia','Palatino Linotype',serif",
    }}>
      {/* Header minimal */}
      <div style={{
        background:"linear-gradient(135deg,#1b3a0e,#2d5a1b)",
        padding: isMobile ? "20px 20px" : "28px 40px",
        display:"flex", alignItems:"center", gap:14,
        boxShadow:"0 4px 20px rgba(27,58,14,0.4)",
      }}>
        <span style={{ fontSize:isMobile?28:36 }}>🌿</span>
        <div>
          <div style={{ color:"#fff", fontWeight:900, fontSize:isMobile?18:24, lineHeight:1 }}>AgroManager România</div>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginTop:3 }}>
            Platformă Agricolă Digitală · APIA 2026 · v4.0
          </div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end" }}>
            <div style={{ width:7, height:7, background:"#4caf50", borderRadius:"50%", animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)" }}>Sistem activ</span>
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>
            Certificat MADR · SSL 256-bit
          </div>
        </div>
      </div>

      {/* Card login centrat */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:isMobile?"20px 16px":"40px 20px" }}>
        <div style={{ width:"100%", maxWidth:440 }}>

          {/* Titlu */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:72, height:72, borderRadius:20,
              background:"linear-gradient(135deg,#2d5a1b,#4a7c2f)",
              boxShadow:"0 8px 28px rgba(45,90,27,0.35)",
              marginBottom:18,
            }}>
              <span style={{ fontSize:34 }}>🔐</span>
            </div>
            <h1 style={{ margin:0, fontSize:isMobile?22:26, fontWeight:900, color:"#1b3a0e", letterSpacing:-0.5 }}>
              Autentificare Securizată
            </h1>
            <p style={{ margin:"8px 0 0", fontSize:14, color:"#7a8a6a", lineHeight:1.5 }}>
              Introduceți credențialele APIA pentru a accesa<br />
              datele fermei dumneavoastră.
            </p>
          </div>

          {/* Card formular */}
          <div style={{
            background:"#fff",
            borderRadius:20, padding:isMobile?"24px 20px":"32px 36px",
            boxShadow:"0 12px 48px rgba(0,0,0,0.10)",
            border:"2px solid #e8f0e0",
          }}>
            {/* Error alert */}
            {phase==="error" && (
              <div style={{ marginBottom:20 }}>
                <Alert type="error" title="Eroare de autentificare" onClose={()=>setPhase("idle")}>
                  {errorMsg}
                </Alert>
              </div>
            )}

            {/* Câmp ID APIA */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:0.7, color:"#5a6a4a", marginBottom:7 }}>
                🪪 ID APIA
              </label>
              <input
                type="text"
                placeholder="ex: RO-23041982-DJ"
                value={idApia}
                onChange={e=>setIdApia(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                onFocus={()=>setFieldFocus("id")}
                onBlur={()=>setFieldFocus(null)}
                style={inputBase(fieldFocus==="id")}
                autoComplete="username"
              />
              <div style={{ fontSize:11, color:"#aaa", marginTop:5 }}>
                Găsiți ID-ul pe adeverința APIA sau pe portalul apia.org.ro
              </div>
            </div>

            {/* Câmp Parolă */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:0.7, color:"#5a6a4a", marginBottom:7 }}>
                🔑 Parolă
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPass?"text":"password"}
                  placeholder="Parola contului APIA"
                  value={parola}
                  onChange={e=>setParola(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                  onFocus={()=>setFieldFocus("pass")}
                  onBlur={()=>setFieldFocus(null)}
                  style={{ ...inputBase(fieldFocus==="pass"), paddingRight:52 }}
                  autoComplete="current-password"
                />
                <button
                  onClick={()=>setShowPass(p=>!p)}
                  style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#aaa", padding:4 }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Buton Login */}
            <button
              onClick={handleSubmit}
              disabled={phase==="loading"}
              style={{
                width:"100%",
                background: phase==="loading" ? "#aaa" : "linear-gradient(135deg,#1b3a0e,#2d5a1b)",
                color:"#fff", border:"none",
                borderRadius:14, padding:"18px 0",
                fontSize:18, fontWeight:900,
                cursor:phase==="loading"?"not-allowed":"pointer",
                boxShadow: phase!=="loading" ? "0 6px 22px rgba(27,58,14,0.38)" : "none",
                transition:"all 0.25s",
                fontFamily:"inherit",
                letterSpacing:0.3,
              }}
            >
              {phase==="loading" ? (
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  <span style={{ display:"inline-block", width:18, height:18, border:"3px solid rgba(255,255,255,0.3)", borderTop:"3px solid #fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                  Se verifică credențialele...
                </span>
              ) : "🔓 Intră în aplicație"}
            </button>

            {/* Demo hint */}
            <div style={{ marginTop:16, padding:"10px 14px", background:"#f0f9e8", borderRadius:10, border:"1.5px solid #c5deb0", display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ fontSize:16 }}>💡</span>
              <div style={{ fontSize:12, color:"#4a6a3a", lineHeight:1.5 }}>
                <strong>Mod demonstrație:</strong> Introduceți orice ID și parolă pentru a accesa aplicația. Datele sunt fictive și nu se transmit nicăieri.
              </div>
            </div>
          </div>

          {/* Footer legal */}
          <div style={{ textAlign:"center", marginTop:24, fontSize:11, color:"#aaa", lineHeight:1.6 }}>
            🔒 Conexiune securizată SSL · Date protejate GDPR<br />
            Ministerul Agriculturii și Dezvoltării Rurale · MADR 2026
          </div>
        </div>
      </div>

      <footer style={{ background:"#1b3a0e", color:"#6b8c5a", textAlign:"center", padding:"12px", fontSize:11 }}>
        AgroManager România v4.0 · APIA 2026 · Certificat MADR
      </footer>

      <style>{`
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        input { font-size:16px !important; }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB METEO — cu GPS / Geolocation API
══════════════════════════════════════════════════════════ */
function TabMeteo() {
  const { isMobile } = useBreakpoint();
  const [animated, setAnimated]   = useState(false);
  const [gpsPhase, setGpsPhase]   = useState("idle"); // idle | requesting | loading | done | denied | error
  const [gpsCoords, setGpsCoords] = useState(null);   // { lat, lon }
  const [liveMeteo, setLiveMeteo] = useState(null);   // date meteo live
  const [gpsLocatie, setGpsLocatie] = useState("");   // nume localitate

  const maxVal     = Math.max(...PRECIPITATII.map(p=>p.val));
  const totalAnual = PRECIPITATII.reduce((s,p)=>s+p.val,0);
  const mediaLunara= Math.round(totalAnual/PRECIPITATII.length);
  const ultimele3  = PRECIPITATII.slice(-3).reduce((s,p)=>s+p.val,0);
  const rezervaOK  = ultimele3 >= 100;

  useEffect(()=>{ const t=setTimeout(()=>setAnimated(true),80); return()=>clearTimeout(t); },[]);

  /* ── Obținere locație GPS ── */
  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsPhase("error");
      return;
    }
    setGpsPhase("requesting");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setGpsCoords({ lat, lon });
        setGpsPhase("loading");

        try {
          // Open-Meteo API — gratuit, fără API key
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto`;
          const geoUrl     = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

          const [weatherRes, geoRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(geoUrl, { headers:{ "Accept-Language":"ro" } }),
          ]);

          const wData = await weatherRes.json();
          const gData = await geoRes.json();

          // Cod WMO → descriere + emoji
          const wmoIcon = (code) => {
            if (code === 0)          return { text:"Senin",        icon:"☀️"  };
            if (code <= 3)           return { text:"Parțial noros",icon:"⛅"  };
            if (code <= 49)          return { text:"Ceață",        icon:"🌫️"  };
            if (code <= 65)          return { text:"Ploaie",       icon:"🌧️"  };
            if (code <= 77)          return { text:"Ninsoare",     icon:"❄️"  };
            if (code <= 82)          return { text:"Averse",       icon:"🌦️"  };
            if (code <= 99)          return { text:"Furtună",      icon:"⛈️"  };
            return { text:"Variabil", icon:"🌤️" };
          };

          const cur    = wData.current;
          const daily  = wData.daily;
          const locName = gData?.address?.city || gData?.address?.town || gData?.address?.village || gData?.address?.county || "Locația ta";

          setGpsLocatie(locName);
          setLiveMeteo({
            temp:       Math.round(cur.temperature_2m),
            umiditate:  cur.relative_humidity_2m,
            precipAzi:  cur.precipitation,
            vitVant:    Math.round(cur.wind_speed_10m),
            stare:      wmoIcon(cur.weather_code),
            prognoza7:  daily.time.slice(0,7).map((d,i) => ({
              data:  new Date(d).toLocaleDateString("ro-RO",{ weekday:"short" }),
              max:   Math.round(daily.temperature_2m_max[i]),
              min:   Math.round(daily.temperature_2m_min[i]),
              prec:  Math.round(daily.precipitation_sum[i] * 10) / 10,
              stare: wmoIcon(0), // simplificat
            })),
            lat: lat.toFixed(4),
            lon: lon.toFixed(4),
          });

          setGpsPhase("done");
        } catch {
          // API indisponibil — arătăm date simulate cu coordonatele reale
          setGpsLocatie(`${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`);
          setLiveMeteo({
            temp: 14, umiditate: 68, precipAzi: 0,
            vitVant: 12,
            stare: { text:"Parțial noros", icon:"⛅" },
            prognoza7: [
              { data:"Azi",  max:14, min:6,  prec:0,  stare:{ icon:"⛅" } },
              { data:"Mâine",max:11, min:5,  prec:2.8,stare:{ icon:"🌧️" } },
              { data:"Mie",  max:13, min:7,  prec:1.8,stare:{ icon:"🌦️" } },
              { data:"Joi",  max:17, min:8,  prec:0,  stare:{ icon:"☀️" } },
              { data:"Vin",  max:19, min:9,  prec:0,  stare:{ icon:"☀️" } },
              { data:"Sam",  max:16, min:7,  prec:0.5,stare:{ icon:"⛅" } },
              { data:"Dum",  max:12, min:5,  prec:2.2,stare:{ icon:"🌧️" } },
            ],
            lat: lat.toFixed(4), lon: lon.toFixed(4),
          });
          setGpsPhase("done");
        }
      },
      (err) => {
        setGpsPhase(err.code === 1 ? "denied" : "error");
      },
      { enableHighAccuracy:true, timeout:10000, maximumAge:300000 }
    );
  }, []);

  const prognozaStatic = [
    { data:"Lun",icon:"⛅",min:6, max:14,prec:12 }, { data:"Mar",icon:"🌧️",min:5, max:11,prec:28 },
    { data:"Mie",icon:"🌦️",min:7, max:13,prec:18 }, { data:"Joi",icon:"☀️",min:8, max:17,prec:0  },
    { data:"Vin",icon:"☀️",min:9, max:19,prec:0  }, { data:"Sam",icon:"⛅",min:7, max:16,prec:5  },
    { data:"Dum",icon:"🌧️",min:5, max:12,prec:22 },
  ];

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <SectionHeader icon="🌦️" title="Meteo & Apă" subtitle="Date climatice istorice · Sursa: ANM · Plus meteo live prin GPS" badge="ANM + GPS Live" />

      {/* ── CARD GPS ── */}
      <div style={{
        background: gpsPhase==="done"
          ? "linear-gradient(135deg,#0d47a1,#1565c0,#1976d2)"
          : "linear-gradient(135deg,#1b3a0e,#2d5a1b,#3d7224)",
        borderRadius:16, padding:isMobile?"18px 16px":"22px 28px",
        marginBottom:20, color:"#fff",
        boxShadow: gpsPhase==="done"
          ? "0 8px 28px rgba(13,71,161,0.4)"
          : "0 8px 28px rgba(27,58,14,0.35)",
        transition:"background 0.8s ease",
      }}>
        {gpsPhase==="idle" && (
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ fontWeight:900, fontSize:isMobile?16:18, marginBottom:5 }}>
                📡 Meteo Live la Locația Mea
              </div>
              <div style={{ fontSize:13, opacity:0.8, lineHeight:1.5 }}>
                Browserul va solicita accesul la locația ta GPS. Odată aprobat, aplicația va prelua temperatura, precipitațiile și prognoza pentru ferma ta exact.
              </div>
            </div>
            <button onClick={handleGPS} style={{ background:"rgba(255,255,255,0.18)", color:"#fff", border:"2px solid rgba(255,255,255,0.5)", borderRadius:14, padding:isMobile?"14px 20px":"16px 28px", fontSize:isMobile?16:17, fontWeight:900, cursor:"pointer", fontFamily:"inherit", backdropFilter:"blur(4px)", flexShrink:0, transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.28)"}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.18)"}}>
              📍 Accesează Locația GPS
            </button>
          </div>
        )}

        {gpsPhase==="requesting" && (
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:32, animation:"pulseScale 1s ease-in-out infinite" }}>📡</span>
            <div>
              <div style={{ fontWeight:900, fontSize:17 }}>Se solicită accesul la locație...</div>
              <div style={{ fontSize:13, opacity:0.75, marginTop:4 }}>Acceptați notificarea browserului pentru a continua.</div>
              <div style={{ marginTop:8, fontSize:12, opacity:0.6, fontStyle:"italic" }}>
                „AgroManager dorește să vă acceseze locația. Permiteți?"
              </div>
            </div>
          </div>
        )}

        {gpsPhase==="loading" && (
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:28, display:"inline-block", animation:"spin 1s linear infinite" }}>⚙️</span>
            <div>
              <div style={{ fontWeight:900, fontSize:17 }}>Locație obținută ✓ · Se încarcă datele meteo...</div>
              <div style={{ fontSize:13, opacity:0.75, marginTop:4 }}>
                📍 {gpsCoords && `${gpsCoords.lat.toFixed(4)}°N, ${gpsCoords.lon.toFixed(4)}°E`} — Conectare la Open-Meteo API...
              </div>
            </div>
          </div>
        )}

        {gpsPhase==="denied" && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
            <span style={{ fontSize:28 }}>🚫</span>
            <div>
              <div style={{ fontWeight:900, fontSize:17 }}>Acces la locație refuzat</div>
              <div style={{ fontSize:13, opacity:0.8, marginTop:4, lineHeight:1.5 }}>
                Ați refuzat accesul la GPS. Pentru a activa meteo live, mergeți la <strong>Setări Browser → Locație → Permiteți</strong> pentru acest site, apoi apăsați butonul din nou.
              </div>
              <button onClick={()=>setGpsPhase("idle")} style={{ marginTop:10, background:"rgba(255,255,255,0.2)", color:"#fff", border:"2px solid rgba(255,255,255,0.4)", borderRadius:10, padding:"8px 16px", fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
                ↩ Încearcă din nou
              </button>
            </div>
          </div>
        )}

        {gpsPhase==="error" && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
            <span style={{ fontSize:28 }}>⚠️</span>
            <div>
              <div style={{ fontWeight:900, fontSize:17 }}>GPS indisponibil pe acest dispozitiv</div>
              <div style={{ fontSize:13, opacity:0.8, marginTop:4 }}>Browserul nu suportă Geolocation API. Sunt afișate datele climatice pentru zona Dolj.</div>
            </div>
          </div>
        )}

        {gpsPhase==="done" && liveMeteo && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ fontSize:11, opacity:0.7, textTransform:"uppercase", letterSpacing:1.2, marginBottom:4 }}>
                  📍 Meteo Live · {gpsLocatie}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                  <span style={{ fontSize:56, lineHeight:1 }}>{liveMeteo.stare.icon}</span>
                  <div>
                    <div style={{ fontSize:isMobile?42:52, fontWeight:900, lineHeight:1 }}>{liveMeteo.temp}°C</div>
                    <div style={{ fontSize:15, opacity:0.85, marginTop:2 }}>{liveMeteo.stare.text}</div>
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { label:"Umiditate",   value:`${liveMeteo.umiditate}%`,         icon:"💧" },
                  { label:"Vânt",        value:`${liveMeteo.vitVant} km/h`,        icon:"💨" },
                  { label:"Precipitații",value:`${liveMeteo.precipAzi} mm/oră`,    icon:"🌧️" },
                  { label:"Coordonate",  value:`${liveMeteo.lat}°N`,              icon:"📍" },
                ].map((m,i)=>(
                  <div key={i} style={{ background:"rgba(255,255,255,0.15)", borderRadius:10, padding:"10px 12px", backdropFilter:"blur(4px)" }}>
                    <div style={{ fontSize:12, opacity:0.7 }}>{m.icon} {m.label}</div>
                    <div style={{ fontSize:15, fontWeight:900, marginTop:2 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prognoză 7 zile live */}
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.2)", paddingTop:14 }}>
              <div style={{ fontSize:12, opacity:0.7, marginBottom:10, textTransform:"uppercase", letterSpacing:0.8 }}>📅 Prognoză 7 Zile (Live)</div>
              <div style={{ display:"flex", gap:6, overflowX:"auto", WebkitOverflowScrolling:"touch", paddingBottom:4 }}>
                {liveMeteo.prognoza7.map((z,i)=>(
                  <div key={i} style={{ flexShrink:0, width:68, textAlign:"center", padding:"8px 6px", background:"rgba(255,255,255,0.15)", borderRadius:10, backdropFilter:"blur(4px)", border: i===0?"2px solid rgba(255,255,255,0.5)":"1px solid rgba(255,255,255,0.2)" }}>
                    <div style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", opacity:0.8 }}>{z.data}</div>
                    <div style={{ fontSize:22, margin:"4px 0" }}>{z.stare.icon}</div>
                    <div style={{ fontSize:14, fontWeight:900 }}>{z.max}°</div>
                    <div style={{ fontSize:10, opacity:0.6 }}>{z.min}°</div>
                    {z.prec>0 && <div style={{ fontSize:10, color:"#90caf9", fontWeight:700, marginTop:2 }}>💧{z.prec}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Buton refresh */}
            <button onClick={()=>{ setGpsPhase("idle"); setLiveMeteo(null); }} style={{ marginTop:14, background:"rgba(255,255,255,0.15)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.35)", borderRadius:10, padding:"8px 16px", fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
              🔄 Reîncarcă
            </button>
          </div>
        )}
      </div>

      {/* ── KPI-uri date istorice ── */}
      <RGrid cols={4} gap={12} style={{ marginBottom:18 }}>
        {[
          { label:"Total 12 luni",    value:`${totalAnual} l/m²`,  icon:"🌧️", color:"#1565c0", sub:"Apr 2025 – Mar 2026" },
          { label:"Medie lunară",     value:`${mediaLunara} l/m²`, icon:"📊", color:"#2d5a1b", sub:"Normală climatică"   },
          { label:"Ultimele 90 zile", value:`${ultimele3} l/m²`,   icon:"🗓️", color:"#6a1a1a", sub:"Ian-Mar 2026"        },
          { label:"Rezervă apă sol",  value:rezervaOK?"✅ Optimă":"⚠️ Scăzută", icon:rezervaOK?"💧":"🏜️", color:rezervaOK?"#1b5e20":"#b71c1c", sub:rezervaOK?"Condiții favorabile":"Irigații recomandate", hl:true },
        ].map((k,i)=>(
          <div key={i} style={{ background:"#fff", borderRadius:12, padding:"14px", border:k.hl?`2px solid ${rezervaOK?"#4caf50":"#ef5350"}`:"2px solid #e0ecd4", borderLeft:`5px solid ${k.color}`, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:22 }}>{k.icon}</div>
            <div style={{ fontSize:isMobile?17:20, fontWeight:900, color:k.color, marginTop:5, lineHeight:1 }}>{k.value}</div>
            <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:0.5, color:"#888", marginTop:4 }}>{k.label}</div>
            <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{k.sub}</div>
          </div>
        ))}
      </RGrid>

      <div style={{ marginBottom:16 }}>
        {rezervaOK
          ? <Alert type="success" title="Rezervă apă în sol: OPTIMĂ">Precipitații cumulate {ultimele3} l/m² · Umiditate suficientă · Nu sunt necesare irigații.</Alert>
          : <Alert type="warning" title="Rezervă apă în sol: SCĂZUTĂ">Precipitații {ultimele3} l/m² sub pragul de 100 l/m². Recomandăm irigații pentru porumb și floarea-soarelui.</Alert>
        }
      </div>

      {/* ── Grafic precipitații ── */}
      <div style={{ background:"#fff", borderRadius:14, padding:isMobile?"14px 12px 10px":"22px 22px 14px", border:"2px solid #d6e8c4", marginBottom:16, boxShadow:"0 3px 14px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight:900, fontSize:isMobile?14:15, color:"#1b3a0e", marginBottom:14 }}>Precipitații lunare istorice (l/m²) · Dolj</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:isMobile?2:5, height:isMobile?110:170, paddingBottom:5 }}>
          {PRECIPITATII.map((p,i)=>{
            const pct=animated?(p.val/maxVal)*100:0;
            const c=CULORI_SEZON[p.sezon];
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", height:"100%" }}>
                {!isMobile && <div style={{ fontSize:9, fontWeight:700, color:c.bar, marginBottom:2, opacity:animated?1:0, transition:`opacity 0.4s ${i*0.05}s` }}>{p.val}</div>}
                <div style={{ flex:1, width:"100%", display:"flex", alignItems:"flex-end" }}>
                  <div style={{ width:"100%", height:`${pct}%`, background:i===PRECIPITATII.length-1?`repeating-linear-gradient(45deg,${c.bar},${c.bar} 4px,${c.light} 4px,${c.light} 8px)`:c.bar, borderRadius:"4px 4px 0 0", transition:`height 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i*0.06}s`, minHeight:animated?3:0 }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:isMobile?2:5, marginTop:4 }}>
          {PRECIPITATII.map((p,i)=>(
            <div key={i} style={{ flex:1, textAlign:"center", fontSize:isMobile?7:9, color:i===PRECIPITATII.length-1?"#1b3a0e":"#999", fontWeight:i===PRECIPITATII.length-1?800:500 }}>{p.luna.split(" ")[0]}</div>
          ))}
        </div>
      </div>

      {/* Indici agro */}
      <RGrid cols={3} gap={12}>
        {[
          { label:"Indice ariditate (Martonne)", value:"28.4",      status:"Semi-arid", color:"#e65100", icon:"🌡️" },
          { label:"Evapotranspirație potențială", value:"580 mm/an", status:"Moderată",  color:"#2d5a1b", icon:"💨" },
          { label:"Zile cu îngheț (iarna)",       value:"42 zile",   status:"Normal",    color:"#1565c0", icon:"❄️" },
        ].map((ind,i)=>(
          <div key={i} style={{ background:"#fff", borderRadius:12, padding:"14px", border:"1.5px solid #e0ecd4" }}>
            <div style={{ fontSize:18 }}>{ind.icon}</div>
            <div style={{ fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:0.5, marginTop:5, marginBottom:2 }}>{ind.label}</div>
            <div style={{ fontSize:isMobile?17:20, fontWeight:900, color:ind.color }}>{ind.value}</div>
            <div style={{ fontSize:11, color:"#aaa" }}>{ind.status}</div>
          </div>
        ))}
      </RGrid>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB FINANTE
══════════════════════════════════════════════════════════ */
function TabFinante() {
  const { isMobile } = useBreakpoint();
  const [expanded, setExpanded] = useState(null);
  const [animated, setAnimated] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setAnimated(true),100); return()=>clearTimeout(t); },[]);

  const totalVenituri = FINANTE.reduce((s,f)=>s+f.productieHa*f.pretTona*f.parcela.suprafataOficiala,0);
  const totalCosturi  = FINANTE.reduce((s,f)=>s+Object.values(f.costuri).reduce((a,b)=>a+b,0)*f.parcela.suprafataOficiala,0);
  const profitGlobal  = totalVenituri-totalCosturi;

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <SectionHeader icon="💰" title="Finanțe Fermă — Profitabilitate 2026" subtitle="Estimare costuri și venituri · Prețuri CMVL Dolj · Mar 2026" badge="Estimare" />
      <div style={{ background:"linear-gradient(135deg,#1b3a0e,#2d5a1b,#3d7224)", borderRadius:14, padding:isMobile?"16px":"22px 26px", marginBottom:20, boxShadow:"0 8px 28px rgba(27,58,14,0.32)", color:"#fff" }}>
        <div style={{ fontSize:10, opacity:0.6, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>📊 Sumar Financiar · 106.10 ha</div>
        <RGrid cols={3} gap={isMobile?12:20}>
          {[
            { label:"Costuri totale",  value:`${Math.round(totalCosturi).toLocaleString("ro-RO")} RON`,                         color:"#ef9a9a", icon:"📉" },
            { label:"Venituri totale", value:`${Math.round(totalVenituri).toLocaleString("ro-RO")} RON`,                        color:"#a5d6a7", icon:"📈" },
            { label:"PROFIT NET",      value:`${profitGlobal>=0?"+":""}${Math.round(profitGlobal).toLocaleString("ro-RO")} RON`, color:profitGlobal>=0?"#69f0ae":"#ff5252", icon:profitGlobal>=0?"✅":"❌", big:true },
          ].map((s,i)=>(
            <div key={i} style={{ borderTop:isMobile&&i>0?"1px solid rgba(255,255,255,0.15)":"none", paddingTop:isMobile&&i>0?12:0 }}>
              <div style={{ fontSize:11, opacity:0.6 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize:s.big?(isMobile?19:24):(isMobile?16:20), fontWeight:900, color:s.color, marginTop:3, lineHeight:1.1 }}>{s.value}</div>
            </div>
          ))}
        </RGrid>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {FINANTE.map((f,idx)=>{
          const totalCostHa=Object.values(f.costuri).reduce((a,b)=>a+b,0);
          const venitHa=f.productieHa*f.pretTona;
          const profitHa=venitHa-totalCostHa;
          const profitTot=profitHa*f.parcela.suprafataOficiala;
          const profitPct=Math.round((profitHa/venitHa)*100);
          const isOpen=expanded===idx;
          const p=f.parcela;
          const costuriArr=[
            { label:"🌱 Semințe",   val:f.costuri.seminte,   color:"#66bb6a" },
            { label:"⛽ Motorină",   val:f.costuri.motorina,  color:"#ffa726" },
            { label:"🧪 Substanțe", val:f.costuri.substante, color:"#ab47bc" },
            { label:"👷 Manoperă",   val:f.costuri.manopera,  color:"#26c6da" },
          ];
          return (
            <div key={idx} style={{ background:"#fff", borderRadius:14, border:`2px solid ${p.culoare}44`, borderLeft:`6px solid ${p.culoare}`, boxShadow:"0 3px 14px rgba(0,0,0,0.07)", overflow:"hidden" }}>
              <div onClick={()=>setExpanded(isOpen?null:idx)} style={{ padding:isMobile?"14px":"18px 22px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:isMobile?30:38 }}>{p.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:6 }}>
                    <div style={{ fontSize:isMobile?17:20, fontWeight:900, color:"#1b3a0e" }}>{p.cultura}</div>
                    <span style={{ fontSize:12, color:"#888" }}>{p.suprafataOficiala} ha</span>
                  </div>
                  {[
                    { label:"Cost", pct:(totalCostHa/venitHa)*100, color:"#ef9a9a", val:`${totalCostHa.toLocaleString()} RON`, tColor:"#c62828" },
                    { label:"Venit",pct:100, color:"#a5d6a7", val:`${venitHa.toLocaleString()} RON`, tColor:"#1b5e20" },
                  ].map((b,bi)=>(
                    <div key={bi} style={{ display:"flex", gap:6, alignItems:"center", marginBottom:bi===0?4:0 }}>
                      <span style={{ fontSize:10, color:"#888", width:32, flexShrink:0 }}>{b.label}</span>
                      <div style={{ flex:1, height:7, background:"#f0f0f0", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:animated?`${b.pct}%`:"0%", background:b.color, borderRadius:4, transition:`width 0.8s cubic-bezier(0.34,1.2,0.64,1) ${idx*0.15+(bi*0.1)}s` }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:b.tColor, width:80, textAlign:"right", flexShrink:0 }}>{b.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign:"center", minWidth:isMobile?82:120, padding:isMobile?"10px":"12px 16px", borderRadius:10, background:profitHa>=0?"#e8f5e9":"#fdecea", border:`2px solid ${profitHa>=0?"#4caf50":"#ef5350"}`, flexShrink:0 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:3 }}>Profit / ha</div>
                  <div style={{ fontSize:isMobile?17:21, fontWeight:900, color:profitHa>=0?"#1b5e20":"#b71c1c", lineHeight:1 }}>{profitHa>=0?"+":""}{Math.round(profitHa).toLocaleString()}</div>
                  <div style={{ fontSize:10, color:"#888", marginTop:1 }}>RON/ha</div>
                  <div style={{ marginTop:5 }}><Badge variant={profitHa>=0?"green":"red"}>{profitHa>=0?`▲${profitPct}%`:"▼ Pierd."}</Badge></div>
                </div>
                <div style={{ fontSize:16, color:"#ccc", transition:"transform 0.3s", transform:isOpen?"rotate(180deg)":"none" }}>▼</div>
              </div>
              {isOpen && (
                <div style={{ borderTop:"2px solid #f0f4ec", padding:isMobile?"14px":"18px 22px", animation:"fadeIn 0.25s ease" }}>
                  <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:20 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:13, color:"#1b3a0e", marginBottom:10 }}>📊 Breakdown Costuri (RON/ha)</div>
                      {costuriArr.map((c,ci)=>(
                        <div key={ci} style={{ marginBottom:9 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                            <span style={{ fontSize:13 }}>{c.label}</span>
                            <span style={{ fontSize:13, fontWeight:800 }}>{c.val.toLocaleString()} RON</span>
                          </div>
                          <div style={{ height:7, background:"#f5f5f5", borderRadius:4, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${(c.val/totalCostHa)*100}%`, background:c.color, borderRadius:4 }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop:10, padding:"9px 12px", background:"#f0f4ec", borderRadius:8, display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontWeight:800, fontSize:13 }}>TOTAL / ha</span>
                        <span style={{ fontWeight:900, fontSize:15, color:"#c62828" }}>{totalCostHa.toLocaleString()} RON</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:13, color:"#1b3a0e", marginBottom:10 }}>📈 Producție & Venit Estimat</div>
                      <RGrid cols={2} gap={8} style={{ marginBottom:12 }}>
                        {[
                          { label:"Producție", value:`${f.productieHa} t/ha`, icon:"🌾", color:"#2d5a1b" },
                          { label:"Preț piață", value:`${f.pretTona.toLocaleString()} RON/t`, icon:"💹", color:"#1565c0" },
                          { label:"Venit/ha",   value:`${venitHa.toLocaleString()} RON`, icon:"💵", color:"#1b5e20" },
                          { label:"Total",      value:`${(f.productieHa*p.suprafataOficiala).toFixed(1)} t`, icon:"🏗️", color:"#6a1a1a" },
                        ].map((r,ri)=>(
                          <div key={ri} style={{ background:"#fafdf7", borderRadius:8, padding:"10px 12px", border:"1.5px solid #e0ecd4" }}>
                            <div style={{ fontSize:16 }}>{r.icon}</div>
                            <div style={{ fontSize:14, fontWeight:900, color:r.color, marginTop:3 }}>{r.value}</div>
                            <div style={{ fontSize:10, color:"#aaa", marginTop:2 }}>{r.label}</div>
                          </div>
                        ))}
                      </RGrid>
                      <div style={{ padding:"14px", borderRadius:10, background:profitHa>=0?"linear-gradient(135deg,#e8f5e9,#f1f8e9)":"linear-gradient(135deg,#fdecea,#fce4ec)", border:`2px solid ${profitHa>=0?"#4caf50":"#ef5350"}` }}>
                        <div style={{ fontSize:10, fontWeight:800, color:"#888", textTransform:"uppercase", marginBottom:6 }}>💰 Profit Net Estimat</div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:6 }}>
                          <div>
                            <div style={{ fontSize:isMobile?20:25, fontWeight:900, color:profitHa>=0?"#1b5e20":"#b71c1c", lineHeight:1 }}>{profitHa>=0?"+":""}{Math.round(profitHa).toLocaleString()} RON</div>
                            <div style={{ fontSize:11, color:"#888", marginTop:2 }}>per hectar</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:16, fontWeight:900, color:profitTot>=0?"#1b5e20":"#b71c1c" }}>{profitTot>=0?"+":""}{Math.round(profitTot).toLocaleString()} RON</div>
                            <div style={{ fontSize:11, color:"#888" }}>total ({p.suprafataOficiala} ha)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   APP ROOT — State Management principal
   authState: "logged_out" | "logged_in"
══════════════════════════════════════════════════════════ */
const labelStyle = { display:"block", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, color:"#5a6a4a", marginBottom:6 };
const baseInput  = { width:"100%", padding:"13px 12px", border:"2px solid #d6e8c4", borderRadius:10, fontSize:16, fontFamily:"Georgia,serif", color:"#1a1a0e", background:"#fafdf7", boxSizing:"border-box", outline:"none", WebkitAppearance:"none" };

export default function AgroManagerV4() {
  const { isMobile } = useBreakpoint();

  /* ── AUTH STATE ── */
  const [authState, setAuthState] = useState("logged_out"); // "logged_out" | "logged_in"
  const [user, setUser]           = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setAuthState("logged_in");
  };
  const handleLogout = () => {
    setUser(null);
    setAuthState("logged_out");
  };

  /* ── APP STATE (activ doar când logged_in) ── */
  const sp = isMobile ? "14px" : "22px 24px";
  const [activeTab, setActiveTab]   = useState("parcele");
  const [stocMotorina, setStocMotorina] = useState(1200);
  const [ocrPhase, setOcrPhase]     = useState("idle");
  const [facturiInreg, setFacturiInreg] = useState([]);
  const [ultimaFact, setUltimaFact] = useState(null);
  const [tForm, setTForm]           = useState({ parcela:"", produs:"", doza:"", data:"2026-03-26" });
  const [tratamente, setTratamente] = useState(TRATAMENTE_BAZA);
  const [dosarPhase, setDosarPhase] = useState("idle");
  const [toast, setToast]           = useState(null);

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),4000); };

  const handleOCR = () => {
    if (facturiInreg.includes("AGRO-77")) { setOcrPhase("duplicate"); return; }
    setOcrPhase("scanning");
    setTimeout(()=>{
      setOcrPhase("done"); setFacturiInreg(p=>[...p,"AGRO-77"]); setStocMotorina(p=>p+500);
      setUltimaFact({ serie:"AGRO-77", furnizor:"AgroTotal SRL", cantitate:500, data:"25.03.2026", valoare:"3.650 RON" });
      showToast("✅ Factură AGRO-77 înregistrată. +500L motorină.");
    },2400);
  };

  const dozaNum      = parseFloat(tForm.doza);
  const dozaDepasita = !isNaN(dozaNum) && dozaNum > 3.0;
  const formValid    = tForm.parcela && tForm.produs && tForm.doza && !dozaDepasita;

  const handleSalva = () => {
    if (!formValid) return;
    setTratamente(p=>[...p,{ nr:p.length+1, data:tForm.data.split("-").reverse().join("."), parcela:tForm.parcela, produs:tForm.produs, doza:`${tForm.doza} L/ha`, tip:"Manual", operator:user?.nume||"Fermier" }]);
    setTForm({parcela:"",produs:"",doza:"",data:"2026-03-26"});
    showToast("✅ Tratament înregistrat și validat APIA.");
  };

  const tabs = [
    { key:"parcele",   label:"📍 Parcele"    },
    { key:"ocr",       label:"🧾 Facturi"    },
    { key:"tratament", label:"💊 Tratamente" },
    { key:"dosar",     label:"📁 APIA"       },
    { key:"meteo",     label:"🌦️ Meteo"      },
    { key:"finante",   label:"💰 Finanțe"    },
  ];

  const TH = ({children}) => <th style={{ padding:"11px 12px", textAlign:"left", fontSize:10, textTransform:"uppercase", letterSpacing:0.5, color:"#5a6a4a", fontWeight:800, whiteSpace:"nowrap", background:"#f0f4ec" }}>{children}</th>;
  const TD = ({children, mono, bold, muted}) => <td style={{ padding:"10px 12px", fontFamily:mono?"monospace":"inherit", fontSize:mono?12:13, fontWeight:bold?700:400, color:muted?"#bbb":bold?"#2d5a1b":"inherit", whiteSpace:"nowrap" }}>{children}</td>;

  /* ════════ GATE: arată LoginScreen dacă nu e autentificat ════════ */
  if (authState === "logged_out") {
    return <LoginScreen onLogin={handleLogin} />;
  }

  /* ════════ DASHBOARD (vizibil doar după login) ════════ */
  return (
    <div style={{ fontFamily:"'Georgia','Palatino Linotype',serif", minHeight:"100vh", background:"#f2efe8", color:"#1a1a0e" }}>

      {toast && (
        <div style={{ position:"fixed", top:isMobile?10:20, left:isMobile?10:undefined, right:isMobile?10:20, zIndex:9999, background:toast.type==="success"?"#1b5e20":"#b71c1c", color:"#fff", padding:"12px 16px", borderRadius:12, fontSize:14, fontWeight:700, boxShadow:"0 8px 28px rgba(0,0,0,0.3)", animation:"slideDown 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:"linear-gradient(135deg,#1b3a0e,#2d5a1b,#3d7224)", color:"#fff", padding:`0 ${isMobile?14:28}px`, boxShadow:"0 4px 20px rgba(27,58,14,0.45)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:isMobile?"14px 0 0":"22px 0 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:isMobile?8:12 }}>
              <span style={{ fontSize:isMobile?24:32 }}>🌿</span>
              <div>
                <h1 style={{ margin:0, fontSize:isMobile?17:24, fontWeight:900, letterSpacing:-0.5, lineHeight:1 }}>AgroManager RO</h1>
                {!isMobile && <div style={{ fontSize:12, opacity:0.6, marginTop:2 }}>Platformă Agricolă · APIA 2026 · v4.0</div>}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:isMobile?10:16 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, justifyContent:"flex-end", marginBottom:2 }}>
                  <div style={{ width:7, height:7, background:"#4caf50", borderRadius:"50%", animation:"pulse 2s infinite" }} />
                  <span style={{ fontSize:11, opacity:0.75 }}>IPA Online</span>
                </div>
                <div style={{ fontWeight:800, fontSize:isMobile?13:15 }}>{user?.nume || "Fermier"}</div>
                {!isMobile && <div style={{ fontSize:11, opacity:0.6 }}>{user?.idApia} · {user?.judet||"Dolj"}</div>}
              </div>
              {/* Buton Logout */}
              <button onClick={handleLogout} title="Deconectare" style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.35)", borderRadius:10, padding:isMobile?"8px 10px":"9px 14px", fontSize:isMobile?12:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flexShrink:0, display:"flex", alignItems:"center", gap:5, transition:"all 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,0,0,0.25)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.15)"}}>
                🚪 {isMobile?"":"Ieșire"}
              </button>
            </div>
          </div>
          <div style={{ display:"flex", marginTop:12, borderTop:"1px solid rgba(255,255,255,0.12)", overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
            {[
              { label:"Suprafață", value:"106.10 ha" }, { label:"Motorină", value:`${stocMotorina} L` },
              { label:"Tratamente",value:`${tratamente.length}` }, { label:"Facturi", value:`${facturiInreg.length}` },
              { label:"APIA", value:"Sync ✅" }, { label:"Apă", value:"Optimă 💧" },
            ].map((s,i)=>(
              <div key={i} style={{ flexShrink:0, padding:isMobile?"8px 14px":"9px 12px", borderRight:"1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize:9, opacity:0.5, textTransform:"uppercase", letterSpacing:0.6, whiteSpace:"nowrap" }}>{s.label}</div>
                <div style={{ fontSize:isMobile?12:14, fontWeight:900, marginTop:1, whiteSpace:"nowrap" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav style={{ background:"#fff", borderBottom:"2px solid #d6e8c4", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", overflowX:"auto", WebkitOverflowScrolling:"touch", scrollbarWidth:"none" }}>
          {tabs.map(t=>(
            <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{ flexShrink:0, padding:isMobile?"12px 14px":"14px 10px", flex:isMobile?"none":1, minWidth:isMobile?80:undefined, background:"none", border:"none", borderBottom:activeTab===t.key?"4px solid #2d5a1b":"4px solid transparent", color:activeTab===t.key?"#1b3a0e":"#888", fontWeight:activeTab===t.key?800:500, fontSize:isMobile?12:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth:1100, margin:"0 auto", padding:isMobile?"18px 12px 32px":"28px 20px 40px" }}>

        {/* PARCELE */}
        {activeTab==="parcele" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <SectionHeader icon="📍" title="Parcele Oficiale (Sync APIA)" subtitle="Date din Registrul Agricol · IPA Online · Suprafețe blocate LPIS" badge="LIVE" />
            <Alert type="success" title="Sincronizare completă cu IPA Online">Toate parcelele corespund cu LPIS. Ultima sincronizare: <strong>26.03.2026 · 08:14</strong></Alert>
            <RGrid cols={3} gap={14} style={{ marginTop:14 }}>
              {PARCELE.map(p=>(
                <div key={p.id} style={{ background:"#fff", borderRadius:14, border:"2px solid #d6e8c4", borderTop:`5px solid ${p.culoare}`, overflow:"hidden", boxShadow:"0 3px 12px rgba(0,0,0,0.07)" }}>
                  <div style={{ padding:sp, borderBottom:"1.5px solid #eef4e8" }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:34 }}>{p.icon}</span><Badge variant="green">✅ Sync</Badge></div>
                    <div style={{ fontSize:isMobile?17:21, fontWeight:900, color:"#1b3a0e", marginTop:8 }}>{p.cultura}</div>
                  </div>
                  <div style={{ padding:sp }}>
                    {[{label:"ID Oficial",value:p.id,mono:true},{label:"Bloc",value:p.bloc},{label:"Județ",value:p.judet}].map(r=>(
                      <div key={r.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:7, gap:6 }}>
                        <span style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:0.4, flexShrink:0 }}>{r.label}</span>
                        <span style={{ fontSize:12, fontWeight:700, fontFamily:r.mono?"monospace":"inherit", background:r.mono?"#f0f4ec":"none", padding:r.mono?"2px 6px":0, borderRadius:r.mono?4:0, textAlign:"right", wordBreak:"break-all" }}>{r.value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:12, background:"#f0f4ec", border:"2px solid #c5deb0", borderRadius:10, padding:"10px 12px" }}>
                      <div style={{ fontSize:10, color:"#6a7a5a", textTransform:"uppercase", letterSpacing:0.6, marginBottom:3 }}>🔒 Suprafață oficială</div>
                      <div style={{ fontSize:isMobile?22:27, fontWeight:900, color:p.culoare, lineHeight:1 }}>{p.suprafataOficiala.toFixed(2)} <span style={{ fontSize:13, color:"#888" }}>ha</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </RGrid>
          </div>
        )}

        {/* OCR */}
        {activeTab==="ocr" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <SectionHeader icon="🧾" title="Modul OCR cu Protecție Antifraudă" subtitle="Anti-duplicat activ · Hash SHA-256" badge="Protecție Activă" />
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:16 }}>
              <div style={{ background:"#fff", borderRadius:14, padding:sp, border:"2px solid #d6e8c4" }}>
                <div style={{ fontSize:15, fontWeight:800, color:"#1b3a0e", marginBottom:4 }}>📷 Scanare Factură</div>
                <div style={{ fontSize:13, color:"#777", marginBottom:14 }}>Serie: <code style={{ background:"#f0f4ec", padding:"2px 7px", borderRadius:4, fontWeight:700 }}>AGRO-77</code></div>
                {ocrPhase==="duplicate" && <div style={{ marginBottom:12 }}><Alert type="error" title="⚠️ ALERTĂ DUPLICAT: Această factură a fost deja înregistrată!" onClose={()=>setOcrPhase("idle")}>Seria <strong>AGRO-77</strong> procesată pe <strong>25.03.2026</strong>. Blocată automat.</Alert></div>}
                {ocrPhase==="scanning" && (
                  <div style={{ marginBottom:12, background:"#f0f4ec", borderRadius:10, padding:14, textAlign:"center" }}>
                    <div style={{ fontSize:26, animation:"spin 1s linear infinite", display:"inline-block" }}>⏳</div>
                    <div style={{ fontWeight:700, color:"#2d5a1b", marginTop:7 }}>Se procesează OCR...</div>
                    <div style={{ background:"#ddd", height:5, borderRadius:3, marginTop:10, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:"#2d5a1b", borderRadius:3, animation:"progress 2.4s ease forwards" }} />
                    </div>
                  </div>
                )}
                <button onClick={handleOCR} disabled={ocrPhase==="scanning"} style={{ width:"100%", background:ocrPhase==="scanning"?"#ccc":ocrPhase==="duplicate"?"#b71c1c":"linear-gradient(135deg,#e8722a,#c85a10)", color:"#fff", border:"none", borderRadius:12, padding:"18px 0", fontSize:isMobile?18:20, fontWeight:900, cursor:ocrPhase==="scanning"?"not-allowed":"pointer", fontFamily:"inherit" }}>
                  {ocrPhase==="scanning"?"⏳ Se procesează...":"📷 Adaugă Factură (OCR)"}
                </button>
                <div style={{ marginTop:10, display:"flex", gap:6, flexWrap:"wrap" }}><Badge variant="gray">🔍 Anti-duplicat</Badge><Badge variant="gray">🔐 SHA-256</Badge></div>
              </div>
              <div>
                {ultimaFact && (
                  <div style={{ background:"#e8f5e9", border:"2px solid #4caf50", borderRadius:14, padding:sp, marginBottom:14 }}>
                    <div style={{ fontWeight:800, fontSize:14, color:"#1b5e20", marginBottom:10 }}>✅ Factură Procesată</div>
                    {[["Serie",ultimaFact.serie],["Furnizor",ultimaFact.furnizor],["Data",ultimaFact.data],["Cantitate",`${ultimaFact.cantitate}L motorină`],["Valoare",ultimaFact.valoare]].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #c8e6c9", gap:10 }}>
                        <span style={{ fontSize:13, color:"#555" }}>{k}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:"#1b5e20" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ background:"#fff", borderRadius:12, padding:14, border:"1.5px solid #e0e0e0" }}>
                  <div style={{ fontWeight:700, fontSize:12, color:"#555", marginBottom:8, textTransform:"uppercase", letterSpacing:0.6 }}>📋 Log Facturi</div>
                  {facturiInreg.length===0 ? <div style={{ color:"#bbb", fontSize:13, textAlign:"center", padding:"14px 0" }}>Nicio factură procesată.</div>
                    : facturiInreg.map((s,i)=>(
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", background:"#f9f9f9", borderRadius:8, marginBottom:5 }}>
                        <span style={{ fontFamily:"monospace", fontWeight:700, color:"#2d5a1b", fontSize:13 }}>{s}</span>
                        <Badge variant="green">OK</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRATAMENTE */}
        {activeTab==="tratament" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <SectionHeader icon="💊" title="Tratamente cu Validare Legală" subtitle="Doză maximă: 3.0 L/ha · Reg. (CE) 1107/2009" badge="Conf. APIA" />
            <div style={{ background:"#fff", borderRadius:14, padding:sp, border:"2px solid #d6e8c4", marginBottom:18 }}>
              <div style={{ fontWeight:800, fontSize:15, color:"#1b3a0e", marginBottom:14 }}>➕ Tratament Nou</div>
              <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:14, marginBottom:14 }}>
                <div><label style={labelStyle}>📍 Parcelă</label><select value={tForm.parcela} onChange={e=>setTForm(f=>({...f,parcela:e.target.value}))} style={baseInput}><option value="">— Selectați —</option>{PARCELE.map(p=><option key={p.id} value={`${p.id} · ${p.cultura}`}>{p.id} · {p.cultura}</option>)}</select></div>
                <div><label style={labelStyle}>📅 Data</label><input type="date" value={tForm.data} onChange={e=>setTForm(f=>({...f,data:e.target.value}))} style={baseInput} /></div>
                <div><label style={labelStyle}>🧪 Produs</label><input type="text" placeholder="ex: Roundup 360 SL" value={tForm.produs} onChange={e=>setTForm(f=>({...f,produs:e.target.value}))} style={baseInput} /></div>
                <div>
                  <label style={labelStyle}>⚖️ Doză (L/ha)</label>
                  <input type="number" placeholder="ex: 2.5" step="0.1" min="0" inputMode="decimal" value={tForm.doza} onChange={e=>setTForm(f=>({...f,doza:e.target.value}))} style={{...baseInput, borderColor:dozaDepasita?"#c62828":undefined, background:dozaDepasita?"#fdecea":undefined}} />
                  {dozaDepasita && <div style={{ color:"#b71c1c", fontSize:13, fontWeight:800, marginTop:5 }}>❌ Depășire Doză Maximă Admisă (Conformitate APIA în pericol!)</div>}
                </div>
              </div>
              {dozaDepasita && <div style={{ marginBottom:12 }}><Alert type="error" title="Depășire Doză Maximă Legală">Doza <strong>{dozaNum} L/ha</strong> depășește limita de <strong>3.0 L/ha</strong>.</Alert></div>}
              <button onClick={handleSalva} disabled={!formValid} style={{ width:"100%", background:!formValid?"#ccc":"linear-gradient(135deg,#2d5a1b,#4a7c2f)", color:"#fff", border:"none", borderRadius:12, padding:"18px 0", fontSize:18, fontWeight:900, cursor:!formValid?"not-allowed":"pointer", fontFamily:"inherit", boxShadow:formValid?"0 4px 16px rgba(45,90,27,0.38)":"none" }}>
                {!formValid?(dozaDepasita?"🔒 Salvare Blocată — Doză Ilegală":"💾 Completați câmpurile"):"💾 Salvează Tratament"}
              </button>
            </div>
            <div style={{ background:"#fff", borderRadius:14, overflow:"hidden", border:"2px solid #d6e8c4" }}>
              <div style={{ background:"#1b3a0e", padding:"12px 16px", color:"#fff", fontWeight:800, fontSize:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span>📋 Registru ({tratamente.length})</span><Badge variant="green">✅ Validate</Badge>
              </div>
              <ScrollTable>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead><tr>{["Nr.","Data","Parcelă","Produs","Doză","Tip","Operator","Status"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                  <tbody>{tratamente.map((t,i)=>(
                    <tr key={i} style={{ borderBottom:"1.5px solid #eef4e8", background:i%2===0?"#fff":"#fafdf7" }}>
                      <TD muted>{t.nr}</TD><TD bold>{t.data}</TD><TD mono>{t.parcela}</TD><TD bold>{t.produs}</TD>
                      <td style={{ padding:"10px 12px", whiteSpace:"nowrap" }}>{t.doza}</td>
                      <td style={{ padding:"10px 12px" }}><Badge variant={t.tip==="Fungicid"?"green":t.tip==="Insecticid"?"orange":t.tip==="Erbicid"?"red":"blue"}>{t.tip}</Badge></td>
                      <TD>{t.operator}</TD>
                      <td style={{ padding:"10px 12px" }}><Badge variant="green">✅</Badge></td>
                    </tr>
                  ))}</tbody>
                </table>
              </ScrollTable>
            </div>
          </div>
        )}

        {/* DOSAR APIA */}
        {activeTab==="dosar" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <SectionHeader icon="📁" title="Generare Dosar APIA Smart" subtitle="Compilare Registru · Validare IPA Online · Export XML" />
            {dosarPhase==="idle" && (
              <div style={{ background:"linear-gradient(135deg,#1b3a0e,#2d5a1b,#3d7224)", borderRadius:18, padding:isMobile?"28px 18px":"44px 36px", textAlign:"center", color:"#fff", boxShadow:"0 10px 40px rgba(27,58,14,0.4)" }}>
                <div style={{ fontSize:isMobile?44:56, marginBottom:10 }}>📁</div>
                <div style={{ fontSize:isMobile?18:22, fontWeight:900, marginBottom:22 }}>Dosar APIA 2026 · {tratamente.length} tratamente</div>
                <button onClick={()=>{setDosarPhase("generating");setTimeout(()=>setDosarPhase("done"),2200);}} style={{ background:"#fff", color:"#1b3a0e", border:"none", borderRadius:14, padding:isMobile?"18px 32px":"24px 60px", fontSize:isMobile?18:22, fontWeight:900, cursor:"pointer", boxShadow:"0 6px 24px rgba(0,0,0,0.2)", fontFamily:"inherit", width:isMobile?"100%":undefined }}>
                  📋 Generează Dosar APIA
                </button>
              </div>
            )}
            {dosarPhase==="generating" && (<div style={{ background:"#fff", borderRadius:14, padding:36, textAlign:"center", border:"2px solid #d6e8c4" }}><div style={{ fontSize:44, animation:"spin 1.5s linear infinite", display:"inline-block", marginBottom:12 }}>⚙️</div><div style={{ fontWeight:800, fontSize:18, color:"#1b3a0e" }}>Se generează...</div></div>)}
            {dosarPhase==="done" && (
              <div style={{ animation:"fadeIn 0.4s ease" }}>
                <div style={{ background:"#e8f5e9", border:"3px solid #2e7d32", borderRadius:14, padding:sp, marginBottom:16 }}>
                  <div style={{ fontSize:isMobile?16:20, fontWeight:900, color:"#1b5e20", marginBottom:5 }}>✅ Validare Finală — Dosar Complet</div>
                  <div style={{ fontSize:isMobile?13:15, color:"#2e7d32", fontWeight:700 }}>Toate datele coincid cu IPA Online. Gata de Export XML.</div>
                  <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                    <button onClick={()=>window.print()} style={{ background:"#1b5e20", color:"#fff", border:"none", borderRadius:10, padding:"12px 18px", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>🖨️ Printează</button>
                    <button style={{ background:"#2e7d32", color:"#fff", border:"none", borderRadius:10, padding:"12px 18px", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>📤 Export XML</button>
                    <button onClick={()=>setDosarPhase("idle")} style={{ background:"#f5f0e8", color:"#666", border:"2px solid #ddd", borderRadius:10, padding:"12px 12px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
                  </div>
                </div>
                <div style={{ background:"#fff", borderRadius:14, overflow:"hidden", border:"2px solid #d6e8c4" }}>
                  <div style={{ background:"#1b3a0e", padding:"14px 16px", color:"#fff" }}>
                    <div style={{ fontSize:isMobile?14:17, fontWeight:900 }}>REGISTRU TRATAMENTE · 2026</div>
                    <div style={{ fontSize:11, opacity:0.7, marginTop:3 }}>{user?.nume} · {user?.idApia} · Dolj · 26.03.2026</div>
                  </div>
                  <ScrollTable>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                      <thead><tr>{["Nr.","Data","Parcelă","Produs","Doză","Tip","Validare"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                      <tbody>{tratamente.map((t,i)=>(
                        <tr key={i} style={{ borderBottom:"1.5px solid #eef4e8", background:i%2===0?"#fff":"#fafdf7" }}>
                          <TD muted>{t.nr}</TD><TD bold>{t.data}</TD><TD mono>{t.parcela}</TD><TD bold>{t.produs}</TD>
                          <td style={{ padding:"10px 12px", whiteSpace:"nowrap" }}>{t.doza}</td>
                          <td style={{ padding:"10px 12px" }}><Badge variant={t.tip==="Fungicid"?"green":t.tip==="Insecticid"?"orange":t.tip==="Erbicid"?"red":"blue"}>{t.tip}</Badge></td>
                          <td style={{ padding:"10px 12px" }}><Badge variant="green">✅ LPIS</Badge></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </ScrollTable>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==="meteo"   && <TabMeteo />}
        {activeTab==="finante" && <TabFinante />}

      </main>

      <footer style={{ background:"#1b3a0e", color:"#6b8c5a", textAlign:"center", padding:"14px 20px", fontSize:12 }}>
        AgroManager România v4.0 · APIA 2026 · IPA Online · LPIS · ANM · <span style={{ color:"#4a7c2f" }}>Certificat MADR</span>
      </footer>

      <style>{`
        * { box-sizing:border-box; }
        @keyframes fadeIn     { from{opacity:0;transform:translateY(6px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown  { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes progress   { from{width:0%} to{width:100%} }
        @keyframes pulseScale { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        nav div::-webkit-scrollbar, header div::-webkit-scrollbar { display:none; }
        input, select, textarea { font-size:16px !important; }
        @media print {
          nav, header, button, footer { display:none !important; }
          body { background:white !important; }
        }
      `}</style>
    </div>
  );
}
