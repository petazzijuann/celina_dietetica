"use client";

import useSWR from "swr";
import { Download } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SubscribersTable() {
  const { data, isLoading } = useSWR<Subscriber[]>("/api/admin/subscribers", fetcher);

  function downloadCSV() {
    if (!data) return;
    const rows = [["Email", "Fecha"]];
    data.forEach((s) => rows.push([s.email, new Date(s.created_at).toLocaleDateString("es-AR")]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `celina-suscriptores-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label-tag text-muted-foreground text-[10px] mb-1">GESTIÓN</p>
          <h1 className="font-playfair text-5xl">Suscriptores</h1>
        </div>
        <button
          onClick={downloadCSV}
          disabled={!data || data.length === 0}
          className="label-tag text-[11px] px-5 py-3 border border-border hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-40"
        >
          <Download size={13} /> EXPORTAR CSV
        </button>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="label-tag text-[10px] text-muted-foreground text-left px-4 py-3">EMAIL</th>
              <th className="label-tag text-[10px] text-muted-foreground text-left px-4 py-3">FECHA</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse w-48" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse w-24" /></td>
                  </tr>
                ))
              : !data?.length
              ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Sin suscriptores todavía.
                    </td>
                  </tr>
                )
              : data.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
