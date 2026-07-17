"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileText,
  Info,
  Scale,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Language = "fi" | "en" | "et";

type Section = {
  title: string;
  body?: string[];
  items?: string[];
};

type TermsCopy = {
  back: string;
  backToAccount: string;
  languageLabel: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  lastUpdated: string;
  nav: {
    about: string;
    privacy: string;
    terms: string;
  };
  sections: {
    acceptance: Section;
    about: Section;
    affiliation: Section & {
      highlighted: string;
    };
    estimates: Section;
    responsibilities: Section;
    availability: Section;
    intellectualProperty: Section;
    liability: Section;
    privacy: Section & {
      link: string;
    };
    changes: Section;
    contact: Section & {
      contactValue: string;
    };
  };
};

const LANGUAGE_STORAGE_KEY = "palkkapro-language";
const STORAGE_NOTICE_KEY = "palkkapro-storage-consent";
const CONTACT_EMAIL = "contact@palkkapro.com";
const EFFECTIVE_DATE = "12 July 2026";

const languageOptions: { code: Language; label: string }[] = [
  { code: "fi", label: "FI" },
  { code: "en", label: "EN" },
  { code: "et", label: "ET" },
];

const copy: Record<Language, { terms: TermsCopy }> = {
  fi: {
    terms: {
      back: "Takaisin PalkkaProhon",
      backToAccount: "Takaisin rekisteröitymiseen",
      languageLabel: "Kieli",
      title: "Käyttöehdot",
      subtitle: "Lue nämä ehdot ennen PalkkaPron käyttöä.",
      effectiveDate: "Voimaantulopäivä: 12. heinäkuuta 2026",
      lastUpdated: "Päivitetty viimeksi: 12. heinäkuuta 2026",
      nav: {
        about: "Tietoa",
        privacy: "Tietosuoja",
        terms: "Käyttöehdot",
      },
      sections: {
        acceptance: {
          title: "Ehtojen hyväksyminen",
          body: [
            "Käyttämällä PalkkaProta hyväksyt nämä käyttöehdot.",
            "Jos et hyväksy näitä ehtoja, lopeta sovelluksen käyttö.",
          ],
        },
        about: {
          title: "Tietoa PalkkaProsta",
          body: [
            "PalkkaPro on itsenäinen palkkalaskuri ja työvuorojen suunnittelutyökalu, joka on tehty erityisesti Suomessa työskenteleville siivousalan ammattilaisille.",
            "Sovelluksen tarkoitus on auttaa arvioimaan palkkaa ja hallitsemaan työvuoroja. Se on tiedollinen työkalu eikä korvaa virallisia palkanlaskentajärjestelmiä.",
          ],
        },
        affiliation: {
          title: "Ei virallista yhteyttä",
          highlighted: "PalkkaPro on itsenäinen sovellus.",
          body: ["PalkkaPro ei ole seuraavien tahojen palvelu tai kumppani:"],
          items: [
            "PAM",
            "Kiinteistötyönantajat ry",
            "Palkka.fi",
            "mikään työnantaja",
            "mikään palkanlaskennan palveluntarjoaja",
            "mikään Suomen viranomainen",
          ],
        },
        estimates: {
          title: "Palkka-arviot",
          body: [
            "PalkkaPron laskelmat ovat arvioita. Tulokset riippuvat käyttäjän syöttämistä tiedoista, valitusta tuntipalkasta, veroasetuksista ja sovelluksen tukemista työehtosopimuksen säännöistä.",
            "Todellinen palkanlaskenta voi poiketa arviosta palkanmaksujaksojen, työnantajakohtaisten käytäntöjen, verolaskennan, vähennysten, poissaolojen, työehtosopimuksen tulkinnan tai pyöristysten vuoksi.",
            "Tarkista tärkeät palkkatiedot aina virallisesta palkkalaskelmasta.",
          ],
        },
        responsibilities: {
          title: "Käyttäjän vastuut",
          items: [
            "Syöttää tiedot mahdollisimman oikein",
            "Tarkistaa, mitä työehtosopimusta omaan työhön sovelletaan",
            "Varmistaa palkkatiedot työnantajalta tai palkanlaskennasta",
            "Käyttää sovellusta lainmukaisesti",
          ],
        },
        availability: {
          title: "Saatavuus",
          body: [
            "PalkkaPro voi ajoittain olla poissa käytöstä. Sovelluksessa voidaan tehdä huoltoa, virheitä voi esiintyä ja ominaisuudet voivat muuttua ajan myötä.",
          ],
        },
        intellectualProperty: {
          title: "Immateriaalioikeudet",
          body: [
            "PalkkaPro-nimi, sovelluksen ulkoasu, alkuperäinen lähdekoodi ja alkuperäinen sisältö kuuluvat PalkkaProlle.",
            "Työehtosopimuksiin, lainsäädäntöön ja käyttäjän syöttämiin tietoihin liittyvät oikeudet kuuluvat niiden omille oikeudenhaltijoille.",
          ],
        },
        liability: {
          title: "Vastuunrajoitus",
          body: [
            "PalkkaPro tarjoaa arvioita eikä sitä tule käyttää ainoana perusteena palkkaan liittyvissä päätöksissä.",
            "Varmista tärkeät palkkatiedot työnantajalta, palkanlaskennasta ja virallisesta palkkalaskelmasta.",
            "Mikään näissä ehdoissa ei rajoita pakottavia kuluttajaoikeuksia Suomen tai EU:n lain mukaan.",
          ],
        },
        privacy: {
          title: "Tietosuoja",
          body: [
            "Henkilötietojen ja selaimeen tallennettavien tietojen käsittelystä kerrotaan PalkkaPron tietosuojaselosteessa.",
          ],
          link: "Avaa tietosuojaseloste",
        },
        changes: {
          title: "Ehtojen muutokset",
          body: [
            "Näitä käyttöehtoja voidaan päivittää sovelluksen kehittyessä. Päivitetty versio tulee voimaan, kun se julkaistaan tällä sivulla.",
          ],
        },
        contact: {
          title: "Yhteydenotto",
          body: ["Käyttöehtoihin liittyvissä kysymyksissä voit ottaa yhteyttä:"],
          contactValue: CONTACT_EMAIL,
        },
      },
    },
  },
  en: {
    terms: {
      back: "Back to PalkkaPro",
      backToAccount: "Back to registration",
      languageLabel: "Language",
      title: "Terms of Use",
      subtitle: "Please read these terms before using PalkkaPro.",
      effectiveDate: `Effective date: ${EFFECTIVE_DATE}`,
      lastUpdated: `Last updated: ${EFFECTIVE_DATE}`,
      nav: {
        about: "About",
        privacy: "Privacy Policy",
        terms: "Terms of Use",
      },
      sections: {
        acceptance: {
          title: "Acceptance",
          body: [
            "By using PalkkaPro, you agree to these Terms of Use.",
            "If you do not agree with these terms, you should stop using the application.",
          ],
        },
        about: {
          title: "About PalkkaPro",
          body: [
            "PalkkaPro is an independent salary calculator and shift planning tool designed mainly for cleaning professionals working in Finland.",
            "The application is intended to estimate salary and help manage work schedules. It is informational and does not replace official payroll systems.",
          ],
        },
        affiliation: {
          title: "No Official Affiliation",
          highlighted: "PalkkaPro is an independent application.",
          body: ["It is not affiliated with:"],
          items: [
            "PAM",
            "Kiinteistötyönantajat ry",
            "Palkka.fi",
            "any employer",
            "any payroll provider",
            "any Finnish government authority",
          ],
        },
        estimates: {
          title: "Salary Estimates",
          body: [
            "Salary calculations are estimates. Results depend on user-entered information, the selected hourly wage, tax settings and the supported collective agreement rules.",
            "Actual payroll calculations may differ because of payroll period rules, employer-specific practices, tax calculations, deductions, absences, collective agreement interpretation or rounding.",
            "Users should always verify important salary information from their official payslip.",
          ],
        },
        responsibilities: {
          title: "User Responsibilities",
          items: [
            "Enter accurate information",
            "Check which collective agreement applies to their work",
            "Verify salary information with their employer or payroll department",
            "Use the application lawfully",
          ],
        },
        availability: {
          title: "Availability",
          body: [
            "The application may occasionally be unavailable. Maintenance may occur, bugs may exist and features may change over time.",
          ],
        },
        intellectualProperty: {
          title: "Intellectual Property",
          body: [
            "The PalkkaPro name, application design, original source code and original content belong to PalkkaPro.",
            "Collective agreement information, legislation and user-entered information remain the property of their respective owners.",
          ],
        },
        liability: {
          title: "Limitation of Liability",
          body: [
            "PalkkaPro provides estimated calculations. Users should not rely solely on the application for payroll decisions.",
            "Always verify important salary information with your employer, payroll department and official payslip.",
            "Nothing in these terms limits mandatory consumer rights under Finnish or EU law.",
          ],
        },
        privacy: {
          title: "Privacy",
          body: [
            "Personal data and browser-saved information are handled according to the PalkkaPro Privacy Policy.",
          ],
          link: "Open Privacy Policy",
        },
        changes: {
          title: "Changes to the Terms",
          body: [
            "These Terms of Use may be updated as the application develops. The updated version applies when it is published on this page.",
          ],
        },
        contact: {
          title: "Contact",
          body: ["For questions about these Terms of Use, contact:"],
          contactValue: CONTACT_EMAIL,
        },
      },
    },
  },
  et: {
    terms: {
      back: "Tagasi PalkkaPro juurde",
      backToAccount: "Tagasi registreerimise juurde",
      languageLabel: "Keel",
      title: "Kasutustingimused",
      subtitle: "Palun loe neid tingimusi enne PalkkaPro kasutamist.",
      effectiveDate: "Kehtib alates: 12. juuli 2026",
      lastUpdated: "Viimati uuendatud: 12. juuli 2026",
      nav: {
        about: "Meist",
        privacy: "Privaatsuspoliitika",
        terms: "Kasutustingimused",
      },
      sections: {
        acceptance: {
          title: "Tingimustega nõustumine",
          body: [
            "PalkkaPro kasutamisega nõustud nende kasutustingimustega.",
            "Kui sa tingimustega ei nõustu, lõpeta rakenduse kasutamine.",
          ],
        },
        about: {
          title: "PalkkaProst",
          body: [
            "PalkkaPro on sõltumatu palgakalkulaator ja töövahetuste planeerimise tööriist, mis on mõeldud peamiselt Soomes töötavatele koristusala inimestele.",
            "Rakendus aitab hinnata palka ja hallata töögraafikut. See on informatiivne tööriist ega asenda ametlikke palgaarvestuse süsteeme.",
          ],
        },
        affiliation: {
          title: "Ametlik seos puudub",
          highlighted: "PalkkaPro on sõltumatu rakendus.",
          body: ["PalkkaPro ei ole seotud järgmiste osapooltega:"],
          items: [
            "PAM",
            "Kiinteistötyönantajat ry",
            "Palkka.fi",
            "ükski tööandja",
            "ükski palgaarvestuse teenusepakkuja",
            "ükski Soome riigiasutus",
          ],
        },
        estimates: {
          title: "Palgahinnangud",
          body: [
            "PalkkaPro arvutused on hinnangulised. Tulemused sõltuvad kasutaja sisestatud infost, valitud tunnipalgast, maksuseadetest ja rakenduses toetatud kollektiivlepingu reeglitest.",
            "Tegelik palgaarvestus võib erineda palgaperioodi reeglite, tööandja praktikate, maksuarvestuse, mahaarvamiste, puudumiste, kollektiivlepingu tõlgenduse või ümardamise tõttu.",
            "Olulised palgaandmed tuleks alati kontrollida ametlikult palgalehelt.",
          ],
        },
        responsibilities: {
          title: "Kasutaja vastutus",
          items: [
            "Sisestada võimalikult õiged andmed",
            "Kontrollida, milline kollektiivleping tema tööle kehtib",
            "Kinnitada palgaandmed tööandja või palgaarvestusega",
            "Kasutada rakendust seaduslikult",
          ],
        },
        availability: {
          title: "Kättesaadavus",
          body: [
            "Rakendus võib aeg-ajalt olla kättesaamatu. Võib toimuda hooldustöid, esineda vigu ja funktsioonid võivad aja jooksul muutuda.",
          ],
        },
        intellectualProperty: {
          title: "Intellektuaalomand",
          body: [
            "PalkkaPro nimi, rakenduse disain, originaalne lähtekood ja originaalne sisu kuuluvad PalkkaProle.",
            "Kollektiivlepingute info, seadused ja kasutaja sisestatud andmed kuuluvad nende vastavatele omanikele.",
          ],
        },
        liability: {
          title: "Vastutuse piiramine",
          body: [
            "PalkkaPro pakub hinnangulisi arvutusi. Kasutaja ei tohiks teha palgaga seotud otsuseid ainult rakenduse põhjal.",
            "Olulised palgaandmed tuleb alati üle kontrollida tööandjalt, palgaarvestusest ja ametlikult palgalehelt.",
            "Miski nendes tingimustes ei piira kohustuslikke tarbijaõigusi Soome või Euroopa Liidu õiguse alusel.",
          ],
        },
        privacy: {
          title: "Privaatsus",
          body: [
            "Isikuandmeid ja brauserisse salvestatud infot käsitletakse PalkkaPro privaatsuspoliitika järgi.",
          ],
          link: "Ava privaatsuspoliitika",
        },
        changes: {
          title: "Tingimuste muutmine",
          body: [
            "Neid kasutustingimusi võidakse rakenduse arenedes uuendada. Uuendatud versioon kehtib alates selle avaldamisest sellel lehel.",
          ],
        },
        contact: {
          title: "Kontakt",
          body: ["Kasutustingimustega seotud küsimuste korral võta ühendust:"],
          contactValue: CONTACT_EMAIL,
        },
      },
    },
  },
};

const sectionIcons = {
  acceptance: CheckCircle2,
  about: Info,
  estimates: CalendarClock,
  responsibilities: ShieldCheck,
  availability: AlertTriangle,
  intellectualProperty: FileText,
  liability: Scale,
  privacy: ShieldCheck,
  changes: FileText,
  contact: Info,
};

export default function TermsPageClient() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<Language>("fi");
  const [showMobilePageNav, setShowMobilePageNav] = useState(false);
  const t = copy[language].terms;
  const isFromAccount = searchParams.get("from") === "account";
  const backHref = isFromAccount ? "/account" : "/";
  const backLabel = isFromAccount ? t.backToAccount : t.back;

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

  const standardSections = [
    ["acceptance", t.sections.acceptance],
    ["about", t.sections.about],
    ["estimates", t.sections.estimates],
    ["responsibilities", t.sections.responsibilities],
    ["availability", t.sections.availability],
    ["intellectualProperty", t.sections.intellectualProperty],
    ["liability", t.sections.liability],
    ["privacy", t.sections.privacy],
    ["changes", t.sections.changes],
    ["contact", t.sections.contact],
  ] as const;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={backHref}
              className="text-sm font-bold text-teal-700 transition hover:text-teal-800"
            >
              {backLabel}
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
            <p className="text-xs font-bold uppercase text-teal-700">
              PalkkaPro
            </p>
            <h1 className="mt-2 break-words text-2xl font-black tracking-normal text-slate-950 sm:text-4xl">
              {t.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {t.subtitle}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">
                {t.effectiveDate}
              </span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">
                {t.lastUpdated}
              </span>
            </div>
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
              className="h-10 min-w-0 flex-1 rounded-md px-2 text-center text-[12px] font-bold leading-10 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
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
              className="h-10 min-w-0 flex-1 rounded-md bg-slate-950 px-2 text-center text-[12px] font-bold leading-10 text-white shadow-sm"
            >
              <span className="block truncate">{t.nav.terms}</span>
            </Link>
          </nav>
        </div>

        <section className="rounded-lg border border-teal-200 bg-teal-50 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-teal-800" />
            <h2 className="text-xl font-bold text-teal-950">
              {t.sections.affiliation.title}
            </h2>
          </div>
          <p className="mt-3 text-sm font-bold leading-6 text-teal-950">
            {t.sections.affiliation.highlighted}
          </p>
          <div className="mt-3 space-y-2 text-sm leading-6 text-teal-900">
            {t.sections.affiliation.body?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {t.sections.affiliation.items?.map((item) => (
              <div
                key={item}
                className="rounded-md border border-teal-200 bg-white/70 px-3 py-2 text-sm font-bold text-teal-950"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {standardSections.map(([key, section]) => {
            const Icon = sectionIcons[key];
            const isContact = key === "contact";
            const isPrivacy = key === "privacy";

            return (
              <article
                key={section.title}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-5 text-teal-700" />
                  <h2 className="text-xl font-bold text-slate-950">
                    {section.title}
                  </h2>
                </div>

                {section.body ? (
                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}

                {section.items ? (
                  <div className="mt-4 space-y-2">
                    {section.items.map((item) => (
                      <div
                        key={item}
                        className="flex gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold leading-5 text-slate-700"
                      >
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-700" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {isPrivacy ? (
                  <Link
                    href="/privacy"
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  >
                    {t.sections.privacy.link}
                  </Link>
                ) : null}

                {isContact ? (
                  <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800">
                    {t.sections.contact.contactValue}
                  </p>
                ) : null}
              </article>
            );
          })}
        </section>

        <footer className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="font-bold text-slate-900">PalkkaPro</div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/about"
              className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-teal-700"
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
              className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-bold text-teal-700"
            >
              {t.nav.terms}
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
