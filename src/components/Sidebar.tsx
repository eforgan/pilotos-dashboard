"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Plane, 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  ShieldAlert,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Lista de Pilotos", href: "/pilots", icon: Users },
    { name: "Mis Datos", href: "/pilot/pilot-0-21524146.0", icon: Calendar }, // Mocking an ID for demo
    { name: "Alertas", href: "/alerts", icon: Bell },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${scrolled ? "glass-panel" : "bg-transparent"}`}>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-900 rounded-lg">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">FlyDashboard</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-40">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-slate-900 dark:bg-slate-100 rounded-xl shadow-lg">
              <Plane className="w-6 h-6 text-white dark:text-slate-900" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">FlyDashboard</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Pilot Management</p>
            </div>
          </div>

          <nav className="space-y-1.5 font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${
                    isActive 
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md shadow-slate-200 dark:shadow-slate-950" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-white dark:text-slate-900" : ""}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 pt-0">
          <div className="p-4 rounded-2xl bg-slate-900/5 dark:bg-slate-100/5 border border-slate-200/50 dark:border-slate-100/10">
            <div className="flex items-center gap-3 mb-3">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold">Alertas Críticas</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Hay 12 documentos que vencen pronto.</p>
            <Link href="/alerts" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Ver Reportes →</Link>
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

                <div className="mt-auto">
                    <button className="flex items-center gap-3 w-full px-5 py-4 text-slate-500 hover:text-red-500 transition-colors">
                        <LogOut className="w-6 h-6" />
                        <span className="font-medium text-lg">Cerrar Sesión</span>
                    </button>
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
