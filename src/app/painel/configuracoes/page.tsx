import { Aviso } from "@/components/Aviso";
import { Card, PageHeader, btnPrimary, input } from "@/components/ui";
import { getProfile } from "@/lib/data";
import { salvarPerfil } from "../actions";

type Props = { searchParams: Promise<{ erro?: string; ok?: string }> };

export default async function ConfiguracoesPage({ searchParams }: Props) {
  const { erro, ok } = await searchParams;
  const { profile, email } = await getProfile();
  const whatsapp = profile.whatsapp?.replace(/^55/, "") ?? "";

  return (
    <>
      <PageHeader title="Configurações" />
      <Aviso erro={erro} ok={ok ? "Dados salvos!" : undefined} />
      <Card className="max-w-2xl">
        <h2 className="font-semibold">Seus dados</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Aparecem na página do álbum. O WhatsApp é para onde chegam os pedidos dos clientes.
        </p>
        <form action={salvarPerfil} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            Nome que aparece para os clientes
            <input name="full_name" defaultValue={profile.full_name ?? ""} className={`${input} mt-1`} />
          </label>
          <label className="text-sm">
            WhatsApp (com DDD)
            <input name="whatsapp" defaultValue={whatsapp} inputMode="tel" placeholder="11 98656-6715" className={`${input} mt-1`} />
          </label>
          <label className="text-sm">
            Instagram
            <input name="instagram" defaultValue={profile.instagram ?? ""} placeholder="photos.cozatti" className={`${input} mt-1`} />
          </label>
          <label className="text-sm">
            Cidade
            <input name="city" defaultValue={profile.city ?? ""} placeholder="Jundiaí - SP" className={`${input} mt-1`} />
          </label>
          <label className="text-sm">
            E-mail da conta
            <input value={email} disabled className={`${input} mt-1 bg-zinc-50 text-zinc-500`} />
          </label>
          <div className="sm:col-span-2">
            <button className={btnPrimary}>Salvar</button>
          </div>
        </form>
      </Card>
    </>
  );
}
