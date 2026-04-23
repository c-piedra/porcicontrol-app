"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { fmtDate, daysFromNow } from "@/lib/utils";
import { Badge, Sheet, Input, Select, EmptyState, ConfirmDialog } from "@/components/ui";
import { Plus, Trash2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { Vacuna } from "@/types";

const TIPO_OPTIONS = [
    { value: "preventiva", label: "Preventiva" },
    { value: "curativa", label: "Curativa" },
    { value: "suplemento", label: "Suplemento" },
];

const ESTADO_OPTIONS = [
    { value: "aplicada", label: "Aplicada" },
    { value: "proxima", label: "Próxima" },
    { value: "vencida", label: "Vencida" },
];

export default function VacunasScreen() {
    const { vacunas, lotes, addVacuna, deleteVacuna, updateVacuna } = useStore();

    const [tab, setTab] = useState<"proximas" | "historial">("proximas");
    const [showForm, setShowForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const [form, setForm] = useState({
        loteId: "", nombre: "", tipo: "preventiva",
        fecha: new Date().toISOString().split("T")[0],
        proximaFecha: "", estado: "aplicada",
        dosis: "", observaciones: "", veterinario: "",
    });

    const proximas = vacunas.filter((v) => v.estado === "proxima" || v.estado === "vencida");
    const historial = vacunas.filter((v) => v.estado === "aplicada");
    const shown = tab === "proximas" ? proximas : historial;

    const getLote = (id: string) => lotes.find((l) => l.id === id);

    const resetForm = () => setForm({
        loteId: "", nombre: "", tipo: "preventiva",
        fecha: new Date().toISOString().split("T")[0],
        proximaFecha: "", estado: "aplicada",
        dosis: "", observaciones: "", veterinario: "",
    });

    const handleSubmit = () => {
        if (!form.loteId || !form.nombre) return;
        addVacuna({
            loteId: form.loteId,
            nombre: form.nombre,
            tipo: form.tipo as any,
            fecha: form.fecha,
            proximaFecha: form.proximaFecha || undefined,
            estado: form.estado as any,
            dosis: form.dosis || undefined,
            observaciones: form.observaciones || undefined,
            veterinario: form.veterinario || undefined,
        });
        resetForm();
        setShowForm(false);
    };

    const getIcon = (estado: string) => {
        if (estado === "aplicada") return <CheckCircle size={16} color="var(--color-success)" />;
        if (estado === "vencida") return <AlertCircle size={16} color="var(--color-danger)" />;
        return <Clock size={16} color="var(--color-warning)" />;
    };

    return (
        <div className="page fade-in">

            {/* Tabs */}
            <div className="tab-pills">
                <button
                    className={`tab-pill${tab === "proximas" ? " active" : ""}`}
                    onClick={() => setTab("proximas")}
                >
                    Próximas ({proximas.length})
                </button>
                <button
                    className={`tab-pill${tab === "historial" ? " active" : ""}`}
                    onClick={() => setTab("historial")}
                >
                    Historial ({historial.length})
                </button>
            </div>

            {/* Botón agregar */}
            <button
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: "var(--space-4)" }}
                onClick={() => setShowForm(true)}
            >
                <Plus size={16} /> Agregar vacuna o tratamiento
            </button>

            {/* Lista */}
            {shown.length === 0 ? (
                <EmptyState
                    message={
                        tab === "proximas"
                            ? "No hay vacunas próximas. ¡Todo al día! ✅"
                            : "No hay vacunas registradas aún."
                    }
                />
            ) : (
                shown.map((v) => {
                    const lote = getLote(v.loteId);
                    return (
                        <div key={v.id} className="card" style={{ marginBottom: "var(--space-3)" }}>
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "flex-start", marginBottom: "var(--space-2)",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                                    {getIcon(v.estado)}
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                                            {v.nombre}
                                        </p>
                                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                                            {lote?.nombre ?? "Lote desconocido"} · {v.tipo}
                                            {v.dosis ? ` · ${v.dosis}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <Badge estado={v.estado} />
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                        Fecha: {fmtDate(v.fecha)}
                                    </p>
                                    {v.proximaFecha && (
                                        <p style={{
                                            fontSize: "var(--text-xs)", color: "var(--color-warning)",
                                            fontWeight: 600, marginTop: 2,
                                        }}>
                                            Próxima: {daysFromNow(v.proximaFecha)}
                                        </p>
                                    )}
                                    {v.observaciones && (
                                        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                                            {v.observaciones}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                                    {v.estado === "proxima" && (
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: "4px 12px", minHeight: 32, fontSize: "var(--text-xs)" }}
                                            onClick={() => updateVacuna(v.id, { estado: "aplicada" })}
                                        >
                                            Aplicar
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-ghost"
                                        style={{ padding: "4px 10px", minHeight: 32 }}
                                        onClick={() => setConfirmDelete(v.id)}
                                    >
                                        <Trash2 size={13} color="var(--color-danger)" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Form Sheet */}
            {showForm && (
                <Sheet title="Nueva Vacuna / Tratamiento" onClose={() => { setShowForm(false); resetForm(); }}>
                    <Select
                        label="Lote" value={form.loteId}
                        onChange={(v) => setForm({ ...form, loteId: v })}
                        required
                        options={lotes.map((l) => ({ value: l.id, label: l.nombre }))}
                    />
                    <Input
                        label="Nombre de la vacuna o tratamiento" value={form.nombre}
                        onChange={(v) => setForm({ ...form, nombre: v })}
                        placeholder="Ej: Complejo Respiratorio" required
                    />
                    <Select
                        label="Tipo" value={form.tipo}
                        onChange={(v) => setForm({ ...form, tipo: v })}
                        options={TIPO_OPTIONS}
                    />
                    <Select
                        label="Estado" value={form.estado}
                        onChange={(v) => setForm({ ...form, estado: v })}
                        options={ESTADO_OPTIONS}
                    />
                    <Input
                        label="Fecha de aplicación" value={form.fecha}
                        onChange={(v) => setForm({ ...form, fecha: v })}
                        type="date"
                    />
                    <Input
                        label="Próxima aplicación (opcional)" value={form.proximaFecha}
                        onChange={(v) => setForm({ ...form, proximaFecha: v })}
                        type="date"
                    />
                    <Input
                        label="Dosis" value={form.dosis}
                        onChange={(v) => setForm({ ...form, dosis: v })}
                        placeholder="Ej: 2ml por animal"
                    />
                    <Input
                        label="Veterinario" value={form.veterinario}
                        onChange={(v) => setForm({ ...form, veterinario: v })}
                        placeholder="Nombre del veterinario"
                    />
                    <Input
                        label="Observaciones" value={form.observaciones}
                        onChange={(v) => setForm({ ...form, observaciones: v })}
                        placeholder="Notas adicionales..."
                    />
                    <button
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        onClick={handleSubmit}
                    >
                        Guardar
                    </button>
                </Sheet>
            )}

            {/* Confirmar eliminación */}   
            {confirmDelete && (
                <ConfirmDialog
                    message="¿Eliminar este registro de vacuna?"
                    onConfirm={() => { deleteVacuna(confirmDelete); setConfirmDelete(null); }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

        </div>
    );
}