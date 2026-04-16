"use client";

import React from "react";
import { PilotSummary } from "@/lib/types";
import { Users, AlertCircle, Calendar, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface PilotMetricsProps {
  summary: PilotSummary;
}

const PilotMetrics = ({ summary }: PilotMetricsProps) => {
  const cards = [
    {
      title: "Total Pilotos",
      value: summary.total,
      icon: Users,
      color: "blue",
      description: "Personal activo"
    },
    {
      title: "Críticos",
      value: summary.criticalAlerts,
      icon: AlertCircle,
      color: "red",
      description: "Atención inmediata"
    },
    {
      title: "En Alerta",
      value: summary.warningAlerts + summary.cautionAlerts,
      icon: Calendar,
      color: "orange",
      description: "Próximos vencimientos"
    },
    {
      title: "Vigentes",
      value: summary.okCount,
      icon: CheckCircle2,
      color: "green",
      description: "Estado operativo"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="card-premium p-6 flex items-start gap-4"
        >
          <div className={`p-3 rounded-2xl bg-${card.color}-500/10 dark:bg-${card.color}-500/20`}>
            <card.icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
            <h4 className="text-2xl font-bold tracking-tight">{card.value}</h4>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 mt-1">{card.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PilotMetrics;
