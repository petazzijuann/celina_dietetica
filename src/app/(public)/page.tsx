import HeroSection from "@/components/public/HeroSection";
import MarqueeSection from "@/components/public/MarqueeSection";
import CategoriesSection from "@/components/public/CategoriesSection";
import AnimatedProductGrid from "@/components/public/AnimatedProductGrid";
import AboutSection from "@/components/public/AboutSection";
import { prisma } from "@/lib/prisma/client";
import type { ProductPublic } from "@/types";

export const revalidate = 3600;

async function getFeaturedProducts(): Promise<ProductPublic[]> {
  const products = await prisma.product.findMany({
    where: { is_published: true },
    orderBy: { created_at: "desc" },
    take: 8,
  });

  return products.map((p) => ({
    id:            p.id,
    name:          p.name,
    slug:          p.slug,
    description:   p.description,
    category:      p.category as ProductPublic["category"],
    images:        p.images,
    tags:          p.tags,
    price_sale:    Number(p.price_sale),
    stock:         p.stock as Record<string, number>,
    color_variants: p.color_variants as unknown as ProductPublic["color_variants"],
    is_published:  p.is_published,
    created_at:    p.created_at.toISOString(),
    updated_at:    p.updated_at.toISOString(),
  }));
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <CategoriesSection />
      <AnimatedProductGrid
        title="Productos destacados"
        products={products}
        viewAllHref="/tienda"
      />
      <AboutSection />
    </>
  );
}
