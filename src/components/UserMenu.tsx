"use client";

import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";

type Props = { name: string; email: string; plan: string; fee: number; demo: boolean };

export function UserMenu({ name, email, plan, fee, demo }: Props) {
  const [aberto, setAberto] = useState(false);
  const iniciais = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-sm"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-bold text-white">
          {iniciais || "PC"}
        </span>
        <ChevronDown size={16} className={aberto ? "rotate-180 transition" : "transition"} />
      </button>

      {aberto && (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-zinc-500">{email}</p>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm">
            <span>Plano {plan === "pro" ? "Pro" : "Grátis"}</span>
            <span className="font-semibold">Taxa {fee}%</span>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-zinc-700">
            {["Configurações", "Meu site", "Estatísticas", "Materiais de apoio"].map((item) => (
              <li key={item} className="flex justify-between rounded-md px-2 py-1.5 hover:bg-zinc-50">
                {item} <span className="text-xs text-zinc-400">em breve</span>
              </li>
            ))}
          </ul>
          {!demo && (
            <form action="/auth/sair" method="post" className="mt-3 border-t border-zinc-100 pt-3">
              <button className="flex items-center gap-2 text-sm font-medium text-red-600">
                <LogOut size={16} /> Sair da conta
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
