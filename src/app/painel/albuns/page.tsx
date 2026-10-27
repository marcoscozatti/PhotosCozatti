import Link from "next/link";
import { Images, Plus, Search } from "lucide-react";
import { Aviso } from "@/components/Aviso";
import { Card, EmptyState, PageHeader, btnPrimary, input } from "@/components/ui";
import { getAlbums } from "@/lib/data";
import { brl, dataLonga } from "@/lib/format";
import { criarAlbum } from "../actions";

const VISIBILIDADE = { listed: "Público", unlisted: "Não listado", portfolio: "Portfólio" } as const;
const STATUS = { active: "Ativo", draft: "Rascunho", archived: "Arquivado" } as const;
const CATEGORIAS = ["Ensaios", "Esportes", "Corrida", "Festas", "Casamentos", "Formaturas", "Shows", "Outros"];

type Props = { searchParams: Promise<{ novo?: string; q?: string; erro?: string }> };

export default async function AlbunsPage({ searchParams }: Props) {
  const { novo, q, erro } = await searchParams;
  const todos = await getAlbums();
  const albuns = q ? todos.filter((a) => a.title.toLowerCase().includes(q.toLowerCase())) : todos;

  return (
    <>
      <PageHeader
        title="Álbuns"
        action={
          <Link href="/painel/albuns?novo=1" className={btnPrimary}>
            <Plus size={18} /> Criar álbum
          </Link>
        }
      />
      <Aviso erro={erro} />

      {novo && (
        <Card className="mb-6">
          <h2 className="mb-4 font-semibold">Novo álbum</h2>
          <form action={criarAlbum} className="grid gap-4 md:grid-cols-3">
            <input name="title" required placeholder="Título do álbum" className={`${input} md:col-span-2`} />
            <input name="date" type="date" className={input} />
            <input name="city" placeholder="Cidade - UF" className={input} />
            <select name="category" className={input}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select name="visibility" className={input}>
              <option value="listed">Público (aparece na busca)</option>
              <option value="unlisted">Não listado (só com o link)</option>
              <option value="portfolio">Portfólio (não vende)</option>
            </select>
            <input name="price" inputMode="decimal" placeholder="Preço por foto (R$ 15,00)" className={input} />
            <div className="flex gap-3 md:col-span-2 md:justify-end">
              <Link href="/painel/albuns" className="rounded-lg px-4 py-2.5 text-sm text-zinc-600">Cancelar</Link>
              <button className={btnPrimary}>Salvar álbum</button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <form className="mb-4 flex max-w-md items-center gap-2 rounded-lg border border-zinc-300 px-3">
          <Search size={16} className="text-zinc-400" />
          <input name="q" defaultValue={q} placeholder="Buscar pelo título do álbum" className="w-full py-2.5 text-sm outline-none" />
        </form>

        {albuns.length === 0 ? (
          <EmptyState icon={<Images size={48} />} title="Nenhum álbum" text="Crie seu primeiro álbum e comece a vender suas fotos." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-zinc-500">
                <tr className="border-b border-zinc-100">
                  <th className="py-3 font-medium">Álbum</th>
                  <th className="font-medium">Data</th>
                  <th className="font-medium">Faturamento</th>
                  <th className="font-medium">Conversão</th>
                  <th className="font-medium">Fotos vendidas</th>
                  <th className="font-medium">Tipo</th>
                  <th className="font-medium">Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {albuns.map((a) => (
                  <tr key={a.id} className="border-b border-zinc-50">
                    <td className="py-3">
                      <Link href={`/painel/albuns/${a.id}`} className="font-semibold hover:text-brand-600">{a.title}</Link>
                      <p className="text-xs text-zinc-500">{a.city} · {a.category} · {brl(Number(a.price_per_photo))}/foto</p>
                    </td>
                    <td>{dataLonga(a.album_date + "T12:00:00")}</td>
                    <td>{brl(a.revenue ?? 0)}</td>
                    <td>{a.views ? (((a.photos_sold ?? 0) / a.views) * 100).toFixed(1) : "0"}%</td>
                    <td>{a.photos_sold ?? 0}</td>
                    <td><span className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-semibold text-white">{VISIBILIDADE[a.visibility]}</span></td>
                    <td><span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">● {STATUS[a.status]}</span></td>
                    <td className="text-right">
                      <Link href={`/painel/albuns/${a.id}`} className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-ink">
                        Fotos e link
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
