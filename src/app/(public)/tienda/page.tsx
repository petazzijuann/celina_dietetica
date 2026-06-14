import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import type { ProductPublic } from "@/types";
import TiendaHeader from "@/components/public/TiendaHeader";
import FiltrosBarra from "@/components/public/FiltrosBarra";
import TiendaProductGrid from "@/components/public/TiendaProductGrid";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Explorá todos nuestros productos naturales. Semillas, cereales, granola, especias y más.",
};

export const revalidate = 3600;

async function getAllProducts(): Promise<ProductPublic[]> {
  const products = await prisma.product.findMany({
    where: { is_published: true },
    orderBy: { created_at: "desc" },
  });

  return products.map((p) => ({
    id:             p.id,
    name:           p.name,
    slug:           p.slug,
    description:    p.description,
    category:       p.category as ProductPublic["category"],
    images:         p.images,
    tags:           p.tags,
    price_sale:     Number(p.price_sale),
    stock:          p.stock as Record<string, number>,
    color_variants: p.color_variants as unknown as ProductPublic["color_variants"],
    is_published:   p.is_published,
    created_at:     p.created_at.toISOString(),
    updated_at:     p.updated_at.toISOString(),
  }));
}

export default async function TiendaPage() {
  const products = await getAllProducts();

  return (
    <div className="bg-cream min-h-screen">
      <TiendaHeader count={products.length} />
      <FiltrosBarra />
      <TiendaProductGrid initialProducts={products} />
    </div>
  );
}
