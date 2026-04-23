"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { fmt } from "@/lib/utils";
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from "recharts";
import { exportarReporteExcel, generarMensajeResumen } from "@/lib/exportUtils";
import { Download, MessageCircle } from "lucide-react";
const CHART_COLORS = ["#22c55e", "#86efac", "#f59e0b", "#3b82f6", "#a855f7", "#ef4444"];

export default function ReportesScreen() {
    const { lotes, ventas, vacunas, pagos, clientes, settings } = useStore();
    const [tab, setTab] = useState<"ventas" | "inversion" | "lotes">("ventas");

    // Ventas por mes
    const ventasPorMes = ventas.reduce<Record<string, number>>((acc, v) => {
        const mes = v.fecha.slice(0, 7);
        acc[mes] = (acc[mes] ?? 0) + v.total;
        return acc;
    }, {});
    const ventasData = Object.entries(ventasPorMes)
        .slice(-6)
        .map(([mes, total]) => ({
            mes: new Date(mes + "-01").toLocaleDateString("es-CR", { month: "short" }),
            total: Math.round(total / 1000),
        }));

    // Costos por categoría
    const totalCostos = lotes.flatMap((l) => l.costos);
    const costosPorCat = totalCostos.reduce<Record<string, number>>((acc, c) => {
        acc[c.categoria] = (acc[c.categoria] ?? 0) + c.monto;
        return acc;
    }, {});
    const costosData = Object.entries(costosPorCat).map(([cat, monto]) => ({
        name:
            cat === "compra" ? "Compra" :
                cat === "alimentacion" ? "Alimento" :
                    cat === "vacunas" ? "Vacunas" :
                        cat === "medicamentos" ? "Medicamentos" :
                            "Otros",
        value: Math.round(monto / 1000),
    }));

    // Inversión vs estimado por lote
    const lotesData = lotes.slice(0, 5).map((l) => ({
        name: l.nombre,
        inversion: Math.round(l.inversion / 1000),
        estimado: Math.round(l.valorEstimado / 1000),
    }));

    // KPIs
    const totalVendido = ventas
        .filter((v) => v.estado === "pagada")
        .reduce((s, v) => s + v.total, 0);
    const totalInversion = lotes.reduce((s, l) => s + l.inversion, 0);
    const roi = totalInversion > 0
        ? ((totalVendido - totalInversion) / totalInversion * 100).toFixed(1)
        : "0";

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2) var(--space-3)",
            }}>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                    {label}
                </p>
                {payload.map((p: any) => (
                    <p key={p.dataKey} style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: p.color }}>
                        {fmt(p.value * 1000)}
                    </p>
                ))}
            </div>
        );
    };

    const handleExportExcel = () => {
        exportarReporteExcel(lotes, ventas, pagos, clientes, settings.nombreGranja);
    };

    const handleWhatsApp = () => {
        const mensaje = generarMensajeResumen(lotes, ventas, pagos, settings.nombreGranja);
        window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank");
    };
    return (
        <div className="page fade-in">
            {/* Exportar */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-3)", marginBottom: "var(--space-5)",
            }}>
                <button
                    className="btn btn-primary"
                    style={{ width: "100%", flexDirection: "column", gap: 4, minHeight: 64 }}
                    onClick={handleExportExcel}
                >
                    <Download size={20} />
                    <span style={{ fontSize: "var(--text-xs)" }}>Exportar Excel</span>
                </button>
                <button
                    className="btn btn-secondary"
                    style={{ width: "100%", flexDirection: "column", gap: 4, minHeight: 64 }}
                    onClick={handleWhatsApp}
                >
                    <MessageCircle size={20} color="#25D366" />
                    <span style={{ fontSize: "var(--text-xs)" }}>Enviar WhatsApp</span>
                </button>
            </div>
            {/* KPIs */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-3)", marginBottom: "var(--space-5)",
            }}>
                {[
                    { label: "Total vendido", value: fmt(totalVendido), color: "var(--color-primary)" },
                    { label: "ROI acumulado", value: `${roi}%`, color: "var(--color-accent)" },
                    { label: "Inversión activa", value: fmt(totalInversion), color: "var(--color-warning)" },
                    { label: "Vacunas aplicadas", value: vacunas.filter((v) => v.estado === "aplicada").length, color: "var(--color-info)" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        background: "var(--color-bg-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-3)",
                    }}>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                            {label}
                        </p>
                        <p style={{
                            fontFamily: "var(--font-display)", fontWeight: 800,
                            fontSize: "var(--text-lg)", color,
                        }}>
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Chart Tabs */}
            <div className="tab-pills">
                <button className={`tab-pill${tab === "ventas" ? " active" : ""}`} onClick={() => setTab("ventas")}>Ventas</button>
                <button className={`tab-pill${tab === "inversion" ? " active" : ""}`} onClick={() => setTab("inversion")}>Costos</button>
                <button className={`tab-pill${tab === "lotes" ? " active" : ""}`} onClick={() => setTab("lotes")}>Lotes</button>
            </div>

            <div className="card">

                {/* Ventas por mes */}
                {tab === "ventas" && (
                    <>
                        <p style={{
                            fontFamily: "var(--font-display)", fontWeight: 700,
                            fontSize: "var(--text-base)", color: "var(--color-text)",
                            marginBottom: "var(--space-3)",
                        }}>
                            Ventas por mes (₡ miles)
                        </p>
                        {ventasData.length === 0 ? (
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", textAlign: "center", padding: "var(--space-8) 0" }}>
                                Sin ventas registradas aún
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={ventasData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--color-text-3)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "var(--color-text-3)" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </>
                )}

                {/* Costos por categoría */}
                {tab === "inversion" && (
                    <>
                        <p style={{
                            fontFamily: "var(--font-display)", fontWeight: 700,
                            fontSize: "var(--text-base)", color: "var(--color-text)",
                            marginBottom: "var(--space-3)",
                        }}>
                            Distribución de costos
                        </p>
                        {costosData.length === 0 ? (
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", textAlign: "center", padding: "var(--space-8) 0" }}>
                                Sin costos registrados aún
                            </p>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={costosData} dataKey="value" nameKey="name"
                                            cx="50%" cy="50%" outerRadius={80}
                                        >
                                            {costosData.map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v) => fmt(Number(v ?? 0) * 1000)} />                                  </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
                                    {costosData.map((d, i) => (
                                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <div style={{
                                                width: 8, height: 8, borderRadius: "50%",
                                                background: CHART_COLORS[i % CHART_COLORS.length],
                                            }} />
                                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                                {d.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Inversión vs Estimado */}
                {tab === "lotes" && (
                    <>
                        <p style={{
                            fontFamily: "var(--font-display)", fontWeight: 700,
                            fontSize: "var(--text-base)", color: "var(--color-text)",
                            marginBottom: "var(--space-3)",
                        }}>
                            Inversión vs Valor estimado (₡ miles)
                        </p>
                        {lotesData.length === 0 ? (
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", textAlign: "center", padding: "var(--space-8) 0" }}>
                                Sin lotes registrados aún
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={lotesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--color-text-3)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "var(--color-text-3)" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-text-3)" }} />
                                    <Bar dataKey="inversion" name="Inversión" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="estimado" name="Estimado" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </>
                )}

            </div>

            {/* Recomendaciones */}
            <div style={{ marginTop: "var(--space-4)" }}>
                <p className="section-title" style={{ marginBottom: "var(--space-3)" }}>
                    Recomendaciones
                </p>
                {[
                    {
                        icon: "📈",
                        text: `Tu ROI es ${roi}%. Los mejores productores logran entre 30–40%.`,
                    },
                    {
                        icon: "🐷",
                        text: `Tienes ${lotes.filter((l) => l.estado === "activo").reduce((s, l) => s + l.chanchos, 0)} chanchos activos. Considera escalar si la demanda lo permite.`,
                    },
                    {
                        icon: "💊",
                        text: `${vacunas.filter((v) => v.estado === "proxima").length} vacunas próximas pendientes. Mantén al día el programa sanitario.`,
                    },
                ].map(({ icon, text }) => (
                    <div key={text} className="card" style={{
                        marginBottom: "var(--space-2)",
                        display: "flex", gap: "var(--space-3)", alignItems: "flex-start",
                    }}>
                        <span style={{ fontSize: 20 }}>{icon}</span>
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)", lineHeight: 1.5 }}>
                            {text}
                        </p>
                    </div>
                ))}
            </div>

        </div>
    );
}