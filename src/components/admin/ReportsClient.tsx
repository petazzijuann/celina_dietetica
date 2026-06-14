"use client";

import { useState } from "react";
import useSWR from "swr";
import { formatARS } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ReportSummary {
  revenue: number;
  cogs: number;
  profit: number;
  expenses_total: number;
  net_profit: number;
  margin: number;
  sales_count: number;
}

interface ReportData {
  summary: ReportSummary;
  by_category: Array<{ name: string; revenue: number; units: number }>;
  by_payment:  Array<{ method: string; revenue: number }>;
}

export default function ReportsClient() {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to,   setTo]   = useState(today);

  const { data, isLoading } = useSWR<ReportData>(
    `/api/admin/reports?from=${from}&to=${to}`,
    fetcher
  );

  const summary = data?.summary;
  const maxRevenueCat = Math.max(...(data?.by_category.map((c) => c.revenue) ?? [1]), 1);

  return (
    <div className="space-y-8">
      <div>
        <p className="label-tag text-muted-foreground text-[10px] mb-1">ANÁLISIS</p>
        <h1 className="font-playfair text-5xl">Reportes</h1>
      </div>

      {/* Date range */}
      <div className="bg-card border border-border p-5 flex items-end gap-4 flex-wrap">
        <div>
          <label className="label-tag text-[10px] block mb-1.5 text-muted-foreground">DESDE</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-olive-dark bg-background"
          />
        </div>
        <div>
          <label className="label-tag text-[10px] block mb-1.5 text-muted-foreground">HASTA</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-border px-3 py-2 text-sm focus:outline-none focus:border-olive-dark bg-background"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "FACTURACIÓN",  value: summary?.revenue,        color: "text-olive-dark" },
          { label: "GANANCIA BRUTA", value: summary?.profit,       color: "text-celina-success" },
          { label: "GASTOS",       value: summary?.expenses_total, color: "text-celina-error" },
          { label: "GANANCIA NETA", value: summary?.net_profit,    color: summary && summary.net_profit >= 0 ? "text-celina-success" : "text-celina-error" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border p-5">
            <p className="label-tag text-[10px] text-muted-foreground mb-2">{label}</p>
            <p className={`font-playfair text-2xl ${color}`}>
              {isLoading ? "—" : formatARS(value ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Extra stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5">
          <p className="label-tag text-[10px] text-muted-foreground mb-2">MARGEN BRUTO</p>
          <p className="font-playfair text-2xl">{isLoading ? "—" : `${summary?.margin ?? 0}%`}</p>
        </div>
        <div className="bg-card border border-border p-5">
          <p className="label-tag text-[10px] text-muted-foreground mb-2">VENTAS</p>
          <p className="font-playfair text-2xl">{isLoading ? "—" : summary?.sales_count ?? 0}</p>
        </div>
        <div className="bg-card border border-border p-5">
          <p className="label-tag text-[10px] text-muted-foreground mb-2">TICKET PROMEDIO</p>
          <p className="font-playfair text-2xl">
            {isLoading ? "—" : formatARS(
              summary && summary.sales_count > 0
                ? summary.revenue / summary.sales_count
                : 0
            )}
          </p>
        </div>
      </div>

      {/* By category */}
      {data?.by_category && data.by_category.length > 0 && (
        <div className="bg-card border border-border p-6">
          <p className="label-tag text-[10px] text-muted-foreground mb-4">FACTURACIÓN POR VARIANTE</p>
          <div className="space-y-2">
            {data.by_category
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 10)
              .map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="label-tag text-[10px] text-muted-foreground w-20 shrink-0 truncate">{cat.name}</span>
                  <div className="flex-1 relative h-5 bg-muted overflow-hidden">
                    <div
                      className="h-full bg-olive-dark/60 transition-all duration-500"
                      style={{ width: `${Math.round((cat.revenue / maxRevenueCat) * 100)}%` }}
                    />
                  </div>
                  <span className="label-tag text-[10px] text-right w-28 shrink-0">
                    {formatARS(cat.revenue)}
                    <span className="text-muted-foreground ml-1">({cat.units}u)</span>
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* By payment */}
      {data?.by_payment && data.by_payment.length > 0 && (
        <div className="bg-card border border-border p-6">
          <p className="label-tag text-[10px] text-muted-foreground mb-4">POR MÉTODO DE PAGO</p>
          <div className="space-y-2">
            {data.by_payment.map((p) => (
              <div key={p.method} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                <span className="label-tag text-[11px]">{p.method.toUpperCase()}</span>
                <span className="font-medium text-sm">{formatARS(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
