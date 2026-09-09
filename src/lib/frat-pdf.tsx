import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { FratResponses, FratType, allItems, computeFratScore, getFratSheet } from "@/lib/frat-data";

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
  badge: { fontSize: 12, fontFamily: "Helvetica-Bold", padding: 6, borderRadius: 4, color: "#fff" },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  infoCell: { width: "25%", marginBottom: 4 },
  infoLabel: { fontSize: 7, color: "#94a3b8", textTransform: "uppercase" },
  infoValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#0f172a",
    color: "#fff",
    padding: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 3,
  },
  itemLabel: { width: "28%", fontFamily: "Helvetica-Bold" },
  itemOption: { width: "42%" },
  itemScore: { width: "8%", textAlign: "center", fontFamily: "Helvetica-Bold" },
  itemMitigation: { width: "22%", color: "#334155", fontSize: 8 },
  scoreBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
  },
  footer: { marginTop: 14, fontSize: 8, color: "#475569" },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  signBox: { width: "45%", borderTopWidth: 1, borderTopColor: "#94a3b8", paddingTop: 4, fontSize: 8, textAlign: "center" },
});

const RISK_COLOR: Record<string, string> = {
  ACCEPTABLE: "#059669",
  CAUTION: "#d97706",
  HIGH_RISK: "#dc2626",
};

const SCORE_COLOR: Record<number, string> = { 0: "#059669", 1: "#d97706", 2: "#dc2626" };

export interface FratPdfProps {
  type: FratType;
  flightDate: string;
  base?: string | null;
  aircraft?: string | null;
  picName: string;
  sicName?: string | null;
  route?: string | null;
  etd?: string | null;
  missionType?: string | null;
  pilotName?: string | null;
  responses: FratResponses;
  generalNotes?: string | null;
  decision?: string | null;
  createdAt: string;
}

export function FratPdfDocument(props: FratPdfProps) {
  const sheet = getFratSheet(props.type);
  const items = allItems(sheet);
  const score = computeFratScore(sheet, props.responses);
  const riskColor = RISK_COLOR[score.finalLevel];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>MODENA AIR SERVICE OFFSHORE</Text>
            <Text style={styles.sub}>Dirección de Operaciones — Seguridad Operacional (SMS)</Text>
            <Text style={styles.sub}>{sheet.title} — Flight Risk Assessment Tool (EHSIT / PAVE)</Text>
          </View>
          <Text style={[styles.badge, { backgroundColor: riskColor }]}>
            {score.finalScore}/{score.max} PTS — {score.finalLevel.replace("_", " ")}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Fecha del vuelo</Text>
            <Text style={styles.infoValue}>{props.flightDate}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Base</Text>
            <Text style={styles.infoValue}>{props.base || "N/A"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Aeronave</Text>
            <Text style={styles.infoValue}>{props.aircraft || "N/A"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Misión</Text>
            <Text style={styles.infoValue}>{props.missionType || "N/A"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>
              {props.type === "TRAINING"
                ? "Instructor / Inspector"
                : props.missionType === "HEMS"
                ? "Piloto HEMS"
                : "Comandante (PIC)"}
            </Text>
            <Text style={styles.infoValue}>{props.picName}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>
              {props.type === "TRAINING"
                ? "Piloto en Instrucción"
                : props.missionType === "HEMS"
                ? "Técnico Operativo (TFO) / Copiloto"
                : "Copiloto / TFO"}
            </Text>
            <Text style={styles.infoValue}>{props.sicName || "N/A"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Ruta</Text>
            <Text style={styles.infoValue}>{props.route || "N/A"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>ETD</Text>
            <Text style={styles.infoValue}>{props.etd || "N/A"}</Text>
          </View>
        </View>

        {sheet.sections.map((section) => (
          <View key={section.id} wrap={false}>
            <Text style={styles.sectionTitle}>
              {section.title} {section.kind === "static" ? "(Estático)" : "(Dinámico)"}
            </Text>
            {section.items.map((item) => {
              const r = props.responses[item.id];
              const chosen = r ? item.options.find((o) => o.score === r.final) : undefined;
              return (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemOption}>{chosen?.label || "Sin responder"}</Text>
                  <Text style={[styles.itemScore, { color: r ? SCORE_COLOR[r.final] : "#94a3b8" }]}>
                    {r ? r.final : "-"}
                  </Text>
                  <Text style={styles.itemMitigation}>{r?.mitigation || ""}</Text>
                </View>
              );
            })}
          </View>
        ))}

        <View style={styles.scoreBar}>
          <Text>Puntaje inicial: {score.initialScore}/{score.max} ({score.initialLevel.replace("_", " ")})</Text>
          <Text>Puntaje final: {score.finalScore}/{score.max} ({score.finalLevel.replace("_", " ")})</Text>
          <Text>Preguntas respondidas: {score.answered}/{score.total}</Text>
        </View>

        {props.generalNotes ? (
          <View style={styles.footer}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Observaciones generales:</Text>
            <Text>{props.generalNotes}</Text>
          </View>
        ) : null}

        {props.decision ? (
          <View style={styles.footer}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Decisión / Autorización:</Text>
            <Text>{props.decision}</Text>
          </View>
        ) : null}

        <View style={styles.signRow}>
          <Text style={styles.signBox}>{props.picName || "Firma Comandante (PIC)"}</Text>
          <Text style={styles.signBox}>Dirección de Operaciones / SMS</Text>
        </View>

        <Text style={[styles.footer, { textAlign: "center", marginTop: 20 }]}>
          Documento generado electrónicamente el {props.createdAt} — Modena Air Service Offshore
          {props.pilotName ? ` — Piloto: ${props.pilotName}` : ""}
        </Text>
      </Page>
    </Document>
  );
}
