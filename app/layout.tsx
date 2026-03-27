import type { Metadata, Viewport } from "next"; // Adicionado Viewport
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configuração de Título e SEO
export const metadata: Metadata = {
  title: "Loteria Inteligente | Cérebro Estatístico",
  description: "Análise avançada de tendências e estatísticas para Lotofácil. Gere fechamentos inteligentes e aumente suas chances.",
  // Isso aqui ajuda quando você manda o link no WhatsApp/Instagram:
  openGraph: {
    title: "Loteria Inteligente",
    description: "Gere jogos baseados em estatística real.",
    type: "website",
  },
};

// Configuração para garantir que o Mobile não dê zoom automático em inputs
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR" // Mudei para Português Brasil
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}