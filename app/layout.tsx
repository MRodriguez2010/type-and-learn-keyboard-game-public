import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fallbackBase = new URL("https://press-and-play-keys.shmiggs.chatgpt.site");

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host =
    incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host");
  const forwardedProtocol = incomingHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol ?? (host?.startsWith("localhost") ? "http" : "https");
  const metadataBase = host ? new URL(`${protocol}://${host}`) : fallbackBase;
  const socialImage = new URL(
    "/og-type-and-learn-20260802.png",
    metadataBase,
  ).toString();

  return {
    metadataBase,
    title: "Type & Learn Keyboard Game",
    description:
      "A calm bilingual game with letters, counting hands, familiar words, sounds, and gentle two-choice play.",
    icons: {
      icon: [
        {
          url: "/brand/favicon-32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: "/brand/favicon-64.png",
          sizes: "64x64",
          type: "image/png",
        },
      ],
      shortcut: "/brand/favicon-32.png",
      apple: [
        {
          url: "/brand/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    openGraph: {
      title: "Type & Learn Keyboard Game",
      description: "Words, sounds, counting hands, and gentle two-choice play.",
      type: "website",
      url: new URL("/", metadataBase).toString(),
      siteName: "Type & Learn Keyboard Game",
      locale: "en_US",
      images: [
        {
          url: socialImage,
          secureUrl: socialImage,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: "Type & Learn Keyboard Game — Listen. Copy. Play.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Type & Learn Keyboard Game",
      description: "Words, sounds, counting hands, and gentle two-choice play.",
      images: [socialImage],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Type & Learn",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080908",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
