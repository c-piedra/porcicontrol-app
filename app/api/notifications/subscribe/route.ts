import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
    try {
        const { subscription, userId } = await req.json();
        if (!subscription || !userId) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
        }

        await setDoc(doc(db, "pushSubscriptions", userId), {
            subscription,
            userId,
            creadoEn: new Date().toISOString(),
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: "Error guardando suscripción" }, { status: 500 });
    }
}