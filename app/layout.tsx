import type { Metadata } from "next";
import { Source_Sans_3, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Netgear AV Line Selector",
  description: "Internal Netgear AV switch selector for commercial AV-over-IP deployments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
        style={{ fontFamily: "var(--font-body), sans-serif" }}
      >
        <div className="min-h-screen">
          <Header />
          <main className="mx-auto w-full max-w-[min(96vw,1800px)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
