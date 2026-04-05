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
    "Picksy analyzes Reddit and TikTok discussions to give you one clear recommendation in seconds. Real reviews, real pricing, zero research-induced stress.",
  metadataBase: new URL("https://picksy.app"),
  openGraph: {
    title: "Picksy — We'll Tell You What To Buy",
    description:
      "Stop drowning in reviews. Picksy reads Reddit and TikTok so you don't have to — one clear pick, every time.",
    url: "https://picksy.app",
    siteName: "Picksy",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Picksy — Stop Overthinking. We'll Tell You What To Buy.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Picksy — We'll Tell You What To Buy",
    description: "One clear pick from Reddit + TikTok reviews. No more analysis paralysis.",
    images: ["/og-image.png"],
  },
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
