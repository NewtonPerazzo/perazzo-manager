import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { AppProviders } from "@/providers/app-providers";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Perazzo Manager",
  description: "Client area for Perazzo",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png"
  }
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={spaceGrotesk.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
