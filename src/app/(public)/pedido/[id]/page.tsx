import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma/client";
import type { OrderItem, CustomerAddress } from "@/types";
import { formatARS } from "@/lib/utils";
import ProofUpload from "@/components/pedido/ProofUpload";

export const metadata: Metadata = { title: "Confirmación de pedido" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PedidoPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  const items   = order.items as unknown as OrderItem[];
  const address = order.customer_address as unknown as CustomerAddress;
  const cbu     = process.env.CBU             ?? "";
  const alias   = process.env.ALIAS_CBU       ?? "";
  const titular = process.env.TITULAR_CUENTA  ?? "";
  const phone   = process.env.CONTACT_PHONE   ?? "";

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-olive-dark py-12 px-4 text-center">
        <p className="label-tag text-beige-sand text-[10px] tracking-widest mb-3">PEDIDO CONFIRMADO</p>
        <h1 className="font-playfair text-4xl text-cream mb-2">¡Gracias por tu compra!</h1>
        <p className="text-cream/70 font-dm-sans">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Transfer info */}
        <div className="bg-white border border-beige-sand p-6">
          <p className="label-tag text-[10px] mb-5 text-muted-foreground">DATOS DE TRANSFERENCIA</p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Titular</span>
              <span className="text-sm font-medium">{titular}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CBU</span>
              <span className="text-sm font-mono font-medium">{cbu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Alias</span>
              <span className="text-sm font-medium">{alias}</span>
            </div>
            <div className="flex justify-between border-t border-beige-sand pt-3">
              <span className="text-sm font-medium">Total a transferir</span>
              <span className="price-text text-olive-dark">{formatARS(Number(order.total_amount))}</span>
            </div>
          </div>
        </div>

        {/* Proof upload */}
        <div className="bg-white border border-beige-sand p-6">
          <p className="label-tag text-[10px] mb-4 text-muted-foreground">ENVIANOS EL COMPROBANTE</p>
          <ProofUpload orderId={order.id} existingUrl={order.payment_proof_url} />
        </div>

        {/* WhatsApp */}
        {phone && (
          <div className="bg-white border border-beige-sand p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4 font-dm-sans">
              También podés enviarnos el comprobante por WhatsApp
            </p>
            <a
              href={`https://wa.me/${phone.replace(/\D/g, "")}?text=Hola!%20Acabo%20de%20hacer%20el%20pedido%20%23${order.id.slice(0, 8).toUpperCase()}%20y%20quiero%20enviar%20el%20comprobante.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-celina-success text-white px-8 py-3 label-tag text-[11px] hover:opacity-90 transition-opacity"
            >
              ABRIR WHATSAPP
            </a>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-white border border-beige-sand p-6">
          <p className="label-tag text-[10px] mb-4 text-muted-foreground">RESUMEN DEL PEDIDO</p>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.name}
                  <span className="text-muted-foreground"> ×{item.qty} — {item.size}{item.color ? ` · ${item.color}` : ""}</span>
                </span>
                <span className="price-text">{formatARS(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-beige-sand mt-4 pt-4">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span className="price-text text-olive-dark">{formatARS(Number(order.total_amount))}</span>
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-white border border-beige-sand p-6">
          <p className="label-tag text-[10px] mb-4 text-muted-foreground">TUS DATOS</p>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Nombre: </span>{order.customer_name}</p>
            <p><span className="text-muted-foreground">Email: </span>{order.customer_email}</p>
            <p><span className="text-muted-foreground">Teléfono: </span>{order.customer_phone}</p>
            <p><span className="text-muted-foreground">Dirección: </span>{address.street}, {address.city}, {address.province}</p>
          </div>
        </div>

        <Link
          href="/tienda"
          className="block text-center bg-olive-dark text-cream py-4 label-tag text-[11px] hover:bg-olive-mid transition-colors"
        >
          SEGUIR COMPRANDO
        </Link>
      </div>
    </div>
  );
}
