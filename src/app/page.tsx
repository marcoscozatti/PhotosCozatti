import Image from "next/image";
import Link from "next/link";
import { Camera, ScanFace, Share2, Wallet } from "lucide-react";
import { Logo } from "@/components/Sidebar";
import { btnBrand } from "@/components/ui";

const PASSOS = [
  { icon: Camera, titulo: "Suba as fotos do evento", texto: "Crie um álbum, envie as fotos e defina o preço. A marca d'água é automática." },
  { icon: Share2, titulo: "Compartilhe o link", texto: "Mande no WhatsApp e no Instagram. O cliente abre direto no celular." },
  { icon: ScanFace, titulo: "Cliente se acha por selfie", texto: "O reconhecimento facial mostra só as fotos em que ele aparece." },
  { icon: Wallet, titulo: "Receba por Pix", texto: "Taxa transparente e saque rápido para a sua conta." },
];

export default function Home() {
  return (
    <div className="bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="font-medium">Entrar</Link>
          <Link href="/login?modo=cadastro" className={btnBrand}>Criar conta grátis</Link>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-35" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">Para fotógrafos de eventos</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold sm:text-6xl">
            Venda suas fotos. Seu cliente se encontra por uma selfie.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-zinc-300">
            Corridas, jogos, shows, formaturas e ensaios. Você fotografa, a Photos Cozatti vende e você recebe por Pix.
          </p>
          <Link href="/login?modo=cadastro" className={`${btnBrand} mt-10 px-8 py-4 text-base`}>Começar grátis</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center font-serif text-3xl font-bold">Como funciona</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="rounded-2xl border border-zinc-200 p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-600"><Icon /></span>
              <h3 className="mt-4 font-semibold">{titulo}</h3>
              <p className="mt-2 text-sm text-zinc-600">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f6f5f3]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
          <Image src="/marcos-cozatti.jpeg" alt="Marcos Cozatti, fundador" width={480} height={480}
            className="mx-auto aspect-square w-full max-w-sm rounded-2xl object-cover shadow-lg" />
          <div>
            <h2 className="font-serif text-3xl font-bold">Feito por fotógrafo, para fotógrafos</h2>
            <p className="mt-4 text-zinc-600">
              A Photos Cozatti nasceu da experiência de Marcos Cozatti com mais de 10 anos atrás das lentes.
              A ideia é simples: taxa justa, sistema estável e o seu trabalho em primeiro lugar.
            </p>
            <Link href="/login?modo=cadastro" className={`${btnBrand} mt-8`}>Quero vender minhas fotos</Link>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Photos Cozatti · @photos.cozatti
      </footer>
    </div>
  );
}
