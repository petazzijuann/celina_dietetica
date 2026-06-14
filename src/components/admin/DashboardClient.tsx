"use client";

import { useState } from "react";
import useSWR from "swr";
import { TrendingUp, TrendingDown, Package, ShoppingBag } from "lucide-react";
import { formatARS } from "@/lib/utils";
import MetricCard from "./MetricCard";
import TopProductsTable from "./TopProductsTable";
import LowStockAlert from "./LowStockAlert";
import SalesChart from "./SalesChart";
import type { DashboardMetrics } from "@/types";

type Period = "today" | "week" | "month" | "all";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "HOY" },
  { value: "week",  label: "SEMANA" },
  { value: "month", label: "MES" },
  { value: "all",   label: "TODO" },
];

export default function DashboardClient() {
  const [activePeriod, setActivePeriod] = useState<Period>("month");

  const { data, isLoading } = useSWR<DashboardMetrics>(
    `/api/admin/dashboard?period=${activePeriod}`,
    fetcher,
    { refreshInterval: 30_000 }
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="label-tag text-muted-foreground text-[10px] mb-1">PANEL</p>
          <h1 className="font-playfair text-5xl">Dashboard</h1>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setActivePeriod(p.value)}
              className={`label-tag text-[10px] px-4 py-2 border transition-colors ${
                activePeriod === p.value
                  ? "bg-olive-dark text-cream border-olive-dark"
                  : "border-border hover:border-olive-mid text-muted-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="FACTURACIÓN"
          value={isLoading ? "—" : formatARS(data?.revenue ?? 0)}
          icon={TrendingUp}
          variant="positive"
        />
        <MetricCard
          label="GANANCIA NETA"
          value={isLoading ? "—" : formatARS(data?.net_profit ?? 0)}
          sub={data ? `Margen: ${data.margin_avg}%` : undefined}
          icon={TrendingUp}
          variant={data && data.net_profit >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          label="GASTOS"
          value={isLoading ? "—" : formatARS(data?.expenses_total ?? 0)}
          icon={TrendingDown}
          variant="negative"
        />
        <MetricCard
          label="VENTAS"
          value={isLoading ? "—" : String(data?.sales_count ?? 0)}
          icon={ShoppingBag}
        />
      </div>

      {/* Stock values */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="STOCK (COSTO)"
          value={isLoading ? "—" : formatARS(data?.stock_value_cost ?? 0)}
          icon={Package}
        />
        <MetricCard
          label="STOCK (VENTA)"
          value={isLoading ? "—" : formatARS(data?.stock_value_sale ?? 0)}
          icon={Package}
          variant="positive"
        />
      </div>

      {/* Chart */}
      {data?.sales_by_day && data.sales_by_day.length > 0 && (
        <div className="bg-card border border-border p-6">
          <p className="label-tag text-[10px] text-muted-foreground mb-4">VENTAS POR DÍA</p>
          <SalesChart data={data.sales_by_day} />
        </div>
      )}

      {/* Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6">
          <p className="label-tag text-[10px] text-muted-foreground mb-4">TOP PRODUCTOS</p>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-muted animate-pulse" />)}
            </div>
          ) : (
            <TopProductsTable products={data?.top_products ?? []} />
          )}
        </div>
        <div className="bg-card border border-border p-6">
          <p className="label-tag text-[10px] text-muted-foreground mb-4">STOCK BAJO</p>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-muted animate-pulse" />)}
            </div>
          ) : (
            <LowStockAlert items={data?.low_stock ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
