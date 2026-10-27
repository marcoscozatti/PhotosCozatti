export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

// Chaves copiadas da versão "escondida" do painel vêm com "•" e quebram o login.
const temCaractereInvalido = (v: string) => /[^\x21-\x7E]/.test(v);

export const supabaseConfigError =
  SUPABASE_URL && SUPABASE_ANON_KEY && (temCaractereInvalido(SUPABASE_URL) || temCaractereInvalido(SUPABASE_ANON_KEY))
    ? "As chaves do Supabase cadastradas na Netlify têm caracteres inválidos (ex.: •). Copie a chave novamente com o botão Copy do Supabase e refaça o deploy."
    : null;

// Sem as chaves, o site roda em "modo demonstração" (sem login e sem dados reais).
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !supabaseConfigError);
