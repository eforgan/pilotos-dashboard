"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Plane,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bell,
  ShieldAlert,
  FileCheck,
  Clock,
  User,
  MapPin,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);
  const { data: session } = useSession();

  const user = session?.user as { role?: string; pilotId?: string | null } | undefined;
  const isAdmin = user?.role === "ADMIN";
  const isSupervisor = user?.role === "BASE_SUPERVISOR";
  const pilotId = user?.pilotId;

  // Close sidebar on route change
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (pathname === "/login") return null;

  const navItems = isAdmin || isSupervisor
    ? [
        { name: "Dashboard Flota", href: "/", icon: LayoutDashboard },
        { name: "Alertas ANAC", href: "/alerts", icon: Bell },
        { name: "FRAT", href: "/frat", icon: FileCheck },
        { name: "Logbook & Horas", href: "/logbook", icon: Clock },
        ...(isAdmin ? [{ name: "Gestión de Flota", href: "/admin/fleet", icon: MapPin }] : []),
        ...(isAdmin ? [{ name: "Auditoría", href: "/admin/audit", icon: History }] : []),
        { name: "Manuales Técnicos", href: "/manuals", icon: Plane },
      ]
    : [
        { name: "Mi Legajo", href: pilotId ? `/pilot/${pilotId}` : "/", icon: User },
        { name: "Evaluaciones FRAT", href: "/frat", icon: FileCheck },
        { name: "Logbook & Horas", href: "/logbook", icon: Clock },
        { name: "Manuales Técnicos", href: "/manuals", icon: Plane },
      ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 glass-panel border-b border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-xl bg-white/90 dark:bg-slate-900/90">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 relative">
            {!logoError ? (
              <Image
                src="/logo.png"
                alt="Modena Logo"
                fill
                sizes="40px"
                className="object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs italic">
                    MAE
                </div>
            )}
          </div>
          <span className="font-bold text-lg tracking-tight">Modena Dashboard</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 z-40">
        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="relative w-56 h-24 mb-2">
              {!logoError ? (
                <Image
                    src="/logo.png"
                    alt="Modena Logo"
                    fill
                    priority
                    sizes="224px"
                    className="object-contain"
                    onError={() => setLogoError(true)}
                />
              ) : (
                  <div className="flex flex-col items-center">
                      <span className="text-3xl font-black italic text-blue-600 leading-none">MODENA</span>
                      <span className="text-xs font-bold tracking-widest text-slate-400 mt-1">AIR SERVICE</span>
                  </div>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-bold text-center">Aviation Excellence</p>
          </div>

          <nav className="space-y-2 font-bold">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-lg shadow-blue-500/30 scale-[1.02]" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`} />
                    <span className="text-xs uppercase tracking-wider">{item.name}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_8px_#67e8f9]" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-auto p-8 pt-0">
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-900/90 dark:to-slate-950/90 text-white border border-slate-800 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-white">Alertas ANAC</span>
              </div>
              <p className="text-[11px] font-medium text-slate-300 mb-3">Monitoreo de vencimientos y licencias en tiempo real.</p>
              <Link href="/alerts" className="inline-flex items-center gap-1 text-[11px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-all">
                Ver Reportes →
              </Link>
            </div>
          )}
          <div className="mt-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              desarrollo @eforgan
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white dark:bg-slate-900 z-[70] md:hidden border-r border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-2">
                    <Plane className="w-6 h-6" />
                    <span className="font-bold text-xl">FlyDashboard</span>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="flex-1 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-lg font-medium ${
                        pathname === item.href 
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" 
                          : "text-slate-500"
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto space-y-4">
                  <ThemeToggle />
                  <button 
                    onClick={() => signOut()}
                    className="flex items-center gap-3 w-full px-5 py-3.5 text-slate-500 hover:text-red-500 transition-colors font-bold text-sm"
                  >
                      <LogOut className="w-5 h-5" />
                      <span>Cerrar Sesión</span>
                  </button>
                  <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    desarrollo @eforgan
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
