import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma/client";

const BASE_URL = "https://dietetica-celina.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { is_published: true },
    select: { slug: true, updated_at: true },
  });

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/producto/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: BASE_URL,               lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${BASE_URL}/tienda`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...productUrls,
  ];
}
