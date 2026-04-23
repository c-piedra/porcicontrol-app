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

    // ─── Lotes ────────────────────────────────────────────────────────────────
    addLote: async (lote) => {
        await lotesService.add(lote);
    },
    updateLote: async (id, data) => {
        await lotesService.update(id, data);
    },
    deleteLote: async (id) => {
        await lotesService.delete(id);
    },
    addCosto: async (loteId, costo) => {
        const lote = get().lotes.find((l) => l.id === loteId);
        if (!lote) return;
        const nuevoCosto: Costo = { ...costo, id: uid(), loteId };
        const costos = [...lote.costos, nuevoCosto];
        const inversion = lote.inversion + costo.monto;
        await lotesService.update(loteId, { costos, inversion });
    },

    // ─── Vacunas ──────────────────────────────────────────────────────────────
    addVacuna: async (v) => {
        await vacunasService.add(v);
    },
    updateVacuna: async (id, data) => {
        await vacunasService.update(id, data);
    },
    deleteVacuna: async (id) => {
        await vacunasService.delete(id);
    },

    // ─── Clientes ─────────────────────────────────────────────────────────────
    addCliente: async (c) => {
        await clientesService.add(c);
    },
    updateCliente: async (id, data) => {
        await clientesService.update(id, data);
    },
    deleteCliente: async (id) => {
        await clientesService.delete(id);
    },

    // ─── Ventas ───────────────────────────────────────────────────────────────
    addVenta: async (v) => {
        await ventasService.add(v);
    },
    updateVenta: async (id, data) => {
        await ventasService.update(id, data);
    },

    // ─── Pagos ────────────────────────────────────────────────────────────────
    addPago: async (p) => {
        await pagosService.add(p);
        await ventasService.update(p.ventaId, { estado: "pagada" });
    },

    // ─── Facturas ─────────────────────────────────────────────────────────────
    addFactura: async (f) => {
        await facturasService.add(f);
        await ventasService.update(f.ventaId, { facturada: true });
    },
    updateFactura: async (id, data) => {
        await facturasService.update(id, data);
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