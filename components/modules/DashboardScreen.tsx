"use client";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/store";
import { fmt, fmtNum, fmtDate } from "@/lib/utils";
import { Badge, ProgressBar, StatCard } from "@/components/ui";
import { Layers, ShoppingCart, DollarSign, Syringe, Plus } from "lucide-react";

export default function DashboardScreen() {
    const { lotes, ventas, getDashboardStats, setActiveTab } = useStore();
    const { user } = useAuth();
    const stats = getDashboardStats();
    const lotesActivos = lotes.filter((l) => l.estado === "activo");
    const ventasRecientes = ventas.slice(0, 3);
    const calcDiasEngorde = (fechaIngreso: string) => {
        const ingreso = new Date(fechaIngreso + "T00:00:00");
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return Math.floor((hoy.getTime() - ingreso.getTime()) / (1000 * 60 * 60 * 24));
    };
    return (
        <div className="page fade-in">

            {/* Greeting */}
            <div style={{ marginBottom: "var(--space-5)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>
                    ¡Buenos días,
                </p>
                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-2xl)",
                    fontWeight: 800,
                    color: "var(--color-text)",
                    lineHeight: 1.2,
                }}>
                    {user?.displayName?.split(" ")[0] ?? "Usuario"}! 👋
                </h1>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", marginTop: 2 }}>
                    Aquí el resumen de tu granja.
                </p>
            </div>

            {/* Hero Card */}
            <div className="hero-card" style={{ marginBottom: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                            Ganancias estimadas
                        </p>
                        <p style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "var(--text-3xl)",
                            fontWeight: 800,
                            color: "var(--color-primary)",
                            lineHeight: 1,
                        }}>
                            {fmt(stats.gananciasEstimadas)}
                        </p>

                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                            Inversión total
                        </p>
                        <p style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "var(--text-lg)",
                            fontWeight: 700,
                            color: "var(--color-text)",
                        }}>
                            {fmt(stats.inversionTotal)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stat Grid */}
            <div className="stat-grid" style={{ marginBottom: "var(--space-5)" }}>
                <StatCard
                    label="Lotes activos"
                    value={stats.lotesActivos}
                    icon={<Layers size={16} color="var(--color-primary)" />}
                />
                <StatCard
                    label="Total chanchos"
                    value={fmtNum(stats.totalChanchos)}
                    icon={<span style={{ fontSize: 16 }}>🐷</span>}
                />
                <StatCard
                    label="Ventas este mes"
                    value={fmt(stats.ventasMes)}
                    icon={<ShoppingCart size={16} color="var(--color-info)" />}
                    iconBg="rgba(59,130,246,0.15)"
                />
                <StatCard
                    label="Por cobrar"
                    value={fmt(stats.pendientesCobro)}
                    icon={<DollarSign size={16} color="var(--color-warning)" />}
                    iconBg="rgba(245,158,11,0.15)"
                />
            </div>

            {/* Alerta vacunas */}
            {stats.vacunasProximas > 0 && (
                <div
                    onClick={() => setActiveTab("vacunas")}
                    style={{
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-3) var(--space-4)",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        marginBottom: "var(--space-5)",
                        cursor: "pointer",
                    }}
                >
                    <Syringe size={18} color="var(--color-warning)" />
                    <div>
                        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-warning)" }}>
                            {stats.vacunasProximas} vacuna{stats.vacunasProximas > 1 ? "s" : ""} próxima{stats.vacunasProximas > 1 ? "s" : ""}
                        </p>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                            Toca para ver detalles
                        </p>
                    </div>
                </div>
            )}

            {/* Lotes activos */}
            <div className="section-header">
                <span className="section-title">Lotes activos</span>
                <button
                    onClick={() => setActiveTab("lotes")}
                    style={{
                        background: "transparent", border: "none",
                        color: "var(--color-primary)", fontSize: "var(--text-sm)",
                        fontWeight: 600, cursor: "pointer",
                    }}
                >
                    Ver todos
                </button>
            </div>

            {lotesActivos.length === 0 ? (
                <div style={{
                    background: "var(--color-bg-card)",
                    border: "1px dashed var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-8)",
                    textAlign: "center",
                    color: "var(--color-text-3)",
                    fontSize: "var(--text-sm)",
                    marginBottom: "var(--space-4)",
                }}>
                    No hay lotes activos aún
                </div>
            ) : (
                lotesActivos.map((lote) => (
                    <div
                        key={lote.id}
                        className="list-item"
                        onClick={() => setActiveTab("lotes")}
                    >
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "var(--space-2)",
                        }}>
                            <div>
                                <p style={{
                                    fontFamily: "var(--font-display)",
                                    fontWeight: 700,
                                    color: "var(--color-text)",
                                    fontSize: "var(--text-base)",
                                }}>
                                    {lote.nombre}
                                </p>
                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                                    {lote.chanchos} chanchos · {calcDiasEngorde(lote.fechaIngreso)} días · {lote.pesoPromedio} kg prom.
                                </p>
                            </div>
                            <Badge estado={lote.estado} />
                        </div>
                        <ProgressBar value={lote.progreso} />
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-1)" }}>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                Progreso {lote.progreso}%
                            </span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-primary)", fontWeight: 600 }}>
                                {fmt(lote.valorEstimado)}
                            </span>
                        </div>
                    </div>
                ))
            )}

            <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "var(--space-3)", marginBottom: "var(--space-5)" }}
                onClick={() => setActiveTab("lotes")}
            >
                <Plus size={16} /> Nuevo Lote
            </button>

            {/* Ventas recientes */}
            {ventasRecientes.length > 0 && (
                <>
                    <div className="section-header">
                        <span className="section-title">Últimas ventas</span>
                        <button
                            onClick={() => setActiveTab("ventas")}
                            style={{
                                background: "transparent", border: "none",
                                color: "var(--color-primary)", fontSize: "var(--text-sm)",
                                fontWeight: 600, cursor: "pointer",
                            }}
                        >
                            Ver todas
                        </button>
                    </div>

                    {ventasRecientes.map((v) => (
                        <div
                            key={v.id}
                            className="list-item"
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                            <div>
                                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                    {v.clienteNombre}
                                </p>
                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                    {fmtDate(v.fecha)}
                                </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{
                                    fontFamily: "var(--font-display)",
                                    fontWeight: 700,
                                    color: "var(--color-primary)",
                                    fontSize: "var(--text-sm)",
                                }}>
                                    {fmt(v.total)}
                                </p>
                                <Badge estado={v.estado} />
                            </div>
                        </div>
                    ))}
                </>
            )}

        </div>
    );
}