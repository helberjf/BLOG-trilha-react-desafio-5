import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Entregador",
  description: "Mural de pedidos de entrega para empresas e motoboys."
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
