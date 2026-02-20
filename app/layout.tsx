import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Picksy | Stop Overthinking. We'll Tell You What To Buy.",
  description:
    "Picksy analyzes thousands of Reddit discussions to give you one clear recommendation in 30 seconds. Real reviews, real pricing, zero research-induced stress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${instrumentSerif.variable} font-inter antialiased overflow-x-hidden selection:bg-orange-200 selection:text-orange-900`}>
        {children}
      </body>
    </html>
  );
}
