"use client";
import { useStore } from "@/store";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
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
  const { activeTab } = useStore();
  const Screen = SCREENS[activeTab] ?? DashboardScreen;

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