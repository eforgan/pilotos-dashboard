import { db } from "./db";
import { getPilotExpirations } from "./utils";
import { Pilot } from "./types";

export interface NotificationPayload {
  to: string;
  type: "email" | "whatsapp";
  message: string;
}

export async function checkAndNotify() {
  console.log("Starting notification scan...");
  const pilots = await db.pilot.findMany();
  const notificationsSent: NotificationPayload[] = [];

  for (const pilot of pilots) {
    const expirations = getPilotExpirations(pilot as unknown as Pilot);
    const critical = expirations.filter(e => e.level === "critical");
    const warning = expirations.filter(e => e.level === "warning");

    if (critical.length > 0) {
      const msg = `⚠️ ALERTA CRÍTICA: Hola ${pilot.PILOTO}, tienes ${critical.length} certificados por vencer en menos de 30 días (${critical.map(c => c.field).join(", ")}). Por favor actualízalos inmediatamente.`;
      
      if (pilot.TELEFONO) {
        notificationsSent.push({ to: pilot.TELEFONO, type: "whatsapp", message: msg });
      }
      // Add email notification if user exists
    } else if (warning.length > 0) {
        const msg = `🔔 AVISO: Hola ${pilot.PILOTO}, tienes ${warning.length} certificados con vencimiento próximo (30-60 días).`;
        if (pilot.TELEFONO) {
            notificationsSent.push({ to: pilot.TELEFONO, type: "whatsapp", message: msg });
        }
    }
  }

  console.log(`Scan complete. ${notificationsSent.length} notifications queued.`);
  return notificationsSent;
}

/**
 * Mock sender function
 * In production, this would integrate with Resend or Twilio
 */
export async function sendNotification(payload: NotificationPayload) {
  console.log(`[MOCK NOTIFICATION] To: ${payload.to} | Type: ${payload.type} | Msg: ${payload.message}`);
  // return await resend.emails.send(...) 
  return { success: true };
}
