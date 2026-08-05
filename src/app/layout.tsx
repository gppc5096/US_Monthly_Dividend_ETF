import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_KR } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plexSans = IBM_Plex_Sans_KR({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "미국 월배당 ETF — 배당 현금흐름 계산기",
  description:
    "투자 원금과 목표 월 수령액을 입력하면 미국 월배당 ETF 10종의 국가별 세후 현금흐름을 계산합니다.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1720" },
  ],
  viewportFit: "cover",
};

/** Dark-first per PRD §12.1; drops to light only when the OS asks for it. */
const THEME_BOOTSTRAP = `try{if(matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.classList.remove('dark')}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${plexSans.variable} ${plexMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
