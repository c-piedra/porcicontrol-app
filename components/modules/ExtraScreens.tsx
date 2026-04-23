"use client";
import { useState } from "react";
import { useStore } from "@/store";
import { fmt, fmtDate, METODO_PAGO_LABEL, generateFacturaNum, whatsappLink } from "@/lib/utils";
import { Badge, Sheet, Input, Select, EmptyState, ConfirmDialog } from "@/components/ui";
import { Plus, MessageCircle, FileText, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

// ─── Pagos ────────────────────────────────────────────────────────────────────
export function PagosScreen() {
    const { pagos, ventas, addPago } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        ventaId: "", monto: "", metodoPago: "efectivo",
        referencia: "", notas: "",
    });

    const pendientes = ventas.filter((v) => v.estado !== "pagada" && v.estado !== "cancelada");
    const totalCobrado = pagos.reduce((s, p) => s + p.monto, 0);
    const totalPendiente = pendientes.reduce((s, v) => s + v.total, 0);

    const resetForm = () => setForm({
        ventaId: "", monto: "", metodoPago: "efectivo",
        referencia: "", notas: "",
    });

    const handleSubmit = () => {
        if (!form.ventaId || !form.monto) return;
        const venta = ventas.find((v) => v.id === form.ventaId);
        if (!venta) return;
        addPago({
            ventaId: form.ventaId,
            clienteId: venta.clienteId,
            clienteNombre: venta.clienteNombre,
            monto: parseFloat(form.monto),
            metodoPago: form.metodoPago as any,
            fecha: new Date().toISOString().split("T")[0],
            referencia: form.referencia || undefined,
            notas: form.notas || undefined,
        });
        resetForm();
        setShowForm(false);
    };

    return (
        <div className="page fade-in">
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-3)", marginBottom: "var(--space-5)",
            }}>
                <div className="hero-card" style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                        Total cobrado
                    </p>
                    <p style={{
                        fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: "var(--text-lg)", color: "var(--color-primary)",
                    }}>
                        {fmt(totalCobrado)}
                    </p>
                </div>
                <div style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    borderRadius: "var(--radius-xl)",
                    padding: "var(--space-4)", textAlign: "center",
                }}>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginBottom: 4 }}>
                        Por cobrar
                    </p>
                    <p style={{
                        fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: "var(--text-lg)", color: "var(--color-warning)",
                    }}>
                        {fmt(totalPendiente)}
                    </p>
                </div>
            </div>

            <button
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: "var(--space-4)" }}
                onClick={() => setShowForm(true)}
            >
                <Plus size={16} /> Registrar pago
            </button>

            <p className="section-title" style={{ marginBottom: "var(--space-3)" }}>
                Historial de pagos
            </p>

            {pagos.length === 0 ? (
                <EmptyState message="No hay pagos registrados aún." />
            ) : (
                pagos.slice().reverse().map((p) => (
                    <div key={p.id} className="list-item">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--color-text)" }}>
                                    {p.clienteNombre}
                                </p>
                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                    {fmtDate(p.fecha)} · {METODO_PAGO_LABEL[p.metodoPago]}
                                    {p.referencia ? ` · ${p.referencia}` : ""}
                                </p>
                            </div>
                            <span style={{
                                fontFamily: "var(--font-display)", fontWeight: 800,
                                color: "var(--color-primary)", fontSize: "var(--text-base)",
                            }}>
                                {fmt(p.monto)}
                            </span>
                        </div>
                    </div>
                ))
            )}

            {showForm && (
                <Sheet title="Registrar Pago" onClose={() => { setShowForm(false); resetForm(); }}>
                    <Select
                        label="Venta" value={form.ventaId}
                        onChange={(v) => setForm({ ...form, ventaId: v })}
                        required
                        options={pendientes.map((v) => ({
                            value: v.id,
                            label: `${v.clienteNombre} – ${fmt(v.total)}`,
                        }))}
                    />
                    <Input
                        label="Monto recibido (₡)" value={form.monto}
                        onChange={(v) => setForm({ ...form, monto: v })}
                        type="number" required
                    />
                    <Select
                        label="Método de pago" value={form.metodoPago}
                        onChange={(v) => setForm({ ...form, metodoPago: v })}
                        options={["efectivo", "transferencia", "tarjeta", "sinpe"].map((m) => ({
                            value: m, label: METODO_PAGO_LABEL[m],
                        }))}
                    />
                    <Input
                        label="Referencia / comprobante" value={form.referencia}
                        onChange={(v) => setForm({ ...form, referencia: v })}
                        placeholder="Número de transferencia..."
                    />
                    <Input
                        label="Notas" value={form.notas}
                        onChange={(v) => setForm({ ...form, notas: v })}
                        placeholder="Observaciones..."
                    />
                    <button
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        onClick={handleSubmit}
                    >
                        Guardar pago
                    </button>
                </Sheet>
            )}
        </div>
    );
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
export function ClientesScreen() {
    const { clientes, addCliente, deleteCliente } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [form, setForm] = useState({
        nombre: "", telefono: "", email: "",
        direccion: "", tipo: "regular", notas: "",
    });

    const resetForm = () => setForm({
        nombre: "", telefono: "", email: "",
        direccion: "", tipo: "regular", notas: "",
    });

    const handleSubmit = () => {
        if (!form.nombre || !form.telefono) return;
        addCliente({
            nombre: form.nombre,
            telefono: form.telefono,
            email: form.email || undefined,
            direccion: form.direccion || undefined,
            tipo: form.tipo as any,
            deudaTotal: 0,
            notas: form.notas || undefined,
        });
        resetForm();
        setShowForm(false);
    };

    const sendWhatsApp = (telefono: string, nombre: string) => {
        window.open(
            whatsappLink(telefono, `Hola ${nombre}, le contactamos de nuestra granja. ¿En qué le podemos ayudar? 🐷`),
            "_blank"
        );
    };

    return (
        <div className="page fade-in">

            <button
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: "var(--space-4)" }}
                onClick={() => setShowForm(true)}
            >
                <Plus size={16} /> Nuevo Cliente
            </button>

            {clientes.length === 0 ? (
                <EmptyState message="No hay clientes registrados aún." />
            ) : (
                clientes.map((c) => (
                    <div key={c.id} className="card" style={{ marginBottom: "var(--space-3)" }}>
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "flex-start", marginBottom: "var(--space-3)",
                        }}>
                            <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: "50%",
                                    background: "var(--color-primary-glow)",
                                    display: "grid", placeItems: "center",
                                    fontFamily: "var(--font-display)", fontWeight: 700,
                                    color: "var(--color-primary)", fontSize: "var(--text-base)",
                                }}>
                                    {c.nombre[0]}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--color-text)" }}>
                                        {c.nombre}
                                    </p>
                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                        {c.telefono}
                                    </p>
                                </div>
                            </div>
                            <Badge estado={c.tipo} />
                        </div>

                        {c.deudaTotal > 0 && (
                            <div style={{
                                background: "rgba(239,68,68,0.1)",
                                borderRadius: "var(--radius-sm)",
                                padding: "var(--space-2) var(--space-3)",
                                marginBottom: "var(--space-3)",
                            }}>
                                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>
                                    Deuda pendiente: {fmt(c.deudaTotal)}
                                </p>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "var(--space-2)" }}>
                            <button
                                className="btn btn-secondary"
                                style={{ flex: 1, fontSize: "var(--text-xs)", padding: "6px 10px", minHeight: 36 }}
                                onClick={() => sendWhatsApp(c.telefono, c.nombre)}
                            >
                                <MessageCircle size={13} color="#25D366" /> WhatsApp
                            </button>
                            {c.email && (
                                <button
                                    className="btn btn-ghost"
                                    style={{ flex: 1, fontSize: "var(--text-xs)", padding: "6px 10px", minHeight: 36 }}
                                    onClick={() => window.open(`mailto:${c.email}`)}
                                >
                                    Correo
                                </button>
                            )}
                            <button
                                className="btn btn-ghost"
                                style={{ padding: "6px 10px", minHeight: 36 }}
                                onClick={() => setConfirmDelete(c.id)}
                            >
                                <Trash2 size={14} color="var(--color-danger)" />
                            </button>
                        </div>
                    </div>
                ))
            )}

            {showForm && (
                <Sheet title="Nuevo Cliente" onClose={() => { setShowForm(false); resetForm(); }}>
                    <Input
                        label="Nombre completo" value={form.nombre}
                        onChange={(v) => setForm({ ...form, nombre: v })}
                        required
                    />
                    <Input
                        label="Teléfono / WhatsApp" value={form.telefono}
                        onChange={(v) => setForm({ ...form, telefono: v })}
                        placeholder="+506 8888-0000" required
                    />
                    <Input
                        label="Correo electrónico" value={form.email}
                        onChange={(v) => setForm({ ...form, email: v })}
                        type="email"
                    />
                    <Input
                        label="Dirección" value={form.direccion}
                        onChange={(v) => setForm({ ...form, direccion: v })}
                    />
                    <Select
                        label="Tipo de cliente" value={form.tipo}
                        onChange={(v) => setForm({ ...form, tipo: v })}
                        options={[
                            { value: "regular", label: "Regular" },
                            { value: "mayorista", label: "Mayorista" },
                            { value: "ocasional", label: "Ocasional" },
                        ]}
                    />
                    <Input
                        label="Notas" value={form.notas}
                        onChange={(v) => setForm({ ...form, notas: v })}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        onClick={handleSubmit}
                    >
                        Guardar cliente
                    </button>
                </Sheet>
            )}

            {confirmDelete && (
                <ConfirmDialog
                    message="¿Eliminar este cliente? Esta acción no se puede deshacer."
                    onConfirm={() => { deleteCliente(confirmDelete); setConfirmDelete(null); }}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
        </div>
    );
}

// ─── Facturas ─────────────────────────────────────────────────────────────────
export function FacturasScreen() {
    const { facturas, ventas, clientes, addFactura, updateFactura } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ventaId: "" });

    const getCliente = (id: string) => clientes.find((c) => c.id === id);

    const handleCreate = () => {
        const venta = ventas.find((v) => v.id === form.ventaId);
        if (!venta) return;
        addFactura({
            ventaId: venta.id,
            clienteId: venta.clienteId,
            numero: generateFacturaNum(),
            fecha: new Date().toISOString().split("T")[0],
            subtotal: venta.total + venta.descuento,
            descuento: venta.descuento,
            total: venta.total,
            estado: "emitida",
        });
        setForm({ ventaId: "" });
        setShowForm(false);
    };

    const sendByWhatsApp = (f: typeof facturas[0]) => {
        const cliente = getCliente(f.clienteId);
        if (!cliente) return;
        const msg =
            `📄 *Factura ${f.numero}*\n` +
            `Fecha: ${fmtDate(f.fecha)}\n` +
            `Subtotal: ${fmt(f.subtotal)}\n` +
            `Descuento: ${fmt(f.descuento)}\n` +
            `*Total: ${fmt(f.total)}*\n\n` +
            `Gracias por su compra 🐷`;
        window.open(whatsappLink(cliente.telefono, msg), "_blank");
    };

    return (
        <div className="page fade-in">

            <button
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: "var(--space-4)" }}
                onClick={() => setShowForm(true)}
            >
                <Plus size={16} /> Generar Factura
            </button>

            {facturas.length === 0 ? (
                <EmptyState message="No hay facturas generadas aún." />
            ) : (
                facturas.slice().reverse().map((f) => {
                    const cliente = getCliente(f.clienteId);
                    return (
                        <div key={f.id} className="card" style={{ marginBottom: "var(--space-3)" }}>
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "flex-start", marginBottom: "var(--space-2)",
                            }}>
                                <div>
                                    <p style={{
                                        fontFamily: "var(--font-display)", fontWeight: 700,
                                        color: "var(--color-text)",
                                    }}>
                                        {f.numero}
                                    </p>
                                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                                        {cliente?.nombre ?? "-"} · {fmtDate(f.fecha)}
                                    </p>
                                </div>
                                <Badge estado={f.estado} />
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{
                                    fontFamily: "var(--font-display)", fontWeight: 800,
                                    fontSize: "var(--text-lg)", color: "var(--color-primary)",
                                }}>
                                    {fmt(f.total)}
                                </span>
                                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ padding: "6px 10px", minHeight: 36 }}
                                        onClick={() => sendByWhatsApp(f)}
                                    >
                                        <MessageCircle size={14} color="#25D366" />
                                    </button>
                                    {f.estado === "emitida" && (
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: "6px 12px", minHeight: 36, fontSize: "var(--text-xs)" }}
                                            onClick={() => updateFactura(f.id, { estado: "pagada" })}
                                        >
                                            Marcar pagada
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {showForm && (
                <Sheet title="Generar Factura" onClose={() => setShowForm(false)}>
                    <Select
                        label="Venta" value={form.ventaId}
                        onChange={(v) => setForm({ ventaId: v })}
                        required
                        options={ventas
                            .filter((v) => !v.facturada)
                            .map((v) => ({ value: v.id, label: `${v.clienteNombre} – ${fmt(v.total)}` }))}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "var(--space-2)" }}
                        onClick={handleCreate}
                    >
                        <FileText size={14} /> Crear Factura
                    </button>
                </Sheet>
            )}
        </div>
    );
}

// ─── Ajustes ──────────────────────────────────────────────────────────────────
export function AjustesScreen() {
    const { settings, updateSettings } = useStore();
    const { user, logout } = useAuth();

    const Toggle = ({
        value, onChange, label,
    }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
        <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "var(--space-3) 0", borderBottom: "1px solid var(--color-border)",
        }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text)" }}>{label}</span>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: 44, height: 24, borderRadius: 12, border: "none",
                    cursor: "pointer",
                    background: value ? "var(--color-primary)" : "var(--color-border-2)",
                    position: "relative", transition: "background 200ms",
                }}
            >
                <div style={{
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3, transition: "left 200ms",
                    left: value ? 23 : 3,
                }} />
            </button>
        </div>
    );

    return (
        <div className="page fade-in">

            {/* Perfil */}
            <div className="card" style={{
                marginBottom: "var(--space-4)",
                display: "flex", gap: "var(--space-4)", alignItems: "center",
            }}>
                {user?.photoURL ? (
                    <Image
                        src={user.photoURL}
                        alt="Avatar"
                        width={56}
                        height={56}
                        style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                ) : (
                    <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: "var(--color-primary-glow)",
                        display: "grid", placeItems: "center",
                        fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: "var(--text-xl)", color: "var(--color-primary)",
                    }}>
                        {user?.displayName?.[0] ?? "U"}
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontFamily: "var(--font-display)", fontWeight: 700,
                        fontSize: "var(--text-base)", color: "var(--color-text)",
                    }}>
                        {user?.displayName ?? "Usuario"}
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
                        {user?.email}
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-primary)", fontWeight: 600, marginTop: 2 }}>
                        Administrador
                    </p>
                </div>
            </div>

            {/* Nombre granja */}
            <div className="input-group">
                <label className="input-label">Nombre de la granja</label>
                <input
                    className="input"
                    value={settings.nombreGranja}
                    onChange={(e) => updateSettings({ nombreGranja: e.target.value })}
                    onBlur={(e) => updateSettings({ nombreGranja: e.target.value })}
                    placeholder="Nombre de tu granja"
                />
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)", marginTop: -8, marginBottom: "var(--space-3)" }}>
                El nombre se guarda automáticamente al salir del campo.
            </p>

            {/* Notificaciones */}
            <p className="section-title" style={{ marginBottom: "var(--space-3)" }}>Notificaciones</p>
            <div className="card" style={{ marginBottom: "var(--space-4)" }}>
                <Toggle
                    value={settings.notificacionesPush}
                    onChange={(v) => updateSettings({ notificacionesPush: v })}
                    label="Notificaciones push"
                />
                <Toggle
                    value={settings.recordatorioVacunas}
                    onChange={(v) => updateSettings({ recordatorioVacunas: v })}
                    label="Recordatorio de vacunas"
                />
                <Toggle
                    value={settings.recordatorioPagos}
                    onChange={(v) => updateSettings({ recordatorioPagos: v })}
                    label="Recordatorio de pagos"
                />
            </div>

            {/* Info app */}
            <div className="card" style={{ marginBottom: "var(--space-4)" }}>
                <p style={{
                    fontSize: "var(--text-xs)", color: "var(--color-text-3)",
                    textAlign: "center", lineHeight: 1.6,
                }}>
                    Porcicontrol v1.0.0<br />
                    Tu granja en orden 🐷
                </p>
            </div>

            {/* Cerrar sesión */}
            <button
                className="btn btn-danger"
                style={{ width: "100%", marginBottom: "var(--space-8)" }}
                onClick={logout}
            >
                Cerrar sesión
            </button>

        </div>
    );
}