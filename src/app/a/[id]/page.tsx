import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { AtSign, Camera } from "lucide-react";
import { Logo } from "@/components/Sidebar";
import { PublicGallery } from "@/components/PublicGallery";
import { brl, dataLonga } from "@/lib/format";
import { isUuid, previewUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type AlbumPublico = {
  id: string;
  title: string;
  city: string | null;
  category: string;
  album_date: string;
  price_per_photo: number;
  photographer: { name: string | null; whatsapp: string | null; instagram: string | null };
  photos: { id: string; preview_path: string }[];
};

// cache(): a página e os metadados usam a mesma consulta (conta 1 visita, não 2).
const buscar = cache(async (id: string): Promise<AlbumPublico | null> => {
  if (!isSupabaseConfigured || !isUuid(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_album", { p_id: id });
  return (data as AlbumPublico) ?? null;
});

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const album = isUuid(id) && isSupabaseConfigured ? await buscar(id) : null;
  const titulo = album ? `${album.title} — Photos Cozatti` : "Álbum — Photos Cozatti";
  const imagem = album?.photos[0] ? previewUrl(album.photos[0].preview_path) : undefined;
  return {
    title: titulo,
    description: "Encontre e compre suas fotos.",
    openGraph: { title: titulo, description: "Encontre e compre suas fotos.", images: imagem ? [imagem] : [] },
  };
}

export default async function AlbumPublicoPage({ params }: Props) {
  const { id } = await params;
  const album = await buscar(id);
  if (!album) notFound();

  const fotos = album.photos.map((p) => ({ id: p.id, url: previewUrl(p.preview_path) }));
  const capa = fotos[0]?.url;

  return (
    <div className="min-h-screen bg-white pb-28">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
      </header>

      <section className="relative overflow-hidden bg-ink text-white">
        {capa && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={capa} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <span className="rounded bg-brand-500 px-2 py-0.5 text-xs font-bold text-ink">{album.category}</span>
          <h1 className="mt-3 font-serif text-3xl font-bold sm:text-5xl">{album.title}</h1>
          <p className="mt-3 text-zinc-300">
            {dataLonga(album.album_date + "T12:00:00")}
            {album.city ? ` · ${album.city}` : ""} · {fotos.length} fotos · {brl(Number(album.price_per_photo))} por foto
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
            <span className="flex items-center gap-1"><Camera size={16} /> {album.photographer.name ?? "Fotógrafo"}</span>
            {album.photographer.instagram && (
              <a href={`https://instagram.com/${album.photographer.instagram}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 hover:text-white">
                <AtSign size={16} /> {album.photographer.instagram}
              </a>
            )}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="mb-5 text-sm text-zinc-600">
          Toque numa foto para ampliar e marque o ✓ nas que você quer comprar.
        </p>
        {fotos.length === 0 ? (
          <p className="py-16 text-center text-zinc-500">As fotos deste álbum ainda estão sendo enviadas. Volte em breve!</p>
        ) : (
          <PublicGallery fotos={fotos} preco={Number(album.price_per_photo)} titulo={album.title}
            whatsapp={album.photographer.whatsapp} />
        )}
      </main>
    </div>
  );
}
