import type { MetadataRoute } from "next";

const BASE_URL = "https://dietetica-celina.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tienda", "/producto/", "/contacto"],
        disallow: ["/admin", "/admin/", "/api/", "/login"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
