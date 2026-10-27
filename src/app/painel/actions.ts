"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFinance } from "@/lib/data";
import { getSession } from "@/lib/supabase/server";

const texto = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function exigirLogin(voltarPara: string) {
  const s = await getSession();
  if (!s) redirect(`${voltarPara}?erro=demo`);
  return s;
}

export async function criarAlbum(form: FormData) {
  const { supabase, user } = await exigirLogin("/painel/albuns");
  const { data: novo, error } = await supabase.from("albums").insert({
    owner_id: user.id,
    title: texto(form, "title"),
    city: texto(form, "city") || null,
    category: texto(form, "category") || "Ensaios",
    visibility: texto(form, "visibility") || "listed",
    price_per_photo: Number(texto(form, "price").replace(",", ".")) || 15,
    album_date: texto(form, "date") || undefined,
  }).select("id").single();
  if (error) redirect(`/painel/albuns?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/painel", "layout");
  redirect(`/painel/albuns/${novo.id}`);
}

export async function criarEvento(form: FormData) {
  const { supabase, user } = await exigirLogin("/painel/eventos");
  const { error } = await supabase.from("events").insert({
    created_by: user.id,
    title: texto(form, "title"),
    category: texto(form, "category") || "Outros",
    city: texto(form, "city") || null,
    state: texto(form, "state").toUpperCase() || null,
    starts_at: new Date(texto(form, "starts_at")).toISOString(),
  });
  if (error) redirect(`/painel/eventos?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/painel", "layout");
  redirect("/painel/eventos?aba=meus");
}

export async function alternarInscricao(form: FormData) {
  const { supabase, user } = await exigirLogin("/painel/eventos");
  const eventId = texto(form, "event_id");
  if (texto(form, "inscrito") === "1") {
    await supabase.from("event_registrations").delete().eq("event_id", eventId).eq("photographer_id", user.id);
  } else {
    await supabase.from("event_registrations").insert({ event_id: eventId, photographer_id: user.id });
  }
  revalidatePath("/painel", "layout");
}

export async function solicitarSaque(form: FormData) {
  const { supabase, user } = await exigirLogin("/painel/financeiro");
  const valor = Number(texto(form, "amount").replace(",", "."));
  const { saldo } = await getFinance();
  if (!(valor > 0) || valor > saldo) redirect(`/painel/financeiro?erro=${encodeURIComponent("Valor maior que o saldo disponível")}`);
  const { error } = await supabase.from("withdrawals").insert({
    photographer_id: user.id,
    amount: valor,
    pix_key: texto(form, "pix_key"),
  });
  if (error) redirect(`/painel/financeiro?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/painel", "layout");
  redirect("/painel/financeiro?ok=1");
}

export async function apagarFoto(form: FormData) {
  const { supabase } = await exigirLogin("/painel/albuns");
  const id = texto(form, "photo_id");
  const albumId = texto(form, "album_id");
  const { data: foto } = await supabase.from("photos").select("storage_path, preview_path").eq("id", id).single();
  if (foto) {
    await supabase.storage.from("originais").remove([foto.storage_path]);
    if (foto.preview_path) await supabase.storage.from("previews").remove([foto.preview_path]);
    await supabase.from("photos").delete().eq("id", id);
  }
  revalidatePath(`/painel/albuns/${albumId}`);
}

export async function salvarPerfil(form: FormData) {
  const { supabase, user } = await exigirLogin("/painel/configuracoes");
  const whatsapp = texto(form, "whatsapp").replace(/\D/g, "");
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: texto(form, "full_name") || null,
      whatsapp: whatsapp ? (whatsapp.startsWith("55") ? whatsapp : `55${whatsapp}`) : null,
      instagram: texto(form, "instagram").replace(/^@/, "") || null,
      city: texto(form, "city") || null,
    })
    .eq("id", user.id);
  if (error) redirect(`/painel/configuracoes?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/painel", "layout");
  redirect(`/painel/configuracoes?ok=1`);
}
