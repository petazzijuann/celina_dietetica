"use client";

import { formatARS } from "@/lib/utils";

interface DayData {
  date: string;
  revenue: number;
  profit: number;
}

interface Props {
  data: DayData[];
}

export default function SalesChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Sin datos para mostrar
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="space-y-2">
      {data.slice(-14).map((d, i) => {
        const revPct    = Math.round((d.revenue / maxRevenue) * 100);
        const profitPct = d.revenue > 0 ? Math.round((d.profit / d.revenue) * 100) : 0;
        const label     = new Date(d.date + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });

        return (
          <div key={i} className="flex items-center gap-3 group">
            <span className="label-tag text-[10px] text-muted-foreground w-10 shrink-0">{label}</span>
            <div className="flex-1 relative h-6 bg-muted rounded-none overflow-hidden">
              <div
                className="h-full bg-olive-dark transition-all duration-500"
                style={{ width: `${revPct}%` }}
              />
              {profitPct > 0 && (
                <div
                  className="absolute top-0 h-full bg-celina-success/40"
                  style={{ width: `${Math.round((d.profit / maxRevenue) * 100)}%` }}
                />
              )}
            </div>
            <div className="label-tag text-[10px] text-right shrink-0 w-28">
              <span className="text-foreground">{formatARS(d.revenue)}</span>
              {d.profit > 0 && (
                <span className="text-celina-success ml-1">(+{formatARS(d.profit)})</span>
              )}
            </div>
          </div>
        );
      })}

      <div className="flex gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-olive-dark" />
          <span className="label-tag text-[9px] text-muted-foreground">FACTURACIÓN</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-celina-success/40" />
          <span className="label-tag text-[9px] text-muted-foreground">GANANCIA</span>
        </div>
      </div>
    </div>
  );
}
