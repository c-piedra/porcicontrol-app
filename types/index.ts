// ─── Lotes ────────────────────────────────────────────────────────────────────
export interface Lote {
    id: string;
    nombre: string;
    chanchos: number;
    pesoPromedio: number;
    pesoInicial: number;
    fechaIngreso: string;
    diasEngorde: number;
    progreso: number;
    estado: "activo" | "vendido" | "baja";
    inversion: number;
    valorEstimado: number;
    notas?: string;
    costos: Costo[];
}

export interface Costo {
    id: string;
    loteId: string;
    categoria: "alimentacion" | "vacunas" | "medicamentos" | "compra" | "otros";
    descripcion: string;
    monto: number;
    fecha: string;
}

// ─── Vacunas ──────────────────────────────────────────────────────────────────
export interface Vacuna {
    id: string;
    loteId: string;
    nombre: string;
    tipo: "preventiva" | "curativa" | "suplemento";
    fecha: string;
    proximaFecha?: string;
    estado: "aplicada" | "proxima" | "vencida";
    dosis?: string;
    observaciones?: string;
    veterinario?: string;
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
export interface Cliente {
    id: string;
    nombre: string;
    telefono: string;
    email?: string;
    direccion?: string;
    tipo: "regular" | "mayorista" | "ocasional";
    deudaTotal: number;
    notas?: string;
}

// ─── Ventas ───────────────────────────────────────────────────────────────────
export interface Venta {
    id: string;
    loteId: string;
    clienteId: string;
    clienteNombre: string;
    cantidad: number;
    pesoProm: number;
    precioKg: number;
    descuento: number;
    total: number;
    fecha: string;
    fechaEntrega?: string;
    estado: "pendiente" | "confirmada" | "entregada" | "pagada" | "cancelada";
    notas?: string;
    facturada: boolean;
}

// ─── Pagos ────────────────────────────────────────────────────────────────────
export interface Pago {
    id: string;
    ventaId: string;
    clienteId: string;
    clienteNombre: string;
    monto: number;
    metodoPago: "efectivo" | "transferencia" | "tarjeta" | "sinpe";
    fecha: string;
    referencia?: string;
    notas?: string;
}

// ─── Facturas ─────────────────────────────────────────────────────────────────
export interface Factura {
    id: string;
    ventaId: string;
    clienteId: string;
    numero: string;
    fecha: string;
    subtotal: number;
    descuento: number;
    total: number;
    estado: "emitida" | "pagada" | "anulada";
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────
export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    rol: "admin" | "empleado" | "vendedor";
    activo: boolean;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface AppSettings {
    idioma: "es" | "en";
    moneda: "CRC" | "USD";
    nombreGranja: string;
    notificacionesPush: boolean;
    recordatorioVacunas: boolean;
    recordatorioPagos: boolean;
}