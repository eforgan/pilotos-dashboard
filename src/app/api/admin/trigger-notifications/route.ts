import { NextResponse } from "next/server";
import { checkAndNotify, sendNotification } from "@/lib/notifications";

export async function POST() {
  try {
    const queue = await checkAndNotify();
    
    // In test mode, we just return the queue
    // In production, we would call sendNotification(payload) for each
    const results = await Promise.all(queue.map(p => sendNotification(p)));

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
