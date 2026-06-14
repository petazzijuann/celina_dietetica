"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import type { ProductPublic } from "@/types";

interface Props {
  initialProducts: ProductPublic[];
}

function GridInner({ initialProducts }: Props) {
  const searchParams = useSearchParams();
  const categoria = searchParams.get("categoria") ?? "";

  const filtered = useMemo(() => {
    if (!categoria) return initialProducts;
    return initialProducts.filter((p) => p.category === categoria);
  }, [initialProducts, categoria]);

  if (filtered.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="font-playfair text-2xl text-muted-foreground mb-2">Sin productos</p>
        <p className="text-sm text-muted-foreground font-dm-sans">
          No hay productos en esta categoría todavía.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default function TiendaProductGrid({ initialProducts }: Props) {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      }
    >
      <GridInner initialProducts={initialProducts} />
    </Suspense>
  );
}
