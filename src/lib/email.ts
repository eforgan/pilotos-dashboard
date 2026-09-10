import { Resend } from "resend";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<SendEmailResult> {
  const client = getClient();
  const from = process.env.EMAIL_FROM || "Pilotos Dashboard <onboarding@resend.dev>";

  if (!client) {
    console.log(`[EMAIL NO ENVIADO - falta RESEND_API_KEY] To: ${to} | Subject: ${subject}`);
    return { success: false, error: "RESEND_API_KEY no configurada" };
  }

  try {
    const { error } = await client.emails.send({ from, to, subject, html });
    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
