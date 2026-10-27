"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { brl } from "@/lib/format";

type Foto = { id: string; url: string };
type Props = { fotos: Foto[]; preco: number; titulo: string; whatsapp: string | null };

export function PublicGallery({ fotos, preco, titulo, whatsapp }: Props) {
  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  const [aberta, setAberta] = useState<number | null>(null);

  const alternar = (i: number) =>
    setSelecionadas((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i].sort((a, b) => a - b)));

  useEffect(() => {
    if (aberta === null) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(null);
      if (e.key === "ArrowRight") setAberta((a) => (a === null ? a : Math.min(fotos.length - 1, a + 1)));
      if (e.key === "ArrowLeft") setAberta((a) => (a === null ? a : Math.max(0, a - 1)));
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberta, fotos.length]);

  const total = selecionadas.length * preco;
  const mensagem = encodeURIComponent(
    `Olá! Quero comprar as fotos ${selecionadas.map((i) => `#${i + 1}`).join(", ")} do álbum "${titulo}" (${brl(total)}).`,
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {fotos.map((f, i) => {
          const marcada = selecionadas.includes(i);
          return (
            <div key={f.id} className={`relative overflow-hidden rounded-lg bg-zinc-200 ring-4 transition ${marcada ? "ring-brand-500" : "ring-transparent"}`}>
              <button onClick={() => setAberta(i)} className="block w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={`Foto ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </button>
              <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">#{i + 1}</span>
              <button onClick={() => alternar(i)} aria-label={marcada ? "Remover da seleção" : "Selecionar foto"}
                className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border-2 border-white shadow ${
                  marcada ? "bg-brand-500 text-ink" : "bg-black/30 text-transparent"}`}>
                <Check size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {selecionadas.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white p-4 shadow-2xl">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <strong>{selecionadas.length}</strong> {selecionadas.length === 1 ? "foto selecionada" : "fotos selecionadas"} ·{" "}
              <strong>{brl(total)}</strong>
            </p>
            {whatsapp ? (
              <a href={`https://wa.me/${whatsapp}?text=${mensagem}`} target="_blank" rel="noreferrer"
                className="rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white">
                Comprar pelo WhatsApp
              </a>
            ) : (
              <span className="text-sm text-zinc-500">Compra online em breve.</span>
            )}
          </div>
        </div>
      )}

      {aberta !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4" onClick={() => setAberta(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotos[aberta].url} alt={`Foto ${aberta + 1}`} className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-4 text-white" aria-label="Fechar"><X size={32} /></button>
          {aberta > 0 && (
            <button className="absolute left-2 text-white" aria-label="Anterior"
              onClick={(e) => { e.stopPropagation(); setAberta(aberta - 1); }}><ChevronLeft size={44} /></button>
          )}
          {aberta < fotos.length - 1 && (
            <button className="absolute right-2 text-white" aria-label="Próxima"
              onClick={(e) => { e.stopPropagation(); setAberta(aberta + 1); }}><ChevronRight size={44} /></button>
          )}
          <button onClick={(e) => { e.stopPropagation(); alternar(aberta); }}
            className="absolute bottom-6 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-ink">
            {selecionadas.includes(aberta) ? "✓ Selecionada — remover" : `Selecionar foto #${aberta + 1}`}
          </button>
        </div>
      )}
    </>
  );
}
