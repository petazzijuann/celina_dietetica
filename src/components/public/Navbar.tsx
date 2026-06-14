"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cart";
import SearchDropdown from "./SearchDropdown";

const CATEGORIAS = [
  { value: "semillas",          label: "Semillas" },
  { value: "cereales",          label: "Cereales" },
  { value: "galletitas",        label: "Galletitas" },
  { value: "especias",          label: "Especias" },
  { value: "jugos",             label: "Jugos" },
  { value: "snacks-salados",    label: "Snacks" },
  { value: "granola",           label: "Granola" },
  { value: "frutas-desecadas",  label: "Frutas desecadas" },
  { value: "mermeladas",        label: "Mermeladas" },
  { value: "aceites",           label: "Aceites" },
  { value: "harina",            label: "Harinas" },
  { value: "pastelería",        label: "Pastelería" },
  { value: "alfajores",         label: "Alfajores" },
  { value: "mix",               label: "Mix" },
];

export default function Navbar() {
  const { totalItems, openCart } = useCartStore();
  const count = totalItems();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [catOpen,     setCatOpen]     = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-cream border-b transition-shadow duration-200 ${
          scrolled ? "border-beige-sand shadow-sm" : "border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="Dietética Celina" fill className="object-contain" />
            </div>
            <span className="font-playfair text-xl text-olive-dark hidden sm:block">
              Dietética Celina
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/tienda"
              className="label-tag text-[11px] text-foreground hover:text-olive-dark transition-colors"
            >
              TIENDA
            </Link>

            {/* Categories dropdown */}
            <div ref={catRef} className="relative">
              <button
                onClick={() => setCatOpen((v) => !v)}
                className="label-tag text-[11px] text-foreground hover:text-olive-dark transition-colors flex items-center gap-1"
              >
                CATEGORÍAS <ChevronDown size={12} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-cream border border-beige-sand shadow-lg z-50">
                  <div className="py-2 grid grid-cols-1">
                    {CATEGORIAS.map((cat) => (
                      <Link
                        key={cat.value}
                        href={`/tienda?categoria=${cat.value}`}
                        onClick={() => setCatOpen(false)}
                        className="px-4 py-2 label-tag text-[10px] hover:bg-beige-sand transition-colors"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contacto"
              className="label-tag text-[11px] text-foreground hover:text-olive-dark transition-colors"
            >
              CONTACTO
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="text-foreground hover:text-olive-dark transition-colors"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>

            <button
              onClick={openCart}
              className="relative text-foreground hover:text-olive-dark transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-olive-dark text-cream text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden text-foreground hover:text-olive-dark transition-colors"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-beige-sand bg-cream px-4 py-3">
            <SearchDropdown onClose={() => setSearchOpen(false)} />
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-beige-sand bg-cream">
            <nav className="flex flex-col py-2">
              <Link
                href="/tienda"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3 label-tag text-[11px] hover:bg-beige-sand transition-colors"
              >
                TIENDA
              </Link>
              <div className="px-6 py-2">
                <p className="label-tag text-[10px] text-muted-foreground mb-2">CATEGORÍAS</p>
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIAS.map((cat) => (
                    <Link
                      key={cat.value}
                      href={`/tienda?categoria=${cat.value}`}
                      onClick={() => setMenuOpen(false)}
                      className="py-1.5 label-tag text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/contacto"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3 label-tag text-[11px] hover:bg-beige-sand transition-colors"
              >
                CONTACTO
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
