import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#1d4ed8",
    paddingBottom: 8,
    marginBottom: 10,
  },
  companyName: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  sub: { fontSize: 8, color: "#475569", marginTop: 2 },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 10,
  },
  summaryCell: { alignItems: "center" },
  summaryValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#1d4ed8" },
  summaryLabel: { fontSize: 7, color: "#64748b", textTransform: "uppercase", marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    color: "#fff",
    padding: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    padding: 4,
    fontSize: 8,
  },
  colDate: { width: "11%" },
  colPilot: { width: "22%" },
  colAircraft: { width: "16%" },
  colRoute: { width: "26%" },
  colDay: { width: "8%", textAlign: "right" },
  colNight: { width: "8%", textAlign: "right" },
  colTotal: { width: "9%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  footer: { marginTop: 14, fontSize: 8, color: "#475569", textAlign: "center" },
});

export interface LogbookPdfRow {
  date: string;
  pilotName: string;
  aircraft: string;
  tailNumber: string;
  route: string | null;
  dayHours: number;
  nightHours: number;
  totalHours: number;
}

export interface LogbookPdfProps {
  title: string;
  rows: LogbookPdfRow[];
  createdAt: string;
}

export function LogbookPdfDocument({ title, rows, createdAt }: LogbookPdfProps) {
  const totalHours = rows.reduce((acc, r) => acc + r.totalHours, 0);
  const totalNight = rows.reduce((acc, r) => acc + r.nightHours, 0);
  const totalLandings = rows.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>MODENA AIR SERVICE</Text>
            <Text style={styles.sub}>Logbook & Horas de Vuelo</Text>
            <Text style={styles.sub}>{title}</Text>
          </View>
        </View>

        <View style={styles.summaryBar}>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryValue}>{totalHours.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Horas Totales</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryValue}>{totalNight.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Horas Nocturnas</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryValue}>{totalLandings}</Text>
            <Text style={styles.summaryLabel}>Vuelos Registrados</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.colDate}>Fecha</Text>
          <Text style={styles.colPilot}>Piloto</Text>
          <Text style={styles.colAircraft}>Aeronave</Text>
          <Text style={styles.colRoute}>Ruta</Text>
          <Text style={styles.colDay}>Día</Text>
          <Text style={styles.colNight}>Noche</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>
        {rows.map((r, i) => (
          <View key={i} style={styles.row} wrap={false}>
            <Text style={styles.colDate}>{r.date}</Text>
            <Text style={styles.colPilot}>{r.pilotName}</Text>
            <Text style={styles.colAircraft}>{r.aircraft} ({r.tailNumber})</Text>
            <Text style={styles.colRoute}>{r.route || ""}</Text>
            <Text style={styles.colDay}>{r.dayHours.toFixed(1)}</Text>
            <Text style={styles.colNight}>{r.nightHours.toFixed(1)}</Text>
            <Text style={styles.colTotal}>{r.totalHours.toFixed(1)}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Documento generado electrónicamente el {createdAt} — Modena Air Service
        </Text>
      </Page>
    </Document>
  );
}
