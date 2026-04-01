import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700", "800", "900"],
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
      <body className={`${inter.variable} ${montserrat.variable} font-inter antialiased overflow-x-hidden selection:bg-pink-200 selection:text-pink-900`}>
        {children}
      </body>
    </html>
  );
}
