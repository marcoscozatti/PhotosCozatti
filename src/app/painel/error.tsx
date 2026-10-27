"use client";

import { useEffect } from "react";

export default function PainelErro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Quando o site é atualizado com a página aberta, o navegador fica com uma versão antiga.
  const versaoAntiga = /server action|failed to find|unexpected response/i.test(error.message);

  return (
    <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center">
      <h2 className="font-serif text-2xl font-bold">Algo deu errado</h2>
      <p className="mt-3 text-sm text-zinc-600">
        {versaoAntiga
          ? "O site foi atualizado enquanto esta página estava aberta. Recarregue para continuar."
          : "Tente de novo. Se o erro continuar, mande um print desta tela."}
      </p>
      <p className="mt-4 break-words rounded-lg bg-zinc-50 p-3 text-left font-mono text-xs text-zinc-500">
        {error.message || "Erro sem mensagem"}
        {error.digest ? ` (código ${error.digest})` : ""}
      </p>
      <button
        onClick={() => (versaoAntiga ? window.location.reload() : reset())}
        className="mt-6 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white"
      >
        {versaoAntiga ? "Recarregar página" : "Tentar de novo"}
      </button>
    </div>
  );
}
