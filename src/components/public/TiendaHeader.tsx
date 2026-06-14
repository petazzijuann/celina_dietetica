interface Props {
  count: number;
}

export default function TiendaHeader({ count }: Props) {
  return (
    <div className="bg-beige-sand py-10 px-4 border-b border-beige-warm">
      <div className="max-w-6xl mx-auto">
        <p className="label-tag text-[10px] text-muted-foreground mb-1">NUESTRA</p>
        <h1 className="font-playfair text-4xl mb-1">Tienda</h1>
        <p className="label-tag text-[10px] text-muted-foreground">
          {count} {count === 1 ? "producto" : "productos"}
        </p>
      </div>
    </div>
  );
}
