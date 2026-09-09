"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import ChangePasswordModal from "@/components/ChangePasswordModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <ChangePasswordModal />
      </NextThemesProvider>
    </SessionProvider>
  );
}
