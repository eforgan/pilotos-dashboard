"use client";

import React, { useState, useMemo } from "react";
import { 
  getPilotExpirations
} from "@/lib/utils";
import { Pilot, ExpirationItem } from "@/lib/types";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon
} from "lucide-react";
import { 
  format, addMonths, subMonths, startOfMonth, 
  endOfMonth, startOfWeek, endOfWeek, isSameMonth, 
  isSameDay, eachDayOfInterval 
} from "date-fns";
import { es } from "date-fns/locale";

interface CalendarViewProps {
  pilots: Pilot[];
}

export default function CalendarView({ pilots }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const allExpirations = useMemo(() => {
    const items: ExpirationItem[] = [];
    pilots.forEach(pilot => {
      items.push(...getPilotExpirations(pilot));
    });
    return items;
  }, [pilots]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getExpirationsForDay = (day: Date) => {
    return allExpirations.filter(exp => {
      // Parse DD/MM/YYYY to Date
      const [d, m, y] = exp.date.split('/').map(Number);
      const expDate = new Date(y, m - 1, d);
      return isSameDay(expDate, day);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                <CalendarIcon className="w-7 h-7" />
            </div>
            <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-0.5">Cronograma de Vencimientos</p>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">
                    {format(currentMonth, "MMMM", { locale: es })}
                </h2>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {format(currentMonth, "yyyy")}
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors">
                Hoy
            </button>
            <button onClick={nextMonth} className="p-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50">
        {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <span className="hidden sm:block">{day}</span>
            <span className="block sm:hidden">{day.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-[120px]">
        {days.map((day, idx) => {
          const dayExpirations = getExpirationsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={idx} 
              className={`p-2 border-r border-b border-slate-100 dark:border-slate-800 flex flex-col group transition-colors ${
                !isCurrentMonth ? "bg-slate-50/50 dark:bg-slate-900/50 opacity-40" : "hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg ${
                    isToday ? "bg-blue-600 text-white" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                }`}>
                  {format(day, "d")}
                </span>
                {dayExpirations.length > 0 && (
                    <div className="flex -space-x-1">
                        {dayExpirations.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-blue-500 border border-white dark:border-slate-900" />
                        ))}
                    </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {dayExpirations.map((exp, i) => (
                  <div 
                    key={i} 
                    className={`text-[9px] p-1 px-1.5 rounded-md font-bold truncate ${
                        exp.level === 'critical' ? 'bg-red-500 text-white' :
                        exp.level === 'warning' ? 'bg-orange-500 text-white' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}
                    title={`${exp.pilotName}: ${exp.label}`}
                  >
                    {exp.pilotName.split(',')[0]}: {exp.label.split('(')[0]}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
