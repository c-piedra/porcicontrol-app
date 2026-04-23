import * as XLSX from "xlsx";
import type { Lote, Venta, Pago, Cliente, Factura } from "@/types";
import { fmt, fmtDate, CATEGORIAS_COSTO, METODO_PAGO_LABEL, ESTADO_VENTA_LABEL } from "./utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const currency = (n: number) => fmt(n);
const pct = (n: number) => `${n.toFixed(1)}%`;

// ─── Estilos de celda ─────────────────────────────────────────────────────────
const HEADER_STYLE = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
    fill: { fgColor: { rgb: "1B4D2A" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
        top: { style: "thin", color: { rgb: "22C55E" } },
        bottom: { style: "thin", color: { rgb: "22C55E" } },
        left: { style: "thin", color: { rgb: "22C55E" } },
        right: { style: "thin", color: { rgb: "22C55E" } },
    },
};

const ROW_STYLE = {
    alignment: { vertical: "center", wrapText: true },
    border: {
        top: { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left: { style: "thin", color: { rgb: "CCCCCC" } },
        right: { style: "thin", color: { rgb: "CCCCCC" } },
    },
};

const ALT_ROW_STYLE = {
    ...ROW_STYLE,
    fill: { fgColor: { rgb: "F0FDF4" } },
};

// ─── Aplicar estilos a una hoja ───────────────────────────────────────────────
function styleSheet(ws: XLSX.WorkSheet, headers: string[], rowCount: number) {
    const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");

    for (let C = range.s.c; C <= range.e.c; C++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
        if (ws[headerCell]) ws[headerCell].s = HEADER_STYLE;
    }

    for (let R = 1; R <= rowCount; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cell = XLSX.utils.encode_cell({ r: R, c: C });
            if (ws[cell]) ws[cell].s = R % 2 === 0 ? ALT_ROW_STYLE : ROW_STYLE;
        }
    }
}

// ─── Hoja 1: Resumen General ──────────────────────────────────────────────────
function buildResumen(
    lotes: Lote[], ventas: Venta[], pagos: Pago[], nombreGranja: string
): XLSX.WorkSheet {
    const lotesActivos = lotes.filter((l) => l.estado === "activo");
    const inversionTotal = lotesActivos.reduce((s, l) => s + l.inversion, 0);
    const valorEstimado = lotesActivos.reduce((s, l) => s + l.valorEstimado, 0);
    const gananciaEstimada = valorEstimado - inversionTotal;
    const roi = inversionTotal > 0 ? (gananciaEstimada / inversionTotal) * 100 : 0;
    const totalVendido = ventas.filter((v) => v.estado === "pagada").reduce((s, v) => s + v.total, 0);
    const totalCobrado = pagos.reduce((s, p) => s + p.monto, 0);
    const pendienteCobro = ventas.filter((v) => v.estado !== "pagada" && v.estado !== "cancelada").reduce((s, v) => s + v.total, 0);

    const data = [
        ["RESUMEN GENERAL", ""],
        ["Granja", nombreGranja],
        ["Fecha de reporte", fmtDate(new Date().toISOString().split("T")[0])],
        ["", ""],
        ["LOTES", ""],
        ["Lotes activos", lotesActivos.length],
        ["Total chanchos activos", lotesActivos.reduce((s, l) => s + l.chanchos, 0)],
        ["Inversión total activa", currency(inversionTotal)],
        ["Valor estimado de venta", currency(valorEstimado)],
        ["Ganancia estimada", currency(gananciaEstimada)],
        ["ROI estimado", pct(roi)],
        ["", ""],
        ["VENTAS Y COBROS", ""],
        ["Total vendido (pagado)", currency(totalVendido)],
        ["Total cobrado", currency(totalCobrado)],
        ["Pendiente de cobro", currency(pendienteCobro)],
        ["Número de ventas", ventas.length],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 30 }, { wch: 25 }];
    ws["A1"].s = { font: { bold: true, sz: 14, color: { rgb: "1B4D2A" } } };
    return ws;
}

// ─── Hoja 2: Lotes ────────────────────────────────────────────────────────────
function buildLotes(lotes: Lote[]): XLSX.WorkSheet {
    const headers = [
        "Nombre", "Estado", "Chanchos", "Peso Inicial (kg)",
        "Peso Promedio (kg)", "Días Engorde", "Progreso %",
        "Inversión", "Valor Estimado", "Ganancia Estimada", "Fecha Ingreso", "Notas",
    ];

    const rows = lotes.map((l) => [
        l.nombre,
        l.estado.toUpperCase(),
        l.chanchos,
        l.pesoInicial,
        l.pesoPromedio,
        l.diasEngorde,
        `${l.progreso}%`,
        currency(l.inversion),
        currency(l.valorEstimado),
        currency(l.valorEstimado - l.inversion),
        fmtDate(l.fechaIngreso),
        l.notas ?? "",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = [
        { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 16 },
        { wch: 16 }, { wch: 12 }, { wch: 10 },
        { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 20 },
    ];
    styleSheet(ws, headers, rows.length);
    return ws;
}

// ─── Hoja 3: Gastos por Lote ──────────────────────────────────────────────────
function buildGastos(lotes: Lote[]): XLSX.WorkSheet {
    const headers = ["Lote", "Categoría", "Descripción", "Monto", "Fecha"];
    const rows: any[][] = [];

    lotes.forEach((l) => {
        l.costos.forEach((c) => {
            rows.push([
                l.nombre,
                CATEGORIAS_COSTO[c.categoria]?.label ?? c.categoria,
                c.descripcion,
                currency(c.monto),
                fmtDate(c.fecha),
            ]);
        });
    });

    // Totales por categoría
    const totalesCat: Record<string, number> = {};
    lotes.flatMap((l) => l.costos).forEach((c) => {
        totalesCat[c.categoria] = (totalesCat[c.categoria] ?? 0) + c.monto;
    });

    rows.push(["", "", "", "", ""]);
    rows.push(["TOTALES POR CATEGORÍA", "", "", "", ""]);
    Object.entries(totalesCat).forEach(([cat, total]) => {
        rows.push(["", CATEGORIAS_COSTO[cat]?.label ?? cat, "", currency(total), ""]);
    });
    rows.push(["", "TOTAL GENERAL", "", currency(Object.values(totalesCat).reduce((s, v) => s + v, 0)), ""]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = [{ wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 14 }];
    styleSheet(ws, headers, rows.length);
    return ws;
}

// ─── Hoja 4: Ventas ───────────────────────────────────────────────────────────
function buildVentas(ventas: Venta[], clientes: Cliente[]): XLSX.WorkSheet {
    const headers = [
        "Fecha", "Cliente", "Cantidad", "Peso Prom. (kg)",
        "Precio/kg", "Descuento", "Total", "Estado", "Facturada",
    ];

    const getCliente = (id: string) => clientes.find((c) => c.id === id);

    const rows = ventas.map((v) => [
        fmtDate(v.fecha),
        v.clienteNombre,
        v.cantidad,
        v.pesoProm,
        currency(v.precioKg),
        currency(v.descuento),
        currency(v.total),
        ESTADO_VENTA_LABEL[v.estado] ?? v.estado,
        v.facturada ? "Sí" : "No",
    ]);

    // Total
    rows.push(["", "", "", "", "", "TOTAL", currency(ventas.reduce((s, v) => s + v.total, 0)), "", ""]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = [
        { wch: 14 }, { wch: 20 }, { wch: 10 }, { wch: 14 },
        { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 10 },
    ];
    styleSheet(ws, headers, rows.length);
    return ws;
}

// ─── Hoja 5: Pagos ────────────────────────────────────────────────────────────
function buildPagos(pagos: Pago[]): XLSX.WorkSheet {
    const headers = ["Fecha", "Cliente", "Monto", "Método de Pago", "Referencia", "Notas"];

    const rows = pagos.map((p) => [
        fmtDate(p.fecha),
        p.clienteNombre,
        currency(p.monto),
        METODO_PAGO_LABEL[p.metodoPago] ?? p.metodoPago,
        p.referencia ?? "",
        p.notas ?? "",
    ]);

    rows.push(["", "TOTAL COBRADO", currency(pagos.reduce((s, p) => s + p.monto, 0)), "", "", ""]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = [
        { wch: 14 }, { wch: 20 }, { wch: 16 },
        { wch: 18 }, { wch: 20 }, { wch: 20 },
    ];
    styleSheet(ws, headers, rows.length);
    return ws;
}

// ─── Hoja 6: Clientes ─────────────────────────────────────────────────────────
function buildClientes(clientes: Cliente[], ventas: Venta[], pagos: Pago[]): XLSX.WorkSheet {
    const headers = ["Nombre", "Teléfono", "Email", "Tipo", "Total Comprado", "Total Pagado", "Deuda Pendiente"];

    const rows = clientes.map((c) => {
        const comprado = ventas.filter((v) => v.clienteId === c.id).reduce((s, v) => s + v.total, 0);
        const pagado = pagos.filter((p) => p.clienteId === c.id).reduce((s, p) => s + p.monto, 0);
        return [
            c.nombre,
            c.telefono,
            c.email ?? "",
            c.tipo,
            currency(comprado),
            currency(pagado),
            currency(Math.max(0, comprado - pagado)),
        ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = [
        { wch: 22 }, { wch: 16 }, { wch: 24 },
        { wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 16 },
    ];
    styleSheet(ws, headers, rows.length);
    return ws;
}

// ─── Exportar todo ────────────────────────────────────────────────────────────
export function exportarReporteExcel(
    lotes: Lote[],
    ventas: Venta[],
    pagos: Pago[],
    clientes: Cliente[],
    nombreGranja: string
) {
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, buildResumen(lotes, ventas, pagos, nombreGranja), "📊 Resumen");
    XLSX.utils.book_append_sheet(wb, buildLotes(lotes), "🐷 Lotes");
    XLSX.utils.book_append_sheet(wb, buildGastos(lotes), "💸 Gastos");
    XLSX.utils.book_append_sheet(wb, buildVentas(ventas, clientes), "🛒 Ventas");
    XLSX.utils.book_append_sheet(wb, buildPagos(pagos), "💰 Pagos");
    XLSX.utils.book_append_sheet(wb, buildClientes(clientes, ventas, pagos), "👥 Clientes");

    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Porcicontrol_${nombreGranja}_${fecha}.xlsx`);
}

// ─── Mensaje WhatsApp resumen ─────────────────────────────────────────────────
export function generarMensajeResumen(
    lotes: Lote[],
    ventas: Venta[],
    pagos: Pago[],
    nombreGranja: string
): string {
    const lotesActivos = lotes.filter((l) => l.estado === "activo");
    const inversionTotal = lotesActivos.reduce((s, l) => s + l.inversion, 0);
    const valorEstimado = lotesActivos.reduce((s, l) => s + l.valorEstimado, 0);
    const ganancia = valorEstimado - inversionTotal;
    const roi = inversionTotal > 0 ? ((ganancia / inversionTotal) * 100).toFixed(1) : "0";
    const totalVendido = ventas.filter((v) => v.estado === "pagada").reduce((s, v) => s + v.total, 0);
    const pendiente = ventas.filter((v) => v.estado !== "pagada" && v.estado !== "cancelada").reduce((s, v) => s + v.total, 0);
    const totalCobrado = pagos.reduce((s, p) => s + p.monto, 0);
    const fecha = fmtDate(new Date().toISOString().split("T")[0]);

    return (
        `🐷 *Reporte ${nombreGranja}*\n` +
        `📅 ${fecha}\n\n` +
        `*LOTES ACTIVOS*\n` +
        `• Lotes: ${lotesActivos.length}\n` +
        `• Chanchos: ${lotesActivos.reduce((s, l) => s + l.chanchos, 0)}\n` +
        `• Inversión: ${fmt(inversionTotal)}\n` +
        `• Val. estimado: ${fmt(valorEstimado)}\n` +
        `• Ganancia est.: ${fmt(ganancia)} (ROI ${roi}%)\n\n` +
        `*VENTAS Y COBROS*\n` +
        `• Total vendido: ${fmt(totalVendido)}\n` +
        `• Total cobrado: ${fmt(totalCobrado)}\n` +
        `• Pendiente cobro: ${fmt(pendiente)}\n\n` +
        `_Enviado desde Porcicontrol_ 📱`
    );
}