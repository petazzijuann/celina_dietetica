import type { StockMap } from "@/types";

interface LowStockItem {
  name: string;
  stock: StockMap;
  total_units: number;
}

interface Props {
  items: LowStockItem[];
}

export default function LowStockAlert({ items }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Sin alertas de stock.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
          <p className="text-sm font-medium truncate flex-1">{item.name}</p>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex gap-1">
              {Object.entries(item.stock).map(([size, qty]) => (
                <span
                  key={size}
                  className={`label-tag text-[9px] px-2 py-0.5 border ${
                    qty === 0
                      ? "border-celina-error/30 text-celina-error bg-celina-error/5"
                      : "border-yellow-300 text-yellow-700 bg-yellow-50"
                  }`}
                >
                  {size}: {qty}
                </span>
              ))}
            </div>
            <span className="label-tag text-[10px] text-celina-error">{item.total_units}u</span>
          </div>
        </div>
      ))}
    </div>
  );
}
