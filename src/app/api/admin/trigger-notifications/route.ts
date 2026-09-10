import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkAndNotify, sendNotification } from "@/lib/notifications";

async function runScan() {
  const queue = await checkAndNotify();
  const results = await Promise.all(queue.map(p => sendNotification(p)));
  return { count: queue.length, queue, results };
}

// Triggered manually from the admin Alerts UI.
export async function POST() {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { count, queue } = await runScan();

    return NextResponse.json({
      success: true,
      count,
      queue
    });
  } catch (error) {
    console.error("Notification trigger failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Triggered daily by the Vercel Cron Job defined in vercel.json.
// Vercel signs cron requests with an Authorization: Bearer <CRON_SECRET> header
// when the CRON_SECRET env var is set — see https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    }

    const { count } = await runScan();
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Notification cron failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
