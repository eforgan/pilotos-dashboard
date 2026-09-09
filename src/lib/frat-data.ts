// Catálogo oficial del FRAT (Flight Risk Assessment Tool), metodología EHSIT / PAVE,
// transcripto textualmente de las plantillas Excel reales de Flight Express
// ("Training FRAT" y "Daily Normal Ops FRAT"). El texto de cada ítem se mantiene
// en inglés (idioma original de la herramienta) por fidelidad con el documento
// que los pilotos ya conocen y firman; las ayudas de uso están en español.

export type FratType = "TRAINING" | "DAILY_OPS";
export type FratRiskLevel = "ACCEPTABLE" | "CAUTION" | "HIGH_RISK";

export interface FratOption {
  /** score posicional: la 1ra opción vale 0, la 2da 1, la 3ra 2 (roja) */
  score: 0 | 1 | 2;
  label: string;
  /** mitigación sugerida por el Excel original (columna "MITIGATION") */
  mitigation?: string;
}

export interface FratItem {
  id: string;
  label: string;
  /** Regla NO-GO: cualquier condición fuera de las opciones aprobadas impide el vuelo */
  noGo?: boolean;
  options: FratOption[];
}

export interface FratSection {
  id: string;
  title: string;
  kind: "static" | "dynamic";
  /** breve nota de ayuda en español para esta sección */
  helpText: string;
  items: FratItem[];
}

export interface FratSheet {
  type: FratType;
  title: string;
  usageNote: string;
  sections: FratSection[];
}

const STATIC_HELP =
  "Puntaje Estático: se completa una sola vez al inicio de la jornada y permanece válido para todos los vuelos del día, salvo que cambien las condiciones del piloto, del instructor/copiloto o de la aeronave.";
const DYNAMIC_HELP =
  "Puntaje Dinámico: revisar antes de cada sortie del día, aunque los puntajes estáticos ya se hayan cargado (la meteorología o la misión pueden cambiar de un vuelo a otro).";
const ITEM_HELP =
  "Seleccione la opción que describe la situación real. Si elige la opción marcada en rojo (2 puntos), debe cargar una acción de mitigación antes del vuelo.";
const NO_GO_HELP =
  "Regla NO-GO: cualquier condición fuera de las opciones aprobadas impide el despacho, independientemente del puntaje total.";

export const FRAT_ITEM_HELP = ITEM_HELP;
export const FRAT_NO_GO_HELP = NO_GO_HELP;

// ---------------------------------------------------------------------------
// TRAINING FRAT — 22 preguntas, puntaje máximo 44
// Usar siempre para vuelos de instrucción/entrenamiento y habilitaciones Offshore VMOS.
// ---------------------------------------------------------------------------

export const TRAINING_FRAT: FratSheet = {
  type: "TRAINING",
  title: "Training FRAT",
  usageNote:
    "Usar para vuelos de instrucción/entrenamiento, incluidas las habilitaciones Offshore VMOS.",
  sections: [
    {
      id: "pilot",
      title: "PILOT",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "t_pilot_illness",
          label: "Illness/Physical Condition",
          options: [
            { score: 0, label: "No problems. Physically/mentally in shape." },
            {
              score: 1,
              label: "Nuisance, minor pain, illness or minor mental stress",
              mitigation: "Discuss CRM methods to minimize errors caused by less than optimum health",
            },
            {
              score: 2,
              label: "Illness requiring medication / Persistent pain or discomfort / Major mental stress",
              mitigation: "Stop!! Train another day",
            },
          ],
        },
        {
          id: "t_pilot_medication",
          label: "Medication (NO GO with any unapproved prescription meds)",
          noGo: true,
          options: [
            { score: 0, label: "No medications in the last 24 hours." },
            {
              score: 1,
              label: "Unit approved OTC meds",
              mitigation: "STOP training and wait until illness is gone or subsides to where medication is not needed",
            },
            {
              score: 2,
              label: "Approved prescription meds",
              mitigation: "Confirm with aeromedical contact that meds will have no negative effect on pilot's fitness for flight",
            },
          ],
        },
        {
          id: "t_pilot_fatigue",
          label: "Fatigue",
          options: [
            { score: 0, label: "No fatigue. 6-8 hours sleep" },
            {
              score: 1,
              label: "Some fatigue. Less than 6 hours sleep",
              mitigation: "Get rest before conducting training",
            },
            { score: 2, label: "Mentally or physically fatigued. Less than 4 hours sleep" },
          ],
        },
        {
          id: "t_pilot_flight_time_type",
          label: "Flight time in make/model",
          options: [
            { score: 0, label: "Over 1000 hours flight time in make/model" },
            { score: 1, label: "Between 500 and 1000 hours flight time in make/model" },
            {
              score: 2,
              label: "Below 500 hours flight time in make/model",
              mitigation: "Review POH and all Emergency Procedures, assume no prior knowledge",
            },
          ],
        },
        {
          id: "t_pilot_last_flight_type",
          label: "Last flight in make/model",
          options: [
            { score: 0, label: "Within 1 month." },
            {
              score: 1,
              label: "Between 1 and 3 months.",
              mitigation: "No emergency procedures with ground contact on first flight",
            },
            {
              score: 2,
              label: "Over 3 months (not considered current for flight).",
              mitigation: "No emergency procedures on first flight",
            },
          ],
        },
      ],
    },
    {
      id: "instructor",
      title: "INSTRUCTOR",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "t_instr_illness",
          label: "Illness/Condition",
          options: [
            { score: 0, label: "No problems. Physically/mentally in shape." },
            {
              score: 1,
              label: "Nuisance, minor pain, illness or minor mental stress",
              mitigation: "Discuss CRM methods to minimize errors caused by less than optimum health",
            },
            {
              score: 2,
              label: "Illness requiring medication / Persistent pain or discomfort / Major mental stress",
              mitigation: "Stop!! Train another day",
            },
          ],
        },
        {
          id: "t_instr_medication",
          label: "Medication (NO GO with any unapproved prescription meds)",
          noGo: true,
          options: [
            { score: 0, label: "No medications in the last 24 hours." },
            {
              score: 1,
              label: "Unit approved OTC meds",
              mitigation: "STOP training and wait until illness is gone or subsides to where medication is not needed",
            },
            {
              score: 2,
              label: "Approved prescription meds",
              mitigation: "Confirm with aeromedical contact that meds will have no negative effect on pilot's fitness for flight",
            },
          ],
        },
        {
          id: "t_instr_fatigue",
          label: "Fatigue",
          options: [
            { score: 0, label: "No fatigue. 6-8 hours sleep" },
            {
              score: 1,
              label: "Some fatigue. Less than 6 hours sleep",
              mitigation: "Get rest before conducting training",
            },
            { score: 2, label: "Mentally or physically fatigued. Less than 4 hours sleep" },
          ],
        },
        {
          id: "t_instr_flight_time_type",
          label: "Flight time in make/model",
          options: [
            { score: 0, label: "Over 1000 hours flight time in make/model" },
            {
              score: 1,
              label: "Between 500 and 1000 hours flight time in make/model",
              mitigation: "No emergency procedures on first flight",
            },
            {
              score: 2,
              label: "Below 500 hours flight time in make/model",
              mitigation: "Refresher flight with instructor current in aircraft first",
            },
          ],
        },
        {
          id: "t_instr_last_flight_type",
          label: "Last flight in make/model",
          options: [
            { score: 0, label: "Within 1 month." },
            {
              score: 1,
              label: "Between 1 and 3 months.",
              mitigation: "No emergency procedures with ground contact on first flight",
            },
            {
              score: 2,
              label: "Over 3 months (not considered current for flight).",
              mitigation: "Refresher flight with instructor current in aircraft required",
            },
          ],
        },
        {
          id: "t_crew_composition",
          label: "Crew Composition",
          options: [
            { score: 0, label: "Experienced Instructor (500hrs dual given) and student rated in aircraft" },
            {
              score: 1,
              label: "Two flight instructors",
              mitigation: "Brief cockpit CRM and procedures",
            },
            {
              score: 2,
              label: "New instructor (< 500 hours dual given), ab initio student or initial transition into new aircraft",
              mitigation: "Cover all maneuvers as if student had no prior knowledge",
            },
          ],
        },
      ],
    },
    {
      id: "aircraft",
      title: "AIRCRAFT",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "t_ac_maintenance",
          label: "Recent Maintenance Performed",
          options: [
            { score: 0, label: "More than 10 hours since last maintenance" },
            {
              score: 1,
              label: "5 - 10 hours since last maintenance",
              mitigation: "Conduct basic maneuvers and check engine/clutch etc. operation before beginning training",
            },
            { score: 2, label: "Less than 5 hours since last maintenance", mitigation: "No training" },
          ],
        },
        {
          id: "t_ac_anomalies",
          label: "Known anomalies (NO grounding discrepancies)",
          noGo: true,
          options: [
            { score: 0, label: "None." },
            {
              score: 1,
              label: "1 - 2 discrepancies",
              mitigation: "Discuss countermeasures to compensate for equipment loss or degradation",
            },
            { score: 2, label: "More than 2." },
          ],
        },
        {
          id: "t_ac_performance",
          label: "Performance",
          options: [
            { score: 0, label: "Well under limits." },
            {
              score: 1,
              label: "Within 20% max gross or CG limit",
              mitigation: "Review performance chart. Burn off fuel. Wait for more optimum wx conditions",
            },
            {
              score: 2,
              label: "Within 10% max gross or CG limit",
              mitigation: "Discuss effect of performance/weight condition on maneuvers to be conducted",
            },
          ],
        },
      ],
    },
    {
      id: "environment",
      title: "ENVIRONMENT",
      kind: "dynamic",
      helpText: DYNAMIC_HELP,
      items: [
        {
          id: "t_env_ceiling",
          label: "Ceiling",
          options: [
            { score: 0, label: "> 1000' higher than policy minimums" },
            {
              score: 1,
              label: "Within 500' of policy minimums",
              mitigation: "Set up cockpit for IIMC recovery. Check wx for trend. Verify alternate landing locations within mission area, etc.",
            },
            { score: 2, label: "Within 100' of policy minimums", mitigation: "Train only in the pattern at the airport" },
          ],
        },
        {
          id: "t_env_visibility",
          label: "Visibility",
          options: [
            { score: 0, label: "> 5 miles greater than policy minimum vis" },
            {
              score: 1,
              label: "Within 3 miles of policy minimum vis",
              mitigation: "Set up cockpit for IIMC recovery. Check wx for trend. Verify alternate landing locations within mission area, etc.",
            },
            { score: 2, label: "Within 1 mile of policy minimum vis", mitigation: "Train only in the pattern at the airport" },
          ],
        },
        {
          id: "t_env_winds",
          label: "Winds",
          options: [
            { score: 0, label: "Light winds" },
            {
              score: 1,
              label: "Winds within 10 knots of aircraft (or personal) limits - gusts > 10kts",
              mitigation: "Consider takeoff/landing procedures to favor wind as much as possible",
            },
            {
              score: 2,
              label: "At or near aircraft (or personal) limits - > 15 kt gusts",
              mitigation: "Only conduct training specific to high wind proficiency, cancel unnecessary maneuvers",
            },
          ],
        },
        {
          id: "t_env_convective",
          label: "Convective Activity",
          options: [
            { score: 0, label: "No convective activity" },
            {
              score: 1,
              label: "Moderate convective activity within 20 nm",
              mitigation: "Brief on predicted wx and means of monitoring development",
            },
            { score: 2, label: "Strong convective activity within 20nm", mitigation: "Stop! Train when weather improves" },
          ],
        },
        {
          id: "t_env_terrain",
          label: "Terrain",
          options: [
            { score: 0, label: "Rural - Flat" },
            { score: 1, label: "City - Moderate Hills - Swamp", mitigation: "Review emergency landing areas" },
            {
              score: 2,
              label: "Mountainous, extended overwater beyond gliding distance",
              mitigation: "Only conduct training specific to these terrain types",
            },
          ],
        },
      ],
    },
    {
      id: "training_mission",
      title: "TRAINING MISSION",
      kind: "dynamic",
      helpText: DYNAMIC_HELP,
      items: [
        {
          id: "t_mission_maneuvers",
          label: "Training Maneuvers",
          options: [
            { score: 0, label: "Basic flight maneuvers" },
            {
              score: 1,
              label: "Advanced flight maneuvers - Emergency Procedures",
              mitigation:
                "Review emergency procedures, specify conditions needed to initiate and those that will trigger a 'go around' or instructor intervention",
            },
            {
              score: 2,
              label: "Emergency procedures with ground contact",
              mitigation: "Use progressive approach leading up to ground contact maneuvers",
            },
          ],
        },
        {
          id: "t_mission_day_night",
          label: "Day/Night/Aided",
          options: [
            { score: 0, label: "Daytime mission" },
            {
              score: 1,
              label: "Night mission - NVG's utilized",
              mitigation: "Review use and simulated failure procedures for NVGs",
            },
            {
              score: 2,
              label: "Night mission - unaided",
              mitigation: "Review terrain and CRM procedures during flight",
            },
          ],
        },
        {
          id: "t_mission_briefing",
          label: "Briefing",
          options: [
            { score: 0, label: "All maneuvers and procedures covered" },
            { score: 1, label: "Some maneuvers not covered or limits not specified" },
            { score: 2, label: "No briefing conducted", mitigation: "STOP! Do not train without a briefing" },
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// DAILY NORMAL OPS FRAT — 31 preguntas, puntaje máximo 62
// Usar para vuelos operativos normales (no de instrucción): línea, HEMS, traslados, etc.
// ---------------------------------------------------------------------------

export const DAILY_OPS_FRAT: FratSheet = {
  type: "DAILY_OPS",
  title: "Daily Normal Ops FRAT",
  usageNote: "Usar para vuelos operativos normales (no de instrucción): línea, HEMS, traslados, etc.",
  sections: [
    {
      id: "pilot",
      title: "PILOT",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "d_pilot_illness",
          label: "Illness/Physical Condition",
          options: [
            { score: 0, label: "No problems. Physically/mentally in shape." },
            {
              score: 1,
              label: "Nuisance, minor pain, illness or minor mental stress",
              mitigation: "Discuss CRM methods to minimize errors caused by degraded health",
            },
            { score: 2, label: "Illness requiring medication / Persistent pain or discomfort / Major mental stress", mitigation: "Stop!! Get released for duty by medic" },
          ],
        },
        {
          id: "d_pilot_medication",
          label: "Medication (NO GO with any unapproved prescription meds)",
          noGo: true,
          options: [
            { score: 0, label: "No medications in the last 24 hours." },
            {
              score: 1,
              label: "Unit approved OTC meds",
              mitigation: "Limit flight activity if possible. Get rest during shift if possible, review effects of meds with unit aeromedical contact",
            },
            { score: 2, label: "Approved prescription meds" },
          ],
        },
        {
          id: "d_pilot_fatigue",
          label: "Fatigue",
          options: [
            { score: 0, label: "No fatigue. 6-8 hours sleep" },
            { score: 1, label: "Some fatigue. Less than 6 hours sleep", mitigation: "Get rest during shift if able" },
            {
              score: 2,
              label: "Mentally or physically fatigued. Less than 4 hours sleep",
              mitigation: "Consider temp grounding until rested or relieved by back up crew",
            },
          ],
        },
        {
          id: "d_pilot_total_time",
          label: "Total flight time",
          options: [
            { score: 0, label: "Over 3000 hours total flight time." },
            {
              score: 1,
              label: "Between 3000 and 1000 hours total flight time.",
              mitigation: "Set higher margins of safety in weather, mission profile, etc.",
            },
            { score: 2, label: "Below 1000 hours total flight time.", mitigation: "Pairing with more experienced TFO or Copilot" },
          ],
        },
        {
          id: "d_pilot_time_type",
          label: "Flight time in make/model",
          options: [
            { score: 0, label: "Over 1000 hours flight time in make/model" },
            {
              score: 1,
              label: "Between 500 and 1000 hours flight time in make/model",
              mitigation: "Review section of POH daily (i.e. emergency procedure for the day)",
            },
            { score: 2, label: "Below 500 hours flight time in make/model", mitigation: "Limit mission profiles, weather limits, etc." },
          ],
        },
        {
          id: "d_pilot_last_flight_type",
          label: "Last flight in make/model",
          options: [
            { score: 0, label: "Within 1 month." },
            {
              score: 1,
              label: "Between 1 and 3 months.",
              mitigation: "Refresh with POH, pair with experienced and current crew",
            },
            { score: 2, label: "Over 3 months (not considered current for flight).", mitigation: "Refresher flight needed with unit IP" },
          ],
        },
        {
          id: "d_pilot_currency_training",
          label: "Currency Training",
          options: [
            { score: 0, label: "Previous 6 months (factory, sim, recurrent training, etc.)" },
            { score: 1, label: "Training conducted 6-12 months prior" },
            { score: 2, label: "None in last 12 months", mitigation: "Not considered current for missions" },
          ],
        },
        {
          id: "d_pilot_imc",
          label: "IMC Preparedness",
          options: [
            { score: 0, label: "IFR Current - IIMC training within last 6 months" },
            {
              score: 1,
              label: "IFR currency 6 months old - IIMC training more than 6 months prior",
              mitigation: "Refresh IMC procedures with flight or sim",
            },
            {
              score: 2,
              label: "No IFR currency or IIMC training in last 12 months",
              mitigation: "Flight only if 5000' ceiling and 10 miles visibility, and no forecast change. Nighttime only in well lit urban areas",
            },
          ],
        },
      ],
    },
    {
      id: "tfo_copilot",
      title: "TFO or Copilot",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "d_tfo_illness",
          label: "Illness/Condition",
          options: [
            { score: 0, label: "No problems. Physically/mentally in shape." },
            {
              score: 1,
              label: "Nuisance, minor pain, illness or minor mental stress",
              mitigation: "Discuss CRM methods to minimize errors caused by degraded health",
            },
            { score: 2, label: "Illness requiring medication / Persistent pain or discomfort / Major mental stress", mitigation: "Stop!! Get released for duty by medic" },
          ],
        },
        {
          id: "d_tfo_medication",
          label: "Medication (NO GO with any unapproved prescription meds)",
          noGo: true,
          options: [
            { score: 0, label: "No medications in the last 24 hours." },
            {
              score: 1,
              label: "Unit approved OTC meds",
              mitigation: "Limit flight activity if possible. Get rest during shift if possible, review effects of meds with unit aeromedical contact",
            },
            { score: 2, label: "Approved prescription meds" },
          ],
        },
        {
          id: "d_tfo_fatigue",
          label: "Fatigue",
          options: [
            { score: 0, label: "No fatigue. 6-8 hours sleep" },
            { score: 1, label: "Some fatigue. Less than 6 hours sleep", mitigation: "Get rest during shift if able" },
            {
              score: 2,
              label: "Mentally or physically fatigued. Less than 4 hours sleep",
              mitigation: "Consider temp grounding until rested or relieved by back up crew",
            },
          ],
        },
        {
          id: "d_tfo_total_time",
          label: "Total flight time",
          options: [
            { score: 0, label: "Over 1000 hours total flight time or more than 3 years experience" },
            {
              score: 1,
              label: "Between 300 and 1000 hours total flight time or 1 - 3 years experience",
              mitigation: "Brief emergency procedures/CRM with pilot",
            },
            {
              score: 2,
              label: "Below 300 hours total flight time or less than 6 months experience",
              mitigation: "Flight with more experienced pilot. Raise wx minimums/flight altitude",
            },
          ],
        },
        {
          id: "d_tfo_imc",
          label: "IMC Preparedness",
          options: [
            { score: 0, label: "IIMC training within last 6 months" },
            { score: 1, label: "IIMC training more than 6 months prior", mitigation: "Refresh IMC procedures with briefing or sim" },
            {
              score: 2,
              label: "No IIMC training in last 12 months",
              mitigation: "Flight only if 5000' ceiling and 10 miles visibility, and no forecast change. Nighttime only in well lit urban areas",
            },
          ],
        },
        {
          id: "d_tfo_crew_together",
          label: "Flight crew",
          options: [
            { score: 0, label: "More than 100 hours working together as a flight crew" },
            { score: 1, label: "Between 20 and 100 hours as flight crew", mitigation: "Brief cockpit CRM and procedures" },
            {
              score: 2,
              label: "Less than 20 hours as flight crew",
              mitigation: "Use increased wx and mission profile safety margins",
            },
          ],
        },
      ],
    },
    {
      id: "aircraft",
      title: "AIRCRAFT",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "d_ac_maintenance",
          label: "Recent Maintenance Performed",
          options: [
            { score: 0, label: "More than 10 hours since last maintenance" },
            { score: 1, label: "5 - 10 hours since last maintenance", mitigation: "Daytime or higher wx minimums at night" },
            { score: 2, label: "Less than 5 hours since last maintenance", mitigation: "No passengers" },
          ],
        },
        {
          id: "d_ac_anomalies",
          label: "Known anomalies (NO grounding discrepancies)",
          noGo: true,
          options: [
            { score: 0, label: "None." },
            {
              score: 1,
              label: "1 - 2 discrepancies",
              mitigation: "Discuss countermeasures to compensate for equipment loss or degradation",
            },
            { score: 2, label: "More than 2." },
          ],
        },
        {
          id: "d_ac_performance",
          label: "Performance",
          options: [
            { score: 0, label: "Well under limits." },
            { score: 1, label: "Within 20% max gross or CG limit", mitigation: "Review performance chart" },
            {
              score: 2,
              label: "Within 10% max gross or CG limit",
              mitigation: "No offsite landings, possible changes in landing/takeoff profile",
            },
          ],
        },
      ],
    },
    {
      id: "aircrew",
      title: "AIRCREW",
      kind: "dynamic",
      helpText: DYNAMIC_HELP,
      items: [
        {
          id: "d_crew_hours_duty",
          label: "Hours on Duty",
          options: [
            { score: 0, label: "0 - 8 hours" },
            {
              score: 1,
              label: "8 - 12 hours",
              mitigation: "Take a nap at work if able. Have another crew take the call.",
            },
            { score: 2, label: "12 + hours", mitigation: "Refrain from accepting missions with higher risk scores" },
          ],
        },
        {
          id: "d_crew_time_of_day",
          label: "Time of Day",
          options: [
            { score: 0, label: "N/A" },
            {
              score: 1,
              label: "1500-1700hrs",
              mitigation: "Take a nap at work if able. Have another crew take the call.",
            },
            { score: 2, label: "0100-0600hrs", mitigation: "Refrain from accepting missions with higher risk scores" },
          ],
        },
      ],
    },
    {
      id: "environment",
      title: "ENVIRONMENT",
      kind: "dynamic",
      helpText: DYNAMIC_HELP,
      items: [
        {
          id: "d_env_ceiling",
          label: "Ceiling",
          options: [
            { score: 0, label: "> 1000' higher than policy minimums" },
            {
              score: 1,
              label: "Within 500' of policy minimums",
              mitigation: "Set up cockpit for IIMC recovery. Check wx for trend. Verify alternate landing locations within mission area, etc.",
            },
            { score: 2, label: "Within 100' of policy minimums" },
          ],
        },
        {
          id: "d_env_visibility",
          label: "Visibility",
          options: [
            { score: 0, label: "> 5 miles greater than policy minimum vis" },
            {
              score: 1,
              label: "Within 3 miles of policy minimum vis",
              mitigation: "Set up cockpit for IIMC recovery. Check wx for trend. Verify alternate landing locations within mission area, etc.",
            },
            { score: 2, label: "Within 1 mile of policy minimum vis" },
          ],
        },
        {
          id: "d_env_winds",
          label: "Winds",
          options: [
            { score: 0, label: "Light winds" },
            {
              score: 1,
              label: "Winds within 10 knots of aircraft (or personal) limits - gusts > 10kts",
              mitigation: "Consider takeoff/landing procedures to favor wind as much as possible",
            },
            {
              score: 2,
              label: "At or near aircraft (or personal) limits - > 15 kt gusts",
              mitigation: "Review high wind landing procedures",
            },
          ],
        },
        {
          id: "d_env_convective",
          label: "Convective Activity",
          options: [
            { score: 0, label: "No convective activity" },
            {
              score: 1,
              label: "Moderate convective activity within 20 nm",
              mitigation: "Develop alternate plan to divert or land offsite if needed",
            },
            { score: 2, label: "Strong convective activity within 20nm", mitigation: "Stop! Cancel the flight if needed" },
          ],
        },
        {
          id: "d_env_forecast",
          label: "Forecast conditions",
          options: [
            { score: 0, label: "WX conditions stable - no change forecast" },
            {
              score: 1,
              label: "Moderate change in wx forecast or unreliable forecast",
              mitigation: "Set up cockpit for IIMC recovery. Check wx for trend. Verify alternate landing locations within mission area, etc.",
            },
            {
              score: 2,
              label: "WX unstable or forecast to deteriorate towards IMC conditions",
              mitigation: "Set up wx limit that will allow for time to return to base or land offsite",
            },
          ],
        },
        {
          id: "d_env_terrain",
          label: "Terrain",
          options: [
            { score: 0, label: "Rural - Flat" },
            {
              score: 1,
              label: "City - Moderate Hills - Swamp",
              mitigation: "Survival equipment, life preserver on. Review minimum altitudes and routes",
            },
            { score: 2, label: "Mountainous, extended overwater beyond gliding distance" },
          ],
        },
        {
          id: "d_env_fog",
          label: "Fog",
          options: [
            { score: 0, label: "Conditions not present for fog" },
            {
              score: 1,
              label: "Fog forecast > 4 hours beyond launch time",
              mitigation: "Set up cockpit for IIMC recovery. Check wx for trend. Verify alternate landing locations within mission area, etc.",
            },
            { score: 2, label: "Temp/dewpoint spread < 3F or 1C, light winds", mitigation: "Stop! Cancel the flight if needed" },
          ],
        },
        {
          id: "d_env_icing",
          label: "Icing",
          options: [
            { score: 0, label: "No icing conditions." },
            { score: 1, label: "Marginal icing conditions.", mitigation: "Identify icing levels and discuss recovery plan" },
            {
              score: 2,
              label: "Probable icing if entering in visible moisture conditions.",
              mitigation: "Stop! Cancel the flight",
            },
          ],
        },
      ],
    },
    {
      id: "mission",
      title: "MISSION",
      kind: "dynamic",
      helpText: DYNAMIC_HELP,
      items: [
        {
          id: "d_mission_type",
          label: "Mission Type",
          options: [
            { score: 0, label: "Normal call response - normal operating area" },
            {
              score: 1,
              label: "Call outside of normal operating area",
              mitigation: "Review emergency procedures, conduct mission briefing",
            },
            {
              score: 2,
              label: "Specialized mission - K9 transport, SWAT, long line, hoist, bambi bucket, etc.",
              mitigation: "Use briefing card for specialized mission",
            },
          ],
        },
        {
          id: "d_mission_landing_site",
          label: "Landing Site",
          options: [
            { score: 0, label: "At base or designated landing area" },
            { score: 1, label: "Offsite or helipad landing - familiar site" },
            { score: 2, label: "Offsite or helipad landing - unfamiliar site" },
          ],
        },
        {
          id: "d_mission_day_night",
          label: "Day/Night/Aided",
          options: [
            { score: 0, label: "Daytime mission" },
            { score: 1, label: "Night mission - NVG's utilized" },
            {
              score: 2,
              label: "Night mission - unaided",
              mitigation: "Use higher wx minimums. Set up cockpit for IIMC recovery",
            },
          ],
        },
        {
          id: "d_mission_external_pressure",
          label: "External Pressure",
          options: [
            { score: 0, label: "Flight easily cancelled - no risk of death or injury to persons on call" },
            { score: 1, label: "Risk of injury or death without help from aviation." },
            {
              score: 2,
              label: "Significant pressure from agency leadership to launch",
              mitigation: "Stop! Cancel the flight if it exceeds normal risk limits. Review written unit policy with supervisors",
            },
          ],
        },
      ],
    },
  ],
};

export const FRAT_SHEETS: Record<FratType, FratSheet> = {
  TRAINING: TRAINING_FRAT,
  DAILY_OPS: DAILY_OPS_FRAT,
};

export function getFratSheet(type: FratType): FratSheet {
  return FRAT_SHEETS[type];
}

export function allItems(sheet: FratSheet): FratItem[] {
  return sheet.sections.flatMap((s) => s.items);
}

export function maxScore(sheet: FratSheet): number {
  return allItems(sheet).length * 2;
}

/** Umbrales verificados contra los .xls reales de la compañía: CAUTION al 20% del máximo, HIGH RISK al 40%. */
export function riskLevelFor(score: number, max: number): FratRiskLevel {
  if (score >= max * 0.4) return "HIGH_RISK";
  if (score >= max * 0.2) return "CAUTION";
  return "ACCEPTABLE";
}

export const RISK_LEVEL_INFO: Record<
  FratRiskLevel,
  { label: string; description: string; action: string; colorClass: string }
> = {
  ACCEPTABLE: {
    label: "ACCEPTABLE",
    description: "Riesgo aceptable para la operación prevista.",
    action: "Proceder con el vuelo, conservando el FRAT completado como parte de la documentación del vuelo.",
    colorClass: "emerald",
  },
  CAUTION: {
    label: "CAUTION",
    description: "Riesgo elevado que requiere revisión adicional.",
    action:
      "Requiere autorización expresa del Post Holder de Operaciones (o del responsable de mayor jerarquía disponible) antes de volar, dejando constancia de dicha autorización.",
    colorClass: "amber",
  },
  HIGH_RISK: {
    label: "HIGH RISK",
    description: "Riesgo no aceptable para la operación en las condiciones evaluadas.",
    action:
      "Cancelar o reprogramar el vuelo. No debe operarse hasta que la mitigación de los factores de riesgo reduzca el puntaje a un nivel aceptable.",
    colorClass: "red",
  },
};

export interface FratResponseValue {
  initial: 0 | 1 | 2;
  final: 0 | 1 | 2;
  mitigation?: string;
}

export type FratResponses = Record<string, FratResponseValue>;

export interface FratScoreSummary {
  max: number;
  initialScore: number;
  finalScore: number;
  initialLevel: FratRiskLevel;
  finalLevel: FratRiskLevel;
  answered: number;
  total: number;
  missing: number;
}

export function computeFratScore(sheet: FratSheet, responses: FratResponses): FratScoreSummary {
  const items = allItems(sheet);
  const max = items.length * 2;
  let initialScore = 0;
  let finalScore = 0;
  let answered = 0;

  for (const item of items) {
    const r = responses[item.id];
    if (!r) continue;
    answered += 1;
    initialScore += r.initial;
    finalScore += r.final;
  }

  return {
    max,
    initialScore,
    finalScore,
    initialLevel: riskLevelFor(initialScore, max),
    finalLevel: riskLevelFor(finalScore, max),
    answered,
    total: items.length,
    missing: items.length - answered,
  };
}
