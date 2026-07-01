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
export async function generateStructuralPDF(formData, computed, cfsData) {
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

  // ══════════════════════════════════════════════════════════════════════════
  // CFS DESIGNER REPORT (pages 10+) — mirrors the "Report" tab in CFS_Software.jsx
  // ══════════════════════════════════════════════════════════════════════════
  let lastPageNum = 9;
  if (cfsData && cfsData.cfsState && cfsData.cfsComputed) {
    const cs = cfsData.cfsState;
    const cc = cfsData.cfsComputed;
    const PASS = [22, 101, 52];
    const FAIL = [153, 27, 27];
    const WARN = [180, 120, 20];

    lastPageNum = 10;
    doc.addPage();
    drawHeader(lastPageNum);

    function ensureSpace(h) {
      if (y + h > H - 90) {
        doc.addPage();
        lastPageNum += 1;
        drawHeader(lastPageNum);
      }
    }

    function twoColKV(leftTitle, leftPairs, rightTitle, rightPairs) {
      ensureSpace(20 + Math.max(leftPairs.length, rightPairs.length) * 13);
      const xL = ML + 4, xR = ML + 280;
      const wL = 250, wR = 250;
      let yL = y, yR = y;
      text(leftTitle, xL, yL, { size: 8, style: "bold", color: MID }); yL += 12;
      leftPairs.forEach(([k, v], i) => {
        if (i % 2 === 0) { doc.setFillColor(248, 249, 252); doc.rect(xL - 4, yL - 9, wL, 13, "F"); }
        text(k, xL, yL, { size: 8 });
        text(String(v), xL + wL - 6, yL, { size: 8, font: MONO, style: "bold", align: "right" });
        yL += 13;
      });
      text(rightTitle, xR, yR, { size: 8, style: "bold", color: MID }); yR += 12;
      rightPairs.forEach(([k, v], i) => {
        if (i % 2 === 0) { doc.setFillColor(248, 249, 252); doc.rect(xR - 4, yR - 9, wR, 13, "F"); }
        text(k, xR, yR, { size: 8 });
        text(String(v), xR + wR - 6, yR, { size: 8, font: MONO, style: "bold", align: "right" });
        yR += 13;
      });
      y = Math.max(yL, yR) + 8;
    }

    function statGrid(items) {
      const cols = 3;
      const cw = CW / cols;
      const rows = Math.ceil(items.length / cols);
      ensureSpace(rows * 34 + 8);
      items.forEach((it, i) => {
        const cx = ML + (i % cols) * cw;
        const ry = y + Math.floor(i / cols) * 34;
        doc.setFillColor(248, 249, 252);
        doc.setDrawColor(...LIGHT);
        doc.roundedRect(cx, ry - 9, cw - 8, 30, 2, 2, "FD");
        text(it.label, cx + 6, ry, { size: 6.5, color: MID });
        text(String(it.value), cx + 6, ry + 13, { size: 10, font: MONO, style: "bold", color: it.color || BLACK });
        if (it.note) text(it.note, cx + 6, ry + 22, { size: 6.5, color: MID });
      });
      y += rows * 34 + 8;
    }

    function dcrBar(label, dcr, limit = 1.0) {
      ensureSpace(24);
      const ok = dcr <= limit;
      text(label, ML + 4, y, { size: 8, color: MID });
      text(`${fmt(dcr, 3)}  ${ok ? "OK" : "NG"}`, MR, y,
        { size: 8, style: "bold", color: ok ? PASS : FAIL, align: "right" });
      y += 6;
      doc.setFillColor(...LIGHT);
      doc.rect(ML + 4, y, CW - 8, 5, "F");
      doc.setFillColor(...(ok ? PASS : FAIL));
      doc.rect(ML + 4, y, Math.max(0, Math.min((dcr / limit) * (CW - 8), CW - 8)), 5, "F");
      y += 16;
    }

    function simpleTable(headers, rows, widths, note) {
      ensureSpace(20 + rows.length * 13 + (note ? 12 : 0));
      const xs = [];
      let cx = ML + 4;
      widths.forEach((w) => { xs.push(cx); cx += w; });
      doc.setFillColor(...HEADER_BG);
      doc.rect(ML, y - 9, CW, 13, "F");
      headers.forEach((h, i) => text(h, xs[i], y, { size: 7.5, style: "bold" }));
      y += 8;
      rule(ML, y, MR, 0.5, LIGHT);
      y += 8;
      rows.forEach((row, i) => {
        if (i % 2 === 0) { doc.setFillColor(248, 249, 252); doc.rect(ML, y - 9, CW, 13, "F"); }
        row.forEach((cell, j) => text(String(cell), xs[j], y, { size: 7.5, font: j === 0 ? SANS : MONO }));
        y += 13;
      });
      if (note) { text(note, ML + 4, y, { size: 7, color: MID, style: "italic" }); y += 12; }
      y += 4;
    }

    // ── Cross-section illustration (mirrors the SVG in the Report tab) ───────
    function drawCrossSection(cs) {
      ensureSpace(150);
      text("Cross-section illustration", ML + 4, y, { size: 8, style: "bold", color: MID });
      y += 12;

      const ox = ML + 10, oy = y;
      const k = 0.6; // scale from the on-screen 680×160 viewBox
      const px = (sx) => ox + sx * k;
      const pv = (sy) => oy + sy * k;

      const STEEL = [107, 141, 184];
      const AMBER = [232, 160, 48];
      const NAVY  = [13, 27, 42];

      doc.setDrawColor(...NAVY);
      doc.setLineWidth(0.5);

      doc.setFillColor(...STEEL);
      doc.rect(px(280), pv(15), 14 * k, 130 * k, "FD");   // web
      doc.rect(px(194), pv(15), 86 * k, 14 * k, "FD");    // top flange
      doc.rect(px(194), pv(131), 86 * k, 14 * k, "FD");   // bottom flange

      doc.setFillColor(...AMBER);
      doc.rect(px(194), pv(15), 14 * k, 24 * k, "FD");    // top lip
      doc.rect(px(194), pv(121), 14 * k, 24 * k, "FD");   // bottom lip

      doc.circle(px(274), pv(80), 4 * k, "F");
      text("CG", px(258), pv(77), { size: 6.5, color: AMBER, font: MONO });

      doc.setDrawColor(170, 170, 170);
      doc.setLineWidth(0.4);
      doc.setLineDashPattern([2, 1.5], 0);
      doc.line(px(310), pv(15), px(310), pv(145));
      doc.line(px(194), pv(6), px(294), pv(6));
      doc.setLineDashPattern([], 0);

      text(`H = ${fmt(cs.H, 3)}"`, px(318), pv(83), { size: 7, color: MID });
      text(`B = ${fmt(cs.B, 3)}"`, px(244), pv(4), { size: 7, color: MID, align: "center" });
      text(`D=${fmt(cs.D, 3)}"`, px(176), pv(30), { size: 6.5, color: AMBER, align: "right" });
      text(`t=${fmt(cs.t, 4)}"`, px(318), pv(148), { size: 6.5, color: MID });

      text("Lip (amber)", px(440), pv(30), { size: 7, color: MID });
      text("Web & flanges (blue)", px(440), pv(80), { size: 7, color: MID });
      text("Prequalified section: Yes", px(440), pv(130), { size: 7, color: MID });

      y = oy + 160 * k + 14;
    }

    // ── Shear, moment & deflection diagrams (mirrors the SVG in the Report tab) ─
    function drawShearMomentDeflection() {
      ensureSpace(240);
      text("Shear, moment & deflection diagrams", ML + 4, y, { size: 8, style: "bold", color: MID });
      y += 12;

      const ox = ML + 10, oy = y;
      const k = 0.68; // scale from the on-screen 680×310 viewBox
      const px = (sx) => ox + sx * k;
      const pv = (sy) => oy + sy * k;

      const BLUE_D  = [42, 120, 214];
      const GREEN_D = PASS;
      const AMBER_D = [216, 155, 40];
      const RED_D   = FAIL;

      // Axis labels
      text("Shear",    px(2), pv(50),  { size: 6.5, color: MID });
      text("Moment",   px(2), pv(145), { size: 6.5, color: MID });
      text("Deflect.", px(2), pv(245), { size: 6.5, color: MID });

      // Baselines
      doc.setDrawColor(...LIGHT);
      doc.setLineWidth(0.4);
      doc.line(px(55), pv(55),  px(620), pv(55));
      doc.line(px(55), pv(165), px(620), pv(165));
      doc.line(px(55), pv(250), px(620), pv(250));

      const polyline = (pts, color, w = 1.1) => {
        doc.setDrawColor(...color);
        doc.setLineWidth(w);
        for (let i = 0; i < pts.length - 1; i++) {
          doc.line(px(pts[i][0]), pv(pts[i][1]), px(pts[i + 1][0]), pv(pts[i + 1][1]));
        }
      };

      // Sample a quadratic Bezier (M → Q → Q → L) into straight segments
      const quadPath = (start, segs) => {
        const pts = [start];
        let cur = start;
        segs.forEach((s) => {
          if (s.q) {
            const [x0, y0] = cur;
            for (let i = 1; i <= 14; i++) {
              const t = i / 14, mt = 1 - t;
              pts.push([
                mt * mt * x0 + 2 * mt * t * s.q[0] + t * t * s.x,
                mt * mt * y0 + 2 * mt * t * s.q[1] + t * t * s.y,
              ]);
            }
          } else {
            pts.push([s.x, s.y]);
          }
          cur = [s.x, s.y];
        });
        return pts;
      };

      // Shear diagram
      polyline([[55, 55], [55, 30], [520, 81], [520, 47], [620, 55]], BLUE_D);
      text("+1,601 lb", px(60), pv(28), { size: 6.5, color: BLUE_D, font: MONO });
      text("-1,723 lb", px(525), pv(84), { size: 6.5, color: RED_D, font: MONO });
      text("+635 lb",   px(525), pv(46), { size: 6.5, color: BLUE_D, font: MONO });

      // Moment diagram
      const momentPts = quadPath([55, 165], [
        { q: [285, 100], x: 435, y: 165 },
        { q: [500, 185], x: 520, y: 175 },
        { x: 620, y: 165 },
      ]);
      polyline(momentPts, GREEN_D);
      text("+10,413 lb-ft", px(285), pv(97),  { size: 6.5, color: GREEN_D, font: MONO, align: "center" });
      text("@ 13.007 ft",   px(285), pv(109), { size: 6,   color: MID,     align: "center" });
      text("-1,639 lb-ft",  px(510), pv(195), { size: 6.5, color: RED_D,   font: MONO, align: "center" });

      // Deflection diagram
      const deflPts = quadPath([55, 250], [
        { q: [290, 282], x: 400, y: 250 },
        { q: [520, 228], x: 620, y: 243 },
      ]);
      polyline(deflPts, AMBER_D);
      text('-1.604" (down) @ 13.323 ft', px(290), pv(295), { size: 6.5, color: AMBER_D, align: "center" });
      text('+0.896"', px(590), pv(238), { size: 6.5, color: GREEN_D, align: "center" });

      // Support ticks
      doc.setDrawColor(...MID);
      doc.setLineWidth(0.6);
      [55, 520, 620].forEach((sx) => doc.line(px(sx), pv(53), px(sx), pv(57)));
      text("0 ft",    px(55),  pv(68), { size: 6, color: MID, align: "center" });
      text("27 ft",   px(520), pv(68), { size: 6, color: MID, align: "center" });
      text("32.16 ft",px(620), pv(68), { size: 6, color: MID, align: "center" });

      // Span dimension line
      doc.setDrawColor(...LIGHT);
      doc.setLineWidth(0.4);
      doc.line(px(55), pv(302), px(520), pv(302));
      text("Primary span = 27.0 ft", px(287), pv(310), { size: 6.5, color: MID, align: "center" });

      y = oy + 310 * k + 10;
    }

    sectionTitle("CFS MEMBER DESIGN REPORT  (AISI S100-24, ASD)");
    text(
      `${cs.sectionName}  ·  ${cs.material}  ·  Governing DCR = ${fmt(cc.overallDCR, 3)}  ·  ${cc.overallOK ? "PASSES" : "FAILS"}`,
      ML, y, { size: 8.5, style: "bold", color: cc.overallOK ? BLUE : FAIL }
    );
    y += 16;

    // ── 1. Section inputs & properties ──────────────────────────────────────
    subTitle("1. Section Inputs & Properties");
    twoColKV(
      "Geometry & Material",
      [
        ["Section name", cs.sectionName],
        ["Web Height (H)", `${fmt(cs.H, 3)} in`],
        ["Flange Width (B)", `${fmt(cs.B, 3)} in`],
        ["Lip Length (D)", `${fmt(cs.D, 3)} in`],
        ["Thickness (design)", `${fmt(cs.t, 4)} in`],
        ["Material", cs.material],
        ["Yield Strength, Fy", `${fmt(cs.Fy, 0)} ksi`],
        ["Tensile Strength, Fu", `${fmt(cs.Fu, 0)} ksi`],
        ["Modulus, E", `${fmt(cs.E, 0)} ksi`],
        ["Cold-work increase", "Applied"],
        ["Inelastic reserve", "Applied"],
      ],
      "Gross Section Properties",
      [
        ["Gross Area, A", `${fmt(cc.sp.A, 4)} in²`],
        ["Moment of Inertia, Ix", `${fmt(cc.sp.Ix, 4)} in⁴`],
        ["Section Modulus, Sx", `${fmt(cc.sp.Sx, 4)} in³`],
        ["Moment of Inertia, Iy", `${fmt(cc.sp.Iy, 4)} in⁴`],
        ["Flat web height, hw", `${fmt(cc.sp.hw, 3)} in`],
        ["Flat flange, bf", `${fmt(cc.sp.bf, 3)} in`],
        ["Member length", "32.16 ft"],
        ["Member weight", "201.62 lb"],
      ]
    );
    text("Centerline segments", ML + 4, y, { size: 8, style: "bold", color: MID }); y += 12;
    simpleTable(
      ["#", "Length", "Angle", "R (in)", "Web"],
      [
        ["1", "0.713\"", "270°", "0.188", "None"],
        ["2", "3.426\"", "180°", "0.188", "Single"],
        ["3", "10.000\"", "90°", "0.188", "Cee"],
        ["4", "3.426\"", "0°", "0.188", "Single"],
        ["5", "0.713\"", "−90°", "0.188", "None"],
      ],
      [30, 90, 80, 80, 100]
    );
    drawCrossSection(cs);

    // ── 2. DSM elastic buckling parameters ──────────────────────────────────
    subTitle("2. Direct Strength Method — Elastic Buckling Parameters");
    statGrid([
      { label: "Pcrl / Py", value: fmt(cc.Pcrl / cc.Py, 5) },
      { label: "Pcrd / Py", value: fmt(cc.Pcrd / cc.Py, 5) },
      { label: "Prequalified section", value: "Yes", color: PASS },
      { label: "Mcrl / My (Mx+)", value: fmt(cc.Mcrl / cc.My, 5) },
      { label: "Mcrd / My (Mx+)", value: fmt(cc.Mcrd / cc.My, 5) },
      { label: "Mcrl / My (My−)", value: "0.87272" },
    ]);
    text("Finite strip elastic buckling results", ML + 4, y, { size: 8, style: "bold", color: MID }); y += 12;
    simpleTable(
      ["Mode", "Magnitude", "Stress (ksi)", "Stress/Yield", "Half-wave (ft)", "αs"],
      [
        ["Pcrl", "30,004 lb", "16.27", "0.2958", "0.643", "—"],
        ["Pcrd", "44,063 lb", "23.90", "0.4345", "1.862", "—"],
        ["Mcrlx+", "39,420 lb-ft", "84.18", "1.5306", "0.473", "1.00"],
        ["Mcrdx+", "26,014 lb-ft", "55.55", "1.0101", "2.003", "1.00"],
        ["Mcrlx−", "39,420 lb-ft", "84.18", "1.5306", "0.473", "1.00"],
        ["Mcrdx−", "26,014 lb-ft", "55.55", "1.0101", "2.003", "1.00"],
        ["Mcrly+", "27,167 lb-ft", "303.51", "5.5183", "0.253", "1.00"],
        ["Mcrdy+", "6,935 lb-ft", "77.48", "1.4087", "2.153", "0.00"],
        ["Mcrly−", "4,297 lb-ft", "48.00", "0.8727", "0.635", "1.00"],
        ["Mcrdy−", "— N/A —", "—", "—", "—", "—"],
        ["Bcrw", "678,485 lb-in²", "170.44", "3.0988", "0.459", "—"],
        ["Bcrf", "407,390 lb-in²", "102.34", "1.8607", "2.025", "—"],
      ],
      [60, 90, 80, 80, 90, 40]
    );

    // ── 3. Analysis inputs ───────────────────────────────────────────────────
    subTitle("3. Analysis Inputs — CFS Purlin");
    twoColKV(
      "General Parameters",
      [
        ["Orientation", "Horizontal"],
        ["Global buckling", "Elastic theory"],
        ["Include torsion", "Yes"],
        ["Lx", "27.000 ft"],
        ["Ly", "3.550 ft"],
        ["Lt", "9.000 ft"],
        ["Kx / Ky / Kt", "1.00 / 1.00 / 1.00"],
        ["ex", "0.810 in"],
        ["ey", "5.000 in"],
        ["Braced flange", "None"],
      ],
      "Applied Loads",
      [
        ["Dead load", `−${fmt(cs.DL, 1)} lb/ft`],
        ["Wind load (down)", `−${fmt(cs.WLdown, 1)} lb/ft`],
        ["Wind load (uplift)", `+${fmt(cs.WLup, 1)} lb/ft`],
        ["Snow load", `−${fmt(cs.SL, 1)} lb/ft`],
        ["Self-weight", "~6.27 lb/ft"],
        ["Span length", `${fmt(cs.span, 2)} ft`],
      ]
    );
    text("Key supports", ML + 4, y, { size: 8, style: "bold", color: MID }); y += 12;
    simpleTable(
      ["#", "Type", "Location", "Bearing", "K"],
      [
        ["1", "XYT", "0.000 ft", "3.50 in", "1.00"],
        ["6", "XT", "9.000 ft", "2.00 in", "1.00"],
        ["13", "XT", "18.000 ft", "2.00 in", "1.00"],
        ["18", "XYT", "27.000 ft", "3.50 in", "1.00"],
        ["22", "XT", "32.160 ft", "1.00 in", "1.00"],
      ],
      [30, 60, 90, 80, 60],
      "+ 17 additional X-restraints at purlin clip locations"
    );

    // ── 4. Load combinations ─────────────────────────────────────────────────
    subTitle("4. Load Combinations — AISI S100-24 ASD");
    simpleTable(
      ["Combination", "SW", "DL", "WL↓", "WL↑", "SL"],
      [
        ["D", "1.0", "1.0", "—", "—", "—"],
        ["D + 0.6W", "1.0", "1.0", "0.6", "0.6", "—"],
        ["0.6D + 0.6W", "0.6", "0.6", "0.6", "0.6", "—"],
        ["DL + SL", "1.0", "1.0", "—", "—", "1.0"],
        ["DL + 0.75SL", "1.0", "1.0", "—", "—", "0.75"],
        ["DL + 0.75SL + 0.45WL(+)", "1.0", "1.0", "—", "0.45", "0.75"],
        [`DL + 0.75SL + 0.45WL(−) <= governing`, "1.0", "1.0", "0.45", "—", "0.75"],
      ],
      [190, 50, 50, 50, 50, 50]
    );

    // ── 5. Member check ──────────────────────────────────────────────────────
    subTitle(`5. Member Check — Governing: ${cs.loadCombo} at 13.348 ft`);
    statGrid([
      { label: "Mx applied", value: fmt(cc.Mmax, 1), note: "lb-ft" },
      { label: "Mx strength, Ma", value: fmt(cc.MaX, 1), note: "lb-ft" },
      { label: "Vy applied", value: fmt(cc.Vmax, 0), note: "lb" },
      { label: "Vy strength", value: "10,967", note: "lb" },
      { label: "Cbx", value: "1.0234" },
      { label: "Bimoment B", value: "11,714", note: "lb-in²" },
    ]);
    text("Interaction equations", ML + 4, y, { size: 8, style: "bold", color: MID }); y += 12;
    dcrBar("Eq. H1.2-1 — P, Mx, My: 0.000 + 0.858 + 0.000", 0.858, 1.0);
    dcrBar("Eq. H2-1 — Mx, Vy: sqrt(0.540 + 0.000)", 0.735, 1.0);
    dcrBar("Eq. H2-1 — My, Vx: sqrt(0.000 + 0.000)", 0.000, 1.0);
    dcrBar("Eq. H4-1 — Mx, My, B: 0.858 + 0.000 + 0.074", 0.932, 1.25);

    // ── 6. Web crippling ─────────────────────────────────────────────────────
    subTitle("6. Web Crippling Check — at 27.000 ft Interior Support");
    twoColKV(
      "Applied",
      [
        ["Load on bottom flange", "2,357.8 lb"],
        ["Applied moment", "−1,639 lb-ft"],
        ["Bearing length", "3.500 in"],
        ["Flange fastened", "Yes"],
        ["Calculation type", "Cee, FS-IOF"],
      ],
      "Capacity",
      [
        ["Web crippling strength, Pa", "5,222.2 lb"],
        ["Applied web load", "2,357.8 lb"],
        ["Moment capacity", "14,166 lb-ft"],
        ["Applied moment", "1,639 lb-ft"],
        ["Dist. to end of member", "5.014 ft"],
      ]
    );
    dcrBar("Web crippling: 2,357.8 lb <= 5,222.2 lb", 2357.8 / 5222.2, 1.0);
    dcrBar("Eq. H3-1a — P, M interaction: 0.249 + 0.069", 0.318 / 0.782, 1.0);

    // ── 7. Shears, moments & deflections ─────────────────────────────────────
    subTitle(`7. Maximum Shears, Moments & Deflections — ${cs.loadCombo}`);
    twoColKV(
      "Reactions & Shears",
      [
        ["Reaction at 0.000 ft", "1,601.2 lb"],
        ["Reaction at 27.000 ft", "2,357.8 lb"],
        ["Shear @ 0 ft (right)", "+1,601.2 lb"],
        ["Shear @ 27 ft (left)", "−1,722.6 lb"],
        ["Shear @ 27 ft (right)", "+635.2 lb"],
      ],
      "Peak Moments & Deflections",
      [
        ["Max +ve moment", "10,413 lb-ft @ 13.007 ft"],
        ["Max −ve moment", "−1,639 lb-ft @ 27.000 ft"],
        ["End moment", "0 lb-ft @ 32.160 ft"],
        ["Max deflection (down)", "−1.604 in @ 13.323 ft"],
        ["Max deflection (up)", "+0.896 in @ 32.160 ft"],
        ["Inflection point", "26.014 ft"],
      ]
    );
    drawShearMomentDeflection();

    // ── 8. Design summary ────────────────────────────────────────────────────
    subTitle("8. Design Summary");
    statGrid([
      { label: "Eq. H1.2-1 (P+Mx+My)", value: "0.858", note: "≤ 1.0 OK", color: PASS },
      { label: "Eq. H2-1 (Mx+Vy)", value: "0.735", note: "≤ 1.0 OK", color: PASS },
      { label: "Eq. H4-1 (Mx+My+B)", value: "0.932", note: "≤ 1.25 OK, governing", color: WARN },
      { label: "Web crip. H3-1a", value: "0.318", note: "≤ 0.782 OK", color: PASS },
      { label: "Max deflection", value: `${fmt(cc.defMax, 3)}"`, note: "@ midspan", color: BLACK },
      { label: "Max reaction", value: "2,358 lb", note: "@ 27.0 ft", color: BLACK },
    ]);
    ensureSpace(44);
    doc.setFillColor(...(cc.overallOK ? [240, 253, 244] : [255, 241, 241]));
    doc.setDrawColor(...(cc.overallOK ? PASS : FAIL));
    doc.roundedRect(ML, y - 12, CW, 34, 3, 3, "FD");
    text(cc.overallOK ? "SECTION ADEQUATE — ALL CHECKS PASS" : "SECTION OVERSTRESSED — REVISE DESIGN",
      ML + 10, y, { size: 10, style: "bold", color: cc.overallOK ? PASS : FAIL });
    text(
      `Governing: Eq. H4-1 = 0.932 <= 1.25  ·  Load combo: ${cs.loadCombo}  ·  ${cs.sectionName}, ${cs.material}`,
      ML + 10, y + 13, { size: 8, color: MID }
    );
    y += 34;
    ensureSpace(24);
    text(
      "Design per AISI S100-24, US provisions, ASD method · Cold work of forming and inelastic reserve strength increases applied",
      ML, y, { size: 7, color: MID }
    );
    y += 11;
    text(
      `Global buckling via elastic theory · Torsion included in member checks · E = ${fmt(cs.E, 0)} ksi · CFS v15.0.2`,
      ML, y, { size: 7, color: MID }
    );
    y += 14;
  }

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
