import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PilotsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { role?: string; pilotId?: string | null };

  if (user.role === "ADMIN") {
    redirect("/");
  } else if (user.pilotId) {
    redirect(`/pilot/${user.pilotId}`);
  } else {
    redirect("/frat");
  }
}
