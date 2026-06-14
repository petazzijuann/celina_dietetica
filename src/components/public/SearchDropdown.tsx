"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatARS } from "@/lib/utils";
import type { ProductPublic } from "@/types";

interface Props {
  onClose: () => void;
}

export default function SearchDropdown({ onClose }: Props) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2) { setResults([]); return; }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  return (
    <div className="relative max-w-xl mx-auto">
      <div className="flex items-center gap-2 border border-beige-sand bg-white px-4 py-2">
        <Search size={16} className="text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
        {loading && <span className="text-xs text-muted-foreground">...</span>}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-cream border border-beige-sand border-t-0 shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-beige-sand transition-colors border-b border-beige-sand/50 last:border-0"
            >
              <div className="relative w-10 h-10 bg-beige-sand/30 shrink-0">
                {p.images[0] && (
                  <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="label-tag text-[10px] text-muted-foreground">{p.category}</p>
              </div>
              <span className="price-text text-sm shrink-0">{formatARS(p.price_sale)}</span>
            </Link>
          ))}
        </div>
      )}

      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 bg-cream border border-beige-sand border-t-0 px-4 py-6 text-center text-sm text-muted-foreground">
          Sin resultados para &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
