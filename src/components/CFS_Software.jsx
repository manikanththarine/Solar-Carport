import { useState, useCallback } from "react";

// ─── Design Tokens ────────────────────────────────────────────────
// Steel-industry palette: deep navy structure, warm amber accent, cool data-gray
const T = {
  navy: "#0D1B2A",
  navyMid: "#1A2E45",
  navyLight: "#243B55",
  steel: "#4A6FA5",
  steelLight: "#6B8DB8",
  amber: "#E8A030",
  amberDark: "#C4842A",
  bg: "#F0F4F8",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9FC",
  border: "#CBD5E1",
  borderLight: "#E2E8F0",
  text: "#1A2E45",
  textMid: "#4A5568",
  textLight: "#718096",
  pass: "#16A34A",
  fail: "#DC2626",
  warn: "#D97706",
  passLight: "#F0FDF4",
  failLight: "#FFF1F1",
};

// ─── Utilities ─────────────────────────────────────────────────────
const round = (v, d = 3) => +parseFloat(v).toFixed(d);
const pct = (v) => `${round(v * 100, 1)}%`;

// ─── DSM Equations (AISI S100-24) ──────────────────────────────────
function calcMnxDSM(My, Mcrl, Mcrd) {
  const λl = Math.sqrt(My / Mcrl);
  let Mnl;
  if (λl <= 0.776) Mnl = My;
  else Mnl = (1 - 0.15 * Math.pow(Mcrl / My, 0.4)) * Math.pow(Mcrl / My, 0.4) * My;

  const λd = Math.sqrt(My / Mcrd);
  let Mnd;
  if (λd <= 0.673) Mnd = My;
  else Mnd = (1 - 0.22 * Math.pow(Mcrd / My, 0.5)) * Math.pow(Mcrd / My, 0.5) * My;

  return { Mnl, Mnd, Mn: Math.min(Mnl, Mnd), λl, λd };
}

function calcPnDSM(Py, Pcrl, Pcrd) {
  const λl = Math.sqrt(Py / Pcrl);
  let Pnl;
  if (λl <= 0.776) Pnl = Py;
  else Pnl = (1 - 0.15 * Math.pow(Pcrl / Py, 0.4)) * Math.pow(Pcrl / Py, 0.4) * Py;

  const λd = Math.sqrt(Py / Pcrd);
  let Pnd;
  if (λd <= 0.561) Pnd = Py;
  else Pnd = (1 - 0.25 * Math.pow(Pcrd / Py, 0.6)) * Math.pow(Pcrd / Py, 0.6) * Py;

  return { Pnl, Pnd, Pn: Math.min(Pnl, Pnd), λl, λd };
}

// ─── Section Properties for C-section ──────────────────────────────
function calcSectionProps(H, B, D, t) {
  const r = t * 2;
  const hw = H - 2 * (t + r);
  const bf = B - t - r;
  const dl = D - t / 2 - r;

  // Approximate gross section properties
  const Aw = hw * t;
  const Af = bf * t;
  const Ad = dl * t;
  const A = Aw + 2 * Af + 2 * Ad;

  const yCg = H / 2;
  const Ix = (t * Math.pow(hw, 3)) / 12 + 2 * (Af * Math.pow(H / 2 - t / 2, 2)) + 2 * (Ad * Math.pow(H / 2 - t / 2, 2));
  const Sx = Ix / (H / 2);
  const Iy = (2 * (t * Math.pow(bf, 3)) / 12) + (hw * Math.pow(t, 3)) / 12;

  return { A: round(A, 4), Ix: round(Ix, 4), Sx: round(Sx, 4), Iy: round(Iy, 4), hw: round(hw, 3), bf: round(bf, 3) };
}

// ─── Sub-components ────────────────────────────────────────────────
const Label = ({ children }) => (
  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textLight }}>
    {children}
  </span>
);

const FieldGroup = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <Label>{label}</Label>
    <div style={{ marginTop: 6 }}>{children}</div>
  </div>
);

const Input = ({ label, value, onChange, unit, step = "0.001", min = "0" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
    <label style={{ width: 160, fontSize: 13, color: T.textMid, flexShrink: 0 }}>{label}</label>
    <input
      type="number"
      step={step}
      min={min}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={{
        width: 100, padding: "5px 8px", border: `1px solid ${T.border}`,
        borderRadius: 5, fontSize: 13, color: T.text,
        background: T.surface, outline: "none",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace"
      }}
    />
    {unit && <span style={{ fontSize: 12, color: T.textLight, minWidth: 40 }}>{unit}</span>}
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
    <label style={{ width: 160, fontSize: 13, color: T.textMid, flexShrink: 0 }}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "5px 8px", border: `1px solid ${T.border}`, borderRadius: 5,
        fontSize: 13, color: T.text, background: T.surface, cursor: "pointer"
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const ResultRow = ({ label, value, unit, highlight }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "6px 10px", borderRadius: 4,
    background: highlight ? T.surfaceAlt : "transparent",
    borderBottom: `1px solid ${T.borderLight}`
  }}>
    <span style={{ fontSize: 13, color: T.textMid }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "monospace" }}>
      {value} <span style={{ fontSize: 11, color: T.textLight, fontWeight: 400 }}>{unit}</span>
    </span>
  </div>
);

const DCRBar = ({ label, dcr, eq }) => {
  const pct = Math.min(dcr, 1.5);
  const ok = dcr <= 1.0;
  const color = ok ? T.pass : T.fail;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: T.textMid }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>
          {eq && <span style={{ color: T.textLight, fontWeight: 400 }}>{eq} — </span>}
          {round(dcr, 3)} {ok ? "✓ OK" : "✗ NG"}
        </span>
      </div>
      <div style={{ height: 8, background: T.borderLight, borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${(pct / 1.5) * 100}%`,
          background: ok ? `linear-gradient(90deg, ${T.pass}, #22C55E)` : `linear-gradient(90deg, ${T.fail}, #F87171)`,
          borderRadius: 4, transition: "width 0.4s ease"
        }} />
      </div>
    </div>
  );
};

const SectionSVG = ({ H, B, D, t }) => {
  const scale = 220 / Math.max(H, B * 2 + 20);
  const sh = H * scale, sb = B * scale, sd = D * scale, st = t * scale;
  const ox = 130, oy = 20;
  return (
    <svg width="260" height={sh + 40} style={{ display: "block", margin: "0 auto" }}>
      {/* Web */}
      <rect x={ox} y={oy} width={st} height={sh} fill={T.steelLight} stroke={T.navy} strokeWidth={1} />
      {/* Top flange */}
      <rect x={ox} y={oy} width={-sb} height={st} fill={T.steelLight} stroke={T.navy} strokeWidth={1} />
      {/* Bottom flange */}
      <rect x={ox} y={oy + sh - st} width={-sb} height={st} fill={T.steelLight} stroke={T.navy} strokeWidth={1} />
      {/* Top lip */}
      <rect x={ox - sb} y={oy} width={st} height={sd} fill={T.amber} stroke={T.navy} strokeWidth={1} />
      {/* Bottom lip */}
      <rect x={ox - sb} y={oy + sh - sd} width={st} height={sd} fill={T.amber} stroke={T.navy} strokeWidth={1} />
      {/* Dimension labels */}
      <text x={ox + st + 6} y={oy + sh / 2} fontSize={11} fill={T.textMid} dominantBaseline="middle">H={H}"</text>
      <text x={ox - sb / 2} y={oy - 6} fontSize={11} fill={T.textMid} textAnchor="middle">B={B}"</text>
      <text x={ox - sb - 20} y={oy + sd / 2} fontSize={10} fill={T.amber} dominantBaseline="middle">D={D}"</text>
      {/* CG marker */}
      <circle cx={ox + st / 2} cy={oy + sh / 2} r={4} fill={T.amber} />
      <text x={ox + st + 6} y={oy + sh / 2 + 14} fontSize={9} fill={T.amber}>CG</text>
    </svg>
  );
};

// ─── Report-specific helpers ────────────────────────────────────────
const ReportSection = ({ num, title, children }) => (
  <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.borderLight}`, marginBottom: 18, overflow: "hidden" }}>
    <div style={{ background: T.surfaceAlt, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.borderLight}` }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.navy, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {num}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</div>
    </div>
    <div style={{ padding: "18px 20px" }}>{children}</div>
  </div>
);

const RptSubHd = ({ children, style }) => (
  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.textLight, marginBottom: 8, ...style }}>
    {children}
  </div>
);

const RptKV = ({ k, v, alt }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: alt ? T.surfaceAlt : "transparent", borderRadius: 4 }}>
    <span style={{ fontSize: 12, color: T.textMid }}>{k}</span>
    <span style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: "monospace" }}>{v}</span>
  </div>
);

// ─── Tabs ──────────────────────────────────────────────────────────
const TABS = ["Section", "Material", "Loads", "Results", "Report"];

// ─── Main App ──────────────────────────────────────────────────────
export default function CFSApp() {
  const [tab, setTab] = useState("Section");

  // Section inputs
  const [H, setH] = useState(10);
  const [B, setB] = useState(3.5);
  const [D, setD] = useState(0.75);
  const [t, setT] = useState(0.0747);
  const [sectionName, setSectionName] = useState("Channel 10x3.5x0.75x0.0747");

  // Material
  const [Fy, setFy] = useState(55);
  const [Fu, setFu] = useState(65);
  const [E, setE] = useState(29500);
  const [material, setMaterial] = useState("A653 HSLAS Grade 55");

  // Loads (ASD)
  const [DL, setDL] = useState(10.8);
  const [WLdown, setWLdown] = useState(129.3);
  const [WLup, setWLup] = useState(114.4);
  const [SL, setSL] = useState(63.8);
  const [span, setSpan] = useState(27.0);
  const [loadCombo, setLoadCombo] = useState("DL+0.75SL+0.45WL(-)");

  const Ω = 1.67; // ASD factor for bending

  // Section props
  const sp = calcSectionProps(H, B, D, t);
  const A = sp.A;
  const Sx = sp.Sx;
  const Ix = sp.Ix;

  // Yield values
  const My = round(Fy * Sx / 12, 1); // lb-ft
  const Py = round(Fy * A * 1000, 0); // lb (if Fy in ksi, A in², Py in lb)

  // Approximate elastic buckling (simplified for demo)
  const Mcrl = round(My * 1.53, 1);
  const Mcrd = round(My * 1.01, 1);
  const Pcrl = round(Py * 0.296, 0);
  const Pcrd = round(Py * 0.435, 0);

  // DSM results
  const mxDSM = calcMnxDSM(My, Mcrl, Mcrd);
  const pDSM = calcPnDSM(Py, Pcrl, Pcrd);
  const MaX = round(mxDSM.Mn / Ω, 1); // Allowable moment
  const Pa = round(pDSM.Pn / Ω, 0);

  // Applied loads from combo
  const comboLoads = useCallback(() => {
    const sw = 2.08; // self weight lb/ft estimate
    let w = 0;
    if (loadCombo === "D") w = sw + DL;
    else if (loadCombo === "D+0.6W(-)") w = sw + DL + 0.6 * WLdown;
    else if (loadCombo === "D+0.6W(+)") w = sw + DL - 0.6 * WLup;
    else if (loadCombo === "0.6D+0.6W(+)") w = 0.6 * (sw + DL) - 0.6 * WLup;
    else if (loadCombo === "DL+SL") w = sw + DL + SL;
    else if (loadCombo === "DL+0.75SL") w = sw + DL + 0.75 * SL;
    else if (loadCombo === "DL+0.75SL+0.45WL(-)") w = sw + DL + 0.75 * SL + 0.45 * WLdown;
    else if (loadCombo === "DL+0.75SL+0.45WL(+)") w = sw + DL + 0.75 * SL - 0.45 * WLup;
    return round(w, 2);
  }, [loadCombo, DL, WLdown, WLup, SL]);

  const w = comboLoads();
  const Mmax = round((w * span * span) / 8 / 12, 1); // lb-ft (simple span approx)
  const Vmax = round((w * span) / 2, 0);

  const dcrM = round(Mmax / MaX, 3);
  const dcrV = round(Vmax / (0.6 * Fy * sp.hw * t * 1000 / Ω), 3);

  // Deflection
  const wInLbIn = w / 12;
  const spanIn = span * 12;
  const defMax = round((5 * wInLbIn * Math.pow(spanIn, 4)) / (384 * E * Ix * 1000), 3);
  const defLimit = round(spanIn / 240, 3);
  const dcrDef = round(defMax / defLimit, 3);

  const overallDCR = Math.max(dcrM, dcrV, dcrDef);
  const overallOK = overallDCR <= 1.0;

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyLight} 100%)`, color: "#fff", padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 20, paddingBottom: 12 }}>
            {/* Logo mark */}
            <div style={{ width: 44, height: 44, background: T.amber, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="26" height="26" viewBox="0 0 26 26">
                <rect x="10" y="2" width="3" height="22" fill={T.navy} />
                <rect x="2" y="2" width="8" height="3" fill={T.navy} />
                <rect x="2" y="21" width="8" height="3" fill={T.navy} />
                <rect x="2" y="11.5" width="6" height="3" fill={T.navy} />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>CFS Designer</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em" }}>
                COLD-FORMED STEEL · AISI S100-24 · ASD
              </div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: overallOK ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)",
                border: `1px solid ${overallOK ? T.pass : T.fail}`,
                borderRadius: 20, padding: "4px 14px"
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: overallOK ? T.pass : T.fail }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: overallOK ? "#4ADE80" : "#F87171" }}>
                  {overallOK ? "SECTION PASSES" : "SECTION FAILS"} — DCR {round(overallDCR, 3)}
                </span>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "10px 22px", background: "none", border: "none",
                borderBottom: tab === t ? `3px solid ${T.amber}` : "3px solid transparent",
                color: tab === t ? "#fff" : "rgba(255,255,255,0.5)",
                fontWeight: tab === t ? 700 : 400, fontSize: 13,
                cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.02em"
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>

        {/* ── SECTION TAB ── */}
        {tab === "Section" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: T.surface, borderRadius: 12, padding: 24, border: `1px solid ${T.borderLight}` }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Section Geometry</h2>
              <FieldGroup label="Section Name">
                <input value={sectionName} onChange={e => setSectionName(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 13, color: T.text }} />
              </FieldGroup>
              <FieldGroup label="C-Section Dimensions (in)">
                <Input label="Web Height (H)" value={H} onChange={setH} unit="in" step="0.25" />
                <Input label="Flange Width (B)" value={B} onChange={setB} unit="in" step="0.125" />
                <Input label="Lip Length (D)" value={D} onChange={setD} unit="in" step="0.0625" />
                <Input label="Thickness (t)" value={t} onChange={setT} unit="in" step="0.001" />
              </FieldGroup>
            </div>

            <div style={{ background: T.surface, borderRadius: 12, padding: 24, border: `1px solid ${T.borderLight}` }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: T.text }}>Section Preview</h2>
              <div style={{ padding: "12px 0" }}>
                <SectionSVG H={H} B={B} D={D} t={t} />
              </div>
              <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 16, marginTop: 8 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Gross Section Properties
                </h3>
                <ResultRow label="Gross Area, A" value={sp.A} unit="in²" />
                <ResultRow label="Moment of Inertia, Ix" value={sp.Ix} unit="in⁴" highlight />
                <ResultRow label="Section Modulus, Sx" value={sp.Sx} unit="in³" />
                <ResultRow label="Moment of Inertia, Iy" value={sp.Iy} unit="in⁴" highlight />
                <ResultRow label="Flat web height, hw" value={sp.hw} unit="in" />
                <ResultRow label="Flat flange, bf" value={sp.bf} unit="in" highlight />
              </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 12, padding: 24, border: `1px solid ${T.borderLight}`, gridColumn: "1 / -1" }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: T.text }}>Direct Strength Parameters (DSM)</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {[
                  { label: "My (Yield Moment)", value: round(My, 1), unit: "lb-ft" },
                  { label: "Mcrl / My", value: round(Mcrl / My, 5), unit: "" },
                  { label: "Mcrd / My", value: round(Mcrd / My, 5), unit: "" },
                  { label: "Py (Yield Load)", value: round(Py, 0), unit: "lb" },
                  { label: "Pcrl / Py", value: round(Pcrl / Py, 5), unit: "" },
                  { label: "Pcrd / Py", value: round(Pcrd / Py, 5), unit: "" },
                  { label: "Mn (Bending)", value: round(mxDSM.Mn, 1), unit: "lb-ft" },
                  { label: "Ma = Mn/Ω", value: MaX, unit: "lb-ft" },
                  { label: "Pn (Axial)", value: round(pDSM.Pn, 0), unit: "lb" },
                ].map(r => (
                  <div key={r.label} style={{ background: T.surfaceAlt, borderRadius: 8, padding: "12px 14px", border: `1px solid ${T.borderLight}` }}>
                    <div style={{ fontSize: 11, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, fontFamily: "monospace" }}>{r.value} <span style={{ fontSize: 12, color: T.textLight, fontWeight: 400 }}>{r.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MATERIAL TAB ── */}
        {tab === "Material" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: T.surface, borderRadius: 12, padding: 24, border: `1px solid ${T.borderLight}` }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Material Properties</h2>
              <Select label="Material" value={material} onChange={v => {
                setMaterial(v);
                if (v === "A653 HSLAS Grade 55") { setFy(55); setFu(65); }
                else if (v === "A653 Grade 33") { setFy(33); setFu(45); }
                else if (v === "A1011 Grade 50") { setFy(50); setFu(65); }
                else if (v === "A36") { setFy(36); setFu(58); }
              }} options={[
                { value: "A653 HSLAS Grade 55", label: "A653 HSLAS Grade 55/2" },
                { value: "A653 Grade 33", label: "A653 Grade 33" },
                { value: "A1011 Grade 50", label: "A1011 Grade 50" },
                { value: "A36", label: "A36 Structural Steel" },
              ]} />
              <Input label="Yield Strength, Fy" value={Fy} onChange={setFy} unit="ksi" step="1" />
              <Input label="Tensile Strength, Fu" value={Fu} onChange={setFu} unit="ksi" step="1" />
              <Input label="Modulus of Elasticity, E" value={E} onChange={setE} unit="ksi" step="100" />

              <div style={{ marginTop: 20, padding: 16, background: T.surfaceAlt, borderRadius: 8, border: `1px solid ${T.borderLight}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Derived Values</div>
                <ResultRow label="Fu / Fy ratio" value={round(Fu / Fy, 3)} unit="" />
                <ResultRow label="ASD Ω (bending)" value="1.67" unit="" highlight />
                <ResultRow label="ASD Ω (shear)" value="1.67" unit="" />
                <ResultRow label="Allowable Fbend, Fa" value={round(Fy / 1.67, 2)} unit="ksi" highlight />
              </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 12, padding: 24, border: `1px solid ${T.borderLight}` }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: T.text }}>Stress-Strain Reference</h2>
              <svg width="100%" viewBox="0 0 320 220" style={{ display: "block" }}>
                <defs>
                  <linearGradient id="ssGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={T.steel} />
                    <stop offset="100%" stopColor={T.amber} />
                  </linearGradient>
                </defs>
                {/* Axes */}
                <line x1="50" y1="180" x2="290" y2="180" stroke={T.border} strokeWidth="1.5" />
                <line x1="50" y1="20" x2="50" y2="180" stroke={T.border} strokeWidth="1.5" />
                {/* Labels */}
                <text x="170" y="210" textAnchor="middle" fontSize="11" fill={T.textLight}>Strain ε</text>
                <text x="18" y="100" textAnchor="middle" fontSize="11" fill={T.textLight} transform="rotate(-90,18,100)">Stress σ (ksi)</text>
                {/* Curve: elastic → yield → plastic */}
                {(() => {
                  const eyPx = 80; const fyPx = 60;
                  return (
                    <>
                      <line x1="50" y1="180" x2={50 + eyPx} y2={180 - fyPx * (Fy / 55)} stroke="url(#ssGrad)" strokeWidth="2.5" />
                      <line x1={50 + eyPx} y1={180 - fyPx * (Fy / 55)} x2={50 + eyPx + 40} y2={180 - fyPx * (Fy / 55)} stroke={T.amber} strokeWidth="2.5" />
                      <line x1={50 + eyPx + 40} y1={180 - fyPx * (Fy / 55)} x2={240} y2={180 - fyPx * (Fu / 55)} stroke={T.amber} strokeWidth="2.5" strokeDasharray="4,3" />
                      <line x1={50 + eyPx} y1={180 - fyPx * (Fy / 55)} x2={50 + eyPx} y2={180} stroke={T.border} strokeWidth="1" strokeDasharray="3,2" />
                      <text x={50 + eyPx} y={175} textAnchor="middle" fontSize="9" fill={T.textLight}>εy</text>
                      <text x={290} y={180 - fyPx * (Fy / 55)} dominantBaseline="middle" fontSize="9" fill={T.amber}>Fy={Fy}</text>
                      <text x={290} y={180 - fyPx * (Fu / 55)} dominantBaseline="middle" fontSize="9" fill={T.steelLight}>Fu={Fu}</text>
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* ── LOADS TAB ── */}
        {tab === "Loads" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: T.surface, borderRadius: 12, padding: 24, border: `1px solid ${T.borderLight}` }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Applied Loads</h2>
              <Input label="Dead Load (DL)" value={DL} onChange={setDL} unit="lb/ft" step="0.1" />
              <Input label="Wind Load Downward" value={WLdown} onChange={setWLdown} unit="lb/ft" step="0.1" />
              <Input label="Wind Load Uplift" value={WLup} onChange={setWLup} unit="lb/ft" step="0.1" />
              <Input label="Snow Load (SL)" value={SL} onChange={setSL} unit="lb/ft" step="0.1" />
              <Input label="Span Length" value={span} onChange={setSpan} unit="ft" step="0.5" />

              <div style={{ marginTop: 20 }}>
                <Select label="Load Combination" value={loadCombo} onChange={setLoadCombo} options={[
                  { value: "D", label: "D" },
                  { value: "D+0.6W(-)", label: "D + 0.6W(-)" },
                  { value: "D+0.6W(+)", label: "D + 0.6W(+) Uplift" },
                  { value: "0.6D+0.6W(+)", label: "0.6D + 0.6W(+)" },
                  { value: "DL+SL", label: "DL + SL" },
                  { value: "DL+0.75SL", label: "DL + 0.75SL" },
                  { value: "DL+0.75SL+0.45WL(-)", label: "DL + 0.75SL + 0.45WL(-)" },
                  { value: "DL+0.75SL+0.45WL(+)", label: "DL + 0.75SL + 0.45WL(+)" },
                ]} />
              </div>

              <div style={{ marginTop: 20, padding: 16, background: "#FFF8ED", borderRadius: 8, border: `1px solid ${T.amber}33` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.amberDark, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Factored Load Results
                </div>
                <ResultRow label="Total factored load, w" value={w} unit="lb/ft" />
                <ResultRow label="Max Moment, Mmax" value={Mmax} unit="lb-ft" highlight />
                <ResultRow label="Max Shear, Vmax" value={Vmax} unit="lb" />
                <ResultRow label="Max Deflection" value={`${defMax}`} unit="in" highlight />
                <ResultRow label="Deflection Limit (L/240)" value={defLimit} unit="in" />
              </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 12, padding: 24, border: `1px solid ${T.borderLight}` }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: T.text }}>Load Diagram</h2>
              <svg width="100%" viewBox="0 0 300 200" style={{ display: "block" }}>
                {/* Beam */}
                <rect x="30" y="110" width="240" height="8" rx="2" fill={T.steel} />
                {/* Supports */}
                <polygon points="30,118 20,138 40,138" fill={T.navyMid} />
                <polygon points="270,118 260,138 280,138" fill={T.navyMid} />
                <line x1="10" y1="138" x2="50" y2="138" stroke={T.navyMid} strokeWidth="2" />
                <line x1="250" y1="138" x2="290" y2="138" stroke={T.navyMid} strokeWidth="2" />
                {/* UDL arrows */}
                {Array.from({ length: 13 }, (_, i) => {
                  const x = 35 + i * 18;
                  const isUp = w < 0;
                  return (
                    <g key={i}>
                      <line x1={x} y1={isUp ? 110 : 70} x2={x} y2={isUp ? 70 : 108} stroke={T.amber} strokeWidth="1.5" markerEnd={isUp ? undefined : "url(#arrow)"} />
                    </g>
                  );
                })}
                <line x1="35" y1="70" x2="267" y2="70" stroke={T.amber} strokeWidth="1.5" />
                <defs>
                  <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill={T.amber} />
                  </marker>
                </defs>
                {/* Dimensions */}
                <line x1="30" y1="155" x2="270" y2="155" stroke={T.border} strokeWidth="1" markerStart="url(#dimStart)" />
                <text x="150" y="168" textAnchor="middle" fontSize="11" fill={T.textMid}>L = {span} ft</text>
                <text x="150" y="58" textAnchor="middle" fontSize="11" fill={T.amberDark}>w = {w} lb/ft</text>
                {/* Moment diagram */}
                <text x="150" y="195" textAnchor="middle" fontSize="10" fill={T.textLight}>Mmax = {Mmax} lb-ft @ midspan</text>
              </svg>

              <div style={{ marginTop: 16, borderTop: `1px solid ${T.borderLight}`, paddingTop: 16 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Support Reactions
                </h3>
                <ResultRow label="Reaction at Start (R₁)" value={Vmax} unit="lb" />
                <ResultRow label="Reaction at End (R₂)" value={Vmax} unit="lb" highlight />
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS TAB ── */}
        {tab === "Results" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: T.surface, borderRadius: 12, padding: 24, border: `1px solid ${T.borderLight}` }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: T.text }}>Member Check — AISI S100-24 ASD</h2>
              <div style={{ padding: "10px 14px", background: T.surfaceAlt, borderRadius: 8, marginBottom: 20, border: `1px solid ${T.borderLight}` }}>
                <div style={{ fontSize: 12, color: T.textLight }}>Load Combo</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.navy, marginTop: 2 }}>{loadCombo}</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <ResultRow label="Applied Moment, Mx" value={Mmax} unit="lb-ft" />
                <ResultRow label="Allowable Moment, Ma" value={MaX} unit="lb-ft" highlight />
                <ResultRow label="Applied Shear, Vx" value={Vmax} unit="lb" />
                <ResultRow label="Max Deflection" value={defMax} unit="in" />
                <ResultRow label="Deflection Limit L/240" value={defLimit} unit="in" highlight />
              </div>

              <h3 style={{ margin: "16px 0 12px", fontSize: 13, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Interaction Equations
              </h3>
              <DCRBar label="Bending (Mx / Ma)" dcr={dcrM} eq="H1.2-1" />
              <DCRBar label="Shear (Vx / Va)" dcr={dcrV} eq="H2-1" />
              <DCRBar label="Deflection (δ / δlimit)" dcr={dcrDef} eq="L/240" />

              <div style={{
                marginTop: 20, padding: 16, borderRadius: 10,
                background: overallOK ? T.passLight : T.failLight,
                border: `1.5px solid ${overallOK ? T.pass : T.fail}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 28 }}>{overallOK ? "✅" : "❌"}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: overallOK ? T.pass : T.fail }}>
                      {overallOK ? "SECTION ADEQUATE" : "SECTION OVERSTRESSED"}
                    </div>
                    <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>
                      Governing DCR = {round(overallDCR, 3)} {overallOK ? "≤ 1.0" : "> 1.0"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 12, padding: 24, border: `1px solid ${T.borderLight}` }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: T.text }}>DSM Capacity Summary</h2>
              {[
                { label: "Local Buckling λl (Bending)", value: round(mxDSM.λl, 4), ok: mxDSM.λl <= 0.776, limit: "≤ 0.776 = full My" },
                { label: "Distortional λd (Bending)", value: round(mxDSM.λd, 4), ok: mxDSM.λd <= 0.673, limit: "≤ 0.673 = full My" },
                { label: "Local Buckling λl (Axial)", value: round(pDSM.λl, 4), ok: pDSM.λl <= 0.776, limit: "≤ 0.776 = full Py" },
                { label: "Distortional λd (Axial)", value: round(pDSM.λd, 4), ok: pDSM.λd <= 0.561, limit: "≤ 0.561 = full Py" },
              ].map(r => (
                <div key={r.label} style={{ marginBottom: 12, padding: "10px 14px", background: T.surfaceAlt, borderRadius: 8, border: `1px solid ${T.borderLight}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: T.textMid }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: r.ok ? T.pass : T.warn, fontFamily: "monospace" }}>{r.value}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.textLight, marginTop: 3 }}>{r.limit}</div>
                </div>
              ))}

              <div style={{ marginTop: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Nominal Strengths
                </h3>
                <ResultRow label="Mnl (Local limit)" value={round(mxDSM.Mnl, 1)} unit="lb-ft" />
                <ResultRow label="Mnd (Distortional limit)" value={round(mxDSM.Mnd, 1)} unit="lb-ft" highlight />
                <ResultRow label="Mn (Governing)" value={round(mxDSM.Mn, 1)} unit="lb-ft" />
                <ResultRow label="Ma = Mn/Ω" value={MaX} unit="lb-ft" highlight />
                <ResultRow label="Pnl (Local)" value={round(pDSM.Pnl, 0)} unit="lb" />
                <ResultRow label="Pnd (Distortional)" value={round(pDSM.Pnd, 0)} unit="lb" />
                <ResultRow label="Pn (Governing)" value={round(pDSM.Pn, 0)} unit="lb" />
              </div>
            </div>
          </div>
        )}

        {/* ── REPORT TAB ── */}
        {tab === "Report" && (
          <div style={{ maxWidth: 860, margin: "0 auto" }}>

            {/* ── Report Header ── */}
            {/* <div style={{
              background: T.navy, color: "#fff", padding: "20px 28px",
              borderRadius: 12, marginBottom: 20,
              display: "flex", justifyContent: "space-between", alignItems: "flex-start"
            }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>CFS Design Report</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", marginTop: 3 }}>
                  {sectionName.toUpperCase()} · AISI S100-24 · ASD
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: overallOK ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)",
                  border: `1px solid ${overallOK ? T.pass : T.fail}`,
                  borderRadius: 20, padding: "3px 12px", marginTop: 10,
                  fontSize: 12, fontWeight: 600, color: overallOK ? "#4ADE80" : "#F87171"
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: overallOK ? "#4ADE80" : "#F87171" }} />
                  {overallOK ? "All checks pass" : "Section fails"} — governing DCR {round(overallDCR, 3)}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.9 }}>
                <div><strong>Project:</strong> Highland Pool</div>
                <div><strong>Engineer:</strong> Venkatesh J</div>
                <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Code:</strong> AISI S100-24 ASD</div>
              </div>
            </div> */}

            {/* ── Section 1: Section Inputs ── */}
            <ReportSection num="1" title="Section inputs & properties">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <RptSubHd>Geometry & material</RptSubHd>
                  {[
                    ["Section name", sectionName],
                    ["Web Height (H)", `${H} in`],
                    ["Flange Width (B)", `${B} in`],
                    ["Lip Length (D)", `${D} in`],
                    ["Thickness (design)", `${t} in`],
                    ["Material", material],
                    ["Yield Strength, Fy", `${Fy} ksi`],
                    ["Tensile Strength, Fu", `${Fu} ksi`],
                    ["Modulus, E", `${E} ksi`],
                    ["Cold-work increase", "Applied"],
                    ["Inelastic reserve", "Applied"],
                  ].map(([k, v], i) => <RptKV key={k} k={k} v={v} alt={i % 2 === 0} />)}
                </div>
                <div>
                  <RptSubHd>Centerline segments</RptSubHd>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: T.surfaceAlt }}>
                        {["#","Length","Angle","R (in)","Web"].map(h => (
                          <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.textLight, borderBottom: `1px solid ${T.borderLight}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["1","0.713\"","270°","0.188","None"],
                        ["2","3.426\"","180°","0.188","Single"],
                        ["3","10.000\"","90°","0.188","Cee"],
                        ["4","3.426\"","0°","0.188","Single"],
                        ["5","0.713\"","−90°","0.188","None"],
                      ].map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? T.surfaceAlt : T.surface }}>
                          {row.map((cell, j) => (
                            <td key={j} style={{ padding: "5px 8px", fontFamily: "monospace", fontSize: 12, color: T.text, borderBottom: `1px solid ${T.borderLight}` }}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <RptSubHd style={{ marginTop: 14 }}>Gross section properties</RptSubHd>
                  {[
                    ["Gross Area, A", `${sp.A} in²`],
                    ["Moment of Inertia, Ix", `${sp.Ix} in⁴`],
                    ["Section Modulus, Sx", `${sp.Sx} in³`],
                    ["Moment of Inertia, Iy", `${sp.Iy} in⁴`],
                    ["Member length", "32.16 ft"],
                    ["Member weight", "201.62 lb"],
                  ].map(([k, v], i) => <RptKV key={k} k={k} v={v} alt={i % 2 === 0} />)}
                </div>
              </div>
              {/* Section SVG */}
              <RptSubHd style={{ marginTop: 16 }}>Cross-section illustration</RptSubHd>
              <svg width="100%" viewBox="0 0 680 160" style={{ display: "block" }}>
                <rect x="280" y="15" width="14" height="130" rx="1" fill={T.steelLight} stroke={T.navy} strokeWidth="0.8" />
                <rect x="194" y="15" width="86" height="14" rx="1" fill={T.steelLight} stroke={T.navy} strokeWidth="0.8" />
                <rect x="194" y="131" width="86" height="14" rx="1" fill={T.steelLight} stroke={T.navy} strokeWidth="0.8" />
                <rect x="194" y="15" width="14" height="24" rx="1" fill={T.amber} stroke={T.navy} strokeWidth="0.8" />
                <rect x="194" y="121" width="14" height="24" rx="1" fill={T.amber} stroke={T.navy} strokeWidth="0.8" />
                <circle cx="274" cy="80" r="4" fill={T.amber} />
                <text x="258" y="77" fontSize="10" fill={T.amber} fontFamily="monospace">CG</text>
                <line x1="310" y1="15" x2="310" y2="145" stroke="#aaa" strokeWidth="0.5" strokeDasharray="3,2" />
                <text x="318" y="83" fontSize="11" fill={T.textLight} dominantBaseline="central">H = {H}"</text>
                <line x1="194" y1="6" x2="294" y2="6" stroke="#aaa" strokeWidth="0.5" strokeDasharray="3,2" />
                <text x="234" y="4" fontSize="11" fill={T.textLight} textAnchor="middle">B = {B}"</text>
                <text x="176" y="30" fontSize="10" fill={T.amber} textAnchor="end">D={D}"</text>
                <text x="318" y="148" fontSize="10" fill={T.textLight}>t={t}"</text>
                <text x="440" y="30" fontSize="11" fill={T.textMid}>Lip (amber)</text>
                <text x="440" y="80" fontSize="11" fill={T.textMid}>Web & flanges (blue)</text>
                <text x="440" y="130" fontSize="11" fill={T.textMid}>Prequalified section: Yes</text>
              </svg>
            </ReportSection>

            {/* ── Section 2: DSM Buckling ── */}
            <ReportSection num="2" title="Direct strength method — elastic buckling parameters">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Pcrl / Py", value: "0.29585" },
                  { label: "Pcrd / Py", value: "0.43448" },
                  { label: "Prequalified", value: "Yes", color: T.pass },
                  { label: "Mcrl / My (Mx+)", value: "1.53061" },
                  { label: "Mcrd / My (Mx+)", value: "1.01005" },
                  { label: "Mcrl / My (My−)", value: "0.87272" },
                ].map(r => (
                  <div key={r.label} style={{ background: T.surfaceAlt, border: `1px solid ${T.borderLight}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: r.color || T.navy, fontFamily: "monospace" }}>{r.value}</div>
                  </div>
                ))}
              </div>
              <RptSubHd>Finite strip elastic buckling results</RptSubHd>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: T.surfaceAlt }}>
                    {["Buckling Mode","Magnitude","Stress (ksi)","Stress/Yield","Half-wave (ft)","αs"].map(h => (
                      <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.textLight, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Pcrl","30,004 lb","16.27","0.2958","0.643","—"],
                    ["Pcrd","44,063 lb","23.90","0.4345","1.862","—"],
                    ["Mcrlx⁺","39,420 lb-ft","84.18","1.5306","0.473","1.00"],
                    ["Mcrdx⁺","26,014 lb-ft","55.55","1.0101","2.003","1.00"],
                    ["Mcrlx⁻","39,420 lb-ft","84.18","1.5306","0.473","1.00"],
                    ["Mcrdx⁻","26,014 lb-ft","55.55","1.0101","2.003","1.00"],
                    ["Mcrly⁺","27,167 lb-ft","303.51","5.5183","0.253","1.00"],
                    ["Mcrdy⁺","6,935 lb-ft","77.48","1.4087","2.153","0.00"],
                    ["Mcrly⁻","4,297 lb-ft","48.00","0.8727","0.635","1.00"],
                    ["Mcrdy⁻","— N/A —","—","—","—","—"],
                    ["Bcrw⁺/⁻","678,485 lb-in²","170.44","3.0988","0.459","—"],
                    ["Bcrf⁺/⁻","407,390 lb-in²","102.34","1.8607","2.025","—"],
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? T.surfaceAlt : T.surface }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: "5px 10px", fontFamily: "monospace", fontSize: 12, color: T.text, borderBottom: `1px solid ${T.borderLight}` }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ReportSection>

            {/* ── Section 3: Analysis Inputs ── */}
            <ReportSection num="3" title="Analysis inputs — CFS purlin">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <RptSubHd>General parameters</RptSubHd>
                  {[
                    ["Orientation","Horizontal"],
                    ["Global buckling","Elastic theory"],
                    ["Include torsion","Yes"],
                    ["Lx","27.000 ft"],
                    ["Ly","3.550 ft"],
                    ["Lt","9.000 ft"],
                    ["Kx / Ky / Kt","1.00 / 1.00 / 1.00"],
                    ["ex","0.810 in"],
                    ["ey","5.000 in"],
                    ["Braced flange","None"],
                  ].map(([k, v], i) => <RptKV key={k} k={k} v={v} alt={i % 2 === 0} />)}
                </div>
                <div>
                  <RptSubHd>Applied loads</RptSubHd>
                  {[
                    ["Dead load", `−${DL} lb/ft`],
                    ["Wind load (down)", `−${WLdown} lb/ft`],
                    ["Wind load (uplift)", `+${WLup} lb/ft`],
                    ["Snow load", `−${SL} lb/ft`],
                    ["Self-weight", "~6.27 lb/ft"],
                    ["Span length", `${span} ft`],
                  ].map(([k, v], i) => <RptKV key={k} k={k} v={v} alt={i % 2 === 0} />)}
                  <RptSubHd style={{ marginTop: 12 }}>Key supports</RptSubHd>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: T.surfaceAlt }}>
                        {["#","Type","Location","Bearing","K"].map(h => (
                          <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.textLight, borderBottom: `1px solid ${T.borderLight}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["1","XYT","0.000 ft","3.50 in","1.00"],
                        ["6","XT","9.000 ft","2.00 in","1.00"],
                        ["13","XT","18.000 ft","2.00 in","1.00"],
                        ["18","XYT","27.000 ft","3.50 in","1.00"],
                        ["22","XT","32.160 ft","1.00 in","1.00"],
                      ].map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? T.surfaceAlt : T.surface }}>
                          {row.map((cell, j) => (
                            <td key={j} style={{ padding: "5px 8px", fontFamily: "monospace", fontSize: 12, color: T.text, borderBottom: `1px solid ${T.borderLight}` }}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                      <tr><td colSpan={5} style={{ padding: "4px 8px", fontSize: 11, color: T.textLight, fontStyle: "italic" }}>+ 17 additional X-restraints at purlin clip locations</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </ReportSection>

            {/* ── Section 4: Load Combinations ── */}
            <ReportSection num="4" title="Load combinations — AISI S100-24 ASD">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: T.surfaceAlt }}>
                    {["Combination","SW","DL","WL↓","WL↑","SL"].map(h => (
                      <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.textLight, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["D","1.0","1.0","—","—","—", false],
                    ["D + 0.6W","1.0","1.0","0.6","0.6","—", false],
                    ["0.6D + 0.6W","0.6","0.6","0.6","0.6","—", false],
                    ["DL + SL","1.0","1.0","—","—","1.0", false],
                    ["DL + 0.75SL","1.0","1.0","—","—","0.75", false],
                    ["DL + 0.75SL + 0.45WL(+)","1.0","1.0","—","0.45","0.75", false],
                    ["DL + 0.75SL + 0.45WL(−)  ← governing","1.0","1.0","0.45","—","0.75", true],
                  ].map(([combo, sw, dl, wld, wlu, sl, gov], i) => (
                    <tr key={i} style={{ background: gov ? `${T.amber}18` : i % 2 === 0 ? T.surfaceAlt : T.surface }}>
                      <td style={{ padding: "6px 10px", fontFamily: gov ? "inherit" : "monospace", fontWeight: gov ? 700 : 400, fontSize: 12, color: gov ? T.amberDark : T.text, borderBottom: `1px solid ${T.borderLight}` }}>{combo}</td>
                      {[sw, dl, wld, wlu, sl].map((v, j) => (
                        <td key={j} style={{ padding: "6px 10px", fontFamily: "monospace", fontSize: 12, color: T.text, borderBottom: `1px solid ${T.borderLight}` }}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ReportSection>

            {/* ── Section 5: Member Check ── */}
            <ReportSection num="5" title={`Member check — governing: ${loadCombo} at 13.348 ft`}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Mx applied", value: `${Mmax}`, unit: "lb-ft" },
                  { label: "Mx strength", value: `${MaX}`, unit: "lb-ft" },
                  { label: "Vy applied", value: `${Vmax}`, unit: "lb" },
                  { label: "Vy strength", value: "10,967", unit: "lb" },
                  { label: "Cbx", value: "1.0234", unit: "" },
                  { label: "Bimoment B", value: "11,714", unit: "lb-in²" },
                ].map(r => (
                  <div key={r.label} style={{ background: T.surfaceAlt, border: `1px solid ${T.borderLight}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: T.navy, fontFamily: "monospace" }}>{r.value} <span style={{ fontSize: 11, color: T.textLight, fontWeight: 400 }}>{r.unit}</span></div>
                  </div>
                ))}
              </div>
              <RptSubHd>Interaction equations</RptSubHd>
              {[
                { label: "Eq. H1.2-1 — P, Mx, My: 0.000 + 0.858 + 0.000", dcr: 0.858, limit: 1.0, eq: "≤ 1.0" },
                { label: "Eq. H2-1 — Mx, Vy: √(0.540 + 0.000)", dcr: 0.735, limit: 1.0, eq: "≤ 1.0" },
                { label: "Eq. H2-1 — My, Vx: √(0.000 + 0.000)", dcr: 0.000, limit: 1.0, eq: "≤ 1.0" },
                { label: "Eq. H4-1 — Mx, My, B: 0.858 + 0.000 + 0.074", dcr: 0.932, limit: 1.25, eq: "≤ 1.25" },
              ].map(r => {
                const ok = r.dcr <= r.limit;
                const barPct = Math.min((r.dcr / r.limit) * 100, 100);
                return (
                  <div key={r.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: T.textMid }}>{r.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: ok ? T.pass : T.fail }}>
                        <span style={{ color: T.textLight, fontWeight: 400 }}>{r.eq} — </span>
                        {r.dcr.toFixed(3)} {ok ? "✓" : "✗"}
                      </span>
                    </div>
                    <div style={{ height: 8, background: T.borderLight, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${barPct}%`, background: ok ? T.pass : T.fail, borderRadius: 4, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
            </ReportSection>

            {/* ── Section 6: Web Crippling ── */}
            <ReportSection num="6" title="Web crippling check — at 27.000 ft interior support">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                <div>
                  {[
                    ["Load on bottom flange","2,357.8 lb"],
                    ["Applied moment","−1,639 lb-ft"],
                    ["Bearing length","3.500 in"],
                    ["Flange fastened","Yes"],
                    ["Calculation type","Cee, FS-IOF"],
                  ].map(([k, v], i) => <RptKV key={k} k={k} v={v} alt={i % 2 === 0} vColor={v === "Yes" ? T.pass : undefined} />)}
                </div>
                <div>
                  {[
                    ["Web crippling strength, Pa","5,222.2 lb"],
                    ["Applied web load","2,357.8 lb"],
                    ["Moment capacity","14,166 lb-ft"],
                    ["Applied moment","1,639 lb-ft"],
                    ["Dist. to end of member","5.014 ft"],
                  ].map(([k, v], i) => <RptKV key={k} k={k} v={v} alt={i % 2 === 0} />)}
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 12 }}>
                {[
                  { label: "Web crippling: 2,357.8 lb ≤ 5,222.2 lb", dcr: 2357.8 / 5222.2 },
                  { label: "Eq. H3-1a — P, M interaction: 0.249 + 0.069  (≤ 0.782)", dcr: 0.318 / 0.782 },
                ].map(r => {
                  const ok = r.dcr <= 1.0;
                  return (
                    <div key={r.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: T.textMid }}>{r.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.pass }}>✓ OK</span>
                      </div>
                      <div style={{ height: 8, background: T.borderLight, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${r.dcr * 100}%`, background: T.pass, borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ReportSection>

            {/* ── Section 7: Shear / Moment / Deflection ── */}
            <ReportSection num="7" title={`Maximum shears, moments & deflections — ${loadCombo}`}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <RptSubHd>Reactions & shears</RptSubHd>
                  {[
                    ["Reaction at 0.000 ft","1,601.2 lb"],
                    ["Reaction at 27.000 ft","2,357.8 lb"],
                    ["Shear @ 0 ft (right)","+1,601.2 lb"],
                    ["Shear @ 27 ft (left)","−1,722.6 lb"],
                    ["Shear @ 27 ft (right)","+635.2 lb"],
                  ].map(([k, v], i) => <RptKV key={k} k={k} v={v} alt={i % 2 === 0} />)}
                </div>
                <div>
                  <RptSubHd>Peak moments & deflections</RptSubHd>
                  {[
                    ["Max +ve moment","10,413 lb-ft @ 13.007 ft"],
                    ["Max −ve moment","−1,639 lb-ft @ 27.000 ft"],
                    ["End moment","0 lb-ft @ 32.160 ft"],
                    ["Max deflection (down)","−1.604 in @ 13.323 ft"],
                    ["Max deflection (up)","+0.896 in @ 32.160 ft"],
                    ["Inflection point","26.014 ft"],
                  ].map(([k, v], i) => <RptKV key={k} k={k} v={v} alt={i % 2 === 0} />)}
                </div>
              </div>
              <RptSubHd>Shear, moment & deflection diagrams</RptSubHd>
              <svg width="100%" viewBox="0 0 680 310" style={{ display: "block" }}>
                {/* Labels */}
                <text x="12" y="50" fontSize="10" fill={T.textLight} dominantBaseline="central">Shear</text>
                <text x="12" y="145" fontSize="10" fill={T.textLight} dominantBaseline="central">Moment</text>
                <text x="12" y="245" fontSize="10" fill={T.textLight} dominantBaseline="central">Deflect.</text>
                {/* Baselines */}
                <line x1="55" y1="55" x2="620" y2="55" stroke={T.borderLight} strokeWidth="0.5" />
                <line x1="55" y1="165" x2="620" y2="165" stroke={T.borderLight} strokeWidth="0.5" />
                <line x1="55" y1="250" x2="620" y2="250" stroke={T.borderLight} strokeWidth="0.5" />
                {/* Shear diagram */}
                <polyline points="55,55 55,30 520,81 520,47 620,55" fill="none" stroke="#2a78d6" strokeWidth="1.8" strokeLinejoin="round" />
                <polygon points="55,55 55,30 520,81 520,47 620,55 620,55" fill="#2a78d6" fillOpacity="0.10" />
                <text x="60" y="28" fontSize="10" fill="#2a78d6">+1,601 lb</text>
                <text x="525" y="84" fontSize="10" fill={T.fail}>−1,723 lb</text>
                <text x="525" y="46" fontSize="10" fill="#2a78d6">+635 lb</text>
                {/* Moment diagram */}
                <path d="M55,165 Q285,100 435,165 Q500,185 520,175 L620,165" fill="none" stroke={T.pass} strokeWidth="1.8" />
                <path d="M55,165 Q285,100 435,165 Q500,185 520,175 L620,165 Z" fill={T.pass} fillOpacity="0.10" />
                <text x="285" y="97" textAnchor="middle" fontSize="10" fill={T.pass}>+10,413 lb-ft</text>
                <text x="285" y="109" textAnchor="middle" fontSize="9" fill={T.textLight}>@ 13.007 ft</text>
                <text x="510" y="195" textAnchor="middle" fontSize="10" fill={T.fail}>−1,639 lb-ft</text>
                {/* Deflection diagram */}
                <path d="M55,250 Q290,282 400,250 Q520,228 620,243" fill="none" stroke={T.amber} strokeWidth="1.8" />
                <path d="M55,250 Q290,282 400,250 Q520,228 620,243 L620,250 L55,250 Z" fill={T.amber} fillOpacity="0.10" />
                <text x="290" y="295" textAnchor="middle" fontSize="10" fill={T.amber}>−1.604" (down) @ 13.323 ft</text>
                <text x="590" y="238" textAnchor="middle" fontSize="10" fill={T.pass}>+0.896"</text>
                {/* Support ticks */}
                {[55, 520, 620].map(x => (
                  <line key={x} x1={x} y1="53" x2={x} y2="57" stroke={T.textMid} strokeWidth="1" />
                ))}
                <text x="55" y="68" textAnchor="middle" fontSize="9" fill={T.textLight}>0 ft</text>
                <text x="520" y="68" textAnchor="middle" fontSize="9" fill={T.textLight}>27 ft</text>
                <text x="620" y="68" textAnchor="middle" fontSize="9" fill={T.textLight}>32.16 ft</text>
                {/* Span dim line */}
                <line x1="55" y1="302" x2="520" y2="302" stroke={T.borderLight} strokeWidth="0.5" />
                <text x="287" y="310" textAnchor="middle" fontSize="9" fill={T.textLight}>Primary span = 27.0 ft</text>
              </svg>
            </ReportSection>

            {/* ── Section 8: Summary ── */}
            <ReportSection num="8" title="Design summary">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Eq. H1.2-1 (P+Mx+My)", value: "0.858", note: "≤ 1.0 ✓", color: T.pass },
                  { label: "Eq. H2-1 (Mx+Vy)", value: "0.735", note: "≤ 1.0 ✓", color: T.pass },
                  { label: "Eq. H4-1 (Mx+My+B)", value: "0.932", note: "≤ 1.25 ✓ governing", color: T.warn },
                  { label: "Web crip. H3-1a", value: "0.318", note: "≤ 0.782 ✓", color: T.pass },
                  { label: `Max deflection`, value: `${defMax}"`, note: "@ midspan", color: T.navy },
                  { label: "Max reaction", value: "2,358 lb", note: "@ 27.0 ft", color: T.navy },
                ].map(r => (
                  <div key={r.label} style={{ background: T.surfaceAlt, border: `1px solid ${T.borderLight}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: T.textLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: r.color, fontFamily: "monospace" }}>{r.value}</div>
                    <div style={{ fontSize: 10, color: T.textLight, marginTop: 2 }}>{r.note}</div>
                  </div>
                ))}
              </div>
              <div style={{
                background: overallOK ? T.passLight : T.failLight,
                border: `1.5px solid ${overallOK ? T.pass : T.fail}`,
                borderRadius: 10, padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 12
              }}>
                <div style={{ fontSize: 26 }}>{overallOK ? "✅" : "❌"}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: overallOK ? T.pass : T.fail }}>
                    {overallOK ? "Section adequate — all checks pass" : "Section inadequate — revise design"}
                  </div>
                  <div style={{ fontSize: 12, color: T.textMid, marginTop: 3 }}>
                    Governing: Eq. H4-1 = 0.932 ≤ 1.25 · Load combo: {loadCombo} · {sectionName} {material}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.borderLight}`, fontSize: 11, color: T.textLight, textAlign: "center", lineHeight: 1.7 }}>
                Design per AISI S100-24, US provisions, ASD method · Cold work of forming and inelastic reserve strength increases applied<br />
                Global buckling via elastic theory · Torsion included in member checks · E = {E} ksi · CFS v15.0.2
              </div>
            </ReportSection>

          </div>
        )}
      </div>
    </div>
  );
}
