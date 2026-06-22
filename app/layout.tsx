import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "EntregaApp | Marketplace local de entregas",
    template: "%s | EntregaApp"
  },
  description:
    "Marketplace local para conectar empresas e entregadores, registrar aceite e alinhar detalhes pelo WhatsApp.",
  openGraph: {
    title: "EntregaApp",
    description:
      "Empresas publicam pedidos, entregadores aceitam oportunidades por cidade e o combinado continua entre as partes.",
    type: "website",
    locale: "pt_BR",
    siteName: "EntregaApp"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
