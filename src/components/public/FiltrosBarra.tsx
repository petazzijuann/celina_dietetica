"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const CATEGORIES = [
  { value: "",                  label: "Todos" },
  { value: "semillas",          label: "Semillas" },
  { value: "cereales",          label: "Cereales" },
  { value: "granola",           label: "Granola" },
  { value: "galletitas",        label: "Galletitas" },
  { value: "especias",          label: "Especias" },
  { value: "jugos",             label: "Jugos" },
  { value: "snacks-salados",    label: "Snacks" },
  { value: "frutas-desecadas",  label: "Frutas desecadas" },
  { value: "mermeladas",        label: "Mermeladas" },
  { value: "aceites",           label: "Aceites" },
  { value: "harina",            label: "Harinas" },
  { value: "pastelería",        label: "Pastelería" },
  { value: "alfajores",         label: "Alfajores" },
  { value: "mix",               label: "Mix" },
  { value: "barrita-de-cereales", label: "Barritas" },
];

function FiltrosInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("categoria") ?? "";

  function select(val: string) {
    if (val) {
      router.push(`/tienda?categoria=${val}`, { scroll: false });
    } else {
      router.push("/tienda", { scroll: false });
    }
  }

  return (
    <div className="bg-cream border-b border-beige-sand px-4 py-3">
      <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => select(cat.value)}
            className={`shrink-0 label-tag text-[10px] px-4 py-2 border transition-colors ${
              current === cat.value
                ? "bg-olive-dark text-cream border-olive-dark"
                : "bg-white border-beige-sand text-muted-foreground hover:border-olive-mid hover:text-foreground"
            }`}
          >
            {cat.label.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FiltrosBarra() {
  return (
    <Suspense fallback={<div className="h-14 bg-cream border-b border-beige-sand" />}>
      <FiltrosInner />
    </Suspense>
  );
}
