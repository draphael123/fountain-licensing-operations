import type { Metadata } from "next";
import { Outfit, Fragment_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const outfit = Outfit({ variable: "--font-body", subsets: ["latin"] });
const mono = Fragment_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "Fountain — Licensing Operations",
    description: "A private Fountain workspace for licensing readiness and application preparation.",
    openGraph: { title: "Fountain — Licensing Operations", description: "Private licensing operations workspace", images: [image] },
    twitter: { card: "summary_large_image", title: "Fountain — Licensing Operations", description: "Private licensing operations workspace", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${outfit.variable} ${mono.variable}`}>{children}</body></html>;
}
