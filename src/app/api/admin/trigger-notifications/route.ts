import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkAndNotify, sendNotification } from "@/lib/notifications";

export async function POST() {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const queue = await checkAndNotify();
    
    // In test mode, we just return the queue
    // In production, we would call sendNotification(payload) for each
    await Promise.all(queue.map(p => sendNotification(p)));

    return NextResponse.json({ 
      success: true, 
      count: queue.length,
      queue 
    });
  } catch (error) {
    console.error("Notification trigger failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
