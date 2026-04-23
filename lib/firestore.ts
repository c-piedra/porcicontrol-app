import {
    collection, doc, addDoc, updateDoc, deleteDoc,
    getDocs, onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Lote, Vacuna, Cliente, Venta, Pago, Factura, AppSettings } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const col = (name: string) => collection(db, name);

const cleanData = (data: object) =>
    Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );

// ─── Lotes ────────────────────────────────────────────────────────────────────
export const lotesService = {
    async getAll(): Promise<Lote[]> {
        const snap = await getDocs(query(col("lotes"), orderBy("fechaIngreso", "desc")));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lote));
    },
    async add(lote: Omit<Lote, "id">): Promise<string> {
        const ref = await addDoc(col("lotes"), cleanData({ ...lote, creadoEn: serverTimestamp() }));
        return ref.id;
    },
    async update(id: string, data: Partial<Lote>): Promise<void> {
        await updateDoc(doc(db, "lotes", id), cleanData({ ...data, actualizadoEn: serverTimestamp() }));
    },
    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, "lotes", id));
    },
    subscribe(callback: (lotes: Lote[]) => void) {
        return onSnapshot(
            query(col("lotes"), orderBy("fechaIngreso", "desc")),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lote)))
        );
    },
};

// ─── Vacunas ──────────────────────────────────────────────────────────────────
export const vacunasService = {
    async getAll(): Promise<Vacuna[]> {
        const snap = await getDocs(query(col("vacunas"), orderBy("fecha", "desc")));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vacuna));
    },
    async add(vacuna: Omit<Vacuna, "id">): Promise<string> {
        const ref = await addDoc(col("vacunas"), cleanData({ ...vacuna, creadoEn: serverTimestamp() }));
        return ref.id;
    },
    async update(id: string, data: Partial<Vacuna>): Promise<void> {
        await updateDoc(doc(db, "vacunas", id), cleanData(data));
    },
    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, "vacunas", id));
    },
    subscribe(callback: (vacunas: Vacuna[]) => void) {
        return onSnapshot(
            query(col("vacunas"), orderBy("fecha", "desc")),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vacuna)))
        );
    },
};

// ─── Clientes ─────────────────────────────────────────────────────────────────
export const clientesService = {
    async getAll(): Promise<Cliente[]> {
        const snap = await getDocs(query(col("clientes"), orderBy("nombre", "asc")));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cliente));
    },
    async add(cliente: Omit<Cliente, "id">): Promise<string> {
        const ref = await addDoc(col("clientes"), cleanData({ ...cliente, creadoEn: serverTimestamp() }));
        return ref.id;
    },
    async update(id: string, data: Partial<Cliente>): Promise<void> {
        await updateDoc(doc(db, "clientes", id), cleanData(data));
    },
    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, "clientes", id));
    },
    subscribe(callback: (clientes: Cliente[]) => void) {
        return onSnapshot(
            query(col("clientes"), orderBy("nombre", "asc")),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cliente)))
        );
    },
};

// ─── Ventas ───────────────────────────────────────────────────────────────────
export const ventasService = {
    async getAll(): Promise<Venta[]> {
        const snap = await getDocs(query(col("ventas"), orderBy("fecha", "desc")));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venta));
    },
    async add(venta: Omit<Venta, "id">): Promise<string> {
        const ref = await addDoc(col("ventas"), cleanData({ ...venta, creadoEn: serverTimestamp() }));
        return ref.id;
    },
    async update(id: string, data: Partial<Venta>): Promise<void> {
        await updateDoc(doc(db, "ventas", id), cleanData(data));
    },
    subscribe(callback: (ventas: Venta[]) => void) {
        return onSnapshot(
            query(col("ventas"), orderBy("fecha", "desc")),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venta)))
        );
    },
};

// ─── Pagos ────────────────────────────────────────────────────────────────────
export const pagosService = {
    async getAll(): Promise<Pago[]> {
        const snap = await getDocs(query(col("pagos"), orderBy("fecha", "desc")));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pago));
    },
    async add(pago: Omit<Pago, "id">): Promise<string> {
        const ref = await addDoc(col("pagos"), cleanData({ ...pago, creadoEn: serverTimestamp() }));
        return ref.id;
    },
    subscribe(callback: (pagos: Pago[]) => void) {
        return onSnapshot(
            query(col("pagos"), orderBy("fecha", "desc")),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pago)))
        );
    },
};

// ─── Facturas ─────────────────────────────────────────────────────────────────
export const facturasService = {
    async getAll(): Promise<Factura[]> {
        const snap = await getDocs(query(col("facturas"), orderBy("fecha", "desc")));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Factura));
    },
    async add(factura: Omit<Factura, "id">): Promise<string> {
        const ref = await addDoc(col("facturas"), cleanData({ ...factura, creadoEn: serverTimestamp() }));
        return ref.id;
    },
    async update(id: string, data: Partial<Factura>): Promise<void> {
        await updateDoc(doc(db, "facturas", id), cleanData(data));
    },
    subscribe(callback: (facturas: Factura[]) => void) {
        return onSnapshot(
            query(col("facturas"), orderBy("fecha", "desc")),
            (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Factura)))
        );
    },
};
// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsService = {
    async get(userId: string): Promise<Partial<AppSettings> | null> {
        try {
            const ref = doc(db, "users", userId, "settings", "main");
            const snap = await getDocs(collection(db, "users", userId, "settings"));
            if (snap.empty) return null;
            return snap.docs[0].data() as Partial<AppSettings>;
        } catch {
            return null;
        }
    },

    async save(userId: string, settings: Partial<AppSettings>): Promise<void> {
        try {
            const ref = doc(db, "users", userId, "settings", "main");
            await updateDoc(ref, cleanData(settings));
        } catch {
            await addDoc(
                collection(db, "users", userId, "settings"),
                { ...cleanData(settings), id: "main" }
            );
        }
    },
};