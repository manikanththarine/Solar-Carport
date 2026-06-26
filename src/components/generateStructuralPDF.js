// generateStructuralPDF.js
// Generates a Structurology-style structural calculation PDF using jsPDF

// ─── jsPDF CDN loader ─────────────────────────────────────────────────────────
function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf.jsPDF);
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v, d = 2) =>
  v === undefined || v === null || isNaN(v) ? "—" : Number(v).toFixed(d);

// ─── CN Data (ASCE 7-16 Table 27.3-3) ───────────────────────────────────────
const CN_DATA_PDF = {
  obstructed: [
    { angle: 0,  rows: [{ ai: 0, z3p: 1,    z3n: -3.6,  z2p: 0.8,  z2n: -1.8,  z1p: 0.5,  z1n: -1.2  },
                        { ai: 1, z3p: 0.8,  z3n: -1.8,  z2p: 0.8,  z2n: -1.8,  z1p: 0.5,  z1n: -1.2  },
                        { ai: 2, z3p: 0.5,  z3n: -1.2,  z2p: 0.5,  z2n: -1.2,  z1p: 0.5,  z1n: -1.2  }] },
    { angle: 7.5,rows: [{ ai: 0, z3p: 1.6,  z3n: -5.1,  z2p: 1.2,  z2n: -2.6,  z1p: 0.8,  z1n: -1.7  },
                        { ai: 1, z3p: 1.2,  z3n: -2.6,  z2p: 1.2,  z2n: -2.6,  z1p: 0.8,  z1n: -1.7  },
                        { ai: 2, z3p: 0.8,  z3n: -1.7,  z2p: 0.8,  z2n: -1.7,  z1p: 0.8,  z1n: -1.7  }] },
    { angle: 10, rows: [{ ai: 0, z3p: 1.87, z3n: -4.8,  z2p: 1.4,  z2n: -2.8,  z1p: 0.93, z1n: -1.83 },
                        { ai: 1, z3p: 1.4,  z3n: -2.8,  z2p: 1.4,  z2n: -2.8,  z1p: 0.93, z1n: -1.83 },
                        { ai: 2, z3p: 0.93, z3n: -1.83, z2p: 0.93, z2n: -1.83, z1p: 0.93, z1n: -1.83 }] },
    { angle: 15, rows: [{ ai: 0, z3p: 2.4,  z3n: -4.2,  z2p: 1.8,  z2n: -3.2,  z1p: 1.2,  z1n: -2.1  },
                        { ai: 1, z3p: 1.8,  z3n: -3.2,  z2p: 1.8,  z2n: -3.2,  z1p: 1.2,  z1n: -2.1  },
                        { ai: 2, z3p: 1.2,  z3n: -2.1,  z2p: 1.2,  z2n: -2.1,  z1p: 1.2,  z1n: -2.1  }] },
    { angle: 30, rows: [{ ai: 0, z3p: 3.2,  z3n: -4.6,  z2p: 2.4,  z2n: -3.5,  z1p: 1.6,  z1n: -2.3  },
                        { ai: 1, z3p: 2.4,  z3n: -3.5,  z2p: 2.4,  z2n: -3.5,  z1p: 1.6,  z1n: -2.3  },
                        { ai: 2, z3p: 1.6,  z3n: -2.3,  z2p: 1.6,  z2n: -2.3,  z1p: 1.6,  z1n: -2.3  }] },
    { angle: 45, rows: [{ ai: 0, z3p: 4.2,  z3n: -3.8,  z2p: 3.2,  z2n: -2.9,  z1p: 2.1,  z1n: -1.9  },
                        { ai: 1, z3p: 3.2,  z3n: -2.9,  z2p: 3.2,  z2n: -2.9,  z1p: 2.1,  z1n: -1.9  },
                        { ai: 2, z3p: 2.1,  z3n: -1.9,  z2p: 2.1,  z2n: -1.9,  z1p: 2.1,  z1n: -1.9  }] },
  ],
  clear: [
    { angle: 0,  rows: [{ ai: 0, z3p: 2.4,  z3n: -3.3,  z2p: 1.8,  z2n: -1.7,  z1p: 1.2,  z1n: -1.1  },
                        { ai: 1, z3p: 1.8,  z3n: -1.7,  z2p: 1.8,  z2n: -1.7,  z1p: 1.2,  z1n: -1.1  },
                        { ai: 2, z3p: 1.2,  z3n: -1.1,  z2p: 1.2,  z2n: -1.1,  z1p: 1.2,  z1n: -1.1  }] },
    { angle: 7.5,rows: [{ ai: 0, z3p: 3.2,  z3n: -4.2,  z2p: 2.4,  z2n: -2.1,  z1p: 1.6,  z1n: -1.4  },
                        { ai: 1, z3p: 2.4,  z3n: -2.1,  z2p: 2.4,  z2n: -2.1,  z1p: 1.6,  z1n: -1.4  },
                        { ai: 2, z3p: 1.6,  z3n: -1.4,  z2p: 1.6,  z2n: -1.4,  z1p: 1.6,  z1n: -1.4  }] },
    { angle: 10, rows: [{ ai: 0, z3p: 3.33, z3n: -4.07, z2p: 2.5,  z2n: -2.37, z1p: 1.67, z1n: -1.57 },
                        { ai: 1, z3p: 2.5,  z3n: -2.37, z2p: 2.5,  z2n: -2.37, z1p: 1.67, z1n: -1.57 },
                        { ai: 2, z3p: 1.67, z3n: -1.57, z2p: 1.67, z2n: -1.57, z1p: 1.67, z1n: -1.57 }] },
    { angle: 15, rows: [{ ai: 0, z3p: 3.6,  z3n: -3.8,  z2p: 2.7,  z2n: -2.9,  z1p: 1.8,  z1n: -1.9  },
                        { ai: 1, z3p: 2.7,  z3n: -2.9,  z2p: 2.7,  z2n: -2.9,  z1p: 1.8,  z1n: -1.9  },
                        { ai: 2, z3p: 1.8,  z3n: -1.9,  z2p: 1.8,  z2n: -1.9,  z1p: 1.8,  z1n: -1.9  }] },
    { angle: 30, rows: [{ ai: 0, z3p: 5.2,  z3n: -5.0,  z2p: 3.9,  z2n: -3.8,  z1p: 2.6,  z1n: -2.5  },
                        { ai: 1, z3p: 3.9,  z3n: -3.8,  z2p: 3.9,  z2n: -3.8,  z1p: 2.6,  z1n: -2.5  },
                        { ai: 2, z3p: 2.6,  z3n: -2.5,  z2p: 2.6,  z2n: -2.5,  z1p: 2.6,  z1n: -2.5  }] },
    { angle: 45, rows: [{ ai: 0, z3p: 5.2,  z3n: -4.6,  z2p: 3.9,  z2n: -3.5,  z1p: 2.6,  z1n: -2.3  },
                        { ai: 1, z3p: 3.9,  z3n: -3.5,  z2p: 3.9,  z2n: -3.5,  z1p: 2.6,  z1n: -2.3  },
                        { ai: 2, z3p: 2.6,  z3n: -2.3,  z2p: 2.6,  z2n: -2.3,  z1p: 2.6,  z1n: -2.3  }] },
  ],
};

// ─── MWFRS Wind Data (ASCE 7-16 §27.4-4) ────────────────────────────────────
const WIND_DATA_PDF = {
  clearGamma0: [
    { angle: 0,    rows: [{ lc: "A", cnw:  1.2, cnl:  0.3 }, { lc: "B", cnw: -1.1, cnl: -0.1 }] },
    { angle: 7.5,  rows: [{ lc: "A", cnw: -0.6, cnl: -1.0 }, { lc: "B", cnw: -1.4, cnl:  0.0 }] },
    { angle: 15,   rows: [{ lc: "A", cnw: -0.9, cnl: -1.3 }, { lc: "B", cnw: -1.9, cnl:  0.0 }] },
    { angle: 22.5, rows: [{ lc: "A", cnw: -1.5, cnl: -1.6 }, { lc: "B", cnw: -2.4, cnl: -0.3 }] },
    { angle: 30,   rows: [{ lc: "A", cnw: -1.8, cnl: -1.8 }, { lc: "B", cnw: -2.5, cnl: -0.5 }] },
    { angle: 37.5, rows: [{ lc: "A", cnw: -1.8, cnl: -1.8 }, { lc: "B", cnw: -2.4, cnl: -0.6 }] },
    { angle: 45,   rows: [{ lc: "A", cnw: -1.6, cnl: -1.8 }, { lc: "B", cnw: -2.3, cnl: -0.7 }] },
  ],
  clearGamma180: [
    { angle: 0,    rows: [{ lc: "A", cnw:  1.2, cnl:  0.3 }, { lc: "B", cnw: -1.1, cnl: -0.1 }] },
    { angle: 7.5,  rows: [{ lc: "A", cnw:  0.9, cnl:  1.5 }, { lc: "B", cnw:  1.6, cnl:  0.3 }] },
    { angle: 15,   rows: [{ lc: "A", cnw:  1.3, cnl:  1.6 }, { lc: "B", cnw:  1.8, cnl:  0.6 }] },
    { angle: 22.5, rows: [{ lc: "A", cnw:  1.7, cnl:  1.8 }, { lc: "B", cnw:  2.2, cnl:  0.7 }] },
    { angle: 30,   rows: [{ lc: "A", cnw:  2.1, cnl:  2.1 }, { lc: "B", cnw:  2.6, cnl:  1.0 }] },
    { angle: 37.5, rows: [{ lc: "A", cnw:  2.1, cnl:  2.2 }, { lc: "B", cnw:  2.7, cnl:  1.1 }] },
    { angle: 45,   rows: [{ lc: "A", cnw:  2.2, cnl:  2.5 }, { lc: "B", cnw:  2.6, cnl:  1.4 }] },
  ],
  obsGamma0: [
    { angle: 0,    rows: [{ lc: "A", cnw: -0.5, cnl: -1.2 }, { lc: "B", cnw: -1.1, cnl: -0.6 }] },
    { angle: 7.5,  rows: [{ lc: "A", cnw: -1.0, cnl: -1.5 }, { lc: "B", cnw: -1.7, cnl: -0.8 }] },
    { angle: 15,   rows: [{ lc: "A", cnw: -1.1, cnl: -1.5 }, { lc: "B", cnw: -2.1, cnl: -0.6 }] },
    { angle: 22.5, rows: [{ lc: "A", cnw: -1.5, cnl: -1.7 }, { lc: "B", cnw: -2.3, cnl: -0.9 }] },
    { angle: 30,   rows: [{ lc: "A", cnw: -1.5, cnl: -1.8 }, { lc: "B", cnw: -2.3, cnl: -1.1 }] },
    { angle: 37.5, rows: [{ lc: "A", cnw: -1.5, cnl: -1.8 }, { lc: "B", cnw: -2.2, cnl: -1.1 }] },
    { angle: 45,   rows: [{ lc: "A", cnw: -1.3, cnl: -1.8 }, { lc: "B", cnw: -1.9, cnl: -1.2 }] },
  ],
  obsGamma180: [
    { angle: 0,    rows: [{ lc: "A", cnw: -0.5, cnl: -1.2 }, { lc: "B", cnw: -1.1, cnl: -0.6 }] },
    { angle: 7.5,  rows: [{ lc: "A", cnw: -0.2, cnl: -1.2 }, { lc: "B", cnw:  0.8, cnl: -0.3 }] },
    { angle: 15,   rows: [{ lc: "A", cnw:  0.4, cnl: -1.1 }, { lc: "B", cnw:  1.2, cnl: -0.3 }] },
    { angle: 22.5, rows: [{ lc: "A", cnw:  0.5, cnl: -1.0 }, { lc: "B", cnw:  1.3, cnl:  0.0 }] },
    { angle: 30,   rows: [{ lc: "A", cnw:  0.6, cnl: -1.0 }, { lc: "B", cnw:  1.6, cnl:  0.1 }] },
    { angle: 37.5, rows: [{ lc: "A", cnw:  0.7, cnl: -0.9 }, { lc: "B", cnw:  1.9, cnl:  0.3 }] },
    { angle: 45,   rows: [{ lc: "A", cnw:  0.8, cnl: -0.9 }, { lc: "B", cnw:  2.1, cnl:  0.4 }] },
  ],
};

// ─── Interpolation helpers ────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }

function bracketAngle(data, angle) {
  const s = [...data].sort((a, b) => a.angle - b.angle);
  if (angle <= s[0].angle) return { lower: s[0], upper: s[0], t: 0 };
  if (angle >= s[s.length - 1].angle) return { lower: s[s.length - 1], upper: s[s.length - 1], t: 0 };
  for (let i = 0; i < s.length - 1; i++) {
    if (angle >= s[i].angle && angle <= s[i + 1].angle) {
      const t_val = (angle - s[i].angle) / (s[i + 1].angle - s[i].angle);
      return { lower: s[i], upper: s[i + 1], t: t_val };
    }
  }
  return { lower: s[0], upper: s[0], t: 0 };
}

function cnLookup(flow, angle, aIdx, qh, g) {
  const { lower, upper, t } = bracketAngle(CN_DATA_PDF[flow], angle);
  const getField = (f) => {
    const lR = lower.rows.find(r => r.ai === aIdx) || lower.rows[0];
    const uR = upper.rows.find(r => r.ai === aIdx) || upper.rows[0];
    return lerp(lR[f], uR[f], t);
  };
  const p = (f) => qh * g * getField(f);
  return {
    zone1: { downward: p("z1p"), uplift: p("z1n") },
    zone2: { downward: p("z2p"), uplift: p("z2n") },
    zone3: { downward: p("z3p"), uplift: p("z3n") },
  };
}

function windGroupLookup(groups, angle, qh, g) {
  // Below 7.5° use the 0° row directly
  if (angle < 7.5) {
    const zeroGroup = groups.find(grp => grp.angle === 0);
    if (zeroGroup) {
      return ["A", "B"].map(lc => {
        const r = zeroGroup.rows.find(row => row.lc === lc) || zeroGroup.rows[0];
        return { loadCase: `Load Case ${lc}`, cnw: r.cnw, cnl: r.cnl, pW: qh * g * r.cnw, pL: qh * g * r.cnl };
      });
    }
  }
  const { lower, upper, t } = bracketAngle(groups, angle);
  return ["A", "B"].map(lc => {
    const lRow = lower.rows.find(r => r.lc === lc) || lower.rows[0];
    const uRow = upper.rows.find(r => r.lc === lc) || upper.rows[0];
    const cnw = lerp(lRow.cnw, uRow.cnw, t);
    const cnl = lerp(lRow.cnl, uRow.cnl, t);
    return { loadCase: `Load Case ${lc}`, cnw, cnl, pW: qh * g * cnw, pL: qh * g * cnl };
  });
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function generateStructuralPDF(formData, computed) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  // ── Page constants ──────────────────────────────────────────────────────────
  const W = 612, H = 792;
  const ML = 54, MR = 558, CW = MR - ML;
  let y = 0;

  // ── Color palette ───────────────────────────────────────────────────────────
  const BLACK     = [0, 0, 0];
  const DARK      = [30, 30, 30];
  const MID       = [80, 80, 80];
  const LIGHT     = [180, 180, 180];
  const HEADER_BG = [245, 245, 245];
  const BLUE      = [15, 55, 120];
  const GREEN     = [22, 101, 52];

  // ── Fonts ───────────────────────────────────────────────────────────────────
  const MONO = "courier";
  const SANS = "helvetica";

  // ── Computed values ─────────────────────────────────────────────────────────
  const planeLength  = (formData.PanelDimensionlength * 0.00328084).toFixed(4);
  const panelWidth   = (formData.PanelDimensionwidth  * 0.00328084).toFixed(4);
  const panelWeight  = (formData.PanelDimensionweight * 2.20462).toFixed(3);
  const panelArea    = (
    formData.PanelDimensionlength * 0.00328084 *
    (formData.PanelDimensionwidth * 0.00328084)
  ).toFixed(4);
  const panelDeadLoad = (
    (formData.PanelDimensionweight * 2.20462) /
    (formData.PanelDimensionlength * 0.00328084 *
     (formData.PanelDimensionwidth * 0.00328084))
  ).toFixed(2);
  const totalDeadLoad = (parseFloat(panelDeadLoad) + formData.MiscellaneousLoad).toFixed(2);

  // Wind
  const ke = Math.exp(-0.0000362 * formData.elevation);
  let alpha = 7, zg = 1200, zmin = 30;
  if (formData.exposure === "C") { alpha = 9.5; zg = 900;  zmin = 15; }
  else if (formData.exposure === "D") { alpha = 11.5; zg = 700; zmin = 7; }
  const z  = Math.max(Number(formData.meanRoofHeight), zmin);
  const Kz = 2.01 * Math.pow(z / zg, 2 / alpha);
  const qh = 0.00256 * Kz * formData.kzt * formData.kd * ke * formData.v3s * formData.v3s;

  // Snow
  const exposureFactors = {
    B: { Fully: 0.9, Partially: 1.0, Sheltered: 1.2 },
    C: { Fully: 0.9, Partially: 1.0, Sheltered: 1.1 },
    D: { Fully: 0.8, Partially: 0.9, Sheltered: 1.0 },
  };
  const Ce = exposureFactors[formData.exposure]?.[formData.exposureofRoof] ?? 1.0;
  const flatRoofSnow =
    0.7 * formData.GroundSnow * Ce * formData.ThermalFactor * formData.ImportanceFactor;
  const SlopeFactor = Math.min(1 - (formData.roofSlope - 15) / 55, 1);
  const MinimumSnowLoad =
    formData.GroundSnow <= formData.MinSnowLoadUpperLimit
      ? formData.GroundSnow * formData.ImportanceFactor
      : formData.MinSnowLoadUpperLimit;
  const slopedRoofSnow =
    SlopeFactor * (MinimumSnowLoad > flatRoofSnow ? MinimumSnowLoad : flatRoofSnow);

  const aVal = Math.max(
    Math.min(formData.minimumWidth * 0.1, formData.minimumWidth * 0.4), 3
  );
  const TribArea = (formData.purlinSpacing ** 2) / 3;
  const a2 = aVal ** 2;
  const areaLabel =
    TribArea <= a2 ? "≤ a²" : TribArea <= a2 * 4 ? "> a², ≤ 4.0 a²" : "> 4.0 a²";

  // Purlin loads
  const D_psf = parseFloat(totalDeadLoad);
  const S_psf = slopedRoofSnow * formData.purlinTribWidth;

  // ── CN + MWFRS computed values ───────────────────────────────────────────────
  const G = 0.85;
  const cnAngle = Math.min(45, Math.max(0, Number(formData.roofSlope)));
  const areaIdx = computed?.areaIdx ?? (TribArea <= a2 ? 0 : TribArea <= a2 * 4 ? 1 : 2);
  const AREA_LABELS = ["≤ a²", "> a², ≤ 4.0 a²", "> 4.0 a²"];

  const obsZones   = cnLookup("obstructed", cnAngle, areaIdx, qh, G);
  const clearZones = cnLookup("clear",      cnAngle, areaIdx, qh, G);
  const windResult = {
    clearGamma0:   windGroupLookup(WIND_DATA_PDF.clearGamma0,   cnAngle, qh, G),
    clearGamma180: windGroupLookup(WIND_DATA_PDF.clearGamma180, cnAngle, qh, G),
    obsGamma0:     windGroupLookup(WIND_DATA_PDF.obsGamma0,     cnAngle, qh, G),
    obsGamma180:   windGroupLookup(WIND_DATA_PDF.obsGamma180,   cnAngle, qh, G),
  };
  const worstDown = Math.max(clearZones.zone3.downward, obsZones.zone3.downward);
  const worstUp   = Math.min(clearZones.zone3.uplift,   obsZones.zone3.uplift);

  // ── Drawing helpers ─────────────────────────────────────────────────────────
  function setColor(rgb) {
    doc.setTextColor(...rgb);
    doc.setDrawColor(...rgb);
  }

  function rule(x1, yy, x2, thick = 0.5, color = BLACK) {
    doc.setLineWidth(thick);
    doc.setDrawColor(...color);
    doc.line(x1, yy, x2, yy);
  }

  function text(str, x, yy, opts = {}) {
    const { size = 9, font = SANS, style = "normal", color = DARK, align = "left" } = opts;
    doc.setFont(font, style);
    doc.setFontSize(size);
    setColor(color);
    doc.text(str, x, yy, { align });
  }

  function kvRow(label, value, unit, indent = ML + 30) {
    const xVal = indent + 220;
    text(label, indent, y, { size: 8.5 });
    text(value, xVal, y, { size: 8.5, font: MONO, style: "bold", align: "right" });
    if (unit) text(unit, xVal + 6, y, { size: 8.5, color: MID });
    y += 14;
  }

  function sectionTitle(title) {
    y += 6;
    doc.setFont(SANS, "bold");
    doc.setFontSize(9.5);
    setColor(BLACK);
    doc.text(title, ML, y);
    rule(ML, y + 2, MR, 0.75);
    y += 14;
  }

  function subTitle(title) {
    y += 4;
    text(title, ML + 14, y, { size: 9, style: "bold" });
    y += 13;
  }

  // ── Page header ─────────────────────────────────────────────────────────────
  function drawHeader(pageNum) {
    doc.setFillColor(15, 55, 120);
    doc.rect(ML, 18, 130, 38, "F");
    doc.setFont(SANS, "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("STRUCTUROLOGY", ML + 65, 33, { align: "center" });
    doc.setFontSize(6.5);
    doc.setFont(SANS, "normal");
    doc.text("CONSULTING STRUCTURAL ENGINEERS", ML + 65, 42, { align: "center" });

    doc.setFont(SANS, "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 55, 120);
    doc.text("STRUCTUROLOGY INC", MR, 33, { align: "right" });

    rule(ML, 58, MR, 1.5, [15, 55, 120]);

    doc.setFont(SANS, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);

    const jn  = formData.project_name   || "—";
    const sn  = formData.sitename        || "—";
    const eng = formData.engineer_name   || "—";
    const dt  = formData.date
      ? new Date(formData.date).toLocaleDateString("en-GB")
      : new Date().toLocaleDateString("en-GB");

    text("JOB NAME:", ML + 132, 72, { size: 8, style: "bold" });
    text(jn, ML + 192, 72, { size: 8 });
    text(`ENGINEER: ${eng}`, MR, 72, { size: 8, align: "right" });
    rule(ML + 130, 74, MR, 0.4, LIGHT);

    text(`JOB NO.:  ${sn}`, ML + 132, 84, { size: 8 });
    text(`DATE: ${dt}`, MR - 120, 84, { size: 8 });
    text("contact@structurology.com", ML + 132, 93, { size: 7.5, color: MID });
    text("480.269.7675", MR - 80, 93, { size: 7.5, color: MID });

    rule(ML, 98, MR, 1, [15, 55, 120]);

    doc.setFont(SANS, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MID);
    doc.text(`Page ${pageNum}`, W / 2, H - 22, { align: "center" });

    y = 114;
  }

  // ── Zone pressure mini-table (used on Page 5) ────────────────────────────────
  function drawZoneTable(title, result, titleBg) {
    doc.setFillColor(...titleBg);
    doc.rect(ML, y - 9, CW, 14, "F");
    text(title, ML + 4, y, { size: 9, style: "bold", color: [255, 255, 255] });
    y += 10;

    // Column x-positions
    const xZone = ML + 4;
    const xDown = ML + 200;
    const xUp   = ML + 380;

    doc.setFillColor(...HEADER_BG);
    doc.rect(ML, y - 9, CW, 13, "F");
    text("Zone",            xZone, y, { size: 8, style: "bold" });
    text("Downward (psf)",  xDown, y, { size: 8, style: "bold" });
    text("Uplift (psf)",    xUp,   y, { size: 8, style: "bold" });
    y += 8;
    rule(ML, y, MR, 0.5, LIGHT);
    y += 10;

    [
      { label: "Zone 3", z: result.zone3 },
      { label: "Zone 2", z: result.zone2 },
      { label: "Zone 1", z: result.zone1 },
    ].forEach(({ label, z }, i) => {
      if (i % 2 === 0) { doc.setFillColor(248, 249, 252); doc.rect(ML, y - 9, CW, 13, "F"); }
      text(label, xZone, y, { size: 8.5, style: "bold" });
      text(fmt(z.downward), xDown + 80, y,
        { size: 8.5, font: MONO, style: "bold",
          color: z.downward >= 0 ? [39, 80, 10] : [121, 31, 31], align: "right" });
      text(fmt(z.uplift), xUp + 80, y,
        { size: 8.5, font: MONO, style: "bold",
          color: z.uplift >= 0 ? [39, 80, 10] : [121, 31, 31], align: "right" });
      y += 13;
    });
    y += 8;
  }

  // ── MWFRS mini-table (used on Page 6) ───────────────────────────────────────
  function drawWindTable(title, rows, titleBg) {
    doc.setFillColor(...titleBg);
    doc.rect(ML, y - 9, CW, 14, "F");
    text(title, ML + 4, y, { size: 8.5, style: "bold", color: [255, 255, 255] });
    y += 10;

    const xLC  = ML + 4;
    const xCNW = ML + 130;
    const xCNL = ML + 210;
    const xPW  = ML + 330;
    const xPL  = ML + 450;

    doc.setFillColor(...HEADER_BG);
    doc.rect(ML, y - 9, CW, 13, "F");
    text("Load Case",  xLC,  y, { size: 8, style: "bold" });
    text("CNW",        xCNW, y, { size: 8, style: "bold" });
    text("CNL",        xCNL, y, { size: 8, style: "bold" });
    text("p·W (psf)",  xPW,  y, { size: 8, style: "bold" });
    text("p·L (psf)",  xPL,  y, { size: 8, style: "bold" });
    y += 8;
    rule(ML, y, MR, 0.5, LIGHT);
    y += 10;

    rows.forEach(({ loadCase, cnw, cnl, pW, pL }, i) => {
      if (i % 2 === 0) { doc.setFillColor(248, 249, 252); doc.rect(ML, y - 9, CW, 13, "F"); }
      text(loadCase, xLC, y, { size: 8.5, style: "bold" });
      const cv = (v, x) => text(fmt(v), x + 50, y,
        { size: 8.5, font: MONO, style: "bold",
          color: v >= 0 ? [39, 80, 10] : [121, 31, 31], align: "right" });
      cv(cnw, xCNW); cv(cnl, xCNL); cv(pW, xPW); cv(pL, xPL);
      y += 13;
    });
    y += 10;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — Load Calculations
  // ══════════════════════════════════════════════════════════════════════════
  drawHeader(1);

  sectionTitle("LOAD CALCULATIONS");

  subTitle("Dead Load");
  kvRow("Panel Weight",        fmt(formData.PanelDimensionweight * 2.20462, 3), "lb");
  kvRow("Panel Length",        planeLength,    "ft");
  kvRow("Panel Width",         panelWidth,     "ft");
  kvRow("Panel Area",          panelArea,      "sq ft");
  y += 4;
  kvRow("Panel Dead Load",     panelDeadLoad,  "psf");
  kvRow("Miscellaneous Load",  fmt(formData.MiscellaneousLoad), "psf");
  rule(ML + 30, y, ML + 260, 0.5, LIGHT);
  y += 4;
  kvRow("Total Dead Load",     totalDeadLoad,  "psf");
  y += 6;

  kvRow("Ground Snow Load (pg)", fmt(formData.GroundSnow, 2), "psf");
  kvRow("Roof Live Load",       "20.00",        "psf");

  sectionTitle("WIND LOAD");

  kvRow("Velocity Pressure (qh)", fmt(qh, 2), "psf");
  kvRow("Roof Slope",          fmt(formData.roofSlope, 0), "Deg");
  kvRow("a",                   fmt(aVal, 2),   "ft");
  kvRow("Trib Area",           fmt(TribArea, 1), "sq ft");
  kvRow("Area Classification", areaLabel,      "");
  kvRow("Effective Wind Area", AREA_LABELS[areaIdx], "");

  y += 4;
  text("C & C Wind Pressure (psf) — by Zone:", ML, y, { size: 9, style: "bold" });
  y += 14;

  // Table header
  const cols = [ML + 14, ML + 130, ML + 260, ML + 370, ML + 460];
  function windTableHeader() {
    doc.setFillColor(...HEADER_BG);
    doc.rect(ML, y - 10, CW, 13, "F");
    ["Flow Type", "Zone", "Downward (psf)", "Uplift (psf)", ""].forEach((h, i) => {
      text(h, cols[i], y, { size: 8, style: "bold", color: BLACK });
    });
    y += 6;
    rule(ML, y, MR, 0.5, LIGHT);
    y += 8;
  }

  windTableHeader();
  const windRows = [
    ["Clear Wind Flow", "Zone 3", fmt(clearZones.zone3.downward), fmt(clearZones.zone3.uplift)],
    ["",                "Zone 2", fmt(clearZones.zone2.downward), fmt(clearZones.zone2.uplift)],
    ["",                "Zone 1", fmt(clearZones.zone1.downward), fmt(clearZones.zone1.uplift)],
    ["OBS Wind Flow",   "Zone 3", fmt(obsZones.zone3.downward),   fmt(obsZones.zone3.uplift)],
    ["",                "Zone 2", fmt(obsZones.zone2.downward),   fmt(obsZones.zone2.uplift)],
    ["",                "Zone 1", fmt(obsZones.zone1.downward),   fmt(obsZones.zone1.uplift)],
  ];
  windRows.forEach(([type, zone, down, up], i) => {
    if (i % 2 === 0 && type) {
      doc.setFillColor(250, 250, 250);
      doc.rect(ML, y - 9, CW, 13, "F");
    }
    if (type) text(type, cols[0], y, { size: 8 });
    text(zone, cols[1], y, { size: 8 });
    text(down, cols[2] + 30, y,
      { size: 8, font: MONO, align: "right",
        color: parseFloat(down) >= 0 ? [39, 80, 10] : [121, 31, 31] });
    text(up,   cols[3] + 30, y,
      { size: 8, font: MONO, align: "right",
        color: parseFloat(up) >= 0 ? [39, 80, 10] : [121, 31, 31] });
    y += 13;
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — Snow Loads & Purlin Design
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(2);

  sectionTitle("SNOW LOADS");

  kvRow("Ground Snow Load (pg)",  fmt(formData.GroundSnow, 2),        "psf");
  kvRow("Risk Category",          "I",                                 "");
  kvRow("Exposure Category",      formData.exposure,                   "");
  kvRow("Exposure of Roof",       formData.exposureofRoof,             "");
  kvRow("Exposure Factor (Ce)",   fmt(Ce, 1),                          "Table 7.3-1");
  kvRow("Thermal Factor (Ct)",    fmt(formData.ThermalFactor, 1),      "Table 7.3-2");
  kvRow("Importance Factor (Is)", fmt(formData.ImportanceFactor, 1),   "Table 1.5-2");
  kvRow("Flat Roof Snow Load (pf)", fmt(flatRoofSnow, 2),              "psf");
  y += 4;
  kvRow("Min Snow Load Upper Limit", fmt(formData.MinSnowLoadUpperLimit, 0), "psf");
  kvRow("Minimum Snow Load",      fmt(MinimumSnowLoad, 2),             "psf");
  text(
    MinimumSnowLoad > flatRoofSnow ? "→  Min Governs" : "→  Use Pf",
    ML + 30, y, { size: 8, color: BLUE, style: "bold" }
  );
  y += 14;
  kvRow("Slope Factor (Cs)",      fmt(SlopeFactor, 2),                 "");
  kvRow("Roof Slope",             fmt(formData.roofSlope, 0),          "deg");
  rule(ML + 30, y, ML + 260, 0.5, LIGHT);
  y += 4;
  kvRow("Sloped Roof Snow Load (ps)", fmt(slopedRoofSnow, 2),         "psf");

  sectionTitle("STEEL PURLIN DESIGN (WIND)");

  kvRow("Span",            fmt(formData.Purlin_Length, 2),       "ft");
  kvRow("Over Hang",       fmt(formData.purlinOverhangLength, 2), "ft");
  kvRow("Tributary Width", fmt(formData.purlinTribWidth, 2),     "ft");
  kvRow("Angle",           fmt(formData.roofSlope, 0),           "Deg");

  y += 4;
  text("Wind Load — Worst Case (Zone 3)", ML + 14, y, { size: 8.5, style: "bold" });
  y += 12;
  kvRow("Downward", fmt(worstDown), "psf");
  kvRow("Uplift",   fmt(worstUp),   "psf");

  y += 4;
  text("Distributed Load (Purlin Line Loads)", ML + 14, y, { size: 8.5, style: "bold" });
  y += 12;

  subTitle("Strong Axis");
  kvRow("Dead Load D",          fmt(D_psf),                                    "psf");
  kvRow("wD = D × Trib",        fmt(D_psf * formData.purlinTribWidth),         "plf");
  kvRow("Live Load Floor",       "0.00",                                        "psf");
  kvRow("Live Load Roof Lr",    "20.00",                                        "psf");
  kvRow("wLr = Lr × Trib",      fmt(20 * formData.purlinTribWidth),            "plf");
  kvRow("Snow Load S",           fmt(slopedRoofSnow * formData.purlinTribWidth), "psf");
  kvRow("wS = S × Trib",        fmt(slopedRoofSnow * formData.purlinTribWidth * formData.purlinTribWidth), "plf");
  kvRow("Wind Load W Downward",  fmt(qh),                                       "psf");
  kvRow("wW Downward",          fmt(qh * formData.purlinTribWidth),             "plf");
  kvRow("Wind Load W Uplift",    fmt(-qh),                                      "psf");
  kvRow("wW Uplift",            fmt(-qh * formData.purlinTribWidth),            "plf");

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — C&C & MWFRS Wind Pressure Parameters
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(3);

  sectionTitle("C&C WIND PRESSURE PARAMETERS  (ASCE 7-16 §30.7)");

  text(
    `Mean Roof height = ${formData.meanRoofHeight} ft  ·  ${formData.v3s} mph  ·  Exposure ${formData.exposure}  ·  Monoslope Free Roofs`,
    ML, y, { size: 8, color: MID }
  );
  y += 16;

  const params = [
    ["V3s",                    fmt(formData.v3s, 0), "mph",  "3-sec gust wind speed"],
    ["Exposure",               formData.exposure,    "",     "ASCE 7-16 §26.7.3"],
    ["Kzt",                    fmt(formData.kzt),    "",     "Figure 26.8-1"],
    ["Kd",                     fmt(formData.kd, 2),  "",     "Table 26.6-1"],
    ["Ke",                     fmt(ke, 2),           "",     "Table 26.9-1"],
    ["Kz",                     fmt(Kz, 2),           "",     "Table 26.10-1"],
    ["h",                      fmt(formData.meanRoofHeight, 0), "ft", "Mean roof height"],
    ["L (Building Width)",     fmt(formData.BuildingWidth, 2),  "ft", ""],
    ["Building Length",        fmt(formData.BuildingLength, 2), "ft", ""],
    ["Minimum Width",          fmt(formData.minimumWidth, 2),   "ft", ""],
    ["a",                      fmt(aVal, 2),         "ft",   ""],
    ["Trib Area",              fmt(TribArea, 2),     "sq ft",""],
    ["Area Classification",    areaLabel,            "",     ""],
    ["qh (velocity pressure)", fmt(qh, 2),           "psf",  "Eq. 26.10-1"],
  ];

  params.forEach(([key, val, unit, note]) => {
    const xKey  = ML + 30;
    const xVal  = ML + 200;
    const xNote = ML + 280;
    text(key, xKey, y, { size: 8.5, font: MONO, style: "bold" });
    text("=", xVal - 20, y, { size: 8.5 });
    text(val, xVal, y, { size: 8.5, font: MONO, style: "bold" });
    if (unit) text(unit, xVal + doc.getTextWidth(val) + 4, y, { size: 8, color: MID });
    if (note) text(`[${note}]`, xNote + 60, y, { size: 7.5, color: MID });
    y += 13;
  });

  sectionTitle("MWFRS WIND PRESSURE PARAMETERS  (ASCE 7-16 §27.4-4)");

  text(
    "Design Equation:  qh = 0.00256 × Kz × Kzt × Kd × Ke × V²   [Eq 26.10-1]",
    ML, y, { size: 8, font: MONO }
  );
  y += 14;
  text(`Kz = 2.01 × (h / zg)^(2/α) = ${fmt(Kz, 2)}`, ML, y, { size: 8, font: MONO });
  y += 14;
  text(`pMWFRS = qh = ${fmt(qh, 2)} psf`, ML, y,
    { size: 9, font: MONO, style: "bold", color: BLUE });
  y += 20;

  text("Note: 1. Negative pressures act perpendicular away from the roof surface.", ML, y, { size: 7.5, color: MID });
  y += 11;
  text("       2. Positive pressures act perpendicular toward the surface.", ML, y, { size: 7.5, color: MID });
  y += 11;
  text("       3. Tabulated values are in psf.", ML, y, { size: 7.5, color: MID });
  y += 20;

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — Foundation & Column Data + Load Summary
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(4);

  sectionTitle("FOUNDATION DATA");

  kvRow("Foundation Depth",         fmt(formData.foundationDepth, 2),          "ft");
  kvRow("Foundation Diameter",      fmt(formData.foundationDia, 2),            "ft");
  kvRow("Foundation Moment",        fmt(formData.foundationMoment, 2),         "kip·ft");
  kvRow("Lateral Bearing Pressure", fmt(formData.lateralBearingPressure, 0),   "psf");

  sectionTitle("COLUMN DATA");

  kvRow("Column Distance",    fmt(formData.columnDistance, 2),  "ft");
  kvRow("Column Height",      fmt(formData.columnHeight, 2),    "ft");
  kvRow("Column Placement 1", fmt(formData.columnPlace1, 3),    "ft");
  kvRow("Column Placement 2", fmt(formData.columnPlace2, 2),    "ft");

  sectionTitle("LOAD SUMMARY TABLE — Convert Area Loads to Line Loads");

  const tribW = formData.purlinTribWidth;
  const summaryLoads = [
    { label: "D — Dead Load",       psf: D_psf,         plf: D_psf * tribW },
    { label: "L — Live Load Floor", psf: 0,             plf: 0 },
    { label: "Lr — Live Load Roof", psf: 20,            plf: 20 * tribW },
    { label: "S — Snow Load",       psf: slopedRoofSnow, plf: slopedRoofSnow * tribW },
    { label: "W — Wind Load",       psf: qh,            plf: qh * tribW },
    { label: "E — Seismic",         psf: 0,             plf: 0 },
  ];

  const tc = [ML, ML + 220, ML + 320, MR];
  doc.setFillColor(...BLUE);
  doc.rect(ML, y - 9, CW, 14, "F");
  ["Load Type", "psf", `× ${tribW} ft`, "plf"].forEach((h, i) => {
    text(h, tc[i] + (i > 0 ? 30 : 4), y,
      { size: 8.5, style: "bold", color: [255, 255, 255], align: i > 0 ? "right" : "left" });
  });
  y += 8;
  rule(ML, y, MR, 0.5, LIGHT);
  y += 8;

  summaryLoads.forEach(({ label, psf, plf }, i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 249, 252); doc.rect(ML, y - 9, CW, 13, "F"); }
    text(label, ML + 4, y, { size: 8.5 });
    text(fmt(psf, 1), tc[1] + 30, y, { size: 8.5, font: MONO, align: "right" });
    text(`×${tribW}`,  tc[2] + 30, y, { size: 8, color: MID, align: "right" });
    text(fmt(plf, 1), MR,          y,
      { size: 8.5, font: MONO, style: "bold", color: BLUE, align: "right" });
    y += 13;
  });

  sectionTitle("LOADS INPUT");
  kvRow("UDL Member Label",       formData.udlMemberLabel     || "—", "");
  kvRow("Point Load Node Number", formData.pointLoadNodeNumber || "—", "");

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 5 — CN Zone Pressures (Carport MWFRS Table 27.3-3)
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(5);

  sectionTitle("CARPORT CN ZONE PRESSURES  (ASCE 7-16 Table 27.3-3)");

  text(
    `Roof Angle: ${fmt(cnAngle, 1)}°  ·  Effective Wind Area: ${AREA_LABELS[areaIdx]}  ·  qh = ${fmt(qh)} psf  ·  G = 0.85`,
    ML, y, { size: 8, color: MID }
  );
  y += 6;
  text(
    `Formula: p = qh × G × CN    [p = ${fmt(qh)} × 0.85 × CN]`,
    ML, y, { size: 8, font: MONO, color: MID }
  );
  y += 18;

  drawZoneTable("OBSTRUCTED WIND FLOW", obsZones, BLUE);
  y += 4;
  drawZoneTable("CLEAR WIND FLOW", clearZones, GREEN);

  text("Note: Downward = positive CN · Uplift = negative CN · Ref: ASCE 7-16 Table 27.3-3",
    ML, y, { size: 7.5, color: MID });
  y += 14;

  // ── Carport Wind section inputs (mirroring the "Carport Wind" screen card) ──
  sectionTitle("CARPORT WIND SUMMARY");

  kvRow("Velocity Pressure (qh)",  fmt(qh, 4),      "psf");
  kvRow("a",                       fmt(aVal, 2),     "ft");
  kvRow("a²",                      fmt(a2, 2),       "sq ft");
  kvRow("Trib Area",               fmt(TribArea, 2), "sq ft");
  kvRow("Area Classification",     areaLabel,        "");
  kvRow("Effective Wind Area Index", String(areaIdx) + "  (" + AREA_LABELS[areaIdx] + ")", "");
  y += 4;
  text("Worst Case (Zone 3 governs):", ML + 14, y, { size: 8.5, style: "bold" });
  y += 13;
  kvRow("Worst Downward Pressure", fmt(worstDown), "psf");
  kvRow("Worst Uplift Pressure",   fmt(worstUp),   "psf");

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 6 — MWFRS Wind Pressure Lookup
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(6);

  sectionTitle("MWFRS WIND PRESSURE LOOKUP  (ASCE 7-16 §27.4-4)");

  text(
    `Roof Angle: ${fmt(cnAngle, 1)}°  ·  qh = ${fmt(qh)} psf  ·  G = 0.85  ·  Kz = ${fmt(Kz, 2)}  ·  Ke = ${fmt(ke, 2)}`,
    ML, y, { size: 8, color: MID }
  );
  y += 6;
  text(
    "Formula: p = qh × G × CN    CNW = windward coeff · CNL = leeward coeff",
    ML, y, { size: 8, font: MONO, color: MID }
  );
  y += 18;

  // γ = 0° pair
  text("Wind Direction γ = 0°", ML, y, { size: 9, style: "bold", color: BLUE });
  y += 14;
  drawWindTable("Clear Wind Flow — γ = 0°", windResult.clearGamma0, BLUE);
  drawWindTable("Obstructed Wind Flow — γ = 0°", windResult.obsGamma0, GREEN);

  y += 4;
  // γ = 180° pair
  text("Wind Direction γ = 180°", ML, y, { size: 9, style: "bold", color: BLUE });
  y += 14;
  drawWindTable("Clear Wind Flow — γ = 180°", windResult.clearGamma180, BLUE);
  drawWindTable("Obstructed Wind Flow — γ = 180°", windResult.obsGamma180, GREEN);

  text(
    "CNW = windward net pressure coeff · CNL = leeward net pressure coeff · Ref: ASCE 7-16 §27.4-4",
    ML, y, { size: 7.5, color: MID }
  );
  y += 14;

  // ══════════════════════════════════════════════════════════════════════════
  // PAGES 7 & 8 — Full CN Reference Tables (ASCE 7-16 Table 27.3-3)
  // ══════════════════════════════════════════════════════════════════════════

  function drawFullCNTable(flow, pageNum) {
    doc.addPage();
    drawHeader(pageNum);

    const flowLabel = flow === "obstructed" ? "OBSTRUCTED WIND FLOW" : "CLEAR WIND FLOW";
    sectionTitle(`FULL CN REFERENCE TABLE — ${flowLabel}  (ASCE 7-16 Table 27.3-3)`);

    text(
      `p = qh × G × CN   |   qh = ${fmt(qh)} psf  ·  G = 0.85   ·   Top = CN  ·  (parens) = p (psf)`,
      ML, y, { size: 8, color: MID, font: MONO }
    );
    y += 14;

    // Column layout: Angle(42) + Area(90) + 6 cols × 62 = 504 = CW
    const angleW = 42;
    const areaW  = 90;
    const colW   = 62;
    const xA     = ML;
    const xAr    = ML + angleW;
    const xs     = [0, 1, 2, 3, 4, 5].map(i => xAr + areaW + colW * i);
    const ROW_H  = 22;

    // Header row 1 — Zone span labels
    doc.setFillColor(...HEADER_BG);
    doc.rect(ML, y - 10, CW, 13, "F");
    doc.setFillColor(14, 54, 120);
    doc.rect(xs[0], y - 10, colW * 2, 13, "F");
    text("Roof Angle",          xA  + angleW / 2, y, { size: 7.5, style: "bold", color: BLACK,       align: "center" });
    text("Effective Wind Area", xAr + areaW  / 2, y, { size: 7,   style: "bold", color: BLACK,       align: "center" });
    text("Zone 3",  xs[0] + colW,     y, { size: 8, style: "bold", color: [255, 255, 255], align: "center" });
    text("Zone 2",  xs[2] + colW,     y, { size: 8, style: "bold", color: BLACK,           align: "center" });
    text("Zone 1",  xs[4] + colW,     y, { size: 8, style: "bold", color: BLACK,           align: "center" });
    y += 13;

    // Header row 2 — CN(+)/CN(-) sub-headers
    doc.setFillColor(...HEADER_BG);
    doc.rect(ML, y - 10, CW, 12, "F");
    ["CN(+)/p", "CN(−)/p", "CN(+)/p", "CN(−)/p", "CN(+)/p", "CN(−)/p"].forEach((h, i) => {
      text(h, xs[i] + colW / 2, y, { size: 7, style: "bold", align: "center" });
    });
    y += 12;
    rule(ML, y, MR, 0.5, LIGHT);
    y += 4;

    // Data rows
    CN_DATA_PDF[flow].forEach((group) => {
      const groupStartY = y;

      // Draw 3 area rows (skipping angle column)
      group.rows.forEach((row, ri) => {
        const rowY = groupStartY + ri * ROW_H;
        doc.setFillColor(...(ri === 1 ? [255, 255, 255] : [250, 250, 250]));
        doc.rect(xAr, rowY, MR - xAr, ROW_H, "F");

        const aLabel = ["≤ a²", "> a², ≤ 4.0 a²", "> 4.0 a²"][row.ai];
        text(aLabel, xAr + 3, rowY + 14, { size: 7, color: [100, 100, 100] });

        [row.z3p, row.z3n, row.z2p, row.z2n, row.z1p, row.z1n].forEach((cn, ci) => {
          const p   = qh * G * cn;
          const pos = cn >= 0;
          const clr = pos ? [39, 80, 10] : [121, 31, 31];
          const cx  = xs[ci] + colW / 2;
          text(fmt(cn),      cx, rowY + 9,  { size: 7.5, font: MONO, style: "bold", color: clr, align: "center" });
          text(`(${fmt(p)})`, cx, rowY + 18, { size: 6.5, font: MONO,               color: clr, align: "center" });
        });
      });

      // Angle merged cell (drawn over 3 rows)
      const groupH = ROW_H * 3;
      doc.setFillColor(235, 237, 241);
      doc.rect(xA, groupStartY, angleW - 1, groupH, "F");
      text(`${group.angle}°`, xA + angleW / 2, groupStartY + groupH / 2 + 4,
        { size: 9, style: "bold", align: "center" });

      y = groupStartY + groupH;
      rule(ML, y, MR, 0.3, [210, 210, 210]);
      y += 5;
    });

    text(
      "Ref: ASCE 7-16 Table 27.3-3  ·  CN(+) = downward pressure  ·  CN(−) = uplift pressure",
      ML, y, { size: 7.5, color: MID }
    );
    y += 11;
  }

  drawFullCNTable("obstructed", 7);
  drawFullCNTable("clear", 8);

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 9 — Full MWFRS Wind Pressure Reference Table
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(9);

  sectionTitle("FULL MWFRS WIND PRESSURE REFERENCE TABLE  (ASCE 7-16 §27.4-4)");
  text(
    `p = qh × G × CN  |  qh = ${fmt(qh)} psf  ·  G = 0.85  ·  Top = CN  ·  (parens) = p (psf)`,
    ML, y, { size: 8, color: MID, font: MONO }
  );
  y += 14;

  // Column layout: Angle(40) + LC(52) + 8 cols × 51 = 408 → total = 500 ≈ CW
  const wA2    = 40;
  const wLC    = 52;
  const wCN    = 51;
  const wXA    = ML;
  const wXLC   = ML + wA2;
  const windXs = Array.from({ length: 8 }, (_, i) => wXLC + wLC + wCN * i);
  const WRH    = 22; // MWFRS row height

  // Header row 1 — direction spans
  const bY1 = y;
  doc.setFillColor(...HEADER_BG);
  doc.rect(ML, bY1 - 10, CW, 13, "F");
  doc.setFillColor(219, 234, 254);
  doc.rect(windXs[0], bY1 - 10, wCN * 4, 13, "F");
  text("Wind Direction γ = 0°",   windXs[0] + wCN * 2, bY1, { size: 7.5, style: "bold", color: [30,  64, 175], align: "center" });
  doc.setFillColor(220, 252, 231);
  doc.rect(windXs[4], bY1 - 10, wCN * 4, 13, "F");
  text("Wind Direction γ = 180°", windXs[4] + wCN * 2, bY1, { size: 7.5, style: "bold", color: [22, 101,  52], align: "center" });
  text("Roof", wXA  + 2, bY1, { size: 7.5, style: "bold" });
  text("Load", wXLC + 2, bY1, { size: 7.5, style: "bold" });
  y += 13;

  // Header row 2 — flow type spans
  const bY2 = y;
  doc.setFillColor(...HEADER_BG);
  doc.rect(ML, bY2 - 10, CW, 12, "F");
  [
    [0, "Clear Wind Flow", [219, 234, 254], [30,  64, 175]],
    [2, "Obs. Wind Flow",  [220, 252, 231], [22, 101,  52]],
    [4, "Clear Wind Flow", [219, 234, 254], [30,  64, 175]],
    [6, "Obs. Wind Flow",  [220, 252, 231], [22, 101,  52]],
  ].forEach(([startIdx, lbl, bg, clr]) => {
    doc.setFillColor(...bg);
    doc.rect(windXs[startIdx], bY2 - 10, wCN * 2, 12, "F");
    text(lbl, windXs[startIdx] + wCN, bY2, { size: 7, style: "bold", color: clr, align: "center" });
  });
  text("Angle", wXA  + 2, bY2, { size: 7, style: "bold" });
  text("Case",  wXLC + 2, bY2, { size: 7, style: "bold" });
  y += 12;

  // Header row 3 — CNW / CNL labels
  const bY3 = y;
  doc.setFillColor(...HEADER_BG);
  doc.rect(ML, bY3 - 10, CW, 12, "F");
  windXs.forEach((x, i) => {
    text(i % 2 === 0 ? "CNW" : "CNL", x + wCN / 2, bY3, { size: 7, style: "bold", align: "center" });
  });
  y += 12;
  rule(ML, y, MR, 0.5, LIGHT);
  y += 4;

  // Data rows
  WIND_DATA_PDF.clearGamma0.forEach((group, gi) => {
    const gY    = y;
    const cg0   = WIND_DATA_PDF.clearGamma0[gi];
    const cg180 = WIND_DATA_PDF.clearGamma180[gi];
    const og0   = WIND_DATA_PDF.obsGamma0[gi];
    const og180 = WIND_DATA_PDF.obsGamma180[gi];

    ["A", "B"].forEach((lc, li) => {
      const rowY = gY + li * WRH;
      doc.setFillColor(...(li === 0 ? [250, 250, 250] : [255, 255, 255]));
      doc.rect(wXLC, rowY, MR - wXLC, WRH, "F");

      text(`Case ${lc}`, wXLC + 3, rowY + 14, { size: 8, style: "bold" });

      const r0c   = cg0.rows.find(r => r.lc === lc);
      const r0o   = og0.rows.find(r => r.lc === lc);
      const r180c = cg180.rows.find(r => r.lc === lc);
      const r180o = og180.rows.find(r => r.lc === lc);

      [r0c.cnw, r0c.cnl, r0o.cnw, r0o.cnl, r180c.cnw, r180c.cnl, r180o.cnw, r180o.cnl]
        .forEach((cn, ci) => {
          const p   = qh * G * cn;
          const pos = cn >= 0;
          const clr = pos ? [39, 80, 10] : [121, 31, 31];
          const cx  = windXs[ci] + wCN / 2;
          text(fmt(cn),      cx, rowY + 9,  { size: 7.5, font: MONO, style: "bold", color: clr, align: "center" });
          text(`(${fmt(p)})`, cx, rowY + 18, { size: 6.5, font: MONO,               color: clr, align: "center" });
        });
    });

    // Angle merged cell
    const gH = WRH * 2;
    doc.setFillColor(235, 237, 241);
    doc.rect(wXA, gY, wA2 - 1, gH, "F");
    text(`${group.angle}°`, wXA + wA2 / 2, gY + gH / 2 + 4,
      { size: 9, style: "bold", align: "center" });

    y = gY + gH;
    rule(ML, y, MR, 0.3, [210, 210, 210]);
    y += 5;
  });

  text(
    "CNW = windward CN · CNL = leeward CN · Load Cases A & B · Ref: ASCE 7-16 §27.4-4",
    ML, y, { size: 7.5, color: MID }
  );
  y += 14;

  // ── Footer (last page) ──────────────────────────────────────────────────────
  y = H - 80;
  rule(ML, y, MR, 0.5, LIGHT);
  y += 12;
  text(
    "This document was generated from the Carport Structural Calculator.",
    ML, y, { size: 7.5, color: MID }
  );
  y += 11;
  text(
    `Design Standard: ASCE 7-${formData.ASCE || "16"}   |   IBC 2021   |   Wind Speed: ${formData.v3s} mph   |   Exposure: ${formData.exposure}`,
    ML, y, { size: 7.5, color: MID }
  );

  // ── Save ──────────────────────────────────────────────────────────────────────
  const fileName = `Structural_Calc_${(formData.sitename || "Report").replace(/\s+/g, "_")}_${
    new Date().toISOString().slice(0, 10)
  }.pdf`;
  doc.save(fileName);
}
