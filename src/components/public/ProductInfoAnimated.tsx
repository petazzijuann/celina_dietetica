"use client";

import { useEffect, useRef, useState } from "react";
import { formatARS } from "@/lib/utils";
import type { ProductPublic } from "@/types";

interface Props {
  product: ProductPublic;
}

export default function ProductInfoAnimated({ product }: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
      }}
    >
      <p className="label-tag text-[10px] text-muted-foreground mb-2">
        {product.category.toUpperCase()}
      </p>
      <h1 className="font-playfair text-3xl md:text-4xl mb-4 leading-tight">
        {product.name}
      </h1>
      <p className="price-text text-3xl text-olive-dark mb-6">
        {formatARS(product.price_sale)}
      </p>
      {product.description && (
        <p className="text-muted-foreground font-dm-sans leading-relaxed text-sm">
          {product.description}
        </p>
      )}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {product.tags.map((tag) => (
            <span key={tag} className="label-tag text-[10px] border border-beige-sand px-3 py-1 text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
