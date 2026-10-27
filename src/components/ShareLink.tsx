"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export function ShareLink({ url, titulo }: { url: string; titulo: string }) {
  const [copiado, setCopiado] = useState(false);
  const textoWhats = encodeURIComponent(`Suas fotos do ${titulo} estão aqui 📸 ${url}`);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copie o link:", url);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5">
        <span className="flex-1 truncate font-mono text-sm">{url}</span>
        <button onClick={copiar} className="flex items-center gap-1 text-sm font-semibold text-brand-600">
          {copiado ? <Check size={16} /> : <Copy size={16} />} {copiado ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={`https://wa.me/?text=${textoWhats}`} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white">
          Enviar no WhatsApp
        </a>
        <a href={url} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold">
          <ExternalLink size={16} /> Ver como cliente
        </a>
      </div>
    </div>
  );
}
