"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 40, textAlign: "center" }}>
        <h2>Algo deu errado</h2>
        <p style={{ color: "#555" }}>Recarregue a página. Se continuar, mande um print desta tela.</p>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#777" }}>
          {error.message}
          {error.digest ? ` (código ${error.digest})` : ""}
        </pre>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", marginTop: 16 }}>
          Recarregar página
        </button>
      </body>
    </html>
  );
}
