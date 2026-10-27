export function Aviso({ erro, ok }: { erro?: string; ok?: string }) {
  if (erro === "demo")
    return (
      <p className="mb-4 rounded-lg bg-brand-100 px-4 py-3 text-sm text-amber-900">
        No modo demonstração nada é salvo. Configure o Supabase e entre na sua conta.
      </p>
    );
  if (erro) return <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Erro: {erro}</p>;
  if (ok) return <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{ok}</p>;
  return null;
}
