"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Language = "fi" | "en" | "et";

type PrivacyCopy = {
  back: string;
  title: string;
  intro: string;
  updated: string;
  languageLabel: string;
  sections: {
    title: string;
    body: string[];
  }[];
};

const LANGUAGE_STORAGE_KEY = "palkkapro-language";
const STORAGE_NOTICE_KEY = "palkkapro-storage-consent";

const languageOptions: { code: Language; label: string }[] = [
  { code: "fi", label: "FI" },
  { code: "en", label: "EN" },
  { code: "et", label: "ET" },
];

const copy: Record<Language, PrivacyCopy> = {
  fi: {
    back: "Takaisin PalkkaProhon",
    title: "Tietosuojaseloste",
    intro:
      "Tällä sivulla kerrotaan, miten PalkkaPro käsittelee selaimeen tallennettavia tietoja laskurin nykyisessä versiossa.",
    updated: "Päivitetty viimeksi: 10. heinäkuuta 2026",
    languageLabel: "Kieli",
    sections: [
      {
        title: "Mikä PalkkaPro on",
        body: [
          "PalkkaPro on palkkalaskuri, jolla voi arvioida Suomen siivousalan palkkaa. Laskuria voi käyttää ilman käyttäjätiliä.",
          "Tulokset ovat vain arvioita eivätkä korvaa virallista palkanlaskentaa, verokorttia, työsopimusta tai työehtosopimuksen tulkintaa.",
        ],
      },
      {
        title: "Mitä selaimeen tallennetaan",
        body: [
          "Jos hyväksyt selaimen tallennuksen, PalkkaPro voi muistaa valitsemasi kielen, tuntipalkan, vähennysprosentit ja kalenteriin tallennetut työpäivät.",
          "Nämä tiedot tallennetaan paikallisesti omaan selaimeesi. Nykyisessä versiossa niitä ei lähetetä PalkkaPro-tilille tai palvelimelle.",
        ],
      },
      {
        title: "Jos kieltäydyt tallennuksesta",
        body: [
          "Jos kieltäydyt selaimen tallennuksesta, laskuri toimii edelleen nykyisen käynnin aikana.",
          "Kieltä, palkka-asetuksia ja kalenterin työpäiviä ei tallenneta myöhempiä käyntejä varten, ja aiemmin selaimeen tallennetut PalkkaPro-tiedot poistetaan tästä selaimesta.",
        ],
      },
      {
        title: "Mitä PalkkaPro ei tee tässä versiossa",
        body: [
          "PalkkaPro ei vaadi rekisteröitymistä, ei kysy nimeäsi eikä tallenna palkkaa tai työpäiviä käyttäjätilille.",
          "PalkkaPro ei nykyisessä laskurissa käytä mainosevästeitä tai kolmannen osapuolen markkinointiseurantaa.",
        ],
      },
      {
        title: "Tallennettujen tietojen poistaminen",
        body: [
          "Voit poistaa PalkkaProhon tallennetut tiedot tyhjentämällä tämän sivuston selaintallennuksen tai sivustotiedot selaimen asetuksista.",
          "Voit myös kieltäytyä tallennuksesta, kun ilmoitus näytetään. Tämä poistaa tähän selaimeen tallennetut PalkkaPro-arvot.",
        ],
      },
      {
        title: "Tulevat tilit ja premium-ominaisuudet",
        body: [
          "PalkkaProhon voidaan myöhemmin lisätä käyttäjätilit, premium-ominaisuudet, työvuorojen tuonti tai pilvisynkronointi.",
          "Jos tällaisia ominaisuuksia lisätään, tätä tietosuojaselostetta päivitetään ennen käyttäjätiliin tai palvelimeen perustuvaa tallennusta.",
        ],
      },
      {
        title: "Yhteydenotto",
        body: [
          "Tietosuojaan liittyvissä kysymyksissä, palautteessa tai korjauspyynnöissä voit ottaa yhteyttä osoitteeseen feedback@palkkapro.com.",
        ],
      },
    ],
  },
  en: {
    back: "Back to PalkkaPro",
    title: "Privacy Policy",
    intro:
      "This page explains how PalkkaPro handles browser-saved data in the current version of the calculator.",
    updated: "Last updated: July 10, 2026",
    languageLabel: "Language",
    sections: [
      {
        title: "What PalkkaPro is",
        body: [
          "PalkkaPro is a salary calculator for estimating Finnish cleaning industry pay. The calculator can be used without creating an account.",
          "The results are estimates only and do not replace official payroll, tax card information, employment contracts or collective agreement interpretation.",
        ],
      },
      {
        title: "What is stored in your browser",
        body: [
          "If you accept browser storage, PalkkaPro can remember your selected language, hourly wage, deduction percentages and saved calendar workdays.",
          "This information is stored locally in your own browser using browser storage. In the current version, it is not sent to a PalkkaPro account or server.",
        ],
      },
      {
        title: "If you decline storage",
        body: [
          "If you decline browser storage, the calculator still works during your current visit.",
          "Your language, wage settings and calendar workdays will not be saved for later visits, and previous PalkkaPro browser-saved data is removed from this browser.",
        ],
      },
      {
        title: "What PalkkaPro does not do in this version",
        body: [
          "PalkkaPro does not require registration, does not ask for your name and does not store your salary or workdays in a user account.",
          "PalkkaPro does not currently use advertising cookies or third-party marketing tracking inside the calculator.",
        ],
      },
      {
        title: "How to delete saved data",
        body: [
          "You can delete saved PalkkaPro data by clearing this website's browser storage or site data in your browser settings.",
          "You can also decline storage when the notice is shown, which removes the PalkkaPro values saved in this browser.",
        ],
      },
      {
        title: "Future accounts and premium features",
        body: [
          "PalkkaPro may later add accounts, premium features, schedule import or cloud syncing.",
          "If those features are added, this privacy policy will be updated before account-based or server-side storage is used.",
        ],
      },
      {
        title: "Contact",
        body: [
          "For privacy questions, feedback or correction requests, contact PalkkaPro at feedback@palkkapro.com.",
        ],
      },
    ],
  },
  et: {
    back: "Tagasi PalkkaPro juurde",
    title: "Privaatsuspoliitika",
    intro:
      "Sellel lehel selgitame, kuidas PalkkaPro käsitleb brauserisse salvestatavaid andmeid kalkulaatori praeguses versioonis.",
    updated: "Viimati uuendatud: 10. juuli 2026",
    languageLabel: "Keel",
    sections: [
      {
        title: "Mis on PalkkaPro",
        body: [
          "PalkkaPro on palgakalkulaator Soome koristusala palga hindamiseks. Kalkulaatorit saab kasutada ilma kontot loomata.",
          "Tulemused on ainult hinnangulised ega asenda ametlikku palgaarvestust, maksukaarti, töölepingut ega kollektiivlepingu tõlgendust.",
        ],
      },
      {
        title: "Mida brauserisse salvestatakse",
        body: [
          "Kui nõustud brauseri salvestusega, saab PalkkaPro meeles pidada valitud keelt, tunnipalka, mahaarvamiste protsente ja kalendrisse salvestatud tööpäevi.",
          "Need andmed salvestatakse lokaalselt sinu enda brauserisse. Praeguses versioonis ei saadeta neid PalkkaPro kontole ega serverisse.",
        ],
      },
      {
        title: "Kui keeldud salvestamisest",
        body: [
          "Kui keeldud brauseri salvestusest, töötab kalkulaator selle külastuse ajal edasi.",
          "Keelt, palgaseadeid ja kalendri tööpäevi ei salvestata hilisemaks kasutamiseks ning varasemad PalkkaPro brauserisse salvestatud andmed eemaldatakse sellest brauserist.",
        ],
      },
      {
        title: "Mida PalkkaPro selles versioonis ei tee",
        body: [
          "PalkkaPro ei nõua registreerimist, ei küsi sinu nime ega salvesta palka või tööpäevi kasutajakontole.",
          "PalkkaPro ei kasuta praeguses kalkulaatoris reklaamiküpsiseid ega kolmanda osapoole turundusjälgimist.",
        ],
      },
      {
        title: "Kuidas salvestatud andmeid kustutada",
        body: [
          "Saad PalkkaPro salvestatud andmed kustutada, kui eemaldad brauseri seadetes selle veebilehe salvestusruumi või saidiandmed.",
          "Samuti saad salvestamisest keelduda, kui teavitus kuvatakse. See eemaldab sellesse brauserisse salvestatud PalkkaPro väärtused.",
        ],
      },
      {
        title: "Tulevased kontod ja premium-funktsioonid",
        body: [
          "PalkkaPro võib hiljem lisada kasutajakontod, premium-funktsioonid, töögraafiku impordi või pilvesünkroonimise.",
          "Kui need funktsioonid lisatakse, uuendatakse seda privaatsuspoliitikat enne kontopõhist või serveripoolset salvestamist.",
        ],
      },
      {
        title: "Kontakt",
        body: [
          "Privaatsusega seotud küsimuste, tagasiside või paranduste jaoks kirjuta aadressile feedback@palkkapro.com.",
        ],
      },
    ],
  },
};

export default function PrivacyPage() {
  const [language, setLanguage] = useState<Language>("fi");
  const t = copy[language];

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (
      savedLanguage === "fi" ||
      savedLanguage === "en" ||
      savedLanguage === "et"
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);

    if (window.localStorage.getItem(STORAGE_NOTICE_KEY) === "accepted") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
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
          <p className="mt-5 text-xs font-bold uppercase text-teal-700">
            PalkkaPro
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {t.intro}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-400">
            {t.updated}
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-6">
            {t.sections.map((section) => (
              <article key={section.title}>
                <h2 className="text-lg font-bold text-slate-900">
                  {section.title}
                </h2>
                <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
