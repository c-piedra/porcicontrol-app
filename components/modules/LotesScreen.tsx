"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { fmt, fmtDate, CATEGORIAS_COSTO } from "@/lib/utils";
import { Badge, ProgressBar, Sheet, Input, Select, EmptyState, ConfirmDialog } from "@/components/ui";
import { Plus, Trash2, DollarSign } from "lucide-react";
import type { Lote } from "@/types";

const ESTADO_OPTIONS = [
    { value: "activo", label: "Activo" },
    { value: "vendido", label: "Vendido" },
    { value: "baja", label: "Baja" },
];

const CATEGORIA_OPTIONS = Object.entries(CATEGORIAS_COSTO).map(([k, v]) => ({
    value: k,
    label: v.label,
}));

export default function LotesScreen() {
    const { lotes, addLote, updateLote, deleteLote, addCosto } = useStore();

    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState<Lote | null>(null);
    const [showCosto, setShowCosto] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [filterEstado, setFilterEstado] = useState("todos");

    const [form, setForm] = useState({
        nombre: "", chanchos: "", pesoInicial: "", pesoObjetivo: "",
        precioKg: "", fechaIngreso: new Date().toISOString().split("T")[0],
        notas: "",
    });

    const [costoForm, setCostoForm] = useState({
        categoria: "alimentacion", descripcion: "", monto: "",
        fecha: new Date().toISOString().split("T")[0],
    });

    const filtered = filterEstado === "todos"
        ? lotes
        : lotes.filter((l) => l.estado === filterEstado);

    const resetForm = () => setForm({
        nombre: "", chanchos: "", pesoInicial: "", pesoObjetivo: "",
        precioKg: "", fechaIngreso: new Date().toISOString().split("T")[0],
        notas: "",
    });

    const handleSubmit = () => {
        if (!form.nombre || !form.chanchos) return;
        const chanchos = parseInt(form.chanchos);
        const pesoInicial = parseFloat(form.pesoInicial) || 0;
        const pesoObjetivo = parseFloat(form.pesoObjetivo) || 90;
        const precioKg = parseFloat(form.precioKg) || 3000;
        addLote({
            nombre: form.nombre,
            chanchos,
            pesoInicial,
            pesoPromedio: pesoInicial,
            fechaIngreso: form.fechaIngreso,
            diasEngorde: 0,
            progreso: 0,
            estado: "activo",
            inversion: 0,
            valorEstimado: chanchos * pesoObjetivo * precioKg,
            notas: form.notas,
            costos: [],
        });
        resetForm();
        setShowForm(false);
    };
    const handleAddCosto = () => {
        if (!selected || !costoForm.monto) return;
        addCosto(selected.id, {
            categoria: costoForm.categoria as any,
            descripcion: costoForm.descripcion,
            monto: parseFloat(costoForm.monto),
            fecha: costoForm.fecha,
        });
        setCostoForm({
            categoria: "alimentacion", descripcion: "", monto: "",
            fecha: new Date().toISOString().split("T")[0],
        });
        setShowCosto(false);
    };

    return (
        <div className="page fade-in">

            {/* Filtros */}
            <div className="tab-pills">
                {["todos", "activo", "vendido", "baja"].map((e) => (
                    <button
                        key={e}
                        className={`tab-pill${filterEstado === e ? " active" : ""}`}
                        onClick={() => setFilterEstado(e)}
                    >
                        {e === "todos" ? "Todos" : e.charAt(0).toUpperCase() + e.slice(1)}
                    </button>
                ))}
            </div>

            {/* Botón nuevo */}
            <button
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: "var(--space-4)" }}
                onClick={() => setShowForm(true)}
            >
                <Plus size={16} /> Nuevo Lote
            </button>

            {/* Lista */}
            {filtered.length === 0 ? (
                <EmptyState message="No hay lotes en esta categoría." />
            ) : (
                filtered.map((lote) => (
                    <div
                        key={lote.id}
                        className="card"
                        style={{ marginBottom: "var(--space-3)", cursor: "pointer" }}
                        onClick={() => setSelected(lote)}
                    >
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", marginBottom: "var(--space-2)",
                        }}>
                            <div>
                                <p style={{
                                    fontFamily: "var(--font-display)", fontWeight: 700,
                                    fontSize: "var(--text-base)", color: "var(--color-text)",
                                }}>
                                    {lote.nombre}
                                </p>
                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                                    {lote.chanchos} chanchos · Ingreso: {fmtDate(lote.fechaIngreso)}
                                </p>
                            </div>
                            <Badge estado={lote.estado} />
                        </div>

                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr",
                            gap: "var(--space-2)", marginBottom: "var(--space-3)",
                        }}>
                            {[
                                ["Peso prom.", `${lote.pesoPromedio} kg`],
                                ["Días engorde", lote.diasEngorde],
                                ["Inversión", fmt(lote.inversion)],
                                ["Val. estimado", fmt(lote.valorEstimado)],
                            ].map(([label, value]) => (
                                <div key={label as string} style={{
                                    background: "var(--color-bg-elevated)",
                                    borderRadius: "var(--radius-sm)",
                                    padding: "var(--space-2) var(--space-3)",
                                }}>
                                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>{label}</div>
                                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>{value}</div>
                                </div>
                            ))}
                        </div>

                        <ProgressBar value={lote.progreso} />
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                Progreso {lote.progreso}%
                            </span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-primary)", fontWeight: 600 }}>
                                {lote.valorEstimado > lote.inversion
                                    ? `+${fmt(lote.valorEstimado - lote.inversion)}`
                                    : "-"}
                            </span>
                        </div>
                    </div>
                ))
            )}

            {/* Detail Sheet */}
            {selected && (
                <Sheet title={selected.nombre} onClose={() => setSelected(null)}>
                    <div style={{ marginBottom: "var(--space-4)" }}>
                        <Badge estado={selected.estado} />
                    </div>

                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: "var(--space-2)", marginBottom: "var(--space-4)",
                    }}>
                        {[
                            ["Cantidad", `${selected.chanchos} chanchos`],
                            ["Peso promedio", `${selected.pesoPromedio} kg`],
                            ["Peso inicial", `${selected.pesoInicial} kg`],
                            ["Días engorde", selected.diasEngorde],
                            ["Inversión", fmt(selected.inversion)],
                            ["Val. estimado", fmt(selected.valorEstimado)],
                        ].map(([l, v]) => (
                            <div key={l as string} style={{
                                background: "var(--color-bg-elevated)",
                                borderRadius: "var(--radius-sm)",
                                padding: "var(--space-2) var(--space-3)",
                            }}>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>{l}</div>
                                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>{v}</div>
                            </div>
                        ))}
                    </div>

                    {/* Costos */}
                    <div className="section-header">
                        <span className="section-title">Costos del lote</span>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: "4px 12px", minHeight: 32, fontSize: "var(--text-xs)" }}
                            onClick={() => setShowCosto(true)}
                        >
                            <DollarSign size={12} /> Agregar
                        </button>
                    </div>

                    {selected.costos.length === 0 ? (
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)", marginBottom: "var(--space-4)" }}>
                            Sin costos registrados aún.
                        </p>
                    ) : (
                        selected.costos.map((c) => (
                            <div key={c.id} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "var(--space-2) 0", borderBottom: "1px solid var(--color-border)",
                            }}>
                                <div>
                                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                        {CATEGORIAS_COSTO[c.categoria]?.label ?? c.categoria}
                                    </p>
                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                        {c.descripcion}
                                    </p>
                                </div>
                                <span style={{
                                    fontFamily: "var(--font-display)", fontWeight: 700,
                                    fontSize: "var(--text-sm)", color: "var(--color-text)",
                                }}>
                                    {fmt(c.monto)}
                                </span>
                            </div>
                        ))
                    )}

                    {/* Acciones */}
                    <div style={{ marginTop: "var(--space-5)", display: "flex", gap: "var(--space-3)" }}>
                        <button
                            className="btn btn-ghost"
                            style={{ flex: 1 }}
                            onClick={() => { setConfirmDelete(selected.id); setSelected(null); }}
                        >
                            <Trash2 size={14} /> Eliminar
                        </button>
                        <div style={{ display: "flex", gap: "var(--space-2)", flex: 2 }}>
                            {ESTADO_OPTIONS.map((op) => (
                                <button
                                    key={op.value}
                                    className={`btn ${selected.estado === op.value ? "btn-primary" : "btn-ghost"}`}
                                    style={{ flex: 1, fontSize: "var(--text-xs)", padding: "6px 4px", minHeight: 36 }}
                                    onClick={() => {
                                        updateLote(selected.id, { estado: op.value as any });
                                        setSelected({ ...selected, estado: op.value as any });
                                    }}
                                >
                                    {op.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Sheet>
            )}

            {/* Agregar Costo */}
            {showCosto && selected && (
                <Sheet title="Agregar gasto" onClose={() => setShowCosto(false)}>
                    <Select
                        label="Categoría" value={costoForm.categoria}
                        onChange={(v) => setCostoForm({ ...costoForm, categoria: v })}
                        options={CATEGORIA_OPTIONS}
                    />
                    <Input
                        label="Descripción" value={costoForm.descripcion}
                        onChange={(v) => setCostoForm({ ...costoForm, descripcion: v })}
                        placeholder="Ej: Concentrado semana 1"
                    />
                    <Input
                        label="Monto (₡)" value={costoForm.monto}
                        onChange={(v) => setCostoForm({ ...costoForm, monto: v })}
                        type="number" placeholder="0"
                    />
                    <Input
                        label="Fecha" value={costoForm.fecha}
                        onChange={(v) => setCostoForm({ ...costoForm, fecha: v })}
                        type="date"
                    />
                    <button
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        onClick={handleAddCosto}
                    >
                        Guardar gasto
                    </button>
                </Sheet>
            )}

            {/* Nuevo Lote */}
            {showForm && (
                <Sheet title="Nuevo Lote" onClose={() => { setShowForm(false); resetForm(); }}>
                    <Input
                        label="Nombre del lote" value={form.nombre}
                        onChange={(v) => setForm({ ...form, nombre: v })}
                        placeholder="Ej: Lote #1" required
                    />
                    <Input
                        label="Cantidad de chanchos" value={form.chanchos}
                        onChange={(v) => setForm({ ...form, chanchos: v })}
                        type="number" placeholder="50" required
                    />
                    <Input
                        label="Peso inicial promedio (kg)" value={form.pesoInicial}
                        onChange={(v) => setForm({ ...form, pesoInicial: v })}
                        type="number" placeholder="20"
                    />
                    <Input
                        label="Peso objetivo (kg)" value={form.pesoObjetivo}
                        onChange={(v) => setForm({ ...form, pesoObjetivo: v })}
                        type="number" placeholder="90"
                    />
                    <Input
                        label="Precio estimado por kg (₡)" value={form.precioKg}
                        onChange={(v) => setForm({ ...form, precioKg: v })}
                        type="number" placeholder="3000"
                    />
                    <Input
                        label="Fecha de ingreso" value={form.fechaIngreso}
                        onChange={(v) => setForm({ ...form, fechaIngreso: v })}
                        type="date"
                    />
                    <Input
                        label="Notas" value={form.notas}
                        onChange={(v) => setForm({ ...form, notas: v })}
                        placeholder="Observaciones..."
                    />
                    <button
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "var(--space-2)" }}
                        onClick={handleSubmit}
                    >
                        Crear Lote
                    </button>
                </Sheet>
            )}

            {/* Confirmar eliminación */}
            {confirmDelete && (
                <ConfirmDialog
                    message="¿Eliminar este lote? Esta acción no se puede deshacer."
                    onConfirm={() => { deleteLote(confirmDelete); setConfirmDelete(null); }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

        </div>
    );
}