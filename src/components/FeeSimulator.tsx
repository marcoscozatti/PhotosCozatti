"use client";

import { useState } from "react";
import { brl } from "@/lib/format";

/** Mostra, de forma transparente, quanto o fotógrafo recebe em cada venda. */
export function FeeSimulator({ fee }: { fee: number }) {
  const [preco, setPreco] = useState(50);
  const [parteCliente, setParteCliente] = useState(0);

  const taxaTotal = (preco * fee) / 100;
  const clientePaga = (preco * parteCliente) / 100;
  const voceRecebe = preco - (taxaTotal - clientePaga);

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="flex justify-between text-sm">
          Preço da venda <strong>{brl(preco)}</strong>
        </span>
        <input type="range" min={1} max={500} value={preco} onChange={(e) => setPreco(+e.target.value)}
          className="mt-2 w-full accent-amber-500" />
      </label>
      <label className="block">
        <span className="flex justify-between text-sm">
          Quanto da taxa o cliente paga <strong>{parteCliente}%</strong>
        </span>
        <input type="range" min={0} max={fee} step={0.5} value={parteCliente}
          onChange={(e) => setParteCliente(+e.target.value)} className="mt-2 w-full accent-amber-500" />
      </label>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-zinc-50 p-3">
          <p className="text-zinc-500">Cliente paga</p>
          <p className="text-lg font-bold">{brl(preco + clientePaga)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-emerald-700">Você recebe</p>
          <p className="text-lg font-bold text-emerald-700">{brl(voceRecebe)}</p>
        </div>
      </div>
    </div>
  );
}
