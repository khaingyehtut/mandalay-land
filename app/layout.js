import { Space_Grotesk, Space_Mono, Noto_Sans_Myanmar, Padauk } from "next/font/google";
import Providers from "@/components/Providers";
import BottomNav from "@/components/BottomNav";
import { Suspense } from "react";
import FastClick from "@/components/FastClick";
import NavProgress from "@/components/NavProgress";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const myanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-myanmar",
  display: "swap",
  preload: false,
});

const padauk = Padauk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-padauk",
  display: "swap",
  preload: false,
});

export const metadata = {
  title: "ကိုအောင် အိမ်ခြံမြေနှင့်ဆောက်လုပ်ရေး",
  description: "မန္တလေးမြို့ မြေကွက် အရောင်းအဝယ် — ကြိုက်ရင် ဖုန်းတိုက်ရိုက်ခေါ်နိုင်သည်။",
  other: {
    "google": "notranslate",
  },
  openGraph: {
    title: "ကိုအောင် အိမ်ခြံမြေနှင့်ဆောက်လုပ်ရေး",
    description: "မန္တလေးမြို့ မြေကွက် အရောင်းအဝယ်",
    type: "website",
    locale: "my_MM",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#13151A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="my" translate="no" className={`${grotesk.variable} ${mono.variable} ${myanmar.variable} ${padauk.variable}`}>
      <body><Providers>{children}<BottomNav /><FastClick /><Suspense><NavProgress /></Suspense></Providers></body>
    </html>
  );
}
