import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff, Trash2 } from "lucide-react";
import { PhotoUploader } from "@/components/PhotoUploader";
import { ShareLink } from "@/components/ShareLink";
import { Card } from "@/components/ui";
import { brl, dataLonga } from "@/lib/format";
import { getOrigin, isUuid, previewUrl } from "@/lib/site";
import { getSession } from "@/lib/supabase/server";
import { apagarFoto } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function AlbumPage({ params }: Props) {
  const { id } = await params;
  const s = await getSession();
  if (!s) {
    return (
      <Card>
        <p className="text-sm text-zinc-600">No modo demonstração não é possível enviar fotos. Entre na sua conta.</p>
      </Card>
    );
  }
  if (!isUuid(id)) notFound();

  const [{ data: album }, { data: fotos }] = await Promise.all([
    s.supabase.from("albums").select("*").eq("id", id).single(),
    s.supabase.from("photos").select("id, preview_path, file_name").eq("album_id", id).order("created_at"),
  ]);
  if (!album) notFound();

  const link = `${await getOrigin()}/a/${album.id}`;
  const listaFotos = fotos ?? [];

  return (
    <>
      <Link href="/painel/albuns" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-ink">
        <ArrowLeft size={16} /> Álbuns
      </Link>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">{album.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {dataLonga(album.album_date + "T12:00:00")} · {album.city ?? "Sem cidade"} · {album.category} ·{" "}
          {brl(Number(album.price_per_photo))} por foto · {album.views} visitas
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 font-semibold">Enviar fotos</h2>
          <PhotoUploader albumId={album.id} userId={s.user.id} />
        </Card>
        <Card>
          <h2 className="font-semibold">Link para os clientes</h2>
          <p className="mb-4 mt-1 text-sm text-zinc-500">
            Mande este link. O cliente vê as fotos com marca d&apos;água e escolhe as que quer.
          </p>
          <ShareLink url={link} titulo={album.title} />
          {album.status !== "active" && (
            <p className="mt-3 text-sm text-red-600">Este álbum não está ativo, então o link não abre para clientes.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 font-semibold">Fotos do álbum ({listaFotos.length})</h2>
        {listaFotos.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center text-zinc-400">
            <ImageOff size={40} />
            <p className="mt-2 text-sm">Nenhuma foto ainda. Envie as primeiras acima.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {listaFotos.map((f, i) => (
              <div key={f.id} className="group relative overflow-hidden rounded-lg bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl(f.preview_path)} alt={f.file_name ?? `Foto ${i + 1}`} loading="lazy"
                  className="aspect-[4/3] w-full object-cover" />
                <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">#{i + 1}</span>
                <form action={apagarFoto} className="absolute right-2 top-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                  <input type="hidden" name="photo_id" value={f.id} />
                  <input type="hidden" name="album_id" value={album.id} />
                  <button title="Apagar foto" className="rounded bg-white/90 p-1.5 text-red-600 shadow">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
