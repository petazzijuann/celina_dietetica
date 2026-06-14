"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { ProductPublic } from "@/types";

interface Props {
  title: string;
  products: ProductPublic[];
  viewAllHref?: string;
}

export default function AnimatedProductGrid({ title, products, viewAllHref }: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

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

  if (products.length === 0) return null;

  return (
    <section ref={ref} className="bg-cream py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="label-tag text-[10px] text-muted-foreground mb-2 tracking-widest">PRODUCTOS</p>
            <h2 className="font-playfair text-3xl">{title}</h2>
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="label-tag text-[11px] text-olive-dark border-b border-olive-dark hover:text-olive-mid hover:border-olive-mid transition-colors pb-0.5"
            >
              VER TODOS →
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 60}ms`,
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
