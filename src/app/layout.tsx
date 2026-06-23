import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoSignal Pro — BTC/ETH Trading Decision System",
  description:
    "Sistem analisis sinyal trading BTC & ETH berbasis AI (Gemini 2.5 Flash) dengan metodologi SMC + Bandarmologi. Bukan financial advice.",
  keywords: ["crypto", "trading", "signal", "bitcoin", "ethereum", "SMC", "technical analysis"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
