"use client";
import { Bell, Settings } from "lucide-react";
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
    const { activeTab, setActiveTab, vacunas } = useStore();
    const proximas = vacunas.filter((v) => v.estado === "proxima").length;

    if (activeTab === "dashboard") {
        return (
            <header className="app-header">
                <div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                        Tu granja en orden
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
                        style={{ position: "relative" }}
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