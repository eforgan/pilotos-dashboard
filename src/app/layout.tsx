import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Gestión de Pilotos | FlyDashboard",
  description: "Sistema interactivo de gestión de pilotos y vencimientos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950`}>
        <Providers>
            <div className="flex min-h-screen relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            <Sidebar />
            
            <main className="flex-1 flex flex-col min-w-0 md:pl-0">
                <div className="h-full w-full overflow-y-auto overflow-x-hidden">
                {children}
                </div>
            </main>
            </div>
        </Providers>
      </body>
    </html>
  );
}
