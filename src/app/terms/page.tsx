import type { Metadata } from "next";
import TermsPageClient from "./TermsPageClient";

export const metadata: Metadata = {
  title: "Terms of Use | PalkkaPro",
  description:
    "Read the terms for using the PalkkaPro salary calculator and shift planner.",
  alternates: {
    canonical: "/terms",
    languages: {
      fi: "/terms",
      en: "/terms",
      et: "/terms",
    },
  },
  openGraph: {
    title: "Terms of Use | PalkkaPro",
    description:
      "Read the terms for using the PalkkaPro salary calculator and shift planner.",
    url: "https://palkkapro.com/terms",
    siteName: "PalkkaPro",
    type: "website",
  },
};

export default function TermsPage() {
  return <TermsPageClient />;
}
