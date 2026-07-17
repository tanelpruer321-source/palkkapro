import type { Metadata } from "next";
import AccountPageClient from "./AccountPageClient";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Create a PalkkaPro account or sign in to prepare cloud sync for salary settings and work shifts.",
  alternates: {
    canonical: "/account",
  },
};

type AccountPageProps = {
  searchParams?: Promise<{
    mode?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const initialMode = params?.mode === "signUp" ? "signUp" : "signIn";

  return <AccountPageClient initialMode={initialMode} />;
}
