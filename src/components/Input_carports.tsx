import React, { useState } from "react";
import CarportMWFRSCalculator from "./CarportMWFRSCalculator";
import { generateStructuralPDF } from "./generateStructuralPDF";
import CFSApp, { defaultCFSState, computeCFSResults } from "./CFS_Software";

export type AreaType = "≤ a²" | "> a², ≤ 4.0 a²" | "> 4.0 a²";
// Style constants (match your existing accent colors)
const accentBg = "#eff6ff";
const accentBorder = "#bfdbfe";
const accentText = "#1d4ed8";

const thBase: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: "11px",
  fontWeight: 700,
  color: "#6b7280",
  textAlign: "right",
  borderBottom: "1px solid #e5e7eb",
  borderRight: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const tdBase: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: "12px",
  borderBottom: "1px solid #dddfe4",
  borderRight: "1px solid #dddfe4",
  textAlign: "right",
};
interface FormData {
  sitename: string;
  project_name: string;
  engineer_name: string;
  date: string;
  v3s: number;
  exposure: string;
  kzt: number;
  kd: number;

  meanRoofHeight: number;
  BuildingLength: number;
  BuildingWidth: number;
  elevation: number;
  minimumWidth: number;
  minimumHeight: number;
  ASCE: string;
  PanelDimensionlength: number;
  MinSnowLoadUpperLimit: number;
  PanelDimensionwidth: number;
  PanelDimensionweight: number;
  Purlin_Length: number;
  exposureofRoof: string;
  roofPitch: number;
  roofSlope: number;
  purlinSpan: number;
  purlinSpacing: number;
  purlinTribWidth: number;
  purlinOverhangLength: number;
  Developershallcalculate: number;
  secondaryBeamLength: number;
  mainFrameTribWidth: number;
  mainBeamLength: number;
  PanelArea: number;
  PanelDeadLoad: number;
  columnDistance: number;
  columnHeight: number;
  MiscellaneousLoad: number;
  columnPlace1: number;
  columnPlace2: number;
  TotalDeadLoad: number;
  momentFromRisa: number;
  GroundSnow: number;
  ExposureFactor: number;
  ThermalFactor: number;
  ImportanceFactor: number;
  FlatRoofSnow: number;
  SlopedRoofSnow: number;
  foundationDepth: number;
  foundationDia: number;
  foundationMoment: number;

  lateralBearingPressure: number;

  udlMemberLabel: string;
  pointLoadNodeNumber: string;
}

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
}: any) => (
  <div className="w-full">
    <label className="block text-[11px] font-semibold text-gray-600 mb-1 leading-tight">
      {label}
    </label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={!onChange}
      className="
    w-full
    border
    border-gray-300
    rounded-md
    px-2
    py-1.5
    text-xs
    leading-5
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    bg-white
  "
    />
  </div>
);

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

const EngineeringInputForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    sitename: "",
    project_name: "",
    engineer_name: "",
    date: "",
    v3s: 98,
    exposure: "B",
    kzt: 1,
    kd: 0.85,
    meanRoofHeight: 14,
    BuildingWidth: 0.55,
    BuildingLength: 0.85,
    MinSnowLoadUpperLimit: 20,
    elevation: 5265,
    minimumWidth: 40.08,
    minimumHeight: 13.83,
    ASCE: '7',
    Purlin_Length: 32.16,
    PanelDimensionlength: 2438,
    PanelDimensionwidth: 1133,
    PanelDimensionweight: 30,
    purlinSpan: 32.16,
    exposureofRoof: "Fully",
    roofPitch: 4.5,
    roofSlope: 6,
    PanelArea: 7.99868792 * 3.71719172,
    PanelDeadLoad: 66.1386 / (7.99868792 * 3.71719172),
    purlinSpacing: 32.16,
    purlinTribWidth: 4,
    purlinOverhangLength: 5.5,
    MiscellaneousLoad: 1.0,
    secondaryBeamLength: 0,
    mainFrameTribWidth: 4,
    mainBeamLength: 37.16,
    TotalDeadLoad: 66.1386 / (7.99868792 * 3.71719172) + 1.0,
    columnDistance: 27,
    columnHeight: 13.83,
    Developershallcalculate: 0,
    columnPlace1: 18.625,
    columnPlace2: 47,
    GroundSnow: 45,
    momentFromRisa: 99.1,
    ExposureFactor: 1.0,
    ThermalFactor: 1.0,
    ImportanceFactor: 1.0,
    FlatRoofSnow: 45,
    SlopedRoofSnow: 45,
    foundationDepth: 14,
    foundationDia: 2.5,
    foundationMoment: 92.53,

    lateralBearingPressure: 150,

    udlMemberLabel: "M1",
    pointLoadNodeNumber: "N3A",
  });
  const [showCFSDesigner, setShowCFSDesigner] = useState(false);
  const [cfsState, setCfsState] = useState(defaultCFSState);
  console.log("cfsState", cfsState)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : value,
    }));
  };
  // const handleSubmit = () => {
  //   console.log(formData);
  //   alert("Data Submitted");
  // };

  const planeLength = formData.PanelDimensionlength * 0.00328084;
  const panelWidth = formData.PanelDimensionwidth * 0.00328084;
  const panelWeight = formData.PanelDimensionweight * 2.20462;
  const panelArea = planeLength * panelWidth;

  const panelDeadLoad =
    panelArea > 0
      ? panelWeight / panelArea
      : 0;

  const totalDeadLoad =
    panelDeadLoad + formData.MiscellaneousLoad;

  const flatRoofSnow = 0.7 *
    formData.GroundSnow *
    formData.ExposureFactor *
    formData.ThermalFactor *
    formData.ImportanceFactor;

  const roofFactor =
    Math.max(0.7, 1 - formData.roofSlope / 100);

  const SlopeFactor = Math.min(1 - (formData.roofSlope - 15) / 55, 1)

  const value = Math.min(formData.minimumWidth * 0.1, formData.minimumWidth * 0.4);

  const a = value < 0 ? 3 : value;

  const TribArea = formData.purlinSpacing ** 2 / 3


  const g = 0.85

  const a2 = a ** 2;

  const Area: AreaType =
    TribArea <= a2
      ? "≤ a²"
      : TribArea <= a2 * 4
        ? "> a², ≤ 4.0 a²"
        : "> 4.0 a²";

  const areaValue =
    TribArea <= a2
      ? 0
      : TribArea <= a2 * 4
        ? 1
        : 2;

  console.log(areaValue)
  const developerCalc =
    formData.BuildingLength *
    formData.BuildingWidth *
    20;

  const VelocityPressure = 0.00256 * formData.v3s * formData.v3s * formData.kzt * formData.kd * Math.exp(-0.0000362 * formData.elevation);
  const ke = Math.exp(-0.0000362 * formData.elevation)


  let alpha = 0;
  let zg = 0;
  let zmin = 0;

  if (formData.exposure === "B") {
    alpha = 7;
    zg = 1200;
    zmin = 30;
  } else if (formData.exposure === "C") {
    alpha = 9.5;
    zg = 900;
    zmin = 15;
  } else {
    alpha = 11.5;
    zg = 700;
    zmin = 7;
  }

  const z = Math.max(Number(formData.meanRoofHeight), zmin);

  const Kz = 2.01 * (z / zg) ** (2 / alpha);

  // z = MAX(h, 15)
  // z = 15 ft
  // Kz = 2.01 × (z / Zg) ^ (2 / α)
  // const Kz = 2.01 * (15 / 900) ^ (2 / 9.5)

  // const expocer=if (formData.exposure==="a")
  const valuesofc_c = 0.00256 * Kz * formData.kzt * formData.kd * ke * (formData.v3s * formData.v3s)


  // const valuesofc_c = 14.66
  const roofAngle = a; // Dynamic value from API/Formik/etc.


  const FlatRoofSnowLoad = (e: string): number => {
    const factors: Record<string, Record<string, number>> = {
      B: {
        Fully: 0.9,
        Partially: 1.0,
        Sheltered: 1.2,
      },
      C: {
        Fully: 0.9,
        Partially: 1.0,
        Sheltered: 1.1,
      },
      D: {
        Fully: 0.8,
        Partially: 0.9,
        Sheltered: 1.0,
      },
    };
    formData.ExposureFactor = factors[formData.exposure]?.[e]

    return factors[formData.exposure]?.[e] ?? 0;
  };


  const MinimumSnowLoad =
    formData.GroundSnow <= formData.MinSnowLoadUpperLimit
      ? formData.GroundSnow * formData.ImportanceFactor
      : formData.MinSnowLoadUpperLimit;


  let slopedRoofSnow = 0;

  if (MinimumSnowLoad > FlatRoofSnowLoad(formData.exposureofRoof)) {
    slopedRoofSnow = SlopeFactor * MinimumSnowLoad;
  } else {
    slopedRoofSnow = SlopeFactor * flatRoofSnow;
  }


  // const PurlinUplift=

  // const PurlinDownward=Math.min(F42:F44,F47:F49)
  // Load values (psf)
  const D = totalDeadLoad * formData.purlinTribWidth;                    // Dead Load = 2.5 psf
  const Lr = 20;                              // Live Load Roof = 20 psf (constant per ASCE)
  const LiveLoadFloor = 0;                    // Live Load Floor = 0 psf (carport)
  const S = slopedRoofSnow * formData.purlinTribWidth;;                   // Snow Load = 20 psf

  // Wind Load (Downward & Uplift) from MWFRS
  const W_downward = valuesofc_c;             // Wind Load Downward = +16 psf
  const W_uplift = -valuesofc_c;             // Wind Load Uplift = -16 psf

  // Linear loads on purlin (psf × trib width)
  const wD = D * formData.purlinTribWidth;
  const wLr = Lr * formData.purlinTribWidth;
  const wS = S * formData.purlinTribWidth;
  const wW_down = W_downward * formData.purlinTribWidth;
  const wW_up = W_uplift * formData.purlinTribWidth;


  // Add these calculations near your other load calcs
  const L = 0;

  const W = valuesofc_c;
  const E = 0;

  const tribWidth = formData.purlinTribWidth;

  const loads = [
    { label: "D", psf: D, plf: +(D * tribWidth).toFixed(2) },
    { label: "L", psf: L, plf: +(L * tribWidth).toFixed(2) },
    { label: "Lr", psf: Lr, plf: +(Lr * tribWidth).toFixed(2) },
    { label: "S", psf: S, plf: +(S * tribWidth).toFixed(2) },
    { label: "W", psf: W, plf: +(W * tribWidth).toFixed(2) },
    { label: "E", psf: E, plf: +(E * tribWidth).toFixed(2) },
  ];

  const handleprint = () => {
    generateStructuralPDF(formData, { areaIdx: areaValue }, {
      cfsState,
      cfsComputed: computeCFSResults(cfsState),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-[13px] text-gray-700">

      {/* Header */}



      <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-4 lg:p-5 lg:pl-[400px]">

        <div className="grid grid-cols-1 gap-4 items-start">
          <div className="space-y-4 lg:fixed lg:left-0 lg:top-0 lg:z-10 lg:h-screen lg:w-[380px] lg:overflow-y-auto lg:border-r lg:border-gray-200 lg:bg-gray-50 lg:p-4">


            <SectionCard title="Inputs">
              <div className="grid grid-cols-1 gap-3">

                <InputField
                  label="Site Name"
                  name="sitename"
                  type="string"
                  value={formData.sitename}
                  onChange={handleChange}
                />
                <InputField
                  label="Project Name"
                  name="project_name"
                  type="string"
                  value={formData.project_name}
                  onChange={handleChange}
                />
                <InputField
                  label="Engineer Name"
                  name="engineer_name"
                  type="string"
                  value={formData.engineer_name}
                  onChange={handleChange}
                />
                <InputField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                />

                <div className="w-full">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1 leading-tight">
                    Exposure
                  </label>

                  <select
                    value={formData.exposure}
                    name="exposure"
                    onChange={handleChange}
                    className="
      w-full
      border
      border-gray-300
      rounded-md
      px-2
      py-1.5
      text-xs
      leading-5
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
    "
                  >
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <InputField
                  label="Kzt"
                  name="kzt"
                  type="number"
                  value={formData.kzt}
                  onChange={handleChange}
                />

                <InputField
                  label="Kd"
                  name="kd"
                  type="number"
                  value={formData.kd}
                  onChange={handleChange}
                />

                <InputField
                  label="Mean Roof Height (ft)"
                  name="meanRoofHeight"
                  type="number"
                  value={formData.meanRoofHeight}
                  onChange={handleChange}
                />

                <InputField
                  label="Building Length (ft)"
                  name="BuildingLength"
                  type="number"
                  value={formData.BuildingLength}
                  onChange={handleChange}
                />
                <InputField
                  label="Building Width (ft)"
                  name="BuildingWidth"
                  type="number"
                  value={formData.BuildingWidth}
                  onChange={handleChange}
                />
                <InputField
                  label="Elevation"
                  name="elevation"
                  type="number"
                  value={formData.elevation}
                  onChange={handleChange}
                />
                <InputField
                  label="Minimum Width"
                  name="minimumWidth"
                  type="number"
                  value={formData.minimumWidth}
                  onChange={handleChange}
                />
                <div className="w-full">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1 leading-tight">
                    ASCE
                  </label>

                  <select
                    name="ASCE"
                    value={formData.ASCE}
                    onChange={handleChange}
                    className="
      w-full
      border
      border-gray-300
      rounded-md
      px-2
      py-1.5
      text-xs
      leading-5
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
    "
                  >
                    <option value="10">7-10</option>
                    <option value="16">7-16</option>
                    <option value="22">7-22</option>
                  </select>
                </div>

                <InputField
                  label="Panel Dimension length (mm)"
                  name="PanelDimensionlength"
                  type="number"
                  value={formData.PanelDimensionlength}
                  onChange={handleChange}
                />
                <InputField
                  label="Panel Dimension width (mm)"
                  name="PanelDimensionwidth"
                  type="number"
                  value={formData.PanelDimensionwidth}
                  onChange={handleChange}
                />

                <InputField
                  label="Panel Dimension Weight (lb)"
                  name="PanelDimensionweight"
                  type="number"
                  value={formData.PanelDimensionweight}
                  onChange={handleChange}
                />

                <InputField
                  label="Purlin Length"
                  name="Purlin_Length"
                  type="number"
                  value={formData.Purlin_Length}
                  onChange={handleChange}
                />

                <InputField
                  label="Roof Pitch (deg)"
                  name="roofPitch"
                  type="number"
                  value={formData.roofPitch}
                  onChange={handleChange}
                />

                <div className="w-full">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1 leading-tight">
                    Roof Slope
                  </label>

                  <select
                    value={formData.roofSlope}
                    name="roofSlope"
                    onChange={handleChange}
                    className="
      w-full
      border
      border-gray-300
      rounded-md
      px-2
      py-1.5
      text-xs
      leading-5
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
    "
                  >
                    {[0, 3, 6, 22.5, 30, 37.5, 45].map((angle) => (
                      <option key={angle} value={angle}>
                        {angle}
                      </option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Purlin Spacing (ft)"
                  name="purlinSpacing"
                  type="number"
                  value={formData.purlinSpacing}
                  onChange={handleChange}
                />

                <InputField
                  label="Purlin Tributary Width"
                  name="purlinTribWidth"
                  type="number"
                  value={formData.purlinTribWidth}
                  onChange={handleChange}
                />
                <InputField
                  label="Purlin Span (ft)"
                  name="purlinSpan"
                  type="number"
                  value={formData.purlinSpan}
                  onChange={handleChange}
                />
                <InputField
                  label="Purlin Overhang Length (ft)"
                  name="purlinOverhangLength"
                  type="number"
                  value={formData.purlinOverhangLength}
                  onChange={handleChange}
                />

                <InputField
                  label="Secondary Beam Length"
                  name="secondaryBeamLength"
                  type="number"
                  value={formData.secondaryBeamLength}
                  onChange={handleChange}
                />

                <InputField
                  label="Main Beam Length"
                  name="mainBeamLength"
                  type="number"
                  value={formData.mainBeamLength}
                  onChange={handleChange}
                />
                <InputField
                  label="Miscellaneous Load"
                  name="MiscellaneousLoad"
                  type="number"
                  value={formData.MiscellaneousLoad}
                  onChange={handleChange}
                />
                <InputField
                  label="Ground Snow (Pg)"
                  name="GroundSnow"
                  type="number"
                  value={formData.GroundSnow}
                  onChange={handleChange}
                />



                <InputField
                  label="Thermal Factor"
                  name="ThermalFactor"
                  type="number"
                  value={formData.ThermalFactor}
                  onChange={handleChange}
                />

                <InputField
                  label="Importance Factor"
                  name="ImportanceFactor"
                  type="number"
                  value={formData.ImportanceFactor}
                  onChange={handleChange}
                />
                <InputField
                  label="Min Snow Load Upper Limit"
                  name="MinSnowLoadUpperLimit"
                  type="number"
                  value={formData.MinSnowLoadUpperLimit}
                  onChange={handleChange}
                />

                <div className="w-full">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1 leading-tight">
                    Exposure of Roof
                  </label>

                  <select
                    value={formData.exposureofRoof}
                    name="exposureofRoof"
                    onChange={handleChange}
                    className="
      w-full
      border
      border-gray-300
      rounded-md
      px-2
      py-1.5
      text-xs
      leading-5
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
    "
                  >
                    <option value="Fully">Fully</option>
                    <option value="Partially">Partially</option>
                    <option value="Sheltered">Sheltered</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Column Data">
              <div className="grid grid-cols-1 gap-3">

                <InputField
                  label="Column Distance"
                  name="columnDistance"
                  type="number"
                  value={formData.columnDistance}
                  onChange={handleChange}
                />

                <InputField
                  label="Column Height"
                  name="columnHeight"
                  type="number"
                  value={formData.columnHeight}
                  onChange={handleChange}
                />

                <InputField
                  label="Column Place 1"
                  name="columnPlace1"
                  type="number"
                  value={formData.columnPlace1}
                  onChange={handleChange}
                />

                <InputField
                  label="Column Place 2"
                  name="columnPlace2"
                  type="number"
                  value={formData.columnPlace2}
                  onChange={handleChange}
                />
              </div>
            </SectionCard>

            <SectionCard title="Foundation">
              <div className="grid grid-cols-1 gap-3">

                <InputField
                  label="Foundation Depth"
                  name="foundationDepth"
                  type="number"
                  value={formData.foundationDepth}
                  onChange={handleChange}
                />

                <InputField
                  label="Foundation Diameter"
                  name="foundationDia"
                  type="number"
                  value={formData.foundationDia}
                  onChange={handleChange}
                />

                <InputField
                  label="Foundation Moment"
                  name="foundationMoment"
                  type="number"
                  value={formData.foundationMoment}
                  onChange={handleChange}
                />

                <InputField
                  label="Lateral Bearing Pressure"
                  name="lateralBearingPressure"
                  type="number"
                  value={formData.lateralBearingPressure}
                  onChange={handleChange}
                />
              </div>
            </SectionCard>

            <SectionCard title="Loads Input">
              <div className="grid grid-cols-1 gap-3">

                <InputField
                  label="UDL Member Label"
                  name="udlMemberLabel"
                  value={formData.udlMemberLabel}
                  onChange={handleChange}
                />

                <InputField
                  label="Point Load Node Number"
                  name="pointLoadNodeNumber"
                  value={formData.pointLoadNodeNumber}
                  onChange={handleChange}
                />
              </div>
            </SectionCard>



          </div>
        </div>


        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 mb-6">
          <div className="flex items-center justify-between px-6 py-4">

            {/* Left Side Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCFSDesigner(true)}
                className={`px-5 py-2 rounded-lg font-medium transition ${showCFSDesigner
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                CFS Designer
              </button>

              <button
                onClick={() => setShowCFSDesigner(false)}
                className={`px-5 py-2 rounded-lg font-medium transition ${!showCFSDesigner
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                Engineering Form
              </button>
            </div>

            {/* Right Side Button */}
            <button
              onClick={handleprint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              Print
            </button>

          </div>
        </div>

        {showCFSDesigner ? (
          <div>
            <CFSApp cfsState={cfsState} setCfsState={setCfsState} />
          </div>
        ) : (
          <>
            <aside className="space-y-4">
              <SectionCard title="Dead Load Calculation">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <InputField
                    label="Panel Length (ft)"
                    name="panelLength"
                    value={planeLength.toFixed(3)}
                  />

                  <InputField
                    label="Panel Width (ft)"
                    name="panelWidth"
                    value={panelWidth.toFixed(3)}
                  />

                  <InputField
                    label="Panel Weight (lb)"
                    name="panelWeight"
                    value={panelWeight.toFixed(3)}
                  />
                  <InputField
                    label="Panel Area (sq.ft)"
                    name="panelArea"
                    value={panelArea.toFixed(3)}
                  />

                  <InputField
                    label="Panel Dead Load"
                    name="panelDeadLoad"
                    value={panelDeadLoad.toFixed(3)}
                  />


                  <InputField
                    label="Total Dead Load"
                    name="totalDeadLoad"
                    value={totalDeadLoad.toFixed(3)}
                  />
                </div>
              </SectionCard>
              <SectionCard
                title='Snow Load'
              >              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">


                  <InputField
                    label="Flat Roof Snow"
                    name="flatRoofSnow"
                    value={flatRoofSnow.toFixed(2)}
                  />
                  <InputField
                    label="ExposureFactor"
                    name="ExposureFactor"
                    value={FlatRoofSnowLoad(formData.exposureofRoof)}
                  />

                  <InputField
                    label="Minimum Snow Load"
                    name="MinimumSnowLoad"
                    value={MinimumSnowLoad.toFixed(2)}
                  />


                  <InputField
                    label="Slope Factor"
                    name="SlopeFactor"
                    value={SlopeFactor.toFixed(2)}
                  />

                  <InputField
                    label="Sloped Roof Snow"
                    name="slopedRoofSnow"
                    value={slopedRoofSnow.toFixed(2)}
                  />
                  <div className="flex justify-end items-end mt-4">
                    <div className="text-sm font-medium">
                      {MinimumSnowLoad > FlatRoofSnowLoad(formData.exposureofRoof)
                        ? "Min Governs"
                        : "Use PFF"}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Geometry */}


              <br />

              <SectionCard title="Carport Wind">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">

                  <InputField
                    label="Velocity Pressure"
                    name="VelocityPressure"
                    value={VelocityPressure.toFixed(2)}
                  />



                  <InputField
                    label="A"
                    name="a"
                    value={a.toFixed(2)}
                  />

                  <InputField
                    label="Trib Area"
                    name="TribArea"
                    value={TribArea.toFixed(2)}
                  />
                  <InputField
                    label="Area"
                    name="Area"
                    value={Area}
                  />
                </div>
              </SectionCard>
              <br />
              <SectionCard title="Steel Purlin Design">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <InputField
                    label="Span"
                    name="Span"
                    value={formData.Purlin_Length}
                  />
                  <InputField
                    label="Over Hang"
                    name="Over"
                    value={formData.purlinOverhangLength}
                  />
                  <InputField
                    label="Trib Width"
                    name="Trib"
                    value={formData.purlinTribWidth}
                  />
                  <InputField
                    label="Angle"
                    name="Angle"
                    value={formData.roofSlope}
                  />
                  <InputField label="Dead Load D (psf)" name="D" value={D.toFixed(2)} />
                  <InputField label="Live Load Floor (psf)" name="Lf" value={"0.00"} />
                  <InputField label="Live Load Roof Lr (psf)" name="Lr" value={"20.00"} />
                  <InputField label="Snow Load S (psf)" name="S" value={S.toFixed(2)} />
                  <InputField label="Wind Load W Downward (psf)" name="W_down" value={W_downward.toFixed(2)} />
                  <InputField label="Wind Load W Uplift (psf)" name="W_up" value={W_uplift.toFixed(2)} />

                  {/* Linear loads = psf × Trib Width */}
                  <InputField label="wD = D × Trib (plf)" name="wD" value={wD.toFixed(2)} />
                  <InputField label="wLr = Lr × Trib (plf)" name="wLr" value={wLr.toFixed(2)} />
                  <InputField label="wS = S × Trib (plf)" name="wS" value={wS.toFixed(2)} />
                  <InputField label="wW Downward (plf)" name="wW_down" value={wW_down.toFixed(2)} />
                  <InputField label="wW Uplift (plf)" name="wW_up" value={wW_up.toFixed(2)} />
                  {/* <InputField
              label="DownWard"
              name="Downward"
              value={PurlinDownward}
            />

  <InputField
              label="Uplift"
              name="Uplift"
              value={PurlinUplift}
            /> */}


                </div>
              </SectionCard>
              <br />
              <SectionCard title="Convert Area Loads to Line Loads" >
                <div style={{
                  flex: "1 1 280px",
                  border: `1px solid ${accentBorder}`,
                  borderRadius: "10px",
                  overflow: "hidden",
                  marginBottom: "16px"
                }}>


                  {/* Table */}
                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        <th style={{ ...thBase, textAlign: "left", paddingLeft: "14px" }}>Load</th>
                        <th style={{ ...thBase, textAlign: "center" }}>psf</th>
                        <th style={{ ...thBase, textAlign: "center" }}>× {tribWidth} ft</th>
                        <th style={{ ...thBase, borderRight: "none", textAlign: "center" }}>plf</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loads.map(({ label, psf, plf }, i) => (
                        <tr key={label} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          {/* Load label */}
                          <td style={{
                            ...tdBase,
                            fontWeight: 600,
                            color: "#374151",
                            background: "#f3f4f6",
                            textAlign: "left",
                            paddingLeft: "14px",
                          }}>
                            {label}
                          </td>

                          {/* psf */}
                          <td style={{ ...tdBase, textAlign: "center", color: "#374151" }}>
                            {psf.toFixed(1)}
                          </td>

                          {/* × trib width */}
                          <td style={{ ...tdBase, textAlign: "center", color: "#9ca3af" }}>
                            ×{tribWidth}
                          </td>

                          {/* plf — highlighted */}
                          <td style={{
                            ...tdBase,
                            borderRight: "none",
                            textAlign: "center",
                            fontWeight: 700,
                            color: accentText,
                          }}>
                            {plf}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </SectionCard>
            </aside>
            <br />
            <CarportMWFRSCalculator qh={valuesofc_c} cnAngle={roofAngle} areaIdx={areaValue} ke={ke} kz={Kz} />

          </>
        )}

      </div>
    </div>
  );
};

export default EngineeringInputForm;









