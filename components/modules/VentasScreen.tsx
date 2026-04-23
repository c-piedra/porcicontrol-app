"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { fmt, fmtDate, whatsappLink, ESTADO_VENTA_LABEL } from "@/lib/utils";
import { Badge, Sheet, Input, Select, EmptyState, ConfirmDialog } from "@/components/ui";
import { Plus, MessageCircle, FileText, DollarSign, Trash2 } from "lucide-react";
import type { Venta } from "@/types";

export default function VentasScreen() {
    const { ventas, lotes, clientes, addVenta, updateVenta, deleteVenta, setActiveTab } = useStore();

    const [tab, setTab] = useState<"activas" | "historial">("activas");
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const [form, setForm] = useState({
        loteId: "", clienteId: "", cantidad: "",
        pesoProm: "", precioKg: "", descuento: "0",
        fechaEntrega: "", notas: "",
    });

    const activas = ventas.filter((v) => v.estado !== "pagada" && v.estado !== "cancelada");
    const historial = ventas.filter((v) => v.estado === "pagada" || v.estado === "cancelada");
    const shown = tab === "activas" ? activas : historial;

    const getCliente = (id: string) => clientes.find((c) => c.id === id);
    const getLote = (id: string) => lotes.find((l) => l.id === id);

    const calcTotal = () => {
        const cant = parseFloat(form.cantidad) || 0;
        const peso = parseFloat(form.pesoProm) || 0;
        const precio = parseFloat(form.precioKg) || 0;
        const desc = parseFloat(form.descuento) || 0;
        return Math.max(0, cant * peso * precio - desc);
    };

    const resetForm = () => setForm({
        loteId: "", clienteId: "", cantidad: "",
        pesoProm: "", precioKg: "", descuento: "0",
        fechaEntrega: "", notas: "",
    });

    const handleSubmit = () => {
        if (!form.loteId || !form.clienteId || !form.cantidad) return;
        const cliente = getCliente(form.clienteId);
        addVenta({
            loteId: form.loteId,
            clienteId: form.clienteId,
            clienteNombre: cliente?.nombre ?? "",
            cantidad: parseInt(form.cantidad),
            pesoProm: parseFloat(form.pesoProm) || 0,
            precioKg: parseFloat(form.precioKg) || 0,
            descuento: parseFloat(form.descuento) || 0,
            total: calcTotal(),
            fecha: new Date().toISOString().split("T")[0],
            fechaEntrega: form.fechaEntrega || undefined,
            estado: "pendiente",
            notas: form.notas,
            facturada: false,
        });
        resetForm();
        setShowForm(false);
    };

    const sendWhatsApp = (venta: Venta) => {
        const cliente = getCliente(venta.clienteId);
        if (!cliente) return;
        const msg =
            `Hola ${cliente.nombre}, le confirmamos su pedido:\n` +
            `• Lote: ${getLote(venta.loteId)?.nombre ?? "-"}\n` +
            `• Cantidad: ${venta.cantidad} chanchos\n` +
            `• Total: ${fmt(venta.total)}\n` +
            `• Entrega: ${venta.fechaEntrega ? fmtDate(venta.fechaEntrega) : "Por confirmar"}\n\n` +
            `Gracias por su preferencia 🐷`;
        window.open(whatsappLink(cliente.telefono, msg), "_blank");
    };

    const selectedVenta = ventas.find((v) => v.id === selected);

    return (
        <div className="page fade-in">

            {/* Tabs */}
            <div className="tab-pills">
                <button
                    className={`tab-pill${tab === "activas" ? " active" : ""}`}
                    onClick={() => setTab("activas")}
                >
                    Activas ({activas.length})
                </button>
                <button
                    className={`tab-pill${tab === "historial" ? " active" : ""}`}
                    onClick={() => setTab("historial")}
                >
                    Historial ({historial.length})
                </button>
            </div>

            {/* Botón nueva venta */}
            <button
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: "var(--space-4)" }}
                onClick={() => setShowForm(true)}
            >
                <Plus size={16} /> Nueva Venta
            </button>

            {/* Hero total por cobrar */}
            {tab === "activas" && activas.length > 0 && (
                <div className="hero-card" style={{ marginBottom: "var(--space-4)" }}>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                        Total por cobrar
                    </p>
                    <p style={{
                        fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)",
                        fontWeight: 800, color: "var(--color-primary)",
                    }}>
                        {fmt(activas.reduce((s, v) => s + v.total, 0))}
                    </p>
                </div>
            )}

            {/* Lista */}
            {shown.length === 0 ? (
                <EmptyState message="No hay ventas en esta categoría." />
            ) : (
                shown.map((v) => (
                    <div
                        key={v.id}
                        className="card"
                        style={{ marginBottom: "var(--space-3)", cursor: "pointer" }}
                        onClick={() => setSelected(v.id)}
                    >
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", marginBottom: "var(--space-2)",
                        }}>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                                    {v.clienteNombre}
                                </p>
                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: 2 }}>
                                    {getLote(v.loteId)?.nombre ?? "-"} · {v.cantidad} chanchos · {fmtDate(v.fecha)}
                                </p>
                            </div>
                            <Badge estado={v.estado} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{
                                fontFamily: "var(--font-display)", fontWeight: 800,
                                fontSize: "var(--text-lg)", color: "var(--color-primary)",
                            }}>
                                {fmt(v.total)}
                            </span>
                            <button
                                className="btn btn-ghost"
                                style={{ padding: "6px 10px", minHeight: 36 }}
                                onClick={(e) => { e.stopPropagation(); sendWhatsApp(v); }}
                            >
                                <MessageCircle size={15} color="#25D366" />
                            </button>
                        </div>
                    </div>
                ))
            )}

            {/* Detail Sheet */}
            {selectedVenta && (
                <Sheet title="Detalle de venta" onClose={() => setSelected(null)}>
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: "var(--space-4)",
                    }}>
                        <Badge estado={selectedVenta.estado} />
                        <span style={{
                            fontFamily: "var(--font-display)", fontWeight: 800,
                            fontSize: "var(--text-2xl)", color: "var(--color-primary)",
                        }}>
                            {fmt(selectedVenta.total)}
                        </span>
                    </div>

                    {[
                        ["Cliente", selectedVenta.clienteNombre],
                        ["Lote", getLote(selectedVenta.loteId)?.nombre ?? "-"],
                        ["Cantidad", `${selectedVenta.cantidad} chanchos`],
                        ["Peso promedio", `${selectedVenta.pesoProm} kg`],
                        ["Precio/kg", fmt(selectedVenta.precioKg)],
                        ["Descuento", fmt(selectedVenta.descuento)],
                        ["Fecha", fmtDate(selectedVenta.fecha)],
                        ["Entrega", selectedVenta.fechaEntrega ? fmtDate(selectedVenta.fechaEntrega) : "Por confirmar"],
                    ].map(([l, v]) => (
                        <div key={l as string} style={{
                            display: "flex", justifyContent: "space-between",
                            padding: "var(--space-2) 0", borderBottom: "1px solid var(--color-border)",
                        }}>
                            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>{l}</span>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>{v}</span>
                        </div>
                    ))}

                    <div style={{ marginTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                        <Select
                            label="Actualizar estado"
                            value={selectedVenta.estado}
                            onChange={(v) => updateVenta(selectedVenta.id, { estado: v as any })}
                            options={["pendiente", "confirmada", "entregada", "pagada", "cancelada"].map((e) => ({
                                value: e, label: ESTADO_VENTA_LABEL[e],
                            }))}
                        />
                        <div style={{ display: "flex", gap: "var(--space-2)" }}>
                            <button
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => sendWhatsApp(selectedVenta)}
                            >
                                <MessageCircle size={14} color="#25D366" /> WhatsApp
                            </button>
                            <button
                                className="btn btn-ghost"
                                style={{ flex: 1 }}
                                onClick={() => { setActiveTab("pagos"); setSelected(null); }}
                            >
                                <DollarSign size={14} /> Registrar pago
                            </button>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                            onClick={() => { setActiveTab("facturas"); setSelected(null); }}
                        >
                            <FileText size={14} /> Generar factura
                        </button>
                        <button
                            className="btn btn-ghost"
                            style={{ width: "100%", color: "var(--color-danger)" }}
                            onClick={() => { setConfirmDelete(selectedVenta.id); setSelected(null); }}
                        >
                            <Trash2 size={14} /> Eliminar venta
                        </button>
                    </div>
                </Sheet>
            )}

            {/* Nueva Venta Sheet */}
            {showForm && (
                <Sheet title="Nueva Venta" onClose={() => { setShowForm(false); resetForm(); }}>
                    <Select
                        label="Lote" value={form.loteId}
                        onChange={(v) => setForm({ ...form, loteId: v })}
                        required
                        options={lotes
                            .filter((l) => l.estado === "activo")
                            .map((l) => ({ value: l.id, label: `${l.nombre} (${l.chanchos} chanchos)` }))}
                    />
                    <Select
                        label="Cliente" value={form.clienteId}
                        onChange={(v) => setForm({ ...form, clienteId: v })}
                        required
                        options={clientes.map((c) => ({ value: c.id, label: c.nombre }))}
                    />
                    <Input
                        label="Cantidad de chanchos" value={form.cantidad}
                        onChange={(v) => setForm({ ...form, cantidad: v })}
                        type="number" required
                    />
                    <Input
                        label="Peso promedio (kg)" value={form.pesoProm}
                        onChange={(v) => setForm({ ...form, pesoProm: v })}
                        type="number"
                    />
                    <Input
                        label="Precio por kg (₡)" value={form.precioKg}
                        onChange={(v) => setForm({ ...form, precioKg: v })}
                        type="number"
                    />
                    <Input
                        label="Descuento (₡)" value={form.descuento}
                        onChange={(v) => setForm({ ...form, descuento: v })}
                        type="number"
                    />
                    <Input
                        label="Fecha de entrega" value={form.fechaEntrega}
                        onChange={(v) => setForm({ ...form, fechaEntrega: v })}
                        type="date"
                    />
                    <Input
                        label="Notas" value={form.notas}
                        onChange={(v) => setForm({ ...form, notas: v })}
                        placeholder="Observaciones..."
                    />

                    {calcTotal() > 0 && (
                        <div style={{
                            background: "var(--color-bg-elevated)", borderRadius: "var(--radius-md)",
                            padding: "var(--space-3)", marginBottom: "var(--space-4)", textAlign: "center",
                        }}>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                Total calculado
                            </span>
                            <p style={{
                                fontFamily: "var(--font-display)", fontWeight: 800,
                                fontSize: "var(--text-2xl)", color: "var(--color-primary)",
                            }}>
                                {fmt(calcTotal())}
                            </p>
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        onClick={handleSubmit}
                    >
                        Registrar venta
                    </button>
                </Sheet>
            )}

            {/* Confirmar eliminación */}
            {confirmDelete && (
                <ConfirmDialog
                    message="¿Eliminar esta venta? Esta acción no se puede deshacer."
                    onConfirm={() => { deleteVenta(confirmDelete); setConfirmDelete(null); }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

        </div>
    );
}