"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Tamanhos: o original é reduzido para caber no plano grátis do Supabase (1 GB),
// mantendo qualidade de sobra para redes sociais e impressão até 20x30 cm.
const ORIGINAL_MAX = 3000;
const PREVIEW_MAX = 1200;
const ENVIOS_SIMULTANEOS = 3;

async function carregar(file: File) {
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

function desenhar(img: ImageBitmap, max: number) {
  const escala = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * escala);
  const h = Math.round(img.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return canvas;
}

function aplicarMarcaDagua(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const tamanho = Math.max(18, Math.round(canvas.width / 18));
  ctx.save();
  ctx.font = `bold ${tamanho}px Georgia, serif`;
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = Math.max(1, tamanho / 18);
  ctx.textAlign = "center";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 7);
  const passoY = tamanho * 3.2;
  const passoX = tamanho * 11;
  const alcance = Math.max(canvas.width, canvas.height);
  for (let y = -alcance; y <= alcance; y += passoY) {
    const desloc = (Math.round(y / passoY) % 2) * (passoX / 2);
    for (let x = -alcance; x <= alcance; x += passoX) {
      ctx.strokeText("PHOTOS COZATTI", x + desloc, y);
      ctx.fillText("PHOTOS COZATTI", x + desloc, y);
    }
  }
  ctx.restore();
}

function paraJpeg(canvas: HTMLCanvasElement, qualidade: number) {
  return new Promise<Blob>((ok, falha) =>
    canvas.toBlob((b) => (b ? ok(b) : falha(new Error("Não foi possível converter a imagem"))), "image/jpeg", qualidade),
  );
}

type Props = { albumId: string; userId: string };

export function PhotoUploader({ albumId, userId }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [total, setTotal] = useState(0);
  const [feitas, setFeitas] = useState(0);
  const [erros, setErros] = useState<string[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const enviando = total > 0 && feitas < total;

  async function enviarUma(file: File) {
    const supabase = createClient();
    const img = await carregar(file);
    const original = await paraJpeg(desenhar(img, ORIGINAL_MAX), 0.9);
    const previewCanvas = desenhar(img, PREVIEW_MAX);
    aplicarMarcaDagua(previewCanvas);
    const preview = await paraJpeg(previewCanvas, 0.8);

    const nome = `${crypto.randomUUID()}.jpg`;
    const pasta = `${userId}/${albumId}`;
    const up1 = await supabase.storage.from("originais").upload(`${pasta}/${nome}`, original, { contentType: "image/jpeg" });
    if (up1.error) throw up1.error;
    const up2 = await supabase.storage.from("previews").upload(`${pasta}/${nome}`, preview, { contentType: "image/jpeg" });
    if (up2.error) throw up2.error;

    const { error } = await supabase.from("photos").insert({
      album_id: albumId,
      owner_id: userId,
      storage_path: `${pasta}/${nome}`,
      preview_path: `${pasta}/${nome}`,
      width: previewCanvas.width,
      height: previewCanvas.height,
      file_name: file.name,
    });
    if (error) throw error;
  }

  async function enviar(lista: FileList | null) {
    const arquivos = Array.from(lista ?? []).filter((f) => f.type.startsWith("image/"));
    if (!arquivos.length || enviando) return;
    setTotal(arquivos.length);
    setFeitas(0);
    setErros([]);

    const fila = [...arquivos];
    const trabalhador = async () => {
      while (fila.length) {
        const file = fila.shift()!;
        try {
          await enviarUma(file);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          setErros((v) => [...v, `${file.name}: ${msg}`]);
        }
        setFeitas((v) => v + 1);
      }
    };
    await Promise.all(Array.from({ length: ENVIOS_SIMULTANEOS }, trabalhador));
    router.refresh();
  }

  const pct = total ? Math.round((feitas / total) * 100) : 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          enviar(e.dataTransfer.files);
        }}
        disabled={enviando}
        className={`flex w-full flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          arrastando ? "border-brand-500 bg-brand-50" : "border-zinc-300 bg-white hover:border-brand-500"
        }`}
      >
        <UploadCloud size={40} className="text-brand-500" />
        <span className="mt-3 font-semibold">
          {enviando ? `Enviando ${feitas} de ${total}...` : "Clique ou arraste suas fotos aqui"}
        </span>
        <span className="mt-1 text-sm text-zinc-500">
          JPG ou PNG. Pode enviar várias de uma vez. A marca d&apos;água é colocada automaticamente.
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          enviar(e.target.files);
          e.target.value = "";
        }}
      />

      {total > 0 && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm text-zinc-600">
            {enviando ? `${pct}% — não feche esta página.` : `Pronto! ${total - erros.length} de ${total} fotos enviadas.`}
          </p>
        </div>
      )}
      {erros.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {erros.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </div>
  );
}
