"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Camera, Home, Images, Wallet } from "lucide-react";

const LINKS = [
  { href: "/painel", label: "Início", icon: Home },
  { href: "/painel/albuns", label: "Álbuns", icon: Images },
  { href: "/painel/eventos", label: "Eventos", icon: Calendar },
  { href: "/painel/financeiro", label: "Financeiro", icon: Wallet },
];

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-ink">
        <Camera size={20} />
      </span>
      <span className={`whitespace-nowrap font-serif text-base font-bold uppercase tracking-wide ${dark ? "text-white" : "text-ink"}`}>
        Photos Cozatti
      </span>
    </Link>
  );
}

export function Sidebar() {
  const path = usePathname();
  return (
    <>
      {/* Desktop: menu lateral */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-ink px-4 py-6 lg:flex">
        <Logo dark />
        <nav className="mt-10 flex flex-col gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const ativo = href === "/painel" ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  ativo ? "bg-brand-500 text-ink" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl bg-white/5 p-4 text-sm text-zinc-300">
          <p className="font-semibold text-white">Plano Pro</p>
          <p className="mt-1">Taxa menor e site com domínio próprio.</p>
          <span className="mt-3 inline-block text-brand-400">Em breve</span>
        </div>
      </aside>

      {/* Celular: barra inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-zinc-200 bg-white lg:hidden">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const ativo = href === "/painel" ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2 text-xs ${ativo ? "text-brand-600" : "text-zinc-500"}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
