import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export const fmt = (n: number, currency = "CRC") =>
    new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(n);

export const fmtNum = (n: number) =>
    new Intl.NumberFormat("es-CR").format(n);

export const fmtDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es-CR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const fmtDateShort = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es-CR", {
        day: "2-digit",
        month: "short",
    });
};

export const daysFromNow = (dateStr: string) => {
    const target = new Date(dateStr + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Mañana";
    if (diff < 0) return `Hace ${Math.abs(diff)} días`;
    return `En ${diff} días`;
};

export const whatsappLink = (phone: string, message: string) => {
    const clean = phone.replace(/\D/g, "");
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
};

export const generateFacturaNum = () => {
    const year = new Date().getFullYear();
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `FC-${year}-${num}`;
};

export const CATEGORIAS_COSTO: Record<string, { label: string; color: string }> = {
    compra: { label: "Chanchos de entrada", color: "#22c55e" },
    alimentacion: { label: "Alimentación", color: "#f59e0b" },
    vacunas: { label: "Vacunas", color: "#3b82f6" },
    medicamentos: { label: "Medicamentos", color: "#a855f7" },
    otros: { label: "Otros gastos", color: "#6b7280" },
};

export const ESTADO_VENTA_LABEL: Record<string, string> = {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    entregada: "Entregada",
    pagada: "Pagada",
    cancelada: "Cancelada",
};

export const METODO_PAGO_LABEL: Record<string, string> = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    tarjeta: "Tarjeta",
    sinpe: "SINPE Móvil",
};