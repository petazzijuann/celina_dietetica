import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import type { ProductPublic } from "@/types";
import ProductPageClient from "@/components/public/ProductPageClient";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<ProductPublic | null> {
  const p = await prisma.product.findUnique({ where: { slug, is_published: true } });
  if (!p) return null;
  return {
    id:             p.id,
    name:           p.name,
    slug:           p.slug,
    description:    p.description,
    category:       p.category as ProductPublic["category"],
    images:         p.images,
    tags:           p.tags,
    price_sale:     Number(p.price_sale),
    stock:          p.stock as Record<string, number>,
    color_variants: p.color_variants as ProductPublic["color_variants"],
    is_published:   p.is_published,
    created_at:     p.created_at.toISOString(),
    updated_at:     p.updated_at.toISOString(),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { is_published: true },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return <ProductPageClient product={product} />;
}
