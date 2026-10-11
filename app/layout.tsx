import type { Metadata } from "next";
import { Newsreader, Noto_Sans_SC } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { SiteFooter, SiteHeader, HeaderFallback } from "@/components/shell";

const sans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
});

const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "澜币 — 青澜的硬币柜",
    template: "%s · 澜币",
  },
  description: "1 美元等于 1 硬币。用青澜的同一个账号登录，硬币只兑换青澜的付费作品。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-[15px]">
        <Suspense fallback={<HeaderFallback />}>
          <SiteHeader />
        </Suspense>
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
