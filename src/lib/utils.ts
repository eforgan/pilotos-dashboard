import { Pilot, AlertLevel, ExpirationItem, PilotSummary, TRACKABLE_FIELDS } from "./types";
export type { Pilot, AlertLevel, ExpirationItem, PilotSummary };

// Remove raw import since we now fetch from the database API
// import pilotsRaw from "@/data/pilots.json";

export async function getPilots(): Promise<Pilot[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/pilots`, {
      cache: "no-store", // Ensure fresh data
    });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  } catch (error) {
    console.error("Fetch pilots error:", error);
    return [];
  }
}

export async function getPilotById(id: string): Promise<Pilot | undefined> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/pilots/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    return res.json();
  } catch {
    return undefined;
  }
}

export async function updatePilot(id: string, data: Partial<Pilot>): Promise<Pilot | null> {
  try {
    const res = await fetch(`/api/pilots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === "N.A." || dateStr === "CURRENT" || dateStr === "") return null;
  // Handle YYYY-MM-DD format
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }
  return null;
}

export function daysUntil(dateStr: string): number | null {
  const date = parseDate(dateStr);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = date.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getAlertLevel(daysRemaining: number | null): AlertLevel {
  if (daysRemaining === null) return "na";
  if (daysRemaining < 0) return "critical";
  if (daysRemaining <= 30) return "critical";
  if (daysRemaining <= 60) return "warning";
  if (daysRemaining <= 90) return "caution";
  return "ok";
}

export function getAlertConfig(level: AlertLevel) {
  const configs = {
    critical: { 
      label: "Crítico", 
      color: "#991b1b", 
      bg: "#fee2e2", 
      border: "#fca5a5",
      description: "Vencido o vence en < 30 días"
    },
    warning: { 
      label: "Advertencia", 
      color: "#92400e", 
      bg: "#fef3c7", 
      border: "#fde68a",
      description: "Vence en 30-60 días"
    },
    caution: { 
      label: "Precaución", 
      color: "#1e40af", 
      bg: "#dbeafe", 
      border: "#bfdbfe",
      description: "Vence en 60-90 días"
    },
    ok: { 
      label: "Vigente", 
      color: "#166534", 
      bg: "#dcfce7", 
      border: "#bbf7d0",
      description: "Vigente > 90 días"
    },
    na: { 
      label: "N/A", 
      color: "#1f2937", 
      bg: "#f3f4f6", 
      border: "#e5e7eb",
      description: "No aplica"
    },
  };
  return configs[level];
}

export function getPilotExpirations(pilot: Pilot): ExpirationItem[] {
  const items: ExpirationItem[] = [];
  
  for (const field of TRACKABLE_FIELDS) {
    const value = pilot[field.key] as string;
    if (!value || value === "N.A." || value === "CURRENT" || value === "") continue;
    
    const days = daysUntil(value);
    if (days === null) continue;
    
    items.push({
      field: field.key,
      label: field.label,
      date: value,
      daysRemaining: days,
      level: getAlertLevel(days),
      pilotName: pilot.PILOTO,
      pilotId: pilot.id,
    });
  }
  
  return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getAllAlerts(pilots: Pilot[]): ExpirationItem[] {
  const allExpirations: ExpirationItem[] = [];
  
  for (const pilot of pilots) {
    allExpirations.push(...getPilotExpirations(pilot));
  }
  
  return allExpirations
    .filter((e) => e.level !== "ok" && e.level !== "na")
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getPilotOverallStatus(pilot: Pilot): AlertLevel {
  const expirations = getPilotExpirations(pilot);
  if (expirations.length === 0) return "na";
  
  const levels = expirations.map((e) => e.level);
  if (levels.includes("critical")) return "critical";
  if (levels.includes("warning")) return "warning";
  if (levels.includes("caution")) return "caution";
  return "ok";
}

export function getSummary(pilots: Pilot[]): PilotSummary {
  const byBase: Record<string, number> = {};
  const byLicense: Record<string, number> = {};
  let criticalAlerts = 0;
  let warningAlerts = 0;
  let cautionAlerts = 0;
  let okCount = 0;

  for (const pilot of pilots) {
    // Base
    const base = pilot.BASE || "Sin Base";
    byBase[base] = (byBase[base] || 0) + 1;
    
    // License
    const lic = normalizeLicense(pilot.LICENCIA);
    byLicense[lic] = (byLicense[lic] || 0) + 1;
    
    // Status
    const status = getPilotOverallStatus(pilot);
    switch (status) {
      case "critical": criticalAlerts++; break;
      case "warning": warningAlerts++; break;
      case "caution": cautionAlerts++; break;
      case "ok": okCount++; break;
    }
  }

  return {
    total: pilots.length,
    byBase,
    byLicense,
    criticalAlerts,
    warningAlerts,
    cautionAlerts,
    okCount,
  };
}

export function normalizeLicense(lic: string): string {
  const upper = lic.toUpperCase().trim();
  if (upper.includes("TLAH") || upper.includes("TLA") || upper.includes("T.L.A")) return "TLAH";
  if (upper.includes("PCH") || upper.includes("P.C.H")) return "PCH";
  if (upper.includes("PCA") || upper.includes("P.C.A")) return "PCA";
  return lic;
}

export function formatDate(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr || "—";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export function calculateAge(birthDate: string): number | null {
  const d = parseDate(birthDate);
  if (!d) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

export function searchPilots(pilots: Pilot[], query: string): Pilot[] {
  if (!query.trim()) return pilots;
  const q = query.toLowerCase();
  return pilots.filter(
    (p) =>
      p.PILOTO.toLowerCase().includes(q) ||
      p.DNI.includes(q) ||
      p.BASE.toLowerCase().includes(q) ||
      p.LICENCIA.toLowerCase().includes(q) ||
      (p.EMAIL && p.EMAIL.toLowerCase().includes(q))
  );
}

export function filterByBase(pilots: Pilot[], base: string): Pilot[] {
  if (!base || base === "all") return pilots;
  return pilots.filter((p) => p.BASE === base);
}

export function filterByStatus(pilots: Pilot[], status: AlertLevel | "all"): Pilot[] {
  if (status === "all") return pilots;
  return pilots.filter((p) => getPilotOverallStatus(p) === status);
}

export function getPilotAircraft(pilot: Pilot): string[] {
  const models: string[] = [];
  const candidates = ["AW109", "BO105", "RH44", "BN2B"] as const;
  for (const model of candidates) {
    const val = pilot[model];
    if (val && val !== "N.A." && val !== "" && val !== "0" && val !== "false") {
      models.push(model);
    }
  }
  return models;
}

export function filterByAircraft(pilots: Pilot[], model: string): Pilot[] {
  if (!model || model === "all") return pilots;
  return pilots.filter((p) => getPilotAircraft(p).includes(model));
}
