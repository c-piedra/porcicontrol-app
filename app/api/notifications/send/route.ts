import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { adminDb } from "@/lib/firebase-admin";

webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const hoy = new Date();
        const en7dias = new Date();
        en7dias.setDate(hoy.getDate() + 7);

        // Obtener vacunas próximas
        const vacunasSnap = await adminDb.collection("vacunas").get();
        const vacunasProximas = vacunasSnap.docs
            .map((d) => d.data())
            .filter((v) => {
                if (v.estado !== "proxima" || !v.proximaFecha) return false;
                const fecha = new Date(v.proximaFecha);
                return fecha >= hoy && fecha <= en7dias;
            });

        // Obtener pagos pendientes
        const ventasSnap = await adminDb.collection("ventas").get();
        const pagosPendientes = ventasSnap.docs
            .map((d) => d.data())
            .filter((v) => v.estado !== "pagada" && v.estado !== "cancelada");

        // Obtener suscripciones
        const subsSnap = await adminDb.collection("pushSubscriptions").get();

        if (subsSnap.empty) {
            return NextResponse.json({ ok: true, message: "Sin suscriptores" });
        }

        let sent = 0;
        let failed = 0;

        for (const subDoc of subsSnap.docs) {
            const { subscription, userId } = subDoc.data();

            // Leer settings del usuario
            const settingsSnap = await adminDb
                .collection("users")
                .doc(userId)
                .collection("settings")
                .get();

            const settings = settingsSnap.empty ? null : settingsSnap.docs[0].data();

            // Si desactivó notificaciones push saltar
            if (settings?.notificacionesPush === false) continue;

            const notifications: { title: string; body: string }[] = [];

            if (settings?.recordatorioVacunas !== false && vacunasProximas.length > 0) {
                notifications.push({
                    title: "💉 Vacunas próximas",
                    body: `Tenés ${vacunasProximas.length} vacuna${vacunasProximas.length > 1 ? "s" : ""} pendiente${vacunasProximas.length > 1 ? "s" : ""} esta semana`,
                });
            }

            if (settings?.recordatorioPagos !== false && pagosPendientes.length > 0) {
                notifications.push({
                    title: "💰 Pagos pendientes",
                    body: `Tenés ${pagosPendientes.length} venta${pagosPendientes.length > 1 ? "s" : ""} sin cobrar`,
                });
            }

            for (const notif of notifications) {
                try {
                    await webpush.sendNotification(subscription, JSON.stringify(notif));
                    sent++;
                } catch {
                    failed++;
                }
            }
        }

        return NextResponse.json({ ok: true, sent, failed });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return POST(req);
}