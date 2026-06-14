"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  name: string;
}

export default function ImageGallery({ images, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);

  function handleSelect(i: number) {
    if (i === activeIndex) return;
    setFade(false);
    setTimeout(() => {
      setActiveIndex(i);
      setFade(true);
    }, 150);
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-beige-sand/40 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square bg-beige-sand/30 overflow-hidden">
        <Image
          src={images[activeIndex]}
          alt={`${name} - imagen ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          style={{
            opacity: fade ? 1 : 0,
            transition: "opacity 0.15s ease",
          }}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`relative w-16 h-16 shrink-0 border-2 transition-colors overflow-hidden ${
                i === activeIndex
                  ? "border-olive-dark"
                  : "border-transparent hover:border-olive-mid"
              }`}
            >
              <Image src={img} alt={`${name} thumbnail ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
