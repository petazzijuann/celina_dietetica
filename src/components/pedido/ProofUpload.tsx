"use client";

import { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";

interface Props {
  orderId: string;
  existingUrl: string | null;
}

export default function ProofUpload({ orderId, existingUrl }: Props) {
  const [url,       setUrl]       = useState<string | null>(existingUrl);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo no puede superar los 10MB");
      return;
    }

    setUploading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, orderId }),
      });
      setUploading(false);
      if (res.ok) {
        const data = await res.json();
        setUrl(data.url);
      } else {
        setError("Error al subir el comprobante. Intentá nuevamente.");
      }
    };
    reader.readAsDataURL(file);
  }

  if (url) {
    return (
      <div className="flex items-center gap-3 text-celina-success">
        <CheckCircle size={20} />
        <div>
          <p className="text-sm font-medium">Comprobante recibido</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs underline text-muted-foreground">
            Ver comprobante
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="flex flex-col items-center gap-3 border-2 border-dashed border-beige-warm hover:border-olive-mid transition-colors cursor-pointer py-8 px-4 text-center">
        <Upload size={24} className="text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            {uploading ? "Subiendo..." : "Subí tu comprobante"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG o PDF · Máx. 10MB</p>
        </div>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFile}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-celina-error text-xs mt-2">{error}</p>}
    </div>
  );
}
