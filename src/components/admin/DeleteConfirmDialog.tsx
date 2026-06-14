"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background w-full max-w-md p-6 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle size={20} className="text-celina-error shrink-0 mt-0.5" />
            <div>
              <Dialog.Title className="font-playfair text-xl mb-1">{title}</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground font-dm-sans">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Dialog.Close asChild>
              <button className="px-5 py-2.5 border border-border label-tag text-[11px] hover:bg-muted transition-colors">
                CANCELAR
              </button>
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-5 py-2.5 bg-celina-error text-white label-tag text-[11px] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "ELIMINANDO..." : "ELIMINAR"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
