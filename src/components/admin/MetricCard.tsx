import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  variant?: "default" | "positive" | "negative";
}

export default function MetricCard({ label, value, sub, icon: Icon, variant = "default" }: Props) {
  const valueClass =
    variant === "positive"
      ? "text-celina-success"
      : variant === "negative"
      ? "text-celina-error"
      : "text-foreground";

  return (
    <div className="bg-card border border-border px-5 py-5">
      <div className="flex items-start justify-between gap-2">
        <p className="label-tag text-[10px] text-muted-foreground">{label}</p>
        {Icon && <Icon size={16} className="text-muted-foreground shrink-0" />}
      </div>
      <p className={`font-playfair text-3xl mt-2 ${valueClass}`}>{value}</p>
      {sub && <p className="label-tag text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
