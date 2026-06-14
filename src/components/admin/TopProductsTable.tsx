interface TopProduct {
  name: string;
  units_sold: number;
  profit_total: number;
  margin: number;
}

interface Props {
  products: TopProduct[];
}

export default function TopProductsTable({ products }: Props) {
  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Sin datos aún.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="border-b border-border">
            <th className="label-tag text-[10px] text-left text-muted-foreground py-2 pr-4">PRODUCTO</th>
            <th className="label-tag text-[10px] text-right text-muted-foreground py-2 pr-4">UNIDADES</th>
            <th className="label-tag text-[10px] text-right text-muted-foreground py-2 pr-4">GANANCIA</th>
            <th className="label-tag text-[10px] text-right text-muted-foreground py-2">MARGEN</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-3 pr-4 font-medium max-w-[200px] truncate">{p.name}</td>
              <td className="py-3 pr-4 text-right text-muted-foreground">{p.units_sold}</td>
              <td className="py-3 pr-4 text-right text-celina-success font-medium">
                {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(p.profit_total)}
              </td>
              <td className="py-3 text-right">
                <span className={`label-tag text-[10px] px-2 py-0.5 ${
                  p.margin >= 30
                    ? "bg-celina-success/10 text-celina-success"
                    : p.margin >= 15
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-celina-error/10 text-celina-error"
                }`}>
                  {p.margin}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
