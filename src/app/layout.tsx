import type { Metadata } from "next";
import { Spectral, Inter } from "next/font/google";
import "./globals.css";

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Manos Unidas VE · Coordinación de ayuda humanitaria",
  description:
    "Plataforma para organizar voluntarios, inventario de medicamentos, insumos y comida en los centros de acopio tras el terremoto en Venezuela.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${spectral.variable} ${inter.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
