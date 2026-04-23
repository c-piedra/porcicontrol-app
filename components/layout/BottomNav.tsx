"use client";
import { useStore } from "@/store";
import { LayoutDashboard, Layers, Syringe, ShoppingCart, Users } from "lucide-react";

const NAV_ITEMS = [
    { id: "dashboard", label: "Inicio", Icon: LayoutDashboard },
    { id: "lotes", label: "Lotes", Icon: Layers },
    { id: "vacunas", label: "Salud", Icon: Syringe },
    { id: "ventas", label: "Ventas", Icon: ShoppingCart },
    { id: "clientes", label: "Clientes", Icon: Users },
];

export default function BottomNav() {
    const { activeTab, setActiveTab } = useStore();

    return (
        <nav className="app-nav">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
                <button
                    key={id}
                    className={`nav-item${activeTab === id ? " active" : ""}`}
                    onClick={() => setActiveTab(id)}
                    aria-label={label}
                >
                    <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 1.8} />
                    <span>{label}</span>
                </button>
            ))}
        </nav>
    );
}