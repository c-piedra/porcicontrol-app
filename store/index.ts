"use client";
import { create } from "zustand";
import type { Lote, Vacuna, Cliente, Venta, Pago, Factura, Usuario, AppSettings, Costo } from "@/types";
import {
    lotesService, vacunasService, clientesService,
    ventasService, pagosService, facturasService,
    settingsService,
} from "@/lib/firestore";

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
    loading: boolean;
    userId: string | null;

    // Init
    initSubscriptions: () => () => void;
    setUserId: (id: string | null) => void;
    loadSettings: (userId: string) => Promise<void>;

    // Lotes
    addLote: (lote: Omit<Lote, "id">) => Promise<void>;
    updateLote: (id: string, data: Partial<Lote>) => Promise<void>;
    deleteLote: (id: string) => Promise<void>;
    addCosto: (loteId: string, costo: Omit<Costo, "id" | "loteId">) => Promise<void>;

    // Vacunas
    addVacuna: (v: Omit<Vacuna, "id">) => Promise<void>;
    updateVacuna: (id: string, data: Partial<Vacuna>) => Promise<void>;
    deleteVacuna: (id: string) => Promise<void>;

    // Clientes
    addCliente: (c: Omit<Cliente, "id">) => Promise<void>;
    updateCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
    deleteCliente: (id: string) => Promise<void>;

    // Ventas
    addVenta: (v: Omit<Venta, "id">) => Promise<void>;
    updateVenta: (id: string, data: Partial<Venta>) => Promise<void>;

    // Pagos
    addPago: (p: Omit<Pago, "id">) => Promise<void>;

    // Facturas
    addFactura: (f: Omit<Factura, "id">) => Promise<void>;
    updateFactura: (id: string, data: Partial<Factura>) => Promise<void>;

    // Settings
    updateSettings: (s: Partial<AppSettings>) => void;
    setActiveTab: (tab: string) => void;

    // Stats
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

export const useStore = create<AppStore>()((set, get) => ({
    lotes: [],
    vacunas: [],
    clientes: [],
    ventas: [],
    pagos: [],
    facturas: [],
    loading: false,
    activeTab: "dashboard",
    userId: null,
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
        notificacionesPush: false,
        recordatorioVacunas: false,
        recordatorioPagos: false,
    },

    // ─── userId ───────────────────────────────────────────────────────────────
    setUserId: (id) => set({ userId: id }),

    // ─── Load settings ────────────────────────────────────────────────────────
    loadSettings: async (userId) => {
        const saved = await settingsService.get(userId);
        if (saved) set((s) => ({ settings: { ...s.settings, ...saved } }));
    },

    // ─── Init subscriptions ───────────────────────────────────────────────────
    initSubscriptions: () => {
        const unsubLotes = lotesService.subscribe((lotes) => set({ lotes }));
        const unsubVacunas = vacunasService.subscribe((vacunas) => set({ vacunas }));
        const unsubClientes = clientesService.subscribe((clientes) => set({ clientes }));
        const unsubVentas = ventasService.subscribe((ventas) => set({ ventas }));
        const unsubPagos = pagosService.subscribe((pagos) => set({ pagos }));
        const unsubFacturas = facturasService.subscribe((facturas) => set({ facturas }));

        return () => {
            unsubLotes();
            unsubVacunas();
            unsubClientes();
            unsubVentas();
            unsubPagos();
            unsubFacturas();
        };
    },

    // ─── Lotes ────────────────────────────────────────────────────────────────────
    addLote: async (lote) => {
        const tempId = uid();
        // Actualizar UI inmediatamente
        set((s) => ({ lotes: [{ ...lote, id: tempId }, ...s.lotes] }));
        // Sincronizar con Firestore en background
        try {
            await lotesService.add(lote);
        } catch (err) {
            // Revertir si falla
            set((s) => ({ lotes: s.lotes.filter((l) => l.id !== tempId) }));
        }
    },

    updateLote: async (id, data) => {
        // Actualizar UI inmediatamente
        set((s) => ({ lotes: s.lotes.map((l) => l.id === id ? { ...l, ...data } : l) }));
        // Sincronizar con Firestore en background
        lotesService.update(id, data).catch(console.error);
    },

    deleteLote: async (id) => {
        // Actualizar UI inmediatamente
        set((s) => ({ lotes: s.lotes.filter((l) => l.id !== id) }));
        // Sincronizar con Firestore en background
        lotesService.delete(id).catch(console.error);
    },

    addCosto: async (loteId, costo) => {
        const lote = get().lotes.find((l) => l.id === loteId);
        if (!lote) return;
        const nuevoCosto: Costo = { ...costo, id: uid(), loteId };
        const costos = [...lote.costos, nuevoCosto];
        const inversion = lote.inversion + costo.monto;
        // Actualizar UI inmediatamente
        set((s) => ({
            lotes: s.lotes.map((l) => l.id === loteId ? { ...l, costos, inversion } : l),
        }));
        // Sincronizar con Firestore en background
        lotesService.update(loteId, { costos, inversion }).catch(console.error);
    },

    // ─── Vacunas ──────────────────────────────────────────────────────────────────
    addVacuna: async (v) => {
        const tempId = uid();
        set((s) => ({ vacunas: [{ ...v, id: tempId }, ...s.vacunas] }));
        vacunasService.add(v).catch(console.error);
    },

    updateVacuna: async (id, data) => {
        set((s) => ({ vacunas: s.vacunas.map((v) => v.id === id ? { ...v, ...data } : v) }));
        vacunasService.update(id, data).catch(console.error);
    },

    deleteVacuna: async (id) => {
        set((s) => ({ vacunas: s.vacunas.filter((v) => v.id !== id) }));
        vacunasService.delete(id).catch(console.error);
    },

    // ─── Clientes ─────────────────────────────────────────────────────────────────
    addCliente: async (c) => {
        const tempId = uid();
        set((s) => ({ clientes: [{ ...c, id: tempId }, ...s.clientes] }));
        clientesService.add(c).catch(console.error);
    },

    updateCliente: async (id, data) => {
        set((s) => ({ clientes: s.clientes.map((c) => c.id === id ? { ...c, ...data } : c) }));
        clientesService.update(id, data).catch(console.error);
    },

    deleteCliente: async (id) => {
        set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) }));
        clientesService.delete(id).catch(console.error);
    },

    // ─── Ventas ───────────────────────────────────────────────────────────────────
    addVenta: async (v) => {
        const tempId = uid();
        set((s) => ({ ventas: [{ ...v, id: tempId }, ...s.ventas] }));
        ventasService.add(v).catch(console.error);
    },

    updateVenta: async (id, data) => {
        set((s) => ({ ventas: s.ventas.map((v) => v.id === id ? { ...v, ...data } : v) }));
        ventasService.update(id, data).catch(console.error);
    },

    // ─── Pagos ────────────────────────────────────────────────────────────────────
    addPago: async (p) => {
        const tempId = uid();
        set((s) => ({
            pagos: [{ ...p, id: tempId }, ...s.pagos],
            ventas: s.ventas.map((v) => v.id === p.ventaId ? { ...v, estado: "pagada" as const } : v),
        }));
        pagosService.add(p).catch(console.error);
        ventasService.update(p.ventaId, { estado: "pagada" }).catch(console.error);
    },

    // ─── Facturas ─────────────────────────────────────────────────────────────────
    addFactura: async (f) => {
        const tempId = uid();
        set((s) => ({ facturas: [{ ...f, id: tempId }, ...s.facturas] }));
        facturasService.add(f).catch(console.error);
        ventasService.update(f.ventaId, { facturada: true }).catch(console.error);
    },

    updateFactura: async (id, data) => {
        set((s) => ({ facturas: s.facturas.map((f) => f.id === id ? { ...f, ...data } : f) }));
        facturasService.update(id, data).catch(console.error);
    },

    // ─── Settings ─────────────────────────────────────────────────────────────
    updateSettings: (s) => {
        set((state) => {
            const newSettings = { ...state.settings, ...s };
            if (state.userId) {
                settingsService.save(state.userId, s);
            }
            return { settings: newSettings };
        });
    },
    setActiveTab: (tab) => set({ activeTab: tab }),

    // ─── Stats ────────────────────────────────────────────────────────────────
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
}));