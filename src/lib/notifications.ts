import { db } from "./db";
import { getPilotExpirations } from "./utils";
import { Pilot } from "./types";
import { sendEmail } from "./email";
import { sendPushToUser } from "./push";

export interface NotificationPayload {
  to: string;
  type: "email" | "whatsapp";
  subject?: string;
  message: string;
}

export async function checkAndNotify() {
  console.log("Starting notification scan...");
  const pilots = await db.pilot.findMany({ include: { user: { select: { id: true } } } });
  const notificationsSent: NotificationPayload[] = [];
  let pushSent = 0;

  for (const pilot of pilots) {
    const expirations = getPilotExpirations(pilot as unknown as Pilot);
    const critical = expirations.filter(e => e.level === "critical");
    const warning = expirations.filter(e => e.level === "warning");

    if (critical.length > 0) {
      const items = critical.map(c => c.label).join(", ");
      const waMsg = `⚠️ ALERTA CRÍTICA: Hola ${pilot.PILOTO}, tienes ${critical.length} certificados por vencer en menos de 30 días (${items}). Por favor actualízalos inmediatamente.`;

      if (pilot.TELEFONO) {
        notificationsSent.push({ to: pilot.TELEFONO, type: "whatsapp", message: waMsg });
      }
      if (pilot.EMAIL) {
        notificationsSent.push({
          to: pilot.EMAIL,
          type: "email",
          subject: "⚠️ Alerta crítica de vencimiento de certificaciones",
          message: buildExpirationEmailHtml(pilot.PILOTO, "crítica", critical.map(c => ({ label: c.label, days: c.daysRemaining }))),
        });
      }
      if (pilot.user?.id) {
        const result = await sendPushToUser(pilot.user.id, {
          title: "⚠️ Alerta crítica de vencimiento",
          body: `${critical.length} certificado(s) por vencer en menos de 30 días: ${items}`,
          url: "/alerts",
        });
        pushSent += result.sent;
      }
    } else if (warning.length > 0) {
      const waMsg = `🔔 AVISO: Hola ${pilot.PILOTO}, tienes ${warning.length} certificados con vencimiento próximo (30-60 días).`;
      if (pilot.TELEFONO) {
        notificationsSent.push({ to: pilot.TELEFONO, type: "whatsapp", message: waMsg });
      }
      if (pilot.EMAIL) {
        notificationsSent.push({
          to: pilot.EMAIL,
          type: "email",
          subject: "🔔 Aviso de vencimiento próximo de certificaciones",
          message: buildExpirationEmailHtml(pilot.PILOTO, "próxima", warning.map(w => ({ label: w.label, days: w.daysRemaining }))),
        });
      }
    }
  }

  console.log(`Scan complete. ${notificationsSent.length} notifications queued, ${pushSent} push notifications sent.`);
  return notificationsSent;
}

function buildExpirationEmailHtml(pilotName: string, urgency: "crítica" | "próxima", items: { label: string; days: number }[]): string {
  const rows = items
    .map(i => `<li><strong>${i.label}</strong> — vence en ${i.days} día${i.days === 1 ? "" : "s"}</li>`)
    .join("");
  const color = urgency === "crítica" ? "#991b1b" : "#92400e";
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: ${color};">Alerta de vencimiento ${urgency}</h2>
      <p>Hola ${pilotName},</p>
      <p>Los siguientes certificados requieren tu atención:</p>
      <ul>${rows}</ul>
      <p>Por favor actualizá tu legajo digital lo antes posible.</p>
    </div>
  `;
}

/**
 * Sends a single notification (email via Resend, WhatsApp is still a stub
 * pending a WhatsApp Business API integration).
 */
export async function sendNotification(payload: NotificationPayload) {
  if (payload.type === "email") {
    return sendEmail({
      to: payload.to,
      subject: payload.subject || "Notificación de Pilotos Dashboard",
      html: payload.message,
    });
  }

  console.log(`[WHATSAPP NO IMPLEMENTADO] To: ${payload.to} | Msg: ${payload.message}`);
  return { success: false, error: "WhatsApp aún no está integrado" };
}
