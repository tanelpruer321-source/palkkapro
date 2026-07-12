"use client";

import {
  CalendarDays,
  Calculator,
  CheckCircle2,
  Languages,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Language = "fi" | "en" | "et";

type AboutCopy = {
  back: string;
  languageLabel: string;
  badge: string;
  title: string;
  description: string;
  nav: {
    about: string;
    privacy: string;
    terms: string;
  };
  sections: {
    what: {
      title: string;
      body: string;
      items: string[];
    };
    audience: {
      title: string;
      body: string[];
    };
    independence: {
      title: string;
      highlighted: string;
      body: string[];
    };
    why: {
      title: string;
      body: string;
    };
    features: {
      title: string;
      items: string[];
    };
    roadmap: {
      title: string;
      intro: string;
      items: string[];
    };
    feedback: {
      title: string;
      body: string;
      button: string;
      subject: string;
    };
  };
};

const LANGUAGE_STORAGE_KEY = "palkkapro-language";
const STORAGE_NOTICE_KEY = "palkkapro-storage-consent";
const FEEDBACK_EMAIL = "feedback@palkkapro.com";

const languageOptions: { code: Language; label: string }[] = [
  { code: "fi", label: "FI" },
  { code: "en", label: "EN" },
  { code: "et", label: "ET" },
];

const copy: Record<Language, AboutCopy> = {
  fi: {
    back: "Takaisin PalkkaProhon",
    languageLabel: "Kieli",
    badge: "Itsenäinen työkalu",
    title: "Tietoa PalkkaProsta",
    description:
      "PalkkaPro on itsenäinen palkkalaskuri ja työvuorosuunnittelija Suomessa työskenteleville siivousalan ammattilaisille.",
    nav: {
      about: "Tietoa",
      privacy: "Tietosuoja",
      terms: "Käyttöehdot",
    },
    sections: {
      what: {
        title: "Mikä PalkkaPro on?",
        body: "PalkkaPro auttaa arvioimaan palkkaa ja suunnittelemaan työvuoroja selkeässä näkymässä.",
        items: [
          "Arvioi brutto- ja nettopalkkaa",
          "Laskee ilta-, yö- ja sunnuntailisiä",
          "Auttaa lisäämään ja hallitsemaan työvuoroja",
          "Näyttää kuukauden palkka-arvion",
        ],
      },
      audience: {
        title: "Kenelle se on tarkoitettu?",
        body: [
          "PalkkaPro on suunnattu erityisesti Suomessa työskenteleville siivous- ja kiinteistöpalvelualan työntekijöille, joiden työsuhteessa käytetään Kiinteistöpalvelualan työehtosopimusta.",
          "Samaa työehtosopimusta käyttävät monet siivous- ja kiinteistöpalvelualan työnantajat Suomessa, mutta se ei koske automaattisesti jokaista siivoojaa.",
          "Tarkista aina työsopimuksesta tai palkkalaskelmasta, mitä työehtosopimusta omassa työsuhteessasi noudatetaan.",
        ],
      },
      independence: {
        title: "Itsenäisyys ja vastuu",
        highlighted:
          "PalkkaPro on itsenäinen sovellus. Se ei ole PAMin, Kiinteistötyönantajat ry:n, Palkka.fi:n, työnantajan tai viranomaisen palvelu.",
        body: [
          "Laskelmat ovat arvioita ja perustuvat käyttäjän syöttämiin tietoihin.",
          "Virallinen palkanlaskenta voi sisältää muita sääntöjä, vähennyksiä ja pyöristyksiä.",
          "Varmista aina tiedot työsopimuksesta ja virallisesta palkkalaskelmasta.",
        ],
      },
      why: {
        title: "Miksi PalkkaPro tehtiin?",
        body: "PalkkaPro luotiin helpottamaan palkka-arvioiden tekemistä ja työvuorojen suunnittelua Suomen siivousalalla.",
      },
      features: {
        title: "Nykyiset ominaisuudet",
        items: [
          "Palkkalaskuri",
          "Työvuorosuunnittelija ja kalenteri",
          "Ilta-, yö- ja sunnuntailisien laskenta",
          "Bruttopalkka ja arvioitu nettopalkka",
          "Suomen, englannin ja viron kielet",
          "Mobiiliystävällinen käyttöliittymä",
        ],
      },
      roadmap: {
        title: "Suunniteltuja ominaisuuksia",
        intro: "Nämä ovat suunnitteilla tai harkinnassa, eivät vielä valmiita ominaisuuksia.",
        items: [
          "Lisää raportti- ja vientivaihtoehtoja",
          "Ansioiden kehitys",
          "Tuki muille suomalaisille työehtosopimuksille",
        ],
      },
      feedback: {
        title: "Palaute",
        body: "Löysitkö virheen tai onko sinulla idea? Palaute auttaa kehittämään PalkkaProta.",
        button: "Lähetä palautetta",
        subject: "PalkkaPro palaute",
      },
    },
  },
  en: {
    back: "Back to PalkkaPro",
    languageLabel: "Language",
    badge: "Independent tool",
    title: "About PalkkaPro",
    description:
      "PalkkaPro is an independent salary calculator and shift planner for cleaning professionals working in Finland.",
    nav: {
      about: "About",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
    },
    sections: {
      what: {
        title: "What is PalkkaPro?",
        body: "PalkkaPro helps users estimate pay and manage work shifts in one clear view.",
        items: [
          "Estimate gross and net salary",
          "Calculate evening, night and Sunday bonuses",
          "Create and manage work shifts",
          "View monthly salary estimates",
        ],
      },
      audience: {
        title: "Who is it for?",
        body: [
          "PalkkaPro is mainly intended for cleaning and property-services workers in Finland whose employment follows the Finnish Property Services Collective Agreement: Kiinteistöpalvelualan työehtosopimus.",
          "This agreement is used by many cleaning and property-services employers in Finland, but it may not apply to every cleaner working in Finland.",
          "Users should check their employment contract or payslip to confirm which collective agreement applies to their work.",
        ],
      },
      independence: {
        title: "Independence and disclaimer",
        highlighted:
          "PalkkaPro is an independent application. It is not affiliated with PAM, Kiinteistötyönantajat ry, Palkka.fi, any employer or any government authority.",
        body: [
          "Calculations are estimates and depend on the information entered by the user.",
          "Official payroll calculations may contain additional rules, deductions and rounding.",
          "Users should always verify their employment contract and official payslip.",
        ],
      },
      why: {
        title: "Why it was created",
        body: "PalkkaPro was created to make salary estimation and shift planning easier for cleaning professionals in Finland.",
      },
      features: {
        title: "Current features",
        items: [
          "Salary calculator",
          "Shift planner and calendar",
          "Evening, night and Sunday bonus calculation",
          "Gross and estimated net salary",
          "Finnish, English and Estonian languages",
          "Mobile-friendly interface",
        ],
      },
      roadmap: {
        title: "Planned features",
        intro: "These ideas are planned or under consideration and are not yet available features.",
        items: [
          "More report and export options",
          "Earnings trend",
          "Support for additional collective agreements",
        ],
      },
      feedback: {
        title: "Feedback",
        body: "Found a bug or have an idea? Feedback helps improve PalkkaPro.",
        button: "Send feedback",
        subject: "PalkkaPro feedback",
      },
    },
  },
  et: {
    back: "Tagasi PalkkaPro juurde",
    languageLabel: "Keel",
    badge: "Sõltumatu tööriist",
    title: "PalkkaProst",
    description:
      "PalkkaPro on sõltumatu palgakalkulaator ja töövahetuste planeerija Soomes töötavatele koristusala inimestele.",
    nav: {
      about: "Meist",
      privacy: "Privaatsuspoliitika",
      terms: "Kasutustingimused",
    },
    sections: {
      what: {
        title: "Mis on PalkkaPro?",
        body: "PalkkaPro aitab palka hinnata ja töövahetusi hallata ühes lihtsas vaates.",
        items: [
          "Hinnata bruto- ja netopalka",
          "Arvutada õhtu-, öö- ja pühapäevalisasid",
          "Luua ja hallata töövahetusi",
          "Vaadata kuu palgahinnangut",
        ],
      },
      audience: {
        title: "Kellele see mõeldud on?",
        body: [
          "PalkkaPro on mõeldud peamiselt Soomes töötavatele koristus- ja kinnisvarateenuste töötajatele, kelle töösuhte aluseks on Kiinteistöpalvelualan työehtosopimus.",
          "Seda kollektiivlepingut kasutavad paljud Soome koristus- ja kinnisvarateenuste tööandjad, kuid see ei pruugi kehtida iga Soomes töötava koristaja kohta.",
          "Kasutaja peaks oma töölepingust või palgalehelt kontrollima, milline kollektiivleping tema töösuhtele kehtib.",
        ],
      },
      independence: {
        title: "Sõltumatus ja vastutus",
        highlighted:
          "PalkkaPro on sõltumatu rakendus. See ei ole seotud PAMi, Kiinteistötyönantajat ry, Palkka.fi, ühegi tööandja ega riigiasutusega.",
        body: [
          "Arvutused on hinnangulised ja sõltuvad kasutaja sisestatud andmetest.",
          "Ametlik palgaarvestus võib sisaldada lisareegleid, mahaarvamisi ja ümardamist.",
          "Kontrolli andmed alati oma töölepingust ja ametlikult palgalehelt.",
        ],
      },
      why: {
        title: "Miks PalkkaPro loodi?",
        body: "PalkkaPro loodi selleks, et teha palga hindamine ja töövahetuste planeerimine Soome koristusala töötajatele lihtsamaks.",
      },
      features: {
        title: "Praegused võimalused",
        items: [
          "Palgakalkulaator",
          "Töövahetuste planeerija ja kalender",
          "Õhtu-, öö- ja pühapäevalisa arvutus",
          "Brutopalk ja hinnanguline netopalk",
          "Soome, inglise ja eesti keel",
          "Mobiilisõbralik kasutajaliides",
        ],
      },
      roadmap: {
        title: "Planeeritud võimalused",
        intro: "Need ideed on planeerimisel või kaalumisel ega ole veel valmis funktsioonid.",
        items: [
          "Rohkem raporti- ja ekspordivõimalusi",
          "Teenistuse trend",
          "Tugi teistele Soome kollektiivlepingutele",
        ],
      },
      feedback: {
        title: "Tagasiside",
        body: "Leidsid vea või sul on idee? Tagasiside aitab PalkkaPro paremaks teha.",
        button: "Saada tagasisidet",
        subject: "PalkkaPro tagasiside",
      },
    },
  },
};

function FeatureList({
  columns = "responsive",
  items,
}: {
  columns?: "responsive" | "single";
  items: string[];
}) {
  return (
    <div
      className={`grid gap-2 ${columns === "responsive" ? "sm:grid-cols-2" : ""}`}
    >
      {items.map((item) => (
        <div
          key={item}
          className="flex min-w-0 items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-5 text-slate-700"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-700" />
          <span className="min-w-0 break-words">{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function AboutPageClient() {
  const [language, setLanguage] = useState<Language>("fi");
  const [showMobilePageNav, setShowMobilePageNav] = useState(false);
  const t = copy[language];
  const feedbackHref = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
    t.sections.feedback.subject,
  )}`;

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
    const updateMobilePageNav = () => {
      setShowMobilePageNav(window.scrollY > 24);
    };

    updateMobilePageNav();
    window.addEventListener("scroll", updateMobilePageNav, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateMobilePageNav);
    };
  }, []);

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);

    if (window.localStorage.getItem(STORAGE_NOTICE_KEY) === "accepted") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-bold text-teal-700 transition hover:text-teal-800"
            >
              {t.back}
            </Link>
            <label>
              <span className="sr-only">{t.languageLabel}</span>
              <select
                value={language}
                onChange={(event) =>
                  changeLanguage(event.target.value as Language)
                }
                className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                aria-label={t.languageLabel}
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-8 max-w-3xl">
            <span className="inline-flex rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-bold uppercase text-teal-700">
              {t.badge}
            </span>
            <h1 className="mt-4 break-words text-2xl font-black tracking-normal text-slate-950 sm:text-4xl">
              {t.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {t.description}
            </p>
          </div>
        </header>

        <div
          className={`fixed inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-2 shadow-sm shadow-slate-900/5 backdrop-blur-md transition duration-200 sm:px-6 lg:hidden ${
            showMobilePageNav
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-full opacity-0"
          }`}
        >
          <nav
            className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
            aria-label="PalkkaPro pages"
          >
            <Link
              href="/about"
              className="h-10 min-w-0 flex-1 rounded-md bg-slate-950 px-2 text-center text-[12px] font-bold leading-10 text-white shadow-sm"
            >
              <span className="block truncate">{t.nav.about}</span>
            </Link>
            <Link
              href="/privacy"
              className="h-10 min-w-0 flex-1 rounded-md px-2 text-center text-[12px] font-bold leading-10 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="block truncate">{t.nav.privacy}</span>
            </Link>
            <Link
              href="/terms"
              className="h-10 min-w-0 flex-1 rounded-md px-2 text-center text-[12px] font-bold leading-10 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="block truncate">{t.nav.terms}</span>
            </Link>
          </nav>
        </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
          <div className="space-y-5">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Calculator className="size-5 text-teal-700" />
                <h2 className="text-xl font-bold text-slate-950">
                  {t.sections.what.title}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t.sections.what.body}
              </p>
              <div className="mt-4">
                <FeatureList items={t.sections.what.items} />
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-5 text-teal-700" />
                <h2 className="text-xl font-bold text-slate-950">
                  {t.sections.audience.title}
                </h2>
              </div>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                {t.sections.audience.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                {t.sections.why.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t.sections.why.body}
              </p>
            </article>
          </div>

          <aside className="space-y-5">
            <section className="rounded-lg border border-teal-200 bg-teal-50 p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-teal-800" />
                <h2 className="text-lg font-bold text-teal-950">
                  {t.sections.independence.title}
                </h2>
              </div>
              <p className="mt-3 text-sm font-bold leading-6 text-teal-950">
                {t.sections.independence.highlighted}
              </p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-teal-900">
                {t.sections.independence.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Languages className="size-5 text-teal-700" />
                <h2 className="text-lg font-bold text-slate-950">
                  {t.sections.features.title}
                </h2>
              </div>
              <div className="mt-4">
                <FeatureList columns="single" items={t.sections.features.items} />
              </div>
            </section>
          </aside>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              {t.sections.roadmap.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t.sections.roadmap.intro}
            </p>
            <div className="mt-4">
              <FeatureList items={t.sections.roadmap.items} />
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              {t.sections.feedback.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t.sections.feedback.body}
            </p>
            <a
              href={feedbackHref}
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <Mail size={16} />
              {t.sections.feedback.button}
            </a>
          </article>
        </section>

        <footer className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="font-bold text-slate-900">PalkkaPro</div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/about"
              className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-bold text-teal-700"
            >
              {t.nav.about}
            </Link>
            <Link
              href="/privacy"
              className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-teal-700"
            >
              {t.nav.privacy}
            </Link>
            <Link
              href="/terms"
              className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-teal-700"
            >
              {t.nav.terms}
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
