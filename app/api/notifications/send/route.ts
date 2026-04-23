import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

async function getVacunasProximas() {
    const snap = await getDocs(collection(db, "vacunas"));
    const hoy = new Date();
    const en7dias = new Date();
    en7dias.setDate(hoy.getDate() + 7);

    return snap.docs
        .map((d) => d.data())
        .filter((v) => {
            if (v.estado !== "proxima" || !v.proximaFecha) return false;
            const fecha = new Date(v.proximaFecha);
            return fecha >= hoy && fecha <= en7dias;
        });
}

async function getPagosPendientes() {
    const snap = await getDocs(collection(db, "ventas"));
    return snap.docs
        .map((d) => d.data())
        .filter((v) => v.estado !== "pagada" && v.estado !== "cancelada");
}

async function getSubscriptions() {
    const snap = await getDocs(collection(db, "pushSubscriptions"));
    return snap.docs.map((d) => d.data().subscription);
}

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const [vacunas, pagos, subscriptionsSnap] = await Promise.all([
            getVacunasProximas(),
            getPagosPendientes(),
            getDocs(collection(db, "pushSubscriptions")),
        ]);

        if (subscriptionsSnap.empty) {
            return NextResponse.json({ ok: true, message: "Sin suscriptores" });
        }

        // Para cada suscriptor revisar sus settings
        const results = await Promise.allSettled(
            subscriptionsSnap.docs.map(async (subDoc) => {
                const { subscription, userId } = subDoc.data();

                // Leer settings del usuario
                const settingsSnap = await getDocs(
                    collection(db, "users", userId, "settings")
                );
                const settings = settingsSnap.empty ? null : settingsSnap.docs[0].data();

                // Si desactivó notificaciones push, saltar
                if (settings && settings.notificacionesPush === false) return;

                const notifications: { title: string; body: string; url: string }[] = [];

                if (settings?.recordatorioVacunas !== false && vacunas.length > 0) {
                    notifications.push({
                        title: "💉 Vacunas próximas",
                        body: `Tenés ${vacunas.length} vacuna${vacunas.length > 1 ? "s" : ""} pendiente${vacunas.length > 1 ? "s" : ""} esta semana`,
                        url: "/",
                    });
                }

                if (settings?.recordatorioPagos !== false && pagos.length > 0) {
                    notifications.push({
                        title: "💰 Pagos pendientes",
                        body: `Tenés ${pagos.length} venta${pagos.length > 1 ? "s" : ""} sin cobrar`,
                        url: "/",
                    });
                }

                await Promise.all(
                    notifications.map((notif) =>
                        webpush.sendNotification(subscription, JSON.stringify(notif))
                    )
                );
            })
        );

        const sent = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        return NextResponse.json({ ok: true, sent, failed });
    } catch (error) {
        console.error("Error enviando notificaciones:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

// GET para el cron de Vercel
export async function GET(req: NextRequest) {
    return POST(req);
}