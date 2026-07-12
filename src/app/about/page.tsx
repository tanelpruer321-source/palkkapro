import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About PalkkaPro | Salary Calculator and Shift Planner",
  description:
    "Learn who PalkkaPro is for, how its salary estimates work and why it was created for cleaning professionals in Finland.",
  alternates: {
    canonical: "/about",
    languages: {
      fi: "/about",
      en: "/about",
      et: "/about",
    },
  },
  openGraph: {
    title: "About PalkkaPro | Salary Calculator and Shift Planner",
    description:
      "Learn who PalkkaPro is for, how its salary estimates work and why it was created for cleaning professionals in Finland.",
    url: "https://palkkapro.com/about",
    siteName: "PalkkaPro",
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
