"use client";

import type { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

type Language = "fi" | "en" | "et";
type AuthMode = "signIn" | "signUp";

const LANGUAGE_STORAGE_KEY = "palkkapro-language";
const STORAGE_NOTICE_KEY = "palkkapro-storage-consent";

const languageOptions: { code: Language; label: string }[] = [
  { code: "fi", label: "FI" },
  { code: "en", label: "EN" },
  { code: "et", label: "ET" },
];

const copy = {
  fi: {
    languageLabel: "Kieli",
    brand: "PalkkaPro",
    badge: "Käyttäjätili",
    authEyebrow: "Tilin synkronointi",
    signInTitle: "Tervetuloa takaisin",
    signUpTitle: "Luo tili",
    activeTitle: "Tili on aktiivinen",
    signInDescription: "Kirjaudu, niin asetukset ja työvuorot pysyvät mukana.",
    signUpDescription: "Luo tili ja tallenna työvuorot turvallisesti.",
    activeDescription:
      "Palkka-asetukset ja työvuorot voidaan synkronoida tälle tilille.",
    title: "Kirjaudu tai luo tili",
    description:
      "Tili tallentaa palkka-asetukset ja työvuorot turvallisemmin.",
    backHome: "Takaisin sovellukseen",
    signIn: "Kirjaudu sisään",
    signUp: "Luo tili",
    email: "Sähköposti",
    password: "Salasana",
    passwordHelp: "Käytä vähintään 6 merkkiä.",
    showPassword: "Näytä salasana",
    hidePassword: "Piilota salasana",
    termsAgreement: "Hyväksyn",
    termsLink: "käyttöehdot",
    submitSignIn: "Kirjaudu sisään",
    submitSignUp: "Luo tili",
    signingIn: "Kirjaudutaan...",
    signingUp: "Luodaan tili...",
    signedInAs: "Kirjautuneena sisään",
    signOut: "Kirjaudu ulos",
    signOutSuccess: "Kirjauduit ulos.",
    signUpSuccess:
      "Tili luotu. Tarkista sähköpostisi, jos vahvistus on käytössä.",
    authConnectionError:
      "Kirjautuminen ei onnistunut. Tarkista Supabase-asetukset ja yritä uudelleen.",
    missingConfigTitle: "Supabase ei ole vielä käytössä",
    missingConfigText:
      "Lisää NEXT_PUBLIC_SUPABASE_URL ja NEXT_PUBLIC_SUPABASE_ANON_KEY ympäristömuuttujiin, jotta kirjautuminen toimii.",
    benefitsTitle: "Miksi tili?",
    benefits: [
      "Tallenna palkka-asetukset turvallisemmin",
      "Pidä työvuorot mukana eri laitteilla",
      "Valmistaudu tuleviin premium-ominaisuuksiin",
    ],
    privacyNote:
      "Palkkalaskuri ja työvuorokalenteri toimivat edelleen ilman tiliä tässä versiossa.",
  },
  en: {
    languageLabel: "Language",
    brand: "PalkkaPro",
    badge: "User account",
    authEyebrow: "Account sync",
    signInTitle: "Welcome back",
    signUpTitle: "Create your account",
    activeTitle: "Account active",
    signInDescription: "Sign in to keep settings and work shifts with you.",
    signUpDescription: "Create an account and save work shifts securely.",
    activeDescription:
      "Your salary settings and work shifts can sync with this account.",
    title: "Sign in or create an account",
    description:
      "An account saves salary settings and work shifts more safely.",
    backHome: "Back to app",
    signIn: "Sign in",
    signUp: "Create account",
    email: "Email",
    password: "Password",
    passwordHelp: "Use at least 6 characters.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    termsAgreement: "I agree with",
    termsLink: "terms of use",
    submitSignIn: "Sign in",
    submitSignUp: "Create account",
    signingIn: "Signing in...",
    signingUp: "Creating account...",
    signedInAs: "Signed in as",
    signOut: "Sign out",
    signOutSuccess: "You have signed out.",
    signUpSuccess:
      "Account created. Check your email if confirmation is enabled.",
    authConnectionError:
      "Authentication did not work. Check the Supabase settings and try again.",
    missingConfigTitle: "Supabase is not configured yet",
    missingConfigText:
      "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables to enable sign in.",
    benefitsTitle: "Why create an account?",
    benefits: [
      "Save salary settings more safely",
      "Keep work shifts available across devices",
      "Prepare for future premium features",
    ],
    privacyNote:
      "The calculator and work planner still work without an account in this version.",
  },
  et: {
    languageLabel: "Keel",
    brand: "PalkkaPro",
    badge: "Kasutajakonto",
    authEyebrow: "Konto sünkroonimine",
    signInTitle: "Tere tulemast tagasi",
    signUpTitle: "Loo konto",
    activeTitle: "Konto on aktiivne",
    signInDescription: "Logi sisse, et seaded ja töövahetused oleksid sinuga kaasas.",
    signUpDescription: "Loo konto ja salvesta töövahetused turvaliselt.",
    activeDescription:
      "Sinu palgaseaded ja töövahetused saavad selle kontoga sünkroonida.",
    title: "Logi sisse või loo konto",
    description:
      "Konto salvestab palgaseaded ja töövahetused turvalisemalt.",
    backHome: "Tagasi rakendusse",
    signIn: "Logi sisse",
    signUp: "Loo konto",
    email: "E-post",
    password: "Parool",
    passwordHelp: "Kasuta vähemalt 6 tähemärki.",
    showPassword: "Näita parooli",
    hidePassword: "Peida parool",
    termsAgreement: "Nõustun",
    termsLink: "kasutustingimustega",
    submitSignIn: "Logi sisse",
    submitSignUp: "Loo konto",
    signingIn: "Sisselogimine...",
    signingUp: "Konto loomine...",
    signedInAs: "Sisse logitud",
    signOut: "Logi välja",
    signOutSuccess: "Logisid välja.",
    signUpSuccess:
      "Konto on loodud. Kui kinnitamine on sisse lülitatud, kontrolli e-posti.",
    authConnectionError:
      "Sisselogimine ei õnnestunud. Kontrolli Supabase seadeid ja proovi uuesti.",
    missingConfigTitle: "Supabase pole veel seadistatud",
    missingConfigText:
      "Lisa NEXT_PUBLIC_SUPABASE_URL ja NEXT_PUBLIC_SUPABASE_ANON_KEY keskkonnamuutujad, et sisselogimine töötaks.",
    benefitsTitle: "Miks konto luua?",
    benefits: [
      "Salvesta palgaseaded turvalisemalt",
      "Hoia töövahetused alles eri seadmetes",
      "Valmista ette tulevased premium-funktsioonid",
    ],
    privacyNote:
      "Kalkulaator ja tööplaan töötavad selles versioonis endiselt ka ilma kontota.",
  },
} satisfies Record<Language, Record<string, string | string[]>>;

type AccountPageClientProps = {
  initialMode?: AuthMode;
};

export default function AccountPageClient({
  initialMode = "signIn",
}: AccountPageClientProps) {
  const [language, setLanguage] = useState<Language>("fi");
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const supabase = useMemo(() => getSupabaseClient(), []);
  const t = copy[language];
  const authTitle = user
    ? (t.activeTitle as string)
    : mode === "signIn"
      ? (t.signInTitle as string)
      : (t.signUpTitle as string);
  const authDescription = user
    ? (t.activeDescription as string)
    : mode === "signIn"
      ? (t.signInDescription as string)
      : (t.signUpDescription as string);
  const canSubmit = !isLoading && (mode === "signIn" || acceptTerms);

  function getFriendlyAuthError(authError: unknown) {
    const message =
      authError instanceof Error
        ? authError.message
        : typeof authError === "string"
          ? authError
          : "";

    if (
      message.toLowerCase().includes("unreachable") ||
      message.toLowerCase().includes("failed to fetch") ||
      message.toLowerCase().includes("network")
    ) {
      return t.authConnectionError as string;
    }

    return message || (t.authConnectionError as string);
  }

  useEffect(() => {
    window.setTimeout(() => {
      const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (
        savedLanguage === "fi" ||
        savedLanguage === "en" ||
        savedLanguage === "et"
      ) {
        setLanguage(savedLanguage);
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isActive = true;

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (isActive) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (isActive) {
          setUser(null);
        }
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);

    if (window.localStorage.getItem(STORAGE_NOTICE_KEY) === "accepted") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }
  }

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !canSubmit) {
      return;
    }

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const result =
        mode === "signIn"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (result.error) {
        setError(getFriendlyAuthError(result.error));
        return;
      }

      if (mode === "signUp") {
        setMessage(t.signUpSuccess as string);
      }
    } catch (authError) {
      setError(getFriendlyAuthError(authError));
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError(getFriendlyAuthError(signOutError));
        return;
      }

      setMessage(t.signOutSuccess as string);
    } catch (authError) {
      setError(getFriendlyAuthError(authError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-0 py-3 sm:px-6 sm:py-5 lg:px-8">
        <header className="flex items-center justify-between px-4 sm:px-0">
          <Link
            href="/"
            className="grid size-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100 sm:size-10"
            aria-label={t.backHome as string}
            title={t.backHome as string}
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>

          <label>
            <span className="sr-only">{t.languageLabel as string}</span>
            <select
              value={language}
              onChange={(event) =>
                changeLanguage(event.target.value as Language)
              }
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              aria-label={t.languageLabel as string}
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </header>

        <section
          className={`grid flex-1 items-start justify-items-center gap-4 px-4 py-4 sm:items-center sm:gap-6 sm:px-0 sm:py-8 lg:py-10 ${
            user ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_430px]"
          }`}
        >
          {!user ? (
            <aside className="hidden rounded-lg border border-slate-800 bg-slate-950 p-6 text-white shadow-sm lg:block">
              <div className="flex items-center gap-3">
                <Image
                  src="/palkkapro-mark.svg"
                  alt=""
                  width={52}
                  height={52}
                  className="size-13 rounded-lg bg-white shadow-sm"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-2xl font-black tracking-normal">
                    {t.brand as string}
                  </p>
                </div>
              </div>

              <h1 className="mt-10 max-w-md text-4xl font-black tracking-normal">
                {authTitle}
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
                {authDescription}
              </p>

              <div className="mt-10 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="grid size-10 place-items-center rounded-md border border-teal-300/30 bg-teal-300/10 text-teal-200">
                  <ShieldCheck size={19} aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-black">
                  {t.benefitsTitle as string}
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  {(t.benefits as string[]).map((benefit) => (
                    <li key={benefit} className="flex gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-1 shrink-0 text-teal-300"
                        aria-hidden="true"
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}

          <div className="w-[calc(100dvw-2rem)] max-w-md justify-self-center sm:w-full">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
              <div className="flex flex-col items-center text-center">
                <Image
                  src="/palkkapro-mark.svg"
                  alt=""
                  width={64}
                  height={64}
                  className="size-12 rounded-lg shadow-sm sm:size-16"
                  aria-hidden="true"
                />
                <h1 className="mt-3 text-2xl font-black tracking-normal text-slate-950 sm:mt-5 sm:text-4xl">
                  {authTitle}
                </h1>
                <p className="mt-1.5 max-w-sm text-sm leading-5 text-slate-500 sm:mt-2 sm:leading-6">
                  {authDescription}
                </p>
              </div>

              {!user ? (
                <div className="mt-5 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:mt-7">
                  {(["signIn", "signUp"] as AuthMode[]).map((authMode) => (
                    <button
                      key={authMode}
                      type="button"
                      onClick={() => {
                        setMode(authMode);
                        setAcceptTerms(false);
                        setMessage("");
                        setError("");
                      }}
                      className={`h-10 rounded-md px-3 text-sm font-bold transition ${
                        mode === authMode
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-500 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      {authMode === "signIn"
                        ? (t.signIn as string)
                        : (t.signUp as string)}
                    </button>
                  ))}
                </div>
              ) : null}

              {!supabase ? (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  <h2 className="font-black">
                    {t.missingConfigTitle as string}
                  </h2>
                  <p className="mt-1">{t.missingConfigText as string}</p>
                </div>
              ) : user ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-teal-700 shadow-sm">
                        <CheckCircle2 size={20} aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="font-black text-teal-950">
                          {t.signedInAs as string}
                        </h2>
                        <p className="mt-1 break-all text-sm font-semibold text-teal-800">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={signOut}
                    disabled={isLoading}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    {t.signOut as string}
                  </button>
                </div>
              ) : (
                <form onSubmit={submitAuth} className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-600">
                      {t.email as string}
                    </span>
                    <span className="mt-1.5 flex h-11 items-center rounded-md border border-slate-200 bg-slate-50 px-3 transition focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-100 sm:mt-2 sm:h-12">
                      <Mail
                        size={18}
                        className="mr-3 shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        autoComplete="email"
                        className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold text-slate-600">
                      {t.password as string}
                    </span>
                    <span className="mt-1.5 flex h-11 items-center rounded-md border border-slate-200 bg-slate-50 px-3 transition focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-100 sm:mt-2 sm:h-12">
                      <KeyRound
                        size={18}
                        className="mr-3 shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={6}
                        autoComplete={
                          mode === "signIn"
                            ? "current-password"
                            : "new-password"
                        }
                        className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="ml-2 grid size-8 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900"
                        aria-label={
                          showPassword
                            ? (t.hidePassword as string)
                            : (t.showPassword as string)
                        }
                        title={
                          showPassword
                            ? (t.hidePassword as string)
                            : (t.showPassword as string)
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={17} aria-hidden="true" />
                        ) : (
                          <Eye size={17} aria-hidden="true" />
                        )}
                      </button>
                    </span>
                    <span className="mt-1.5 block text-xs font-semibold text-slate-500 sm:mt-2">
                      {t.passwordHelp as string}
                    </span>
                  </label>

                  {mode === "signUp" ? (
                    <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm font-semibold leading-5 text-slate-700 sm:p-3">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(event) =>
                          setAcceptTerms(event.target.checked)
                        }
                        className="mt-0.5 size-4 rounded border-slate-300 accent-slate-950"
                        required
                      />
                      <span>
                        {t.termsAgreement as string}{" "}
                        <Link
                          href="/terms?from=account"
                          className="font-bold text-teal-700 hover:text-teal-800"
                        >
                          {t.termsLink as string}
                        </Link>
                      </span>
                    </label>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:h-12"
                  >
                    <Lock size={16} aria-hidden="true" />
                    {isLoading
                      ? mode === "signIn"
                        ? (t.signingIn as string)
                        : (t.signingUp as string)
                      : mode === "signIn"
                        ? (t.submitSignIn as string)
                        : (t.submitSignUp as string)}
                  </button>
                </form>
              )}

              {message ? (
                <p className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {error}
                </p>
              ) : null}
            </section>

            <p className="mt-3 rounded-lg border border-slate-200 bg-white p-2.5 text-center text-xs font-semibold leading-5 text-slate-500 shadow-sm sm:mt-4 sm:p-3 lg:hidden">
              {t.privacyNote as string}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
