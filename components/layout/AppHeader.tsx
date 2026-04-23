"use client";
import { useState } from "react";
import { Bell, Settings, BarChart3 } from "lucide-react";
import { useStore } from "@/store";

const PAGE_TITLES: Record<string, string> = {
    dashboard: "Dashboard",
    lotes: "Lotes",
    vacunas: "Salud & Vacunas",
    ventas: "Ventas",
    reportes: "Reportes",
    pagos: "Pagos",
    clientes: "Clientes",
    facturas: "Facturas",
    ajustes: "Ajustes",
};

export default function AppHeader() {
    const { activeTab, setActiveTab, vacunas, settings } = useStore();
    const proximas = vacunas.filter((v) => v.estado === "proxima").length;
    const [showNotifSheet, setShowNotifSheet] = useState(false);

    if (activeTab === "dashboard") {
        return (
            <>
                <header className="app-header">
                    <div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                            {settings.nombreGranja}
                        </div>
                        <div style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: "var(--text-xl)",
                            color: "var(--color-text)",
                            lineHeight: 1.2,
                        }}>
                            Porci<span style={{ color: "var(--color-primary)" }}>control</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        <button
                            className="btn-icon btn"
                            onClick={() => setActiveTab("reportes")}
                            aria-label="Reportes"
                        >
                            <BarChart3 size={18} />
                        </button>
                        <button
                            className="btn-icon btn"
                            style={{ position: "relative" }}
                            onClick={() => setShowNotifSheet(true)}
                            aria-label="Notificaciones"
                        >
                            <Bell size={18} />
                            {proximas > 0 && (
                                <span style={{
                                    position: "absolute", top: -4, right: -4,
                                    background: "var(--color-danger)",
                                    borderRadius: "var(--radius-full)",
                                    width: 16, height: 16,
                                    fontSize: 9, color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 800,
                                }}>
                                    {proximas}
                                </span>
                            )}
                        </button>
                        <button
                            className="btn-icon btn"
                            onClick={() => setActiveTab("ajustes")}
                            aria-label="Ajustes"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                {showNotifSheet && (
                    <div
                        onClick={() => setShowNotifSheet(false)}
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(0,0,0,0.8)",
                            zIndex: 80, display: "flex",
                            alignItems: "flex-end", justifyContent: "center",
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: "var(--color-bg-card)",
                                borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                                border: "1px solid var(--color-border)",
                                width: "100%", maxWidth: 430,
                                padding: "var(--space-5) var(--space-4) var(--space-8)",
                            }}
                        >
                            <div style={{ width: 36, height: 4, background: "var(--color-border-2)", borderRadius: 99, margin: "0 auto var(--space-4)" }} />
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--color-text)", marginBottom: "var(--space-3)" }}>
                                Notificaciones
                            </p>
                            {proximas > 0 && (
                                <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-warning)", fontWeight: 600 }}>
                                        💉 {proximas} vacuna{proximas > 1 ? "s" : ""} próxima{proximas > 1 ? "s" : ""}
                                    </p>
                                </div>
                            )}
                            {proximas === 0 && (
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)", marginBottom: "var(--space-4)" }}>
                                    ✅ Todo al día, sin recordatorios pendientes.
                                </p>
                            )}
                            <div style={{ display: "flex", gap: "var(--space-3)" }}>
                                <button
                                    className="btn btn-ghost"
                                    style={{ flex: 1 }}
                                    onClick={() => setShowNotifSheet(false)}
                                >
                                    Cerrar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    onClick={() => { setShowNotifSheet(false); setActiveTab("ajustes"); }}
                                >
                                    Ajustes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <header className="app-header">
            <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-lg)",
                color: "var(--color-text)",
            }}>
                {PAGE_TITLES[activeTab] ?? activeTab}
            </div>
            <button
                className="btn-icon btn"
                onClick={() => setActiveTab("ajustes")}
                aria-label="Ajustes"
            >
                <Settings size={18} />
            </button>
        </header>
    );
}