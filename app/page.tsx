"use client";
import { useEffect } from "react";
import { useStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import LoginScreen from "@/components/modules/LoginScreen";
import DashboardScreen from "@/components/modules/DashboardScreen";
import LotesScreen from "@/components/modules/LotesScreen";
import VacunasScreen from "@/components/modules/VacunasScreen";
import VentasScreen from "@/components/modules/VentasScreen";
import ReportesScreen from "@/components/modules/ReportesScreen";
import {
  PagosScreen,
  ClientesScreen,
  FacturasScreen,
  AjustesScreen,
} from "@/components/modules/ExtraScreens";

const SCREENS: Record<string, React.ComponentType> = {
  dashboard: DashboardScreen,
  lotes: LotesScreen,
  vacunas: VacunasScreen,
  ventas: VentasScreen,
  reportes: ReportesScreen,
  pagos: PagosScreen,
  clientes: ClientesScreen,
  facturas: FacturasScreen,
  ajustes: AjustesScreen,
};

export default function AppPage() {
  const { activeTab, initSubscriptions } = useStore();
  const { user, loading } = useAuth();
  const Screen = SCREENS[activeTab] ?? DashboardScreen;

  useEffect(() => {
    if (!user) return;
    const { setUserId, loadSettings, initSubscriptions } = useStore.getState();
    setUserId(user.uid);
    loadSettings(user.uid);
    const unsubscribe = initSubscriptions();
    return () => unsubscribe();
  }, [user]);

  // Loading inicial
  if (loading) {
    return (
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        gap: "var(--space-4)",
      }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-2xl)",
          fontWeight: 800,
          color: "var(--color-text)",
        }}>
          Porci<span style={{ color: "var(--color-primary)" }}>control</span>
        </div>
        <div style={{
          width: 32, height: 32,
          border: "3px solid var(--color-border)",
          borderTop: "3px solid var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Sin sesión → Login
  if (!user) return <LoginScreen />;

  // Con sesión → App
  return (
    <div className="app-shell" style={{ position: "relative" }}>
      <AppHeader />
      <main className="app-content" key={activeTab}>
        <Screen />
      </main>
      <BottomNav />
    </div>
  );
}