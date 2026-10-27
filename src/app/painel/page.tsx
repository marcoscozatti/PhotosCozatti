import Link from "next/link";
import { CalendarDays, MapPin, Plus, ShoppingCart } from "lucide-react";
import { FeeSimulator } from "@/components/FeeSimulator";
import { SalesChart } from "@/components/SalesChart";
import { Card, EmptyState, StatCard, btnBrand, btnPrimary } from "@/components/ui";
import { getDashboard, getProfile } from "@/lib/data";
import { brl, dataHora } from "@/lib/format";

export default async function InicioPage() {
  const [{ profile }, d] = await Promise.all([getProfile(), getDashboard()]);
  const primeiroNome = (profile.full_name ?? "").split(" ")[0] || "fotógrafo";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold">Olá, {primeiroNome}! 👋</h1>
        <Link href="/painel/albuns?novo=1" className={btnPrimary}>
          <Plus size={18} /> Criar álbum
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total de ganhos" value={brl(d.totalGanhos)} />
        <StatCard label="Ganhos no mês" value={brl(d.ganhosMes)} />
        <StatCard label="Últimos 7 dias" value={brl(d.ganhos7Dias)} />
        <StatCard label="Carrinhos abertos" value={String(d.carrinhos)} />
        <StatCard label="A receber" value={brl(d.aReceber)} />
        <StatCard label="Visitas nos álbuns" value={String(d.visitas)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 font-semibold">Desempenho — últimos 7 dias</h2>
          <SalesChart data={d.serie} />
        </Card>

        <Card className="flex flex-col">
          <h2 className="font-semibold">Carteira</h2>
          <p className="mt-6 text-sm text-zinc-500">Saldo disponível</p>
          <p className="text-4xl font-bold text-emerald-600">{brl(d.saldo)}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-zinc-500">Ganhos no mês</p>
              <p className="font-semibold">{brl(d.ganhosMes)}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-zinc-500">A receber</p>
              <p className="font-semibold">{brl(d.aReceber)}</p>
            </div>
          </div>
          <Link href="/painel/financeiro" className={`${btnBrand} mt-auto w-full pt-2.5`}>
            Sacar via Pix
          </Link>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Últimas vendas</h2>
            <Link href="/painel/financeiro" className="text-sm text-brand-600">Ver tudo</Link>
          </div>
          {d.ultimasVendas.length === 0 ? (
            <EmptyState icon={<ShoppingCart size={48} />} title="Nenhuma venda ainda"
              text="Compartilhe o link do seu álbum no WhatsApp e no Instagram para vender mais." />
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {d.ultimasVendas.map((v) => (
                <li key={v.id} className="flex justify-between py-3 text-sm">
                  <span>
                    <span className="block font-medium">{v.customer_email}</span>
                    <span className="text-zinc-500">{dataHora(v.paid_at ?? v.created_at)}</span>
                  </span>
                  <span className="font-semibold text-emerald-600">+{brl(v.photographer_amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="rounded-2xl bg-ink p-5 text-white">
          <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-ink">TAXA TRANSPARENTE</span>
          <h2 className="mt-4 font-serif text-2xl font-bold">Taxa de {Number(profile.fee_percent)}%, e você decide quem paga.</h2>
          <div className="mt-5 rounded-xl bg-white p-4 text-ink">
            <FeeSimulator fee={Number(profile.fee_percent)} />
          </div>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Próximos eventos</h2>
            <Link href="/painel/eventos" className="text-sm text-brand-600">Ver tudo</Link>
          </div>
          <ul className="mt-4 space-y-4">
            {d.eventos.map((e) => (
              <li key={e.id} className="text-sm">
                <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600">{e.category}</span>
                <p className="mt-1 font-semibold">{e.title}</p>
                <p className="flex items-center gap-1 text-zinc-500">
                  <CalendarDays size={14} /> {dataHora(e.starts_at)}
                  <MapPin size={14} className="ml-2" /> {e.city} - {e.state}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
