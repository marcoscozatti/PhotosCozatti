import { Aviso } from "@/components/Aviso";
import { SalesChart } from "@/components/SalesChart";
import { Card, PageHeader, StatCard, btnBrand, input } from "@/components/ui";
import { getFinance } from "@/lib/data";
import { brl, dataHora } from "@/lib/format";
import { solicitarSaque } from "../actions";

const STATUS_VENDA: Record<string, string> = { paid: "Pago", pending: "Aguardando", refunded: "Reembolsado", cancelled: "Cancelado" };
const STATUS_SAQUE = { requested: "Solicitado", paid: "Pago", rejected: "Recusado" } as const;

type Props = { searchParams: Promise<{ erro?: string; ok?: string }> };

export default async function FinanceiroPage({ searchParams }: Props) {
  const { erro, ok } = await searchParams;
  const f = await getFinance();

  return (
    <>
      <PageHeader title="Financeiro" />
      <Aviso erro={erro} ok={ok ? "Saque solicitado! O Pix cai em até 1 dia útil." : undefined} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Saldo disponível" value={brl(f.saldo)} destaque />
        <StatCard label="Ganhos no mês" value={brl(f.ganhosMes)} />
        <StatCard label="A receber" value={brl(f.aReceber)} />
        <StatCard label="Total de ganhos" value={brl(f.totalGanhos)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 font-semibold">Desempenho — últimos 30 dias</h2>
          <SalesChart data={f.serie} />
        </Card>
        <Card>
          <h2 className="font-semibold">Sacar via Pix</h2>
          <p className="mt-1 text-sm text-zinc-500">Disponível: {brl(f.saldo)}</p>
          <form action={solicitarSaque} className="mt-4 space-y-3">
            <input name="amount" required inputMode="decimal" placeholder="Valor (ex.: 50,00)" className={input} />
            <input name="pix_key" required placeholder="Sua chave Pix" className={input} />
            <button className={`${btnBrand} w-full`} disabled={f.saldo <= 0}>Solicitar saque</button>
          </form>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Vendas</h2>
          {f.vendas.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma venda ainda.</p> : (
            <ul className="divide-y divide-zinc-100 text-sm">
              {f.vendas.map((v) => (
                <li key={v.id} className="flex justify-between py-3">
                  <span>
                    <span className="block font-medium">{v.customer_email}</span>
                    <span className="text-zinc-500">{dataHora(v.created_at)} · {STATUS_VENDA[v.status] ?? v.status}</span>
                  </span>
                  <span className="text-right">
                    <span className="block font-semibold">{brl(v.photographer_amount)}</span>
                    <span className="text-xs text-zinc-500">de {brl(v.subtotal)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Saques</h2>
          {f.saques.length === 0 ? <p className="text-sm text-zinc-500">Nenhum saque solicitado.</p> : (
            <ul className="divide-y divide-zinc-100 text-sm">
              {f.saques.map((s) => (
                <li key={s.id} className="flex justify-between py-3">
                  <span>
                    <span className="block font-medium">Pix: {s.pix_key}</span>
                    <span className="text-zinc-500">{dataHora(s.created_at)} · {STATUS_SAQUE[s.status]}</span>
                  </span>
                  <span className="font-semibold">{brl(s.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
