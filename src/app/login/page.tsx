import Link from "next/link";
import { Logo } from "@/components/Sidebar";
import { btnPrimary, input } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cadastrar, entrar } from "./actions";

type Props = { searchParams: Promise<{ modo?: string; erro?: string; ok?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { modo, erro, ok } = await searchParams;
  const cadastro = modo === "cadastro";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-16">
        <Logo />
        <h1 className="mt-10 font-serif text-3xl font-bold">{cadastro ? "Crie sua conta de fotógrafo" : "Entrar no painel"}</h1>
        <p className="mt-2 text-zinc-500">
          {cadastro ? "Grátis. Comece a vender suas fotos hoje." : "Bem-vindo de volta."}
        </p>

        {!isSupabaseConfigured && (
          <p className="mt-6 rounded-lg bg-brand-100 px-4 py-3 text-sm text-amber-900">
            Modo demonstração: qualquer e-mail e senha abrem o painel com dados de exemplo.
          </p>
        )}
        {erro && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
        {ok && <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{ok}</p>}

        <form action={cadastro ? cadastrar : entrar} className="mt-8 max-w-sm space-y-4">
          {cadastro && <input name="full_name" required placeholder="Seu nome" className={input} />}
          <input name="email" type="email" required placeholder="E-mail" className={input} />
          <input name="password" type="password" required minLength={6} placeholder="Senha (mín. 6 caracteres)" className={input} />
          <button className={`${btnPrimary} w-full`}>{cadastro ? "Criar conta" : "Entrar"}</button>
        </form>

        <p className="mt-6 text-sm text-zinc-600">
          {cadastro ? "Já tem conta? " : "Ainda não tem conta? "}
          <Link href={cadastro ? "/login" : "/login?modo=cadastro"} className="font-semibold text-brand-600">
            {cadastro ? "Entrar" : "Cadastre-se grátis"}
          </Link>
        </p>
      </div>
      <div className="relative hidden bg-ink lg:block">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-50" />
        <div className="relative flex h-full flex-col justify-end p-16 text-white">
          <p className="font-serif text-4xl font-bold">“Seu cliente se encontra por uma selfie. Você recebe por Pix.”</p>
        </div>
      </div>
    </div>
  );
}
