// import { useState, useMemo } from "react";

// // ── Types ────────────────────────────────────────────────────────────────────

// interface AreaRow {
//   area: string;
//   z3p: number;
//   z3n: number;
//   z2p: number;
//   z2n: number;
//   z1p: number;
//   z1n: number;
// }

// interface AngleGroup {
//   angle: number;
//   rows: AreaRow[];
// }

// type FlowType = "obstructed" | "clear";

// // ── CN Data ──────────────────────────────────────────────────────────────────

// const CN_DATA: Record<FlowType, AngleGroup[]> = {
//   obstructed: [
//     {
//       angle: 0,
//       rows: [
//         { area: "≤ a²", z3p: 1, z3n: -3.6, z2p: 0.8, z2n: -1.8, z1p: 0.5, z1n: -1.2 },
//         { area: "> a², ≤ 4.0 a²", z3p: 0.8, z3n: -1.8, z2p: 0.8, z2n: -1.8, z1p: 0.5, z1n: -1.2 },
//         { area: "> 4.0 a²", z3p: 0.5, z3n: -1.2, z2p: 0.5, z2n: -1.2, z1p: 0.5, z1n: -1.2 },
//       ],
//     },
//     {
//       angle: 6,
//       rows: [
//         { area: "≤ a²", z3p: 1.48, z3n: -4.8, z2p: 1.12, z2n: -2.44, z1p: 0.74, z1n: -1.6 },
//         { area: "> a², ≤ 4.0 a²", z3p: 1.12, z3n: -2.44, z2p: 1.12, z2n: -2.44, z1p: 0.74, z1n: -1.6 },
//         { area: "> 4.0 a²", z3p: 0.74, z3n: -1.6, z2p: 0.74, z2n: -1.6, z1p: 0.74, z1n: -1.6 },
//       ],
//     },
//     {
//       angle: 7.5,
//       rows: [
//         { area: "≤ a²", z3p: 1.6, z3n: -5.1, z2p: 1.2, z2n: -2.6, z1p: 0.8, z1n: -1.7 },
//         { area: "> a², ≤ 4.0 a²", z3p: 1.2, z3n: -2.6, z2p: 1.2, z2n: -2.6, z1p: 0.8, z1n: -1.7 },
//         { area: "> 4.0 a²", z3p: 0.8, z3n: -1.7, z2p: 0.8, z2n: -1.7, z1p: 0.8, z1n: -1.7 },
//       ],
//     },
//     {
//       angle: 10,
//       rows: [
//         { area: "≤ a²", z3p: 1.87, z3n: -4.8, z2p: 1.4, z2n: -2.8, z1p: 0.93, z1n: -1.83 },
//         { area: "> a², ≤ 4.0 a²", z3p: 1.4, z3n: -2.8, z2p: 1.4, z2n: -2.8, z1p: 0.93, z1n: -1.83 },
//         { area: "> 4.0 a²", z3p: 0.93, z3n: -1.83, z2p: 0.93, z2n: -1.83, z1p: 0.93, z1n: -1.83 },
//       ],
//     },
//     {
//       angle: 15,
//       rows: [
//         { area: "≤ a²", z3p: 2.4, z3n: -4.2, z2p: 1.8, z2n: -3.2, z1p: 1.2, z1n: -2.1 },
//         { area: "> a², ≤ 4.0 a²", z3p: 1.8, z3n: -3.2, z2p: 1.8, z2n: -3.2, z1p: 1.2, z1n: -2.1 },
//         { area: "> 4.0 a²", z3p: 1.2, z3n: -2.1, z2p: 1.2, z2n: -2.1, z1p: 1.2, z1n: -2.1 },
//       ],
//     },
//     {
//       angle: 30,
//       rows: [
//         { area: "≤ a²", z3p: 3.2, z3n: -4.6, z2p: 2.4, z2n: -3.5, z1p: 1.6, z1n: -2.3 },
//         { area: "> a², ≤ 4.0 a²", z3p: 2.4, z3n: -3.5, z2p: 2.4, z2n: -3.5, z1p: 1.6, z1n: -2.3 },
//         { area: "> 4.0 a²", z3p: 1.6, z3n: -2.3, z2p: 1.6, z2n: -2.3, z1p: 1.6, z1n: -2.3 },
//       ],
//     },
//     {
//       angle: 45,
//       rows: [
//         { area: "≤ a²", z3p: 4.2, z3n: -3.8, z2p: 3.2, z2n: -2.9, z1p: 2.1, z1n: -1.9 },
//         { area: "> a², ≤ 4.0 a²", z3p: 3.2, z3n: -2.9, z2p: 3.2, z2n: -2.9, z1p: 2.1, z1n: -1.9 },
//         { area: "> 4.0 a²", z3p: 2.1, z3n: -1.9, z2p: 2.1, z2n: -1.9, z1p: 2.1, z1n: -1.9 },
//       ],
//     },
//   ],
//   clear: [
//     {
//       angle: 0,
//       rows: [
//         { area: "≤ a²", z3p: 2.4, z3n: -3.3, z2p: 1.8, z2n: -1.7, z1p: 1.2, z1n: -1.1 },
//         { area: "> a², ≤ 4.0 a²", z3p: 1.8, z3n: -1.7, z2p: 1.8, z2n: -1.7, z1p: 1.2, z1n: -1.1 },
//         { area: "> 4.0 a²", z3p: 1.2, z3n: -1.1, z2p: 1.2, z2n: -1.1, z1p: 1.2, z1n: -1.1 },
//       ],
//     },
//     {
//       angle: 6,
//       rows: [
//         { area: "≤ a²", z3p: 3.04, z3n: -4.02, z2p: 2.28, z2n: -2.02, z1p: 1.52, z1n: -1.34 },
//         { area: "> a², ≤ 4.0 a²", z3p: 2.28, z3n: -2.02, z2p: 2.28, z2n: -2.02, z1p: 1.52, z1n: -1.34 },
//         { area: "> 4.0 a²", z3p: 1.52, z3n: -1.34, z2p: 1.52, z2n: -1.34, z1p: 1.52, z1n: -1.34 },
//       ],
//     },
//     {
//       angle: 7.5,
//       rows: [
//         { area: "≤ a²", z3p: 3.2, z3n: -4.2, z2p: 2.4, z2n: -2.1, z1p: 1.6, z1n: -1.4 },
//         { area: "> a², ≤ 4.0 a²", z3p: 2.4, z3n: -2.1, z2p: 2.4, z2n: -2.1, z1p: 1.6, z1n: -1.4 },
//         { area: "> 4.0 a²", z3p: 1.6, z3n: -1.4, z2p: 1.6, z2n: -1.4, z1p: 1.6, z1n: -1.4 },
//       ],
//     },
//     {
//       angle: 10,
//       rows: [
//         { area: "≤ a²", z3p: 3.33, z3n: -4.07, z2p: 2.5, z2n: -2.37, z1p: 1.67, z1n: -1.57 },
//         { area: "> a², ≤ 4.0 a²", z3p: 2.5, z3n: -2.37, z2p: 2.5, z2n: -2.37, z1p: 1.67, z1n: -1.57 },
//         { area: "> 4.0 a²", z3p: 1.67, z3n: -1.57, z2p: 1.67, z2n: -1.57, z1p: 1.67, z1n: -1.57 },
//       ],
//     },
//     {
//       angle: 15,
//       rows: [
//         { area: "≤ a²", z3p: 3.6, z3n: -3.8, z2p: 2.7, z2n: -2.9, z1p: 1.8, z1n: -1.9 },
//         { area: "> a², ≤ 4.0 a²", z3p: 2.7, z3n: -2.9, z2p: 2.7, z2n: -2.9, z1p: 1.8, z1n: -1.9 },
//         { area: "> 4.0 a²", z3p: 1.8, z3n: -1.9, z2p: 1.8, z2n: -1.9, z1p: 1.8, z1n: -1.9 },
//       ],
//     },
//     {
//       angle: 30,
//       rows: [
//         { area: "≤ a²", z3p: 5.2, z3n: -5.0, z2p: 3.9, z2n: -3.8, z1p: 2.6, z1n: -2.5 },
//         { area: "> a², ≤ 4.0 a²", z3p: 3.9, z3n: -3.8, z2p: 3.9, z2n: -3.8, z1p: 2.6, z1n: -2.5 },
//         { area: "> 4.0 a²", z3p: 2.6, z3n: -2.5, z2p: 2.6, z2n: -2.5, z1p: 2.6, z1n: -2.5 },
//       ],
//     },
//     {
//       angle: 45,
//       rows: [
//         { area: "≤ a²", z3p: 5.2, z3n: -4.6, z2p: 3.9, z2n: -3.5, z1p: 2.6, z1n: -2.3 },
//         { area: "> a², ≤ 4.0 a²", z3p: 3.9, z3n: -3.5, z2p: 3.9, z2n: -3.5, z1p: 2.6, z1n: -2.3 },
//         { area: "> 4.0 a²", z3p: 2.6, z3n: -2.3, z2p: 2.6, z2n: -2.3, z1p: 2.6, z1n: -2.3 },
//       ],
//     },
//   ],
// };

// // ── Helpers ──────────────────────────────────────────────────────────────────

// function computeP(cn: number, qh: number, g: number): number {
//   return qh * g * cn;
// }

// function fmt(n: number, decimals = 2): string {
//   return n.toFixed(decimals);
// }

// // ── Sub-components ────────────────────────────────────────────────────────────

// interface PressureCellProps {
//   cn: number;
//   qh: number;
//   g: number;
// }

// function PressureCell({ cn, qh, g }: PressureCellProps) {
//   const p = computeP(cn, qh, g);
//   const isPos = cn >= 0;

//   const cnStyle: React.CSSProperties = {
//     fontWeight: 600,
//     fontSize: "12px",
//     color: isPos ? "#3B6D11" : "#A32D2D",
//   };

//   const pStyle: React.CSSProperties = {
//     display: "inline-block",
//     marginTop: "3px",
//     padding: "1px 6px",
//     borderRadius: "4px",
//     fontSize: "12px",
//     fontWeight: 600,
//     background: isPos ? "#EAF3DE" : "#FCEBEB",
//     color: isPos ? "#27500A" : "#791F1F",
//   };

//   return (
//     <td style={tdStyle}>
//       <div style={{ textAlign: "center", lineHeight: 1.4 }}>
//         <div style={cnStyle}>{fmt(cn)}</div>
//         <div style={pStyle}>{fmt(p)}</div>
//       </div>
//     </td>
//   );
// }

// // ── Styles (inline objects) ───────────────────────────────────────────────────

// const tdStyle: React.CSSProperties = {
//   padding: "6px 8px",
//   borderBottom: "1px solid #e5e7eb",
//   borderRight: "1px solid #e5e7eb",
//   verticalAlign: "middle",
//   minWidth: "90px",
// };

// const thStyle: React.CSSProperties = {
//   padding: "8px 10px",
//   textAlign: "center",
//   fontWeight: 600,
//   fontSize: "12px",
//   color: "#6b7280",
//   borderBottom: "1px solid #e5e7eb",
//   borderRight: "1px solid #e5e7eb",
//   whiteSpace: "nowrap" as const,
//   background: "#f9fafb",
// };

// const thZone3Style: React.CSSProperties = {
//   ...thStyle,
//   background: "#eff6ff",
//   color: "#1d4ed8",
// };

// // ── Main Component ────────────────────────────────────────────────────────────

// export default function CarportMWFRSCalculator({ qh }: { qh: number | string | any }) {
//   const g = ("0.85");
//   const [activeTab, setActiveTab] = useState<FlowType>("obstructed");

//   const qhNum = useMemo(() => parseFloat(qh) || 0, [qh]);
//   const gNum = useMemo(() => parseFloat(g) || 0, [g]);

//   const data = CN_DATA[activeTab];
//   const SectionCard = ({
//     title,
//     children,
//   }: {
//     title: string;
//     children: React.ReactNode;
//   }) => (
//     <section className="bg-white rounded-md shadow-sm border border-gray-200 p-4 text-left">
//       <h2 className="text-sm font-bold border-b border-gray-200 pb-2 mb-3 text-gray-800">
//         {title}
//       </h2>

//       {children}
//     </section>
//   );
//   return (
//     <SectionCard title="ASCE 7-16 Carport MWFRS Pressure Calculator">

//       <div
//         style={{
//           fontFamily:
//             '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//           maxWidth: "1100px",
//           margin: "0 auto",
//           padding: "24px 16px",
//           color: "#111827",
//         }}
//       >
//         {/* Header */}

//         <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px" }}>
//           p<sub>MWFRS</sub> = q<sub>h</sub> × G × C<sub>N</sub> — all roof
//           angles, area categories and zones
//         </p>

//         {/* Inputs */}
//         {/* <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//           gap: "12px",
//           marginBottom: "16px",
//         }}
//       >
//         <InputCard
//           label={
//             <>
//               q<sub>h</sub> — Velocity Pressure (psf)
//             </>
//           }
//           value={qh}
//           onChange={setQh}
//           step="0.1"
//           min="0"
//         />
//         <InputCard
//           label="G — Gust Factor"
//           value={g}
//           onChange={setG}
//           step="0.01"
//           min="0"
//         />
//       </div> */}

//         {/* Formula bar */}
//         <div
//           style={{
//             background: "#f9fafb",
//             border: "1px solid #e5e7eb",
//             borderRadius: "8px",
//             padding: "10px 14px",
//             fontSize: "13px",
//             color: "#6b7280",
//             marginBottom: "20px",
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             flexWrap: "wrap" as const,
//           }}
//         >
//           <span style={{ fontWeight: 600, color: "#374151" }}>Formula:</span>
//           <span>
//             p<sub>MWFRS</sub> = q<sub>h</sub> × G × C<sub>N</sub>
//           </span>
//           <span style={{ color: "#d1d5db" }}>|</span>
//           <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#111827" }}>
//             = {qh} × {g} × C<sub>N</sub>
//           </span>
//         </div>

//         {/* Tabs */}
//         <div
//           style={{
//             display: "flex",
//             gap: "0",
//             border: "1px solid #e5e7eb",
//             borderRadius: "8px",
//             overflow: "hidden",
//             width: "fit-content",
//             marginBottom: "16px",
//           }}
//         >
//           {(["obstructed", "clear"] as FlowType[]).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               style={{
//                 padding: "8px 20px",
//                 fontSize: "13px",
//                 fontWeight: 500,
//                 cursor: "pointer",
//                 background: activeTab === tab ? "#eff6ff" : "#ffffff",
//                 color: activeTab === tab ? "#1d4ed8" : "#6b7280",
//                 border: "none",
//                 borderRight: tab === "obstructed" ? "1px solid #e5e7eb" : "none",
//                 transition: "background 0.15s, color 0.15s",
//               }}
//             >
//               {tab === "obstructed" ? "Obstructed Wind Flow" : "Clear Wind Flow"}
//             </button>
//           ))}
//         </div>

//         {/* Table */}
//         <div
//           style={{
//             overflowX: "auto",
//             borderRadius: "10px",
//             border: "1px solid #e5e7eb",
//           }}
//         >
//           <table
//             style={{
//               borderCollapse: "collapse",
//               width: "100%",
//               minWidth: "720px",
//               fontSize: "13px",
//             }}
//           >
//             <thead>
//               <tr>
//                 <th rowSpan={2} style={{ ...thStyle, textAlign: "left", width: "70px" }}>
//                   Roof<br />Angle (°)
//                 </th>
//                 <th rowSpan={2} style={{ ...thStyle, textAlign: "left", minWidth: "130px" }}>
//                   Effective<br />Wind Area
//                 </th>
//                 <th colSpan={2} style={thZone3Style}>Zone 3</th>
//                 <th colSpan={2} style={thStyle}>Zone 2</th>
//                 <th colSpan={2} style={{ ...thStyle, borderRight: "none" }}>Zone 1</th>
//               </tr>
//               <tr>
//                 {(["Zone 3", "Zone 3", "Zone 2", "Zone 2", "Zone 1", "Zone 1"] as string[]).map(
//                   (_, i) => {
//                     const isZ3 = i < 2;
//                     const isLast = i === 5;
//                     const label = i % 2 === 0 ? "C\u2099(+) / p (psf)" : "C\u2099(\u2212) / p (psf)";
//                     return (
//                       <th
//                         key={i}
//                         style={{
//                           ...(isZ3 ? thZone3Style : thStyle),
//                           borderRight: isLast ? "none" : "1px solid #e5e7eb",
//                           fontSize: "11px",
//                         }}
//                       >
//                         {label}
//                       </th>
//                     );
//                   }
//                 )}
//               </tr>
//             </thead>
//             <tbody>
//               {data.map((group) =>
//                 group.rows.map((row, rowIdx) => (
//                   <tr
//                     key={`${group.angle}-${rowIdx}`}
//                     style={{
//                       background:
//                         rowIdx === 0
//                           ? "#fafafa"
//                           : rowIdx === 1
//                             ? "#ffffff"
//                             : "#fafafa",
//                     }}
//                   >
//                     {rowIdx === 0 && (
//                       <td
//                         rowSpan={3}
//                         style={{
//                           ...tdStyle,
//                           fontWeight: 700,
//                           fontSize: "14px",
//                           background: "#f3f4f6",
//                           textAlign: "center",
//                           verticalAlign: "middle",
//                           color: "#374151",
//                         }}
//                       >
//                         {group.angle}°
//                       </td>
//                     )}
//                     <td
//                       style={{
//                         ...tdStyle,
//                         fontSize: "12px",
//                         color: "#6b7280",
//                         whiteSpace: "nowrap" as const,
//                       }}
//                     >
//                       {row.area}
//                     </td>
//                     <PressureCell cn={row.z3p} qh={qhNum} g={gNum} />
//                     <PressureCell cn={row.z3n} qh={qhNum} g={gNum} />
//                     <PressureCell cn={row.z2p} qh={qhNum} g={gNum} />
//                     <PressureCell cn={row.z2n} qh={qhNum} g={gNum} />
//                     <PressureCell cn={row.z1p} qh={qhNum} g={gNum} />
//                     <td
//                       style={{
//                         ...tdStyle,
//                         borderRight: "none",
//                         padding: "6px 8px",
//                         verticalAlign: "middle",
//                         minWidth: "90px",
//                       }}
//                     >
//                       <div style={{ textAlign: "center", lineHeight: 1.4 }}>
//                         <div
//                           style={{
//                             fontWeight: 600,
//                             fontSize: "12px",
//                             color: row.z1n >= 0 ? "#3B6D11" : "#A32D2D",
//                           }}
//                         >
//                           {fmt(row.z1n)}
//                         </div>
//                         <div
//                           style={{
//                             display: "inline-block",
//                             marginTop: "3px",
//                             padding: "1px 6px",
//                             borderRadius: "4px",
//                             fontSize: "12px",
//                             fontWeight: 600,
//                             background: row.z1n >= 0 ? "#EAF3DE" : "#FCEBEB",
//                             color: row.z1n >= 0 ? "#27500A" : "#791F1F",
//                           }}
//                         >
//                           {fmt(computeP(row.z1n, qhNum, gNum))}
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Legend */}
//         <div
//           style={{
//             display: "flex",
//             gap: "16px",
//             flexWrap: "wrap" as const,
//             marginTop: "12px",
//             fontSize: "12px",
//             color: "#6b7280",
//             alignItems: "center",
//           }}
//         >
//           <span style={{ fontWeight: 600 }}>Legend:</span>
//           <LegendItem color="#27500A" bg="#EAF3DE" label="+3.21 Positive CN pressure" />
//           <LegendItem color="#791F1F" bg="#FCEBEB" label="−2.45 Negative CN pressure" />
//           <span>
//             Top = C<sub>N</sub> · Bottom = p<sub>MWFRS</sub> (psf)
//           </span>
//         </div>
//       </div>
//     </SectionCard>

//   );
// }

// // ── Small helper components ───────────────────────────────────────────────────

// interface InputCardProps {
//   label: React.ReactNode;
//   value: string;
//   onChange: (v: string) => void;
//   step?: string;
//   min?: string;
// }

// function InputCard({ label, value, onChange, step, min }: InputCardProps) {
//   return (
//     <div
//       style={{
//         background: "#f9fafb",
//         borderRadius: "8px",
//         padding: "12px 14px",
//         border: "1px solid #e5e7eb",
//       }}
//     >
//       <label
//         style={{
//           display: "block",
//           fontSize: "12px",
//           color: "#6b7280",
//           marginBottom: "6px",
//         }}
//       >
//         {label}
//       </label>
//       <input
//         type="number"
//         value={value}
//         step={step}
//         min={min}
//         onChange={(e) => onChange(e.target.value)}
//         style={{
//           width: "100%",
//           background: "#ffffff",
//           border: "1px solid #d1d5db",
//           borderRadius: "6px",
//           padding: "7px 10px",
//           fontSize: "15px",
//           fontWeight: 600,
//           color: "#111827",
//           outline: "none",
//         }}
//       />
//     </div>
//   );
// }

// interface LegendItemProps {
//   color: string;
//   bg: string;
//   label: string;
// }

// function LegendItem({ color, bg, label }: LegendItemProps) {
//   return (
//     <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//       <span
//         style={{
//           borderRadius: "3px",
//           padding: "2px 7px",
//           fontSize: "11px",
//           fontWeight: 600,
//           background: bg,
//           color,
//         }}
//       >
//         {label.split(" ")[0]}
//       </span>
//       <span>{label.split(" ").slice(1).join(" ")}</span>
//     </span>
//   );
// }

import { useState, useMemo } from "react";

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

interface AreaRow {
  areaIndex: 0 | 1 | 2;
  z3p: number; z3n: number;
  z2p: number; z2n: number;
  z1p: number; z1n: number;
}
interface AngleGroup { angle: number; rows: AreaRow[]; }
type FlowType = "obstructed" | "clear";
interface ZoneResult { downward: number; uplift: number; }
interface FlowResult { zone1: ZoneResult; zone2: ZoneResult; zone3: ZoneResult; }

// MWFRS Wind Pressure types
interface WindRow {
  loadCase: "A" | "B";
  cnw: number; // windward CN
  cnl: number; // leeward CN
}
interface WindAngleGroup {
  angle: number;
  rows: WindRow[];
}
interface WindData {
  clearGamma0: WindAngleGroup[];
  clearGamma180: WindAngleGroup[];
  obsGamma0: WindAngleGroup[];
  obsGamma180: WindAngleGroup[];
}
interface WindLookupRow { loadCase: string; cnw: number; cnl: number; pW: number; pL: number; }
interface WindLookupResult {
  clearGamma0: WindLookupRow[];
  clearGamma180: WindLookupRow[];
  obsGamma0: WindLookupRow[];
  obsGamma180: WindLookupRow[];
}

// ══════════════════════════════════════════════════════════════════
// DATA — Section 1: CN carport table (ASCE 7-16 Table 27.3-3)
// ══════════════════════════════════════════════════════════════════

const CN_DATA: Record<FlowType, AngleGroup[]> = {
  obstructed: [
    { angle: 0, rows: [{ areaIndex: 0, z3p: 1, z3n: -3.6, z2p: 0.8, z2n: -1.8, z1p: 0.5, z1n: -1.2 }, { areaIndex: 1, z3p: 0.8, z3n: -1.8, z2p: 0.8, z2n: -1.8, z1p: 0.5, z1n: -1.2 }, { areaIndex: 2, z3p: 0.5, z3n: -1.2, z2p: 0.5, z2n: -1.2, z1p: 0.5, z1n: -1.2 }] },
    { angle: 6, rows: [{ areaIndex: 0, z3p: 1.48, z3n: -4.8, z2p: 1.12, z2n: -2.44, z1p: 0.74, z1n: -1.6 }, { areaIndex: 1, z3p: 1.12, z3n: -2.44, z2p: 1.12, z2n: -2.44, z1p: 0.74, z1n: -1.6 }, { areaIndex: 2, z3p: 0.74, z3n: -1.6, z2p: 0.74, z2n: -1.6, z1p: 0.74, z1n: -1.6 }] },
    { angle: 7.5, rows: [{ areaIndex: 0, z3p: 1.6, z3n: -5.1, z2p: 1.2, z2n: -2.6, z1p: 0.8, z1n: -1.7 }, { areaIndex: 1, z3p: 1.2, z3n: -2.6, z2p: 1.2, z2n: -2.6, z1p: 0.8, z1n: -1.7 }, { areaIndex: 2, z3p: 0.8, z3n: -1.7, z2p: 0.8, z2n: -1.7, z1p: 0.8, z1n: -1.7 }] },
    { angle: 10, rows: [{ areaIndex: 0, z3p: 1.87, z3n: -4.8, z2p: 1.4, z2n: -2.8, z1p: 0.93, z1n: -1.83 }, { areaIndex: 1, z3p: 1.4, z3n: -2.8, z2p: 1.4, z2n: -2.8, z1p: 0.93, z1n: -1.83 }, { areaIndex: 2, z3p: 0.93, z3n: -1.83, z2p: 0.93, z2n: -1.83, z1p: 0.93, z1n: -1.83 }] },
    { angle: 15, rows: [{ areaIndex: 0, z3p: 2.4, z3n: -4.2, z2p: 1.8, z2n: -3.2, z1p: 1.2, z1n: -2.1 }, { areaIndex: 1, z3p: 1.8, z3n: -3.2, z2p: 1.8, z2n: -3.2, z1p: 1.2, z1n: -2.1 }, { areaIndex: 2, z3p: 1.2, z3n: -2.1, z2p: 1.2, z2n: -2.1, z1p: 1.2, z1n: -2.1 }] },
    { angle: 30, rows: [{ areaIndex: 0, z3p: 3.2, z3n: -4.6, z2p: 2.4, z2n: -3.5, z1p: 1.6, z1n: -2.3 }, { areaIndex: 1, z3p: 2.4, z3n: -3.5, z2p: 2.4, z2n: -3.5, z1p: 1.6, z1n: -2.3 }, { areaIndex: 2, z3p: 1.6, z3n: -2.3, z2p: 1.6, z2n: -2.3, z1p: 1.6, z1n: -2.3 }] },
    { angle: 45, rows: [{ areaIndex: 0, z3p: 4.2, z3n: -3.8, z2p: 3.2, z2n: -2.9, z1p: 2.1, z1n: -1.9 }, { areaIndex: 1, z3p: 3.2, z3n: -2.9, z2p: 3.2, z2n: -2.9, z1p: 2.1, z1n: -1.9 }, { areaIndex: 2, z3p: 2.1, z3n: -1.9, z2p: 2.1, z2n: -1.9, z1p: 2.1, z1n: -1.9 }] },
  ],
  clear: [
    { angle: 0, rows: [{ areaIndex: 0, z3p: 2.4, z3n: -3.3, z2p: 1.8, z2n: -1.7, z1p: 1.2, z1n: -1.1 }, { areaIndex: 1, z3p: 1.8, z3n: -1.7, z2p: 1.8, z2n: -1.7, z1p: 1.2, z1n: -1.1 }, { areaIndex: 2, z3p: 1.2, z3n: -1.1, z2p: 1.2, z2n: -1.1, z1p: 1.2, z1n: -1.1 }] },
    { angle: 6, rows: [{ areaIndex: 0, z3p: 3.04, z3n: -4.02, z2p: 2.28, z2n: -2.02, z1p: 1.52, z1n: -1.34 }, { areaIndex: 1, z3p: 2.28, z3n: -2.02, z2p: 2.28, z2n: -2.02, z1p: 1.52, z1n: -1.34 }, { areaIndex: 2, z3p: 1.52, z3n: -1.34, z2p: 1.52, z2n: -1.34, z1p: 1.52, z1n: -1.34 }] },
    { angle: 7.5, rows: [{ areaIndex: 0, z3p: 3.2, z3n: -4.2, z2p: 2.4, z2n: -2.1, z1p: 1.6, z1n: -1.4 }, { areaIndex: 1, z3p: 2.4, z3n: -2.1, z2p: 2.4, z2n: -2.1, z1p: 1.6, z1n: -1.4 }, { areaIndex: 2, z3p: 1.6, z3n: -1.4, z2p: 1.6, z2n: -1.4, z1p: 1.6, z1n: -1.4 }] },
    { angle: 10, rows: [{ areaIndex: 0, z3p: 3.33, z3n: -4.07, z2p: 2.5, z2n: -2.37, z1p: 1.67, z1n: -1.57 }, { areaIndex: 1, z3p: 2.5, z3n: -2.37, z2p: 2.5, z2n: -2.37, z1p: 1.67, z1n: -1.57 }, { areaIndex: 2, z3p: 1.67, z3n: -1.57, z2p: 1.67, z2n: -1.57, z1p: 1.67, z1n: -1.57 }] },
    { angle: 15, rows: [{ areaIndex: 0, z3p: 3.6, z3n: -3.8, z2p: 2.7, z2n: -2.9, z1p: 1.8, z1n: -1.9 }, { areaIndex: 1, z3p: 2.7, z3n: -2.9, z2p: 2.7, z2n: -2.9, z1p: 1.8, z1n: -1.9 }, { areaIndex: 2, z3p: 1.8, z3n: -1.9, z2p: 1.8, z2n: -1.9, z1p: 1.8, z1n: -1.9 }] },
    { angle: 30, rows: [{ areaIndex: 0, z3p: 5.2, z3n: -5.0, z2p: 3.9, z2n: -3.8, z1p: 2.6, z1n: -2.5 }, { areaIndex: 1, z3p: 3.9, z3n: -3.8, z2p: 3.9, z2n: -3.8, z1p: 2.6, z1n: -2.5 }, { areaIndex: 2, z3p: 2.6, z3n: -2.5, z2p: 2.6, z2n: -2.5, z1p: 2.6, z1n: -2.5 }] },
    { angle: 45, rows: [{ areaIndex: 0, z3p: 5.2, z3n: -4.6, z2p: 3.9, z2n: -3.5, z1p: 2.6, z1n: -2.3 }, { areaIndex: 1, z3p: 3.9, z3n: -3.5, z2p: 3.9, z2n: -3.5, z1p: 2.6, z1n: -2.3 }, { areaIndex: 2, z3p: 2.6, z3n: -2.3, z2p: 2.6, z2n: -2.3, z1p: 2.6, z1n: -2.3 }] },
  ],
};

// ══════════════════════════════════════════════════════════════════
// DATA — Section 2: MWFRS Wind Pressure (CNW / CNL)
// ══════════════════════════════════════════════════════════════════

const WIND_DATA: WindData = {
  clearGamma0: [
    { angle: 0, rows: [{ loadCase: "A", cnw: 1.2, cnl: 0.3 }, { loadCase: "B", cnw: -1.1, cnl: -0.1 }] },
    { angle: 2.5, rows: [{ loadCase: "A", cnw: 0, cnl: -0.57 }, { loadCase: "B", cnw: -1.3, cnl: -0.03 }] },
    { angle: 7.5, rows: [{ loadCase: "A", cnw: -0.6, cnl: -1.0 }, { loadCase: "B", cnw: -1.4, cnl: 0.0 }] },
    { angle: 10, rows: [{ loadCase: "A", cnw: -0.7, cnl: -1.1 }, { loadCase: "B", cnw: -1.57, cnl: 0.0 }] },
    { angle: 15, rows: [{ loadCase: "A", cnw: -0.9, cnl: -1.3 }, { loadCase: "B", cnw: -1.9, cnl: 0.0 }] },
    { angle: 22.5, rows: [{ loadCase: "A", cnw: -1.5, cnl: -1.6 }, { loadCase: "B", cnw: -2.4, cnl: -0.3 }] },
    { angle: 30, rows: [{ loadCase: "A", cnw: -1.8, cnl: -1.8 }, { loadCase: "B", cnw: -2.5, cnl: -0.5 }] },
    { angle: 37.5, rows: [{ loadCase: "A", cnw: -1.8, cnl: -1.8 }, { loadCase: "B", cnw: -2.4, cnl: -0.6 }] },
    { angle: 45, rows: [{ loadCase: "A", cnw: -1.6, cnl: -1.8 }, { loadCase: "B", cnw: -2.3, cnl: -0.7 }] },
  ],
  clearGamma180: [
    { angle: 0, rows: [{ loadCase: "A", cnw: 1.2, cnl: 0.3 }, { loadCase: "B", cnw: -1.1, cnl: -0.1 }] },
    { angle: 2.5, rows: [{ loadCase: "A", cnw: 1.0, cnl: 1.1 }, { loadCase: "B", cnw: 0.7, cnl: 0.17 }] },
    { angle: 7.5, rows: [{ loadCase: "A", cnw: 0.9, cnl: 1.5 }, { loadCase: "B", cnw: 1.6, cnl: 0.3 }] },
    { angle: 10, rows: [{ loadCase: "A", cnw: 1.03, cnl: 1.53 }, { loadCase: "B", cnw: 1.67, cnl: 0.4 }] },
    { angle: 15, rows: [{ loadCase: "A", cnw: 1.3, cnl: 1.6 }, { loadCase: "B", cnw: 1.8, cnl: 0.6 }] },
    { angle: 22.5, rows: [{ loadCase: "A", cnw: 1.7, cnl: 1.8 }, { loadCase: "B", cnw: 2.2, cnl: 0.7 }] },
    { angle: 30, rows: [{ loadCase: "A", cnw: 2.1, cnl: 2.1 }, { loadCase: "B", cnw: 2.6, cnl: 1.0 }] },
    { angle: 37.5, rows: [{ loadCase: "A", cnw: 2.1, cnl: 2.2 }, { loadCase: "B", cnw: 2.7, cnl: 1.1 }] },
    { angle: 45, rows: [{ loadCase: "A", cnw: 2.2, cnl: 2.5 }, { loadCase: "B", cnw: 2.6, cnl: 1.4 }] },
  ],
  obsGamma0: [
    { angle: 0, rows: [{ loadCase: "A", cnw: -0.5, cnl: -1.2 }, { loadCase: "B", cnw: -1.1, cnl: -0.6 }] },
    { angle: 2.5, rows: [{ loadCase: "A", cnw: -0.83, cnl: -1.4 }, { loadCase: "B", cnw: -1.5, cnl: -0.73 }] },
    { angle: 7.5, rows: [{ loadCase: "A", cnw: -1.0, cnl: -1.5 }, { loadCase: "B", cnw: -1.7, cnl: -0.8 }] },
    { angle: 10, rows: [{ loadCase: "A", cnw: -1.03, cnl: -1.5 }, { loadCase: "B", cnw: -1.83, cnl: -0.73 }] },
    { angle: 15, rows: [{ loadCase: "A", cnw: -1.1, cnl: -1.5 }, { loadCase: "B", cnw: -2.1, cnl: -0.6 }] },
    { angle: 22.5, rows: [{ loadCase: "A", cnw: -1.5, cnl: -1.7 }, { loadCase: "B", cnw: -2.3, cnl: -0.9 }] },
    { angle: 30, rows: [{ loadCase: "A", cnw: -1.5, cnl: -1.8 }, { loadCase: "B", cnw: -2.3, cnl: -1.1 }] },
    { angle: 37.5, rows: [{ loadCase: "A", cnw: -1.5, cnl: -1.8 }, { loadCase: "B", cnw: -2.2, cnl: -1.1 }] },
    { angle: 45, rows: [{ loadCase: "A", cnw: -1.3, cnl: -1.8 }, { loadCase: "B", cnw: -1.9, cnl: -1.2 }] },
  ],
  obsGamma180: [
    { angle: 0, rows: [{ loadCase: "A", cnw: -0.5, cnl: -1.2 }, { loadCase: "B", cnw: -1.1, cnl: -0.6 }] },
    { angle: 2.5, rows: [{ loadCase: "A", cnw: -0.3, cnl: -1.2 }, { loadCase: "B", cnw: 0.17, cnl: -0.4 }] },
    { angle: 7.5, rows: [{ loadCase: "A", cnw: -0.2, cnl: -1.2 }, { loadCase: "B", cnw: 0.8, cnl: -0.3 }] },
    { angle: 10, rows: [{ loadCase: "A", cnw: 0.0, cnl: -1.17 }, { loadCase: "B", cnw: 0.93, cnl: -0.3 }] },
    { angle: 15, rows: [{ loadCase: "A", cnw: 0.4, cnl: -1.1 }, { loadCase: "B", cnw: 1.2, cnl: -0.3 }] },
    { angle: 22.5, rows: [{ loadCase: "A", cnw: 0.5, cnl: -1.0 }, { loadCase: "B", cnw: 1.3, cnl: 0.0 }] },
    { angle: 30, rows: [{ loadCase: "A", cnw: 0.6, cnl: -1.0 }, { loadCase: "B", cnw: 1.6, cnl: 0.1 }] },
    { angle: 37.5, rows: [{ loadCase: "A", cnw: 0.7, cnl: -0.9 }, { loadCase: "B", cnw: 1.9, cnl: 0.3 }] },
    { angle: 45, rows: [{ loadCase: "A", cnw: 0.8, cnl: -0.9 }, { loadCase: "B", cnw: 2.1, cnl: 0.4 }] },
  ],
};

// ══════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════

const TABLE_ANGLES_CN = [0, 6, 7.5, 10, 15, 30, 45];
const TABLE_ANGLES_WIND = [0, 2.5, 7.5, 10, 15, 22.5, 30, 37.5, 45];

const AREA_LABELS: Record<0 | 1 | 2, string> = { 0: "≤ a²", 1: "> a², ≤ 4.0 a²", 2: "> 4.0 a²" };
const AREA_OPTIONS = [
  { value: 0 as 0 | 1 | 2, label: "≤ a²  (Small / corner area)" },
  { value: 1 as 0 | 1 | 2, label: "> a², ≤ 4.0 a²  (Medium area)" },
  { value: 2 as 0 | 1 | 2, label: "> 4.0 a²  (Large area)" },
];

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function bracketAngle<T extends { angle: number }>(
  data: T[], angle: number
): { lower: T; upper: T; t: number } {
  const s = [...data].sort((a, b) => a.angle - b.angle);
  if (angle <= s[0].angle) return { lower: s[0], upper: s[0], t: 0 };
  if (angle >= s[s.length - 1].angle) return { lower: s[s.length - 1], upper: s[s.length - 1], t: 0 };
  for (let i = 0; i < s.length - 1; i++) {
    if (angle >= s[i].angle && angle <= s[i + 1].angle) {
      const t = (angle - s[i].angle) / (s[i + 1].angle - s[i].angle);
      return { lower: s[i], upper: s[i + 1], t };
    }
  }
  return { lower: s[0], upper: s[0], t: 0 };
}

// CN carport lookup
function lookupPressures(flow: FlowType, angle: number, aIdx: 0 | 1 | 2, qh: number, g: number): FlowResult {
  const { lower, upper, t } = bracketAngle(CN_DATA[flow], angle);
  const getField = (f: keyof AreaRow) => {
    const lR = lower.rows.find(r => r.areaIndex === aIdx)!;
    const uR = upper.rows.find(r => r.areaIndex === aIdx)!;
    return lerp(lR[f] as number, uR[f] as number, t);
  };
  const p = (f: keyof AreaRow) => qh * g * getField(f);
  return {
    zone1: { downward: p("z1p"), uplift: p("z1n") },
    zone2: { downward: p("z2p"), uplift: p("z2n") },
    zone3: { downward: p("z3p"), uplift: p("z3n") },
  };
}

// MWFRS wind lookup — interpolate CNW/CNL then multiply by qh*G
function interpWindGroup(groups: WindAngleGroup[], angle: number, qh: number, g: number): WindLookupRow[] {
  const { lower, upper, t } = bracketAngle(groups, angle);
  return (["A", "B"] as const).map(lc => {
    const lRow = lower.rows.find(r => r.loadCase === lc)!;
    const uRow = upper.rows.find(r => r.loadCase === lc)!;
    const cnw = lerp(lRow.cnw, uRow.cnw, t);
    const cnl = lerp(lRow.cnl, uRow.cnl, t);
    return { loadCase: `Load Case ${lc}`, cnw, cnl, pW: qh * g * cnw, pL: qh * g * cnl };
  });
}

function lookupWind(angle: number, qh: number, g: number): WindLookupResult {
  return {
    clearGamma0: interpWindGroup(WIND_DATA.clearGamma0, angle, qh, g),
    clearGamma180: interpWindGroup(WIND_DATA.clearGamma180, angle, qh, g),
    obsGamma0: interpWindGroup(WIND_DATA.obsGamma0, angle, qh, g),
    obsGamma180: interpWindGroup(WIND_DATA.obsGamma180, angle, qh, g),
  };
}

function fmt2(n: number) { return n.toFixed(2); }

// ══════════════════════════════════════════════════════════════════
// SHARED STYLE TOKENS
// ══════════════════════════════════════════════════════════════════

const thBase: React.CSSProperties = {
  padding: "8px 10px", textAlign: "center", fontWeight: 600, fontSize: "12px",
  color: "#6b7280", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb",
  whiteSpace: "nowrap", background: "#f9fafb",
};
const thZ3: React.CSSProperties = { ...thBase, background: "#eff6ff", color: "#1d4ed8" };
const tdBase: React.CSSProperties = {
  padding: "6px 8px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb",
  verticalAlign: "middle", minWidth: "78px",
};
const inputCard: React.CSSProperties = { background: "#f9fafb", borderRadius: "8px", padding: "12px 14px", border: "1px solid #e5e7eb" };
const lbl: React.CSSProperties = { display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "6px", fontWeight: 500 };
const inp: React.CSSProperties = { width: "100%", background: "#fff", border: "1px solid #d1d5db", borderRadius: "6px", padding: "7px 10px", fontSize: "14px", fontWeight: 600, color: "#111827", outline: "none", appearance: "auto" as const };
const sectionDivider: React.CSSProperties = { borderTop: "2px solid #e5e7eb", paddingTop: "22px", marginBottom: "24px" };

// ══════════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ══════════════════════════════════════════════════════════════════

function PressureCell({ cn, qh, g }: { cn: number; qh: number; g: number }) {
  const p = qh * g * cn; const pos = cn >= 0;
  return (
    <td style={tdBase}>
      <div style={{ textAlign: "center", lineHeight: 1.4 }}>
        <div style={{ fontWeight: 600, fontSize: "12px", color: pos ? "#3B6D11" : "#A32D2D" }}>{fmt2(cn)}</div>
        <div style={{ display: "inline-block", marginTop: "3px", padding: "1px 6px", borderRadius: "4px", fontSize: "12px", fontWeight: 600, background: pos ? "#EAF3DE" : "#FCEBEB", color: pos ? "#27500A" : "#791F1F" }}>{fmt2(p)}</div>
      </div>
    </td>
  );
}

function PressureBadge({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "5px", fontSize: "13px", fontWeight: 700, background: pos ? "#EAF3DE" : "#FCEBEB", color: pos ? "#27500A" : "#791F1F" }}>
      {pos ? "+" : ""}{fmt2(value)}
    </span>
  );
}

function ValueBadge({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700, background: pos ? "#EAF3DE" : "#FCEBEB", color: pos ? "#27500A" : "#791F1F" }}>
      {pos ? "+" : ""}{fmt2(value)}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px", color: "#111827" }}>{children}</h2>;
}

function NumberField({ label, value, onChange, step, min, hint }: { label: React.ReactNode; value: string; onChange: (v: string) => void; step?: string; min?: string; hint?: string }) {
  return (
    <div style={inputCard}>
      <label style={lbl}>{label}</label>
      <input type="number" value={value} step={step} min={min} onChange={e => onChange(e.target.value)} style={inp} />
      {hint && <span style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px", display: "block" }}>{hint}</span>}
    </div>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string | number; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div style={inputCard}>
      <label style={lbl}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={inp}>{children}</select>
    </div>
  );
}

function TabBar({ tabs, active, onSelect }: { tabs: { id: string; label: string }[]; active: string; onSelect: (id: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 0, border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", width: "fit-content", marginBottom: "14px" }}>
      {tabs.map((t, i) => (
        <button key={t.id} onClick={() => onSelect(t.id)}
          style={{
            padding: "8px 18px", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            background: active === t.id ? "#eff6ff" : "#fff", color: active === t.id ? "#1d4ed8" : "#6b7280",
            border: "none", borderRight: i < tabs.length - 1 ? "1px solid #e5e7eb" : "none", transition: "background 0.15s,color 0.15s"
          }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function InfoBar({ angle, extra, qhg }: { angle: number; extra?: React.ReactNode; qhg: number }) {
  return (
    <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "10px 16px", marginBottom: "18px", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", fontSize: "13px", color: "#0369a1" }}>
      <span><strong>Roof angle:</strong> {fmt2(angle)}° {extra}</span>
      <span><strong>q<sub>h</sub> × G =</strong> {fmt2(qhg)} psf</span>
    </div>
  );
}

function InterpolatedBadge({ lower, upper }: { lower: number; upper: number }) {
  return (
    <span style={{ marginLeft: "8px", background: "#fef9c3", color: "#854d0e", borderRadius: "4px", padding: "1px 7px", fontSize: "11px", fontWeight: 600 }}>
      Interpolated between {lower}° and {upper}°
    </span>
  );
}

// ── CN Zone lookup result table ────────────────────────────────────
function ZoneResultTable({ title, accentBg, accentText, accentBorder, result }: { title: string; accentBg: string; accentText: string; accentBorder: string; result: FlowResult }) {
  const zones: { label: string; key: keyof FlowResult }[] = [
    { label: "Zone 1", key: "zone1" }, { label: "Zone 2", key: "zone2" }, { label: "Zone 3", key: "zone3" }
  ];
  return (
    <div style={{ flex: "1 1 280px", border: `1px solid ${accentBorder}`, borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ background: accentBg, padding: "10px 16px", borderBottom: `1px solid ${accentBorder}` }}>
        <span style={{ fontWeight: 700, fontSize: "14px", color: accentText }}>{title}</span>
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            <th style={{ ...thBase, textAlign: "left" }}>Zone</th>
            <th style={thBase}>Downward (psf)</th>
            <th style={{ ...thBase, borderRight: "none" }}>Uplift (psf)</th>
          </tr>
        </thead>
        <tbody>
          {zones.map(({ label, key }, i) => {
            const z = result[key];
            return (
              <tr key={key} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ ...tdBase, fontWeight: 600, color: "#374151", background: "#f3f4f6", textAlign: "left", paddingLeft: "14px" }}>{label}</td>
                <td style={{ ...tdBase, textAlign: "center" }}><PressureBadge value={z.downward} /></td>
                <td style={{ ...tdBase, borderRight: "none", textAlign: "center" }}><PressureBadge value={z.uplift} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── MWFRS Wind lookup result block ────────────────────────────────
function WindLookupBlock({ angle, result }: { angle: number; result: WindLookupResult }) {
  const pairs: { clearLabel: string; obsLabel: string; clearKey: keyof WindLookupResult; obsKey: keyof WindLookupResult }[] = [
    { clearLabel: "Clear Wind Flow — γ = 0°", obsLabel: "Obs. Wind Flow — γ = 0°", clearKey: "clearGamma0", obsKey: "obsGamma0" },
    { clearLabel: "Clear Wind Flow — γ = 180°", obsLabel: "Obs. Wind Flow — γ = 180°", clearKey: "clearGamma180", obsKey: "obsGamma180" },
  ];

  function MiniTable({ rows, title, bg, tc, bc }: { rows: WindLookupRow[]; title: string; bg: string; tc: string; bc: string }) {
    return (
      <div style={{ flex: "1 1 240px", border: `1px solid ${bc}`, borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ background: bg, padding: "9px 14px", borderBottom: `1px solid ${bc}` }}>
          <span style={{ fontWeight: 700, fontSize: "13px", color: tc }}>{title}</span>
        </div>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ ...thBase, textAlign: "left", minWidth: "120px" }}>Load Case</th>
              <th style={thBase}>CNW</th>
              <th style={thBase}>CNL</th>
              <th style={thBase}>p·W (psf)</th>
              <th style={{ ...thBase, borderRight: "none" }}>p·L (psf)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.loadCase} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ ...tdBase, fontWeight: 600, color: "#374151", background: "#f3f4f6", textAlign: "left", paddingLeft: "14px", whiteSpace: "nowrap" }}>{r.loadCase}</td>
                <td style={{ ...tdBase, textAlign: "center" }}><ValueBadge value={r.cnw} /></td>
                <td style={{ ...tdBase, textAlign: "center" }}><ValueBadge value={r.cnl} /></td>
                <td style={{ ...tdBase, textAlign: "center" }}><ValueBadge value={r.pW} /></td>
                <td style={{ ...tdBase, borderRight: "none", textAlign: "center" }}><ValueBadge value={r.pL} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      {pairs.map(({ clearLabel, obsLabel, clearKey, obsKey }) => (
        <div key={clearKey} style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <MiniTable rows={result[clearKey]} title={clearLabel} bg="#eff6ff" tc="#1e40af" bc="#93c5fd" />
            <MiniTable rows={result[obsKey]} title={obsLabel} bg="#f0fdf4" tc="#166534" bc="#86efac" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export default function CarportMWFRSCalculator({ qh, cnAngle, areaIdx }: { qh: any, cnAngle: any, areaIdx: any }) {
  // Shared inputs
  const g = "0.85";

  // Section 1 — full CN table
  const [activeTab, setActiveTab] = useState<FlowType>("obstructed");

  // Section 1 — CN lookup

  // Section 2 — Wind lookup
  const windAngle = cnAngle;
  console.log(windAngle)

  const qhN = useMemo(() => parseFloat(qh) || 0, [qh]);
  const gN = useMemo(() => parseFloat(g) || 0, [g]);

  const cnAngleN = useMemo(() => { const v = parseFloat(cnAngle); return isNaN(v) ? 0 : Math.min(45, Math.max(0, v)); }, [cnAngle]);
  const aIdxN = useMemo(() => { const v = parseInt(areaIdx) as 0 | 1 | 2; return ([0, 1, 2].includes(v) ? v : 2) as 0 | 1 | 2; }, [areaIdx]);
  const windAngleN = useMemo(() => { const v = parseFloat(windAngle); return isNaN(v) ? 0 : Math.min(45, Math.max(0, v)); }, [windAngle]);

  const cnObsResult = useMemo(() => lookupPressures("obstructed", cnAngleN, aIdxN, qhN, gN), [cnAngleN, aIdxN, qhN, gN]);
  const cnClearResult = useMemo(() => lookupPressures("clear", cnAngleN, aIdxN, qhN, gN), [cnAngleN, aIdxN, qhN, gN]);
  const windResult = useMemo(() => lookupWind(windAngleN, qhN, gN), [windAngleN, qhN, gN]);

  const cnInterp = !TABLE_ANGLES_CN.includes(cnAngleN);
  const windInterp = !TABLE_ANGLES_WIND.includes(windAngleN);

  const sortedCn = [...TABLE_ANGLES_CN].sort((a, b) => a - b);
  const sortedWind = [...TABLE_ANGLES_WIND].sort((a, b) => a - b);
  const cnLo = sortedCn.filter(a => a <= cnAngleN).pop() ?? 0;
  const cnHi = sortedCn.find(a => a >= cnAngleN) ?? 45;
  const windLo = sortedWind.filter(a => a <= windAngleN).pop() ?? 0;
  const windHi = sortedWind.find(a => a >= windAngleN) ?? 45;

  const fullTableData = CN_DATA[activeTab];
  const SectionCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="bg-white rounded-md shadow-sm border border-gray-200 p-4 text-left">
      <h2 className="text-sm font-bold border-b border-gray-200 pb-2 mb-3 text-gray-800">
        {title}
      </h2>

      {children}
    </section>
  );
  return (
    <>
      <SectionCard title="Carport Wind Pressure Calculator">

        {/* ── PAGE HEADER ── */}
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 22px" }}>
          p<sub>MWFRS</sub> = q<sub>h</sub> × G × C<sub>N</sub> · Covers carport CN zones and MWFRS wind pressures (CNW / CNL)
        </p>

        {/* ── GLOBAL INPUTS ── */}
        {/* <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "12px", marginBottom: "28px" }}>
        <NumberField label={<>q<sub>h</sub> — Velocity Pressure (psf)</>} value={qh} onChange={setQh} step="0.1" min="0" />
        <NumberField label="G — Gust Factor" value={g} onChange={setG} step="0.01" min="0" />
      </div> */}

        {/* ════════════════════════════════════════════════════
          PART A — CARPORT CN / pMWFRS TABLE
          ════════════════════════════════════════════════════ */}
        <div style={sectionDivider}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
            <SectionTitle>Carport C<sub>N</sub> / p<sub>MWFRS</sub> — Full Reference Table</SectionTitle>
            <span style={{ fontSize: "11px", background: "#f3f4f6", color: "#6b7280", borderRadius: "4px", padding: "2px 8px" }}>Table 27.3-3</span>
          </div>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 14px" }}>Top = C<sub>N</sub> · Badge = p<sub>MWFRS</sub> (psf) using current q<sub>h</sub> × G</p>

          <TabBar
            tabs={[{ id: "obstructed", label: "Obstructed Wind Flow" }, { id: "clear", label: "Clear Wind Flow" }]}
            active={activeTab}
            onSelect={v => setActiveTab(v as FlowType)}
          />

          <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "720px", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ ...thBase, textAlign: "left", width: "70px" }}>Roof<br />Angle (°)</th>
                  <th rowSpan={2} style={{ ...thBase, textAlign: "left", minWidth: "130px" }}>Effective<br />Wind Area</th>
                  <th colSpan={2} style={thZ3}>Zone 3</th>
                  <th colSpan={2} style={thBase}>Zone 2</th>
                  <th colSpan={2} style={{ ...thBase, borderRight: "none" }}>Zone 1</th>
                </tr>
                <tr>
                  {[0, 1, 2, 3, 4, 5].map(i => {
                    const isZ3 = i < 2, isLast = i === 5;
                    return <th key={i} style={{ ...(isZ3 ? thZ3 : thBase), borderRight: isLast ? "none" : "1px solid #e5e7eb", fontSize: "11px" }}>{i % 2 === 0 ? "CN(+) / p (psf)" : "CN(−) / p (psf)"}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {fullTableData.map(group =>
                  group.rows.map((row, ri) => (
                    <tr key={`${group.angle}-${ri}`} style={{ background: ri === 1 ? "#fff" : "#fafafa" }}>
                      {ri === 0 && <td rowSpan={3} style={{ ...tdBase, fontWeight: 700, fontSize: "14px", background: "#f3f4f6", textAlign: "center", verticalAlign: "middle", color: "#374151" }}>{group.angle}°</td>}
                      <td style={{ ...tdBase, fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>{AREA_LABELS[row.areaIndex]}</td>
                      <PressureCell cn={row.z3p} qh={qhN} g={gN} />
                      <PressureCell cn={row.z3n} qh={qhN} g={gN} />
                      <PressureCell cn={row.z2p} qh={qhN} g={gN} />
                      <PressureCell cn={row.z2n} qh={qhN} g={gN} />
                      <PressureCell cn={row.z1p} qh={qhN} g={gN} />
                      <td style={{ ...tdBase, borderRight: "none" }}>
                        <div style={{ textAlign: "center", lineHeight: 1.4 }}>
                          <div style={{ fontWeight: 600, fontSize: "12px", color: row.z1n >= 0 ? "#3B6D11" : "#A32D2D" }}>{fmt2(row.z1n)}</div>
                          <div style={{ display: "inline-block", marginTop: "3px", padding: "1px 6px", borderRadius: "4px", fontSize: "12px", fontWeight: 600, background: row.z1n >= 0 ? "#EAF3DE" : "#FCEBEB", color: row.z1n >= 0 ? "#27500A" : "#791F1F" }}>{fmt2(qhN * gN * row.z1n)}</div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "10px", fontSize: "12px", color: "#6b7280", alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>Legend:</span>
            {[{ bg: "#EAF3DE", c: "#27500A", lbl: "+3.21  Downward" }, { bg: "#FCEBEB", c: "#791F1F", lbl: "−2.45  Uplift" }].map(x => (
              <span key={x.lbl} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ borderRadius: "3px", padding: "2px 7px", fontSize: "11px", fontWeight: 600, background: x.bg, color: x.c }}>{x.lbl.split(" ")[0]}</span>
                {x.lbl.split(" ").slice(1).join(" ")}
              </span>
            ))}
          </div>
        </div>

        {/* ── CN LOOKUP ── */}
        <div style={{ borderTop: "1px dashed #e5e7eb", paddingTop: "20px", marginBottom: "28px" }}>
          <SectionTitle>Carport C<sub>N</sub> — Lookup by Angle &amp; Area</SectionTitle>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 14px" }}>Enter any angle — values between table entries are linearly interpolated.</p>
          {/* <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px", marginBottom: "14px" }}>
          <NumberField label="Roof Angle (°)" value={cnAngle} onChange={setCnAngle} step="0.5" min="0" hint="Table: 0, 6, 7.5, 10, 15, 30, 45" />
          <SelectField label="Effective Wind Area" value={areaIdx} onChange={setAreaIdx}>
            {AREA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </SelectField>
        </div> */}
          <InfoBar angle={cnAngleN} qhg={qhN * gN}
            extra={cnInterp ? <InterpolatedBadge lower={cnLo} upper={cnHi} /> : undefined} />
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <ZoneResultTable title="Obstructed Wind Flow (psf)" accentBg="#f0fdf4" accentText="#166534" accentBorder="#86efac" result={cnObsResult} />
            <ZoneResultTable title="Clear Wind Flow (psf)" accentBg="#eff6ff" accentText="#1e40af" accentBorder="#93c5fd" result={cnClearResult} />
          </div>
          <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "12px", lineHeight: 1.6 }}>
            Downward = positive C<sub>N</sub> · Uplift = negative C<sub>N</sub> · Ref: ASCE 7-16 Table 27.3-3
          </p>
        </div>
      </SectionCard>
      <br />



      <SectionCard title="MWFRS Wind Pressure — Full Reference Table"   >      <div style={sectionDivider}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
          {/* <SectionTitle>MWFRS Wind Pressure — Full Reference Table</SectionTitle> */}
          <span style={{ fontSize: "11px", background: "#fef9c3", color: "#854d0e", borderRadius: "4px", padding: "2px 8px" }}>CNW / CNL</span>
        </div>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 14px" }}>Wind Direction Gamma (γ) = 0° and 180° · Load Cases A and B · p = q<sub>h</sub> × G × CN</p>

        <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "800px", fontSize: "12px" }}>
            <thead>
              <tr>
                <th rowSpan={3} style={{ ...thBase, textAlign: "left", width: "72px" }}>Roof<br />Angle (°)</th>
                <th rowSpan={3} style={{ ...thBase, textAlign: "left", width: "80px" }}>Load<br />Case</th>
                <th colSpan={4} style={{ ...thBase, background: "#eff6ff", color: "#1e40af", fontSize: "12px" }}>Wind Direction γ = 0°</th>
                <th colSpan={4} style={{ ...thBase, background: "#f0fdf4", color: "#166534", fontSize: "12px", borderRight: "none" }}>Wind Direction γ = 180°</th>
              </tr>
              <tr>
                <th colSpan={2} style={{ ...thBase, background: "#dbeafe", color: "#1e40af", fontSize: "11px" }}>Clear Wind Flow</th>
                <th colSpan={2} style={{ ...thBase, background: "#dcfce7", color: "#166534", fontSize: "11px" }}>Obs. Wind Flow</th>
                <th colSpan={2} style={{ ...thBase, background: "#dbeafe", color: "#1e40af", fontSize: "11px" }}>Clear Wind Flow</th>
                <th colSpan={2} style={{ ...thBase, background: "#dcfce7", color: "#166534", fontSize: "11px", borderRight: "none" }}>Obs. Wind Flow</th>
              </tr>
              <tr>
                {["CNW", "CNL", "CNW", "CNL", "CNW", "CNL", "CNW", "CNL"].map((h, i) => (
                  <th key={i} style={{ ...thBase, fontSize: "11px", borderRight: i === 7 ? "none" : "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WIND_DATA.clearGamma0.map((group, gi) => {
                const cg0 = WIND_DATA.clearGamma0[gi];
                const cg180 = WIND_DATA.clearGamma180[gi];
                const og0 = WIND_DATA.obsGamma0[gi];
                const og180 = WIND_DATA.obsGamma180[gi];
                return (["A", "B"] as const).map((lc, li) => {
                  const r0c = cg0.rows.find(r => r.loadCase === lc)!;
                  const r180c = cg180.rows.find(r => r.loadCase === lc)!;
                  const r0o = og0.rows.find(r => r.loadCase === lc)!;
                  const r180o = og180.rows.find(r => r.loadCase === lc)!;
                  return (
                    <tr key={`${group.angle}-${lc}`} style={{ background: li === 0 ? "#fafafa" : "#fff" }}>
                      {li === 0 && <td rowSpan={2} style={{ ...tdBase, fontWeight: 700, fontSize: "13px", background: "#f3f4f6", textAlign: "center", verticalAlign: "middle", color: "#374151" }}>{group.angle}°</td>}
                      <td style={{ ...tdBase, fontWeight: 600, color: "#374151", background: "#f9fafb", whiteSpace: "nowrap", textAlign: "center", fontSize: "12px" }}>{lc}</td>
                      {[r0c.cnw, r0c.cnl, r0o.cnw, r0o.cnl, r180c.cnw, r180c.cnl, r180o.cnw, r180o.cnl].map((v, vi) => (
                        <td key={vi} style={{ ...tdBase, textAlign: "center", borderRight: vi === 7 ? "none" : "1px solid #e5e7eb" }}>
                          <div style={{ fontWeight: 600, fontSize: "12px", color: v >= 0 ? "#3B6D11" : "#A32D2D" }}>{fmt2(v)}</div>
                          <div style={{ display: "inline-block", marginTop: "2px", padding: "1px 5px", borderRadius: "3px", fontSize: "11px", fontWeight: 600, background: v >= 0 ? "#EAF3DE" : "#FCEBEB", color: v >= 0 ? "#27500A" : "#791F1F" }}>{fmt2(qhN * gN * v)}</div>
                        </td>
                      ))}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "10px" }}>Top = CN coefficient · Badge = p = q<sub>h</sub> × G × CN (psf)</p>
      </div>

        {/* ── MWFRS WIND LOOKUP ── */}
        <div style={{ borderTop: "1px dashed #e5e7eb", paddingTop: "20px" }}>
          <SectionTitle>MWFRS Wind Pressure — Lookup by Roof Angle</SectionTitle>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 14px" }}>
            Shows CNW, CNL and computed pressures (psf) for all four combinations at a specific angle.
            Table values: 0, 2.5, 7.5, 10, 15, 22.5, 30, 37.5, 45 — others are interpolated.
          </p>
          {/* <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px", marginBottom: "14px" }}>
          <NumberField label="Roof Angle (°)" value={windAngle} onChange={setWindAngle} step="0.5" min="0" hint="Table: 0, 2.5, 7.5, 10, 15, 22.5, 30, 37.5, 45" />
        </div> */}
          <InfoBar angle={windAngleN} qhg={qhN * gN}
            extra={windInterp ? <InterpolatedBadge lower={windLo} upper={windHi} /> : undefined} />
          <WindLookupBlock angle={windAngleN} result={windResult} />
          <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "14px", lineHeight: 1.6 }}>
            CNW = windward net pressure coeff · CNL = leeward net pressure coeff ·
            p·W and p·L = q<sub>h</sub> × G × CN (psf) · Ref: ASCE 7-16
          </p>
        </div>
      </SectionCard>
    </>

  );
}
