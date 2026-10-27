import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Photos Cozatti — Venda suas fotos de eventos",
  description: "Plataforma para fotógrafos venderem fotos de eventos com busca por selfie.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
