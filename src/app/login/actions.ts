"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function entrar(form: FormData) {
  if (!isSupabaseConfigured) redirect("/painel");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email")),
    password: String(form.get("password")),
  });
  if (error) redirect("/login?erro=E-mail ou senha incorretos");
  redirect("/painel");
}

export async function cadastrar(form: FormData) {
  if (!isSupabaseConfigured) redirect("/painel");
  const supabase = await createClient();
  const origem = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email: String(form.get("email")),
    password: String(form.get("password")),
    options: {
      data: { full_name: String(form.get("full_name") ?? "") },
      emailRedirectTo: `${origem}/painel`,
    },
  });
  if (error) redirect(`/login?modo=cadastro&erro=${encodeURIComponent(error.message)}`);
  if (!data.session) redirect("/login?ok=Enviamos um e-mail de confirmação. Confirme e depois entre.");
  redirect("/painel");
}
