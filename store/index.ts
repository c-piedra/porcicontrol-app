"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lote, Vacuna, Cliente, Venta, Pago, Factura, Usuario, AppSettings, Costo } from "@/types";

interface AppStore {
    lotes: Lote[];
    vacunas: Vacuna[];
    clientes: Cliente[];
    ventas: Venta[];
    pagos: Pago[];
    facturas: Factura[];
    usuario: Usuario;
    settings: AppSettings;
    activeTab: string;

    addLote: (lote: Omit<Lote, "id">) => void;
    updateLote: (id: string, data: Partial<Lote>) => void;
    deleteLote: (id: string) => void;
    addCosto: (loteId: string, costo: Omit<Costo, "id" | "loteId">) => void;

    addVacuna: (v: Omit<Vacuna, "id">) => void;
    updateVacuna: (id: string, data: Partial<Vacuna>) => void;
    deleteVacuna: (id: string) => void;

    addCliente: (c: Omit<Cliente, "id">) => void;
    updateCliente: (id: string, data: Partial<Cliente>) => void;
    deleteCliente: (id: string) => void;

    addVenta: (v: Omit<Venta, "id">) => void;
    updateVenta: (id: string, data: Partial<Venta>) => void;

    addPago: (p: Omit<Pago, "id">) => void;

    addFactura: (f: Omit<Factura, "id">) => void;
    updateFactura: (id: string, data: Partial<Factura>) => void;

    updateSettings: (s: Partial<AppSettings>) => void;
    setActiveTab: (tab: string) => void;

    getDashboardStats: () => {
        lotesActivos: number;
        totalChanchos: number;
        inversionTotal: number;
        gananciasEstimadas: number;
        ventasMes: number;
        pendientesCobro: number;
        vacunasProximas: number;
    };
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<AppStore>()(
    persist(
        (set, get) => ({
            // ─── Estado inicial vacío ───────────────────────────────────────────────
            lotes: [],
            vacunas: [],
            clientes: [],
            ventas: [],
            pagos: [],
            facturas: [],
            activeTab: "dashboard",
            usuario: {
                id: "u1",
                nombre: "José Campos",
                email: "jose@granja.com",
                rol: "admin",
                activo: true,
            },
            settings: {
                idioma: "es",
                moneda: "CRC",
                nombreGranja: "Mi Granja",
                notificacionesPush: true,
                recordatorioVacunas: true,
                recordatorioPagos: true,
            },

            // ─── Lotes ─────────────────────────────────────────────────────────────
            addLote: (lote) => set((s) => ({ lotes: [...s.lotes, { ...lote, id: uid() }] })),
            updateLote: (id, data) => set((s) => ({ lotes: s.lotes.map((l) => l.id === id ? { ...l, ...data } : l) })),
            deleteLote: (id) => set((s) => ({ lotes: s.lotes.filter((l) => l.id !== id) })),
            addCosto: (loteId, costo) => set((s) => ({
                lotes: s.lotes.map((l) => l.id === loteId
                    ? { ...l, costos: [...l.costos, { ...costo, id: uid(), loteId }], inversion: l.inversion + costo.monto }
                    : l),
            })),

            // ─── Vacunas ───────────────────────────────────────────────────────────
            addVacuna: (v) => set((s) => ({ vacunas: [...s.vacunas, { ...v, id: uid() }] })),
            updateVacuna: (id, data) => set((s) => ({ vacunas: s.vacunas.map((v) => v.id === id ? { ...v, ...data } : v) })),
            deleteVacuna: (id) => set((s) => ({ vacunas: s.vacunas.filter((v) => v.id !== id) })),

            // ─── Clientes ──────────────────────────────────────────────────────────
            addCliente: (c) => set((s) => ({ clientes: [...s.clientes, { ...c, id: uid() }] })),
            updateCliente: (id, data) => set((s) => ({ clientes: s.clientes.map((c) => c.id === id ? { ...c, ...data } : c) })),
            deleteCliente: (id) => set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) })),

            // ─── Ventas ────────────────────────────────────────────────────────────
            addVenta: (v) => set((s) => ({ ventas: [...s.ventas, { ...v, id: uid() }] })),
            updateVenta: (id, data) => set((s) => ({ ventas: s.ventas.map((v) => v.id === id ? { ...v, ...data } : v) })),

            // ─── Pagos ─────────────────────────────────────────────────────────────
            addPago: (p) => set((s) => {
                const pago = { ...p, id: uid() };
                const ventas = s.ventas.map((v) => v.id === p.ventaId ? { ...v, estado: "pagada" as const } : v);
                return { pagos: [...s.pagos, pago], ventas };
            }),

            // ─── Facturas ──────────────────────────────────────────────────────────
            addFactura: (f) => set((s) => ({ facturas: [...s.facturas, { ...f, id: uid() }] })),
            updateFactura: (id, data) => set((s) => ({ facturas: s.facturas.map((f) => f.id === id ? { ...f, ...data } : f) })),

            // ─── Settings ──────────────────────────────────────────────────────────
            updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
            setActiveTab: (tab) => set({ activeTab: tab }),

            // ─── Stats ─────────────────────────────────────────────────────────────
            getDashboardStats: () => {
                const { lotes, ventas, vacunas } = get();
                const activos = lotes.filter((l) => l.estado === "activo");
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return {
                    lotesActivos: activos.length,
                    totalChanchos: activos.reduce((s, l) => s + l.chanchos, 0),
                    inversionTotal: activos.reduce((s, l) => s + l.inversion, 0),
                    gananciasEstimadas: activos.reduce((s, l) => s + (l.valorEstimado - l.inversion), 0),
                    ventasMes: ventas.filter((v) => new Date(v.fecha) >= startOfMonth).reduce((s, v) => s + v.total, 0),
                    pendientesCobro: ventas.filter((v) => v.estado !== "pagada" && v.estado !== "cancelada").reduce((s, v) => s + v.total, 0),
                    vacunasProximas: vacunas.filter((v) => v.estado === "proxima").length,
                };
            },
        }),
        { name: "porcicontrol-storage" }
    )
);