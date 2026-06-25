import React, { useState } from "react";
import CarportMWFRSCalculator from "./CarportMWFRSCalculator";

export type AreaType = "≤ a²" | "> a², ≤ 4.0 a²" | "> 4.0 a²";

interface FormData {
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
  PanelDimensionwidth: number;
  PanelDimensionweight: number;

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
    v3s: 98,
    exposure: "B",
    kzt: 1,
    kd: 0.85,
    meanRoofHeight: 14,
    BuildingWidth: 0.55,
    BuildingLength: 0.85,
    elevation: 5265,
    minimumWidth: 40.08,
    minimumHeight: 13.83,
    ASCE: '7',
    PanelDimensionlength: 2438,
    PanelDimensionwidth: 1133,
    PanelDimensionweight: 30,
    purlinSpan: 32.16,

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

  const handleSubmit = () => {
    console.log(formData);
    alert("Data Submitted");
  };

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

  const slopedRoofSnow =
    flatRoofSnow * roofFactor;

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

  console.log(Kz);
  // z = MAX(h, 15)
  // z = 15 ft
  // Kz = 2.01 × (z / Zg) ^ (2 / α)
  // const Kz = 2.01 * (15 / 900) ^ (2 / 9.5)

  // const expocer=if (formData.exposure==="a")
  const valuesofc_c = 0.00256 * Kz * formData.kzt * formData.kd * ke * (formData.v3s * formData.v3s)


  // const valuesofc_c = 14.66
  const roofAngle = a; // Dynamic value from API/Formik/etc.





  return (
    <div className="min-h-screen bg-gray-100 text-[13px] text-gray-700">

      {/* Header */}



      <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-4 lg:p-5 lg:pl-[400px]">

        <div className="grid grid-cols-1 gap-4 items-start">
          <div className="space-y-4 lg:fixed lg:left-0 lg:top-0 lg:z-10 lg:h-screen lg:w-[380px] lg:overflow-y-auto lg:border-r lg:border-gray-200 lg:bg-gray-50 lg:p-4">

            {/* Wind Inputs */}

            <SectionCard title="Inputs">
              <div className="grid grid-cols-1 gap-3">

                <InputField
                  label="V3s (mph)"
                  name="v3s"
                  type="number"
                  value={formData.v3s}
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
                    <option value="6">ASCE 6</option>
                    <option value="7">ASCE 7</option>
                    <option value="16">ASCE 16</option>
                  </select>
                </div>

                <div>MM to ft</div>
                <InputField
                  label="Panel Dimension length (lb)"
                  name="PanelDimensionlength"
                  type="number"
                  value={formData.PanelDimensionlength}
                  onChange={handleChange}
                />
                <InputField
                  label="Panel Dimension width (lb)"
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
                  label="Roof Pitch (deg)"
                  name="roofPitch"
                  type="number"
                  value={formData.roofPitch}
                  onChange={handleChange}
                />
                <InputField
                  label="Roof Slope"
                  name="roofSlope"
                  type="number"
                  value={formData.roofSlope * 12}
                  onChange={handleChange}
                />

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
                  label="Exposure Factor"
                  name="ExposureFactor"
                  type="number"
                  value={formData.ExposureFactor}
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

            <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-gray-200 bg-gray-50/95 p-4 backdrop-blur">
              <button
                className="
                w-full
                px-6
                py-2
                rounded-md
                text-xs
                font-semibold
                bg-gray-600
                text-white
                hover:bg-gray-700
              "
              >
                Reset
              </button>

              <button
                onClick={handleSubmit}
                className="
                w-full
                px-6
                py-2
                rounded-md
                text-xs
                font-semibold
                bg-blue-600
                text-white
                hover:bg-blue-700
              "
              >
                Submit
              </button>

            </div>          </div>


          <aside className="space-y-4">




            {/* Panel Data */}

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
            <SectionCard title="Snow Load ">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">


                <InputField
                  label="Flat Roof Snow"
                  name="flatRoofSnow"
                  value={flatRoofSnow.toFixed(2)}
                />

                <InputField
                  label="Sloped Roof Snow"
                  name="slopedRoofSnow"
                  value={slopedRoofSnow.toFixed(2)}
                />
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

            {/* Geometry */}



          </aside>
        </div>
        <br />
        <CarportMWFRSCalculator qh={valuesofc_c} cnAngle={roofAngle} areaIdx={areaValue} />
        {/* qh={valuesofc_c} roofAngle={roofAngle} areaIndex={areaValue} */}

        <br />


        <div className="hidden">
          {/* Columns */}

          <SectionCard title="Column Data">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">

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

          {/* Foundation */}

          <SectionCard title="Foundation">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">

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

          {/* Loads */}

          <SectionCard title="Loads Input">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">

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

        <div className="hidden">

          <button
            className="
                w-full
                sm:w-auto
                px-6
                py-2
                rounded-md
                text-xs
                font-semibold
                bg-gray-600
                text-white
                hover:bg-gray-700
              "
          >
            Reset
          </button>

          <button
            onClick={handleSubmit}
            className="
                w-full
                sm:w-auto
                px-6
                py-2
                rounded-md
                text-xs
                font-semibold
                bg-blue-600
                text-white
                hover:bg-blue-700
              "
          >
            Submit
          </button>

        </div>
      </div>
    </div>
  );
};

export default EngineeringInputForm;









