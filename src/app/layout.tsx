import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "PalkkaPro",
  title: "PalkkaPro",
  description:
    "A simple multilingual wage calculator for cleaning workers in Finland.",
  openGraph: {
    title: "PalkkaPro",
    description:
      "A simple multilingual wage calculator for cleaning workers in Finland.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="et">
      <body>{children}</body>
    </html>
  );
}
