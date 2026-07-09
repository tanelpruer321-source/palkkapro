import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://palkkapro.com";
const title = "PalkkaPro - Finnish wage calculator";
const description =
  "Calculate estimated gross and net pay for cleaning and shift work in Finland. Supports Finnish, English and Estonian.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "PalkkaPro",
  title: {
    default: title,
    template: "%s | PalkkaPro",
  },
  description,
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.svg",
    apple: "/palkkapro-mark.svg",
  },
  keywords: [
    "PalkkaPro",
    "Finnish wage calculator",
    "Finland salary calculator",
    "cleaning worker wage calculator",
    "shift work pay calculator",
    "koristusala palgakalkulaator",
    "palkkalaskuri",
    "net pay Finland",
    "gross pay Finland",
  ],
  alternates: {
    canonical: "/",
    languages: {
      fi: "/",
      en: "/",
      et: "/",
    },
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "PalkkaPro",
    images: [
      {
        url: "/palkkapro-mark.svg",
        width: 128,
        height: 128,
        alt: "PalkkaPro logo",
      },
    ],
    locale: "fi_FI",
    alternateLocale: ["en_US", "et_EE"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "finance",
  creator: "PalkkaPro",
  publisher: "PalkkaPro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}
