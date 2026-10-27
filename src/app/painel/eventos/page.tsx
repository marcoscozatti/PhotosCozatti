import Link from "next/link";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { Aviso } from "@/components/Aviso";
import { Card, EmptyState, PageHeader, btnPrimary, input } from "@/components/ui";
import { getEvents, type AbaEventos } from "@/lib/data";
import { dataHora } from "@/lib/format";
import { alternarInscricao, criarEvento } from "../actions";

const ABAS: { id: AbaEventos; label: string }[] = [
  { id: "disponiveis", label: "Eventos disponíveis" },
  { id: "inscritos", label: "Eventos inscritos" },
  { id: "meus", label: "Meus eventos" },
];

// Cores de capa por categoria, enquanto o evento não tem imagem.
const CAPAS: Record<string, string> = {
  Esportes: "from-emerald-600 to-emerald-900",
  Festas: "from-indigo-600 to-fuchsia-800",
  Corrida: "from-orange-500 to-red-700",
  Shows: "from-purple-600 to-zinc-900",
};

type Props = { searchParams: Promise<{ aba?: string; novo?: string; cidade?: string; erro?: string }> };

export default async function EventosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const aba = (ABAS.some((a) => a.id === sp.aba) ? sp.aba : "disponiveis") as AbaEventos;
  const todos = await getEvents(aba);
  const eventos = sp.cidade
    ? todos.filter((e) => e.city?.toLowerCase().includes(sp.cidade!.toLowerCase()))
    : todos;

  return (
    <>
      <PageHeader
        title="Eventos"
        action={
          <Link href={`/painel/eventos?aba=${aba}&novo=1`} className={btnPrimary}>
            <Plus size={18} /> Novo evento
          </Link>
        }
      />
      <Aviso erro={sp.erro} />

      {sp.novo && (
        <Card className="mb-6">
          <h2 className="mb-4 font-semibold">Novo evento</h2>
          <form action={criarEvento} className="grid gap-4 md:grid-cols-4">
            <input name="title" required placeholder="Nome do evento" className={`${input} md:col-span-2`} />
            <input name="starts_at" type="datetime-local" required className={input} />
            <select name="category" className={input}>
              {["Esportes", "Corrida", "Festas", "Shows", "Formaturas", "Outros"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input name="city" placeholder="Cidade" className={`${input} md:col-span-2`} />
            <input name="state" placeholder="UF" maxLength={2} className={input} />
            <button className={btnPrimary}>Salvar evento</button>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-5 flex gap-6 overflow-x-auto border-b border-zinc-100">
          {ABAS.map((a) => (
            <Link key={a.id} href={`/painel/eventos?aba=${a.id}`}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-semibold ${
                aba === a.id ? "border-brand-500 text-ink" : "border-transparent text-zinc-500"
              }`}>
              {a.label}
            </Link>
          ))}
        </div>

        <form className="mb-6 flex max-w-sm gap-2">
          <input type="hidden" name="aba" value={aba} />
          <input name="cidade" defaultValue={sp.cidade} placeholder="Filtrar por cidade" className={input} />
        </form>

        {eventos.length === 0 ? (
          <EmptyState icon={<CalendarDays size={48} />} title="Nenhum evento aqui"
            text="Crie um evento ou inscreva-se em um evento disponível." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {eventos.map((e) => (
              <div key={e.id} className="overflow-hidden rounded-xl border border-zinc-200">
                <div className={`relative grid h-36 place-items-center bg-gradient-to-br p-4 text-center font-serif text-lg font-bold text-white ${CAPAS[e.category] ?? "from-zinc-600 to-zinc-900"}`}>
                  {e.category}
                  {!e.registrations_open && (
                    <span className="absolute inset-x-0 bottom-0 bg-red-500/90 py-1 text-xs font-sans font-semibold">Inscrições encerradas</span>
                  )}
                </div>
                <div className="space-y-2 p-4 text-sm">
                  <p className="font-semibold">{e.title}</p>
                  <p className="flex items-center gap-1 text-zinc-500"><MapPin size={14} /> {e.city} - {e.state}</p>
                  <p className="flex items-center gap-1 text-zinc-500"><CalendarDays size={14} /> {dataHora(e.starts_at)}</p>
                  {e.registrations_open && (
                    <form action={alternarInscricao}>
                      <input type="hidden" name="event_id" value={e.id} />
                      <input type="hidden" name="inscrito" value={e.registered ? "1" : "0"} />
                      <button className={`mt-2 w-full rounded-lg py-2 text-sm font-semibold ${
                        e.registered ? "bg-zinc-100 text-zinc-700" : "bg-brand-500 text-ink"}`}>
                        {e.registered ? "Cancelar inscrição" : "Quero fotografar"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
