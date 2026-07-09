"use client";

import { Calculator, ChevronDown, Mail, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Language = "et" | "en" | "fi";

type Field = {
  label: string;
  helper: string;
  value: string;
  setter: (value: string) => void;
  suffix: string;
  step?: string;
};

const EVENING_BONUS = 0.73;
const NIGHT_BONUS = 1.36;

const languageOptions: { code: Language; label: string }[] = [
  { code: "fi", label: "FI" },
  { code: "en", label: "EN" },
  { code: "et", label: "ET" },
];

const LANGUAGE_STORAGE_KEY = "palkkapro-language";
const FEEDBACK_EMAIL = "feedback@palkkapro.com";

const defaults = {
  hourlyWage: "12.59",
  normalHours: "0",
  eveningHours: "0",
  nightHours: "0",
  sundayHours: "0",
  overtime50Hours: "0",
  overtime100Hours: "0",
  special50Hours: "0",
  holiday100Hours: "0",
  taxPercentage: "20",
  pensionPercentage: "7.15",
  unemploymentPercentage: "0.59",
  otherDeductionsPercentage: "0",
};

const copy = {
  et: {
    locale: "et-EE",
    languageLabel: "Keel",
    brand: "PalkkaPro",
    betaLabel: "Beta",
    intro:
      "Lihtne palgakalkulaator Soomes töötavale koristusala töötajale.",
    hoursBadge: "Tunnid",
    formTitle: "Sisesta andmed",
    formHelp: "Kõik väljad on muudetavad.",
    reset: "Taasta algväärtused",
    workSection: "Tunnid ja lisad",
    basicSection: "Põhiandmed",
    overtimeSection: "Ületunnid",
    specialDaysSection: "Pühad ja eripäevad",
    detailsSection: "Detailne jaotus",
    deductionsSection: "Mahaarvamised",
    netPay: "Hinnanguline netopalk",
    grossPay: "Brutopalk",
    deductions: "Mahaarvamised",
    paySection: "Palk",
    basePay: "Põhipalk",
    eveningBonus: "Õhtulisa",
    nightBonus: "Öölisa",
    sundayBonus: "Pühapäevalisa +100%",
    holidayBonus: "Pühade/tähtpäevade lisa +100%",
    specialBonus: "Eripäeva lisa +50%",
    overtimePay: "Ületunnitasu",
    tax: "Maks",
    pension: "Pensionimakse",
    unemployment: "Töötuskindlustus",
    otherDeductions: "Muud mahaarvamised",
    total: "Kokku",
    feedbackText: "Tagasiside ja parandused on oodatud.",
    feedbackButton: "Saada tagasisidet",
    feedbackSubject: "PalkkaPro tagasiside",
    disclaimer:
      "Netopalk on hinnanguline. Lõplik summa sõltub maksukaardist, vanusest, tööandja arvestusest ja võimalikest lisamahaarvamistest.",
    fields: {
      hourlyWage: ["Tunnipalk", "Muuda vastavalt lepingule"],
      normalHours: ["Töötunnid kokku", "Kõik töötunnid perioodis"],
      eveningHours: ["Õhtutunnid", `Lisa ${EVENING_BONUS.toFixed(2)} €/h`],
      nightHours: ["Öötunnid", `Lisa ${NIGHT_BONUS.toFixed(2)} €/h`],
      sundayHours: ["Pühapäevatunnid", "Lisatakse +100%"],
      overtime50Hours: ["50% ületunnid", "Eraldi ületunnid"],
      overtime100Hours: ["100% ületunnid", "Eraldi ületunnid"],
      special50Hours: ["Eripäeva tunnid", "Lisatakse +50%"],
      holiday100Hours: ["Püha- ja tähtpäevatunnid", "Lisatakse +100%"],
      taxPercentage: ["Maksuprotsent / vero %", "Maksukaardi järgi"],
      pensionPercentage: ["Pensionimakse", "Töötaja osa"],
      unemploymentPercentage: ["Töötuskindlustus", "Töötaja osa"],
      otherDeductionsPercentage: ["Muud mahaarvamised", "Soovi korral"],
    },
  },
  en: {
    locale: "en-US",
    languageLabel: "Language",
    brand: "PalkkaPro",
    betaLabel: "Beta",
    intro:
      "A simple wage calculator for cleaning workers working in Finland.",
    hoursBadge: "Hours",
    formTitle: "Enter details",
    formHelp: "All fields are editable.",
    reset: "Reset values",
    workSection: "Hours and bonuses",
    basicSection: "Basic details",
    overtimeSection: "Overtime",
    specialDaysSection: "Holidays and special days",
    detailsSection: "Detailed breakdown",
    deductionsSection: "Deductions",
    netPay: "Estimated net pay",
    grossPay: "Gross pay",
    deductions: "Deductions",
    paySection: "Pay",
    basePay: "Base pay",
    eveningBonus: "Evening bonus",
    nightBonus: "Night bonus",
    sundayBonus: "Sunday bonus +100%",
    holidayBonus: "Holiday bonus +100%",
    specialBonus: "Special day bonus +50%",
    overtimePay: "Overtime pay",
    tax: "Tax",
    pension: "Pension contribution",
    unemployment: "Unemployment insurance",
    otherDeductions: "Other deductions",
    total: "Total",
    feedbackText: "Feedback and corrections are welcome.",
    feedbackButton: "Send feedback",
    feedbackSubject: "PalkkaPro feedback",
    disclaimer:
      "Net pay is an estimate. The final amount depends on the tax card, age, employer payroll calculation and possible extra deductions.",
    fields: {
      hourlyWage: ["Hourly wage", "Edit based on your contract"],
      normalHours: ["Total worked hours", "All hours in the pay period"],
      eveningHours: ["Evening hours", `Bonus ${EVENING_BONUS.toFixed(2)} €/h`],
      nightHours: ["Night hours", `Bonus ${NIGHT_BONUS.toFixed(2)} €/h`],
      sundayHours: ["Sunday hours", "Adds +100%"],
      overtime50Hours: ["50% overtime", "Separate overtime hours"],
      overtime100Hours: ["100% overtime", "Separate overtime hours"],
      special50Hours: ["Special day hours", "Adds +50%"],
      holiday100Hours: ["Holiday hours", "Adds +100%"],
      taxPercentage: ["Tax percentage / vero %", "From your tax card"],
      pensionPercentage: ["Pension contribution", "Employee share"],
      unemploymentPercentage: ["Unemployment insurance", "Employee share"],
      otherDeductionsPercentage: ["Other deductions", "Optional"],
    },
  },
  fi: {
    locale: "fi-FI",
    languageLabel: "Kieli",
    brand: "PalkkaPro",
    betaLabel: "Beta",
    intro:
      "Yksinkertainen palkkalaskuri Suomessa työskentelevälle siivousalan työntekijälle.",
    hoursBadge: "Tunnit",
    formTitle: "Syötä tiedot",
    formHelp: "Kaikkia kenttiä voi muuttaa.",
    reset: "Palauta arvot",
    workSection: "Tunnit ja lisät",
    basicSection: "Perustiedot",
    overtimeSection: "Ylityöt",
    specialDaysSection: "Pyhät ja erityispäivät",
    detailsSection: "Tarkempi erittely",
    deductionsSection: "Vähennykset",
    netPay: "Arvioitu nettopalkka",
    grossPay: "Bruttopalkka",
    deductions: "Vähennykset",
    paySection: "Palkka",
    basePay: "Peruspalkka",
    eveningBonus: "Iltalisä",
    nightBonus: "Yölisä",
    sundayBonus: "Sunnuntailisä +100%",
    holidayBonus: "Pyhäpäivälisä +100%",
    specialBonus: "Erityispäivän lisä +50%",
    overtimePay: "Ylityökorvaus",
    tax: "Vero",
    pension: "Eläkemaksu",
    unemployment: "Työttömyysvakuutus",
    otherDeductions: "Muut vähennykset",
    total: "Yhteensä",
    feedbackText: "Palaute ja korjaukset ovat tervetulleita.",
    feedbackButton: "Lähetä palautetta",
    feedbackSubject: "PalkkaPro palaute",
    disclaimer:
      "Nettopalkka on arvio. Lopullinen summa riippuu verokortista, iästä, työnantajan palkanlaskennasta ja mahdollisista lisävähennyksistä.",
    fields: {
      hourlyWage: ["Tuntipalkka", "Muuta sopimuksesi mukaan"],
      normalHours: ["Työtunnit yhteensä", "Kaikki palkkakauden tunnit"],
      eveningHours: ["Iltatunnit", `Lisä ${EVENING_BONUS.toFixed(2)} €/h`],
      nightHours: ["Yötunnit", `Lisä ${NIGHT_BONUS.toFixed(2)} €/h`],
      sundayHours: ["Sunnuntaitunnit", "Lisää +100%"],
      overtime50Hours: ["50% ylityö", "Erilliset ylityötunnit"],
      overtime100Hours: ["100% ylityö", "Erilliset ylityötunnit"],
      special50Hours: ["Erityispäivän tunnit", "Lisää +50%"],
      holiday100Hours: ["Pyhäpäivätunnit", "Lisää +100%"],
      taxPercentage: ["Veroprosentti / vero %", "Verokortin mukaan"],
      pensionPercentage: ["Eläkemaksu", "Työntekijän osuus"],
      unemploymentPercentage: ["Työttömyysvakuutus", "Työntekijän osuus"],
      otherDeductionsPercentage: ["Muut vähennykset", "Valinnainen"],
    },
  },
} satisfies Record<Language, Record<string, unknown>>;

function parseInputNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "" || normalized === "." || normalized === "-") {
    return 0;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("fi");
  const hasLoadedLanguage = useRef(false);
  const t = copy[language];
  const feedbackHref = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
    t.feedbackSubject as string,
  )}`;
  const money = useMemo(
    () =>
      new Intl.NumberFormat(t.locale as string, {
        style: "currency",
        currency: "EUR",
      }),
    [t.locale],
  );

  const [hourlyWage, setHourlyWage] = useState(defaults.hourlyWage);
  const [normalHours, setNormalHours] = useState(defaults.normalHours);
  const [eveningHours, setEveningHours] = useState(defaults.eveningHours);
  const [nightHours, setNightHours] = useState(defaults.nightHours);
  const [sundayHours, setSundayHours] = useState(defaults.sundayHours);
  const [overtime50Hours, setOvertime50Hours] = useState(
    defaults.overtime50Hours,
  );
  const [overtime100Hours, setOvertime100Hours] = useState(
    defaults.overtime100Hours,
  );
  const [special50Hours, setSpecial50Hours] = useState(defaults.special50Hours);
  const [holiday100Hours, setHoliday100Hours] = useState(
    defaults.holiday100Hours,
  );
  const [taxPercentage, setTaxPercentage] = useState(defaults.taxPercentage);
  const [pensionPercentage, setPensionPercentage] = useState(
    defaults.pensionPercentage,
  );
  const [unemploymentPercentage, setUnemploymentPercentage] = useState(
    defaults.unemploymentPercentage,
  );
  const [otherDeductionsPercentage, setOtherDeductionsPercentage] = useState(
    defaults.otherDeductionsPercentage,
  );

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    window.setTimeout(() => {
      if (
        savedLanguage === "et" ||
        savedLanguage === "fi" ||
        savedLanguage === "en"
      ) {
        setLanguage(savedLanguage);
      }

      hasLoadedLanguage.current = true;
    }, 0);
  }, []);

  useEffect(() => {
    if (hasLoadedLanguage.current) {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  const totals = useMemo(() => {
    const hourlyWageNumber = parseInputNumber(hourlyWage);
    const normalHoursNumber = parseInputNumber(normalHours);
    const eveningHoursNumber = parseInputNumber(eveningHours);
    const nightHoursNumber = parseInputNumber(nightHours);
    const sundayHoursNumber = parseInputNumber(sundayHours);
    const overtime50HoursNumber = parseInputNumber(overtime50Hours);
    const overtime100HoursNumber = parseInputNumber(overtime100Hours);
    const special50HoursNumber = parseInputNumber(special50Hours);
    const holiday100HoursNumber = parseInputNumber(holiday100Hours);
    const taxPercentageNumber = parseInputNumber(taxPercentage);
    const pensionPercentageNumber = parseInputNumber(pensionPercentage);
    const unemploymentPercentageNumber = parseInputNumber(unemploymentPercentage);
    const otherDeductionsPercentageNumber = parseInputNumber(
      otherDeductionsPercentage,
    );

    const basePay = hourlyWageNumber * normalHoursNumber;
    const eveningBonusTotal = eveningHoursNumber * EVENING_BONUS;
    const nightBonusTotal = nightHoursNumber * NIGHT_BONUS;
    const sundayBonus = hourlyWageNumber * sundayHoursNumber;
    const holidayBonus100 = hourlyWageNumber * holiday100HoursNumber;
    const specialBonus50 = hourlyWageNumber * 0.5 * special50HoursNumber;
    const overtimePay =
      overtime50HoursNumber * hourlyWageNumber * 1.5 +
      overtime100HoursNumber * hourlyWageNumber * 2;
    const grossPay =
      basePay +
      eveningBonusTotal +
      nightBonusTotal +
      sundayBonus +
      holidayBonus100 +
      specialBonus50 +
      overtimePay;
    const totalDeductionsPercent =
      taxPercentageNumber +
      pensionPercentageNumber +
      unemploymentPercentageNumber +
      otherDeductionsPercentageNumber;
    const estimatedTaxAmount = grossPay * (taxPercentageNumber / 100);
    const pensionContributionAmount = grossPay * (pensionPercentageNumber / 100);
    const unemploymentInsuranceAmount =
      grossPay * (unemploymentPercentageNumber / 100);
    const otherDeductionsAmount =
      grossPay * (otherDeductionsPercentageNumber / 100);
    const totalDeductions =
      estimatedTaxAmount +
      pensionContributionAmount +
      unemploymentInsuranceAmount +
      otherDeductionsAmount;
    const estimatedNetPay = grossPay * (1 - totalDeductionsPercent / 100);
    const totalHours =
      normalHoursNumber + overtime50HoursNumber + overtime100HoursNumber;

    return {
      basePay,
      estimatedNetPay,
      estimatedTaxAmount,
      eveningBonusTotal,
      grossPay,
      holidayBonus100,
      nightBonusTotal,
      otherDeductionsAmount,
      overtimePay,
      pensionContributionAmount,
      specialBonus50,
      sundayBonus,
      totalDeductions,
      totalDeductionsPercent,
      totalHours,
      unemploymentInsuranceAmount,
    };
  }, [
    eveningHours,
    holiday100Hours,
    hourlyWage,
    nightHours,
    normalHours,
    otherDeductionsPercentage,
    overtime100Hours,
    overtime50Hours,
    pensionPercentage,
    special50Hours,
    sundayHours,
    taxPercentage,
    unemploymentPercentage,
  ]);

  const fieldText = t.fields as unknown as Record<string, [string, string]>;

  const basicFields: Field[] = [
    {
      label: fieldText.hourlyWage[0],
      helper: fieldText.hourlyWage[1],
      value: hourlyWage,
      setter: setHourlyWage,
      suffix: "€/h",
      step: "0.01",
    },
    {
      label: fieldText.normalHours[0],
      helper: fieldText.normalHours[1],
      value: normalHours,
      setter: setNormalHours,
      suffix: "h",
      step: "0.25",
    },
    {
      label: fieldText.eveningHours[0],
      helper: fieldText.eveningHours[1],
      value: eveningHours,
      setter: setEveningHours,
      suffix: "h",
      step: "0.25",
    },
    {
      label: fieldText.nightHours[0],
      helper: fieldText.nightHours[1],
      value: nightHours,
      setter: setNightHours,
      suffix: "h",
      step: "0.25",
    },
    {
      label: fieldText.sundayHours[0],
      helper: fieldText.sundayHours[1],
      value: sundayHours,
      setter: setSundayHours,
      suffix: "h",
      step: "0.25",
    },
  ];

  const overtimeFields: Field[] = [
    {
      label: fieldText.overtime50Hours[0],
      helper: fieldText.overtime50Hours[1],
      value: overtime50Hours,
      setter: setOvertime50Hours,
      suffix: "h",
      step: "0.25",
    },
    {
      label: fieldText.overtime100Hours[0],
      helper: fieldText.overtime100Hours[1],
      value: overtime100Hours,
      setter: setOvertime100Hours,
      suffix: "h",
      step: "0.25",
    },
  ];

  const specialDayFields: Field[] = [
    {
      label: fieldText.special50Hours[0],
      helper: fieldText.special50Hours[1],
      value: special50Hours,
      setter: setSpecial50Hours,
      suffix: "h",
      step: "0.25",
    },
    {
      label: fieldText.holiday100Hours[0],
      helper: fieldText.holiday100Hours[1],
      value: holiday100Hours,
      setter: setHoliday100Hours,
      suffix: "h",
      step: "0.25",
    },
  ];

  const workFields: Field[] = [
    ...basicFields,
    ...overtimeFields,
    ...specialDayFields,
  ];

  const deductionFields: Field[] = [
    {
      label: fieldText.taxPercentage[0],
      helper: fieldText.taxPercentage[1],
      value: taxPercentage,
      setter: setTaxPercentage,
      suffix: "%",
      step: "0.1",
    },
    {
      label: fieldText.pensionPercentage[0],
      helper: fieldText.pensionPercentage[1],
      value: pensionPercentage,
      setter: setPensionPercentage,
      suffix: "%",
      step: "0.01",
    },
    {
      label: fieldText.unemploymentPercentage[0],
      helper: fieldText.unemploymentPercentage[1],
      value: unemploymentPercentage,
      setter: setUnemploymentPercentage,
      suffix: "%",
      step: "0.01",
    },
    {
      label: fieldText.otherDeductionsPercentage[0],
      helper: fieldText.otherDeductionsPercentage[1],
      value: otherDeductionsPercentage,
      setter: setOtherDeductionsPercentage,
      suffix: "%",
      step: "0.1",
    },
  ];

  function resetValues() {
    setHourlyWage(defaults.hourlyWage);
    setNormalHours(defaults.normalHours);
    setEveningHours(defaults.eveningHours);
    setNightHours(defaults.nightHours);
    setSundayHours(defaults.sundayHours);
    setOvertime50Hours(defaults.overtime50Hours);
    setOvertime100Hours(defaults.overtime100Hours);
    setSpecial50Hours(defaults.special50Hours);
    setHoliday100Hours(defaults.holiday100Hours);
    setTaxPercentage(defaults.taxPercentage);
    setPensionPercentage(defaults.pensionPercentage);
    setUnemploymentPercentage(defaults.unemploymentPercentage);
    setOtherDeductionsPercentage(defaults.otherDeductionsPercentage);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:gap-5 lg:px-8">
        <header className="relative flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 pr-20 shadow-sm md:flex-row md:items-center md:justify-between lg:p-5 lg:pr-20">
          <label className="absolute right-3 top-3 lg:right-4 lg:top-4">
            <span className="sr-only">{t.languageLabel as string}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              aria-label={t.languageLabel as string}
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-slate-950 text-base font-black text-white shadow-sm ring-1 ring-slate-900">
                  P
                </span>
                <p className="text-2xl font-black tracking-normal text-slate-950">
                  {t.brand as string}
                </p>
              </div>
              <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-bold uppercase text-teal-700">
                {t.betaLabel as string}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {t.intro as string}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:mr-8 lg:mr-10">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-teal-700 shadow-sm">
                <Calculator size={20} />
              </span>
              <div>
                <p className="text-sm text-slate-500">{t.hoursBadge as string}</p>
                <p className="text-2xl font-bold">{totals.totalHours} h</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.06fr)_minmax(360px,0.94fr)] lg:gap-5">
          <form className="order-2 space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:order-1 lg:space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{t.formTitle as string}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t.formHelp as string}
                </p>
              </div>
              <button
                type="button"
                onClick={resetValues}
                className="grid size-10 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-700"
                aria-label={t.reset as string}
                title={t.reset as string}
              >
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="space-y-4 lg:hidden">
              <FieldGroup title={t.basicSection as string} fields={basicFields} />
              <CollapsibleFieldGroup
                title={t.overtimeSection as string}
                fields={overtimeFields}
              />
              <CollapsibleFieldGroup
                title={t.specialDaysSection as string}
                fields={specialDayFields}
              />
              <CollapsibleFieldGroup
                title={t.deductionsSection as string}
                fields={deductionFields}
              />
            </div>

            <div className="hidden space-y-5 lg:block">
              <FieldGroup title={t.workSection as string} fields={workFields} />
              <FieldGroup
                title={t.deductionsSection as string}
                fields={deductionFields}
              />
            </div>
          </form>

          <div className="order-1 lg:hidden">
            <SalarySummary
              netLabel={t.netPay as string}
              netValue={money.format(totals.estimatedNetPay)}
              grossLabel={t.grossPay as string}
              grossValue={money.format(totals.grossPay)}
            />
          </div>

          <div className="order-3 lg:hidden">
            <CollapsibleResultSection title={t.detailsSection as string}>
              <ResultBlock title={t.paySection as string}>
                <ResultRow
                  label={t.basePay as string}
                  value={totals.basePay}
                  formatter={money}
                />
                <ResultRow
                  label={t.eveningBonus as string}
                  value={totals.eveningBonusTotal}
                  formatter={money}
                />
                <ResultRow
                  label={t.nightBonus as string}
                  value={totals.nightBonusTotal}
                  formatter={money}
                />
                <ResultRow
                  label={t.sundayBonus as string}
                  value={totals.sundayBonus}
                  formatter={money}
                />
                <ResultRow
                  label={t.holidayBonus as string}
                  value={totals.holidayBonus100}
                  formatter={money}
                />
                <ResultRow
                  label={t.specialBonus as string}
                  value={totals.specialBonus50}
                  formatter={money}
                />
                <ResultRow
                  label={t.overtimePay as string}
                  value={totals.overtimePay}
                  formatter={money}
                />
                <ResultRow
                  label={t.grossPay as string}
                  value={totals.grossPay}
                  formatter={money}
                />
              </ResultBlock>

              <ResultBlock title={t.deductionsSection as string}>
                <ResultRow
                  label={t.tax as string}
                  value={totals.estimatedTaxAmount}
                  formatter={money}
                />
                <ResultRow
                  label={t.pension as string}
                  value={totals.pensionContributionAmount}
                  formatter={money}
                />
                <ResultRow
                  label={t.unemployment as string}
                  value={totals.unemploymentInsuranceAmount}
                  formatter={money}
                />
                <ResultRow
                  label={t.otherDeductions as string}
                  value={totals.otherDeductionsAmount}
                  formatter={money}
                />
                <ResultRow
                  label={t.total as string}
                  value={totals.totalDeductions}
                  formatter={money}
                />
              </ResultBlock>
            </CollapsibleResultSection>
          </div>

          <aside className="hidden flex-col gap-4 lg:order-2 lg:flex">
            <SalarySummary
              netLabel={t.netPay as string}
              netValue={money.format(totals.estimatedNetPay)}
              grossLabel={t.grossPay as string}
              grossValue={money.format(totals.grossPay)}
            />

            <ResultSection title={t.paySection as string}>
              <ResultRow
                label={t.basePay as string}
                value={totals.basePay}
                formatter={money}
              />
              <ResultRow
                label={t.eveningBonus as string}
                value={totals.eveningBonusTotal}
                formatter={money}
              />
              <ResultRow
                label={t.nightBonus as string}
                value={totals.nightBonusTotal}
                formatter={money}
              />
              <ResultRow
                label={t.sundayBonus as string}
                value={totals.sundayBonus}
                formatter={money}
              />
              <ResultRow
                label={t.holidayBonus as string}
                value={totals.holidayBonus100}
                formatter={money}
              />
              <ResultRow
                label={t.specialBonus as string}
                value={totals.specialBonus50}
                formatter={money}
              />
              <ResultRow
                label={t.overtimePay as string}
                value={totals.overtimePay}
                formatter={money}
              />
              <ResultRow
                label={t.grossPay as string}
                value={totals.grossPay}
                formatter={money}
              />
            </ResultSection>

            <ResultSection title={t.deductionsSection as string}>
              <ResultRow
                label={t.tax as string}
                value={totals.estimatedTaxAmount}
                formatter={money}
              />
              <ResultRow
                label={t.pension as string}
                value={totals.pensionContributionAmount}
                formatter={money}
              />
              <ResultRow
                label={t.unemployment as string}
                value={totals.unemploymentInsuranceAmount}
                formatter={money}
              />
              <ResultRow
                label={t.otherDeductions as string}
                value={totals.otherDeductionsAmount}
                formatter={money}
              />
              <ResultRow
                label={t.total as string}
                value={totals.totalDeductions}
                formatter={money}
              />
            </ResultSection>
          </aside>
        </section>

        <footer className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>{t.disclaimer as string}</p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {t.feedbackText as string}
            </p>
          </div>
          <a
            href={feedbackHref}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:bg-white hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
          >
            <Mail size={14} />
            {t.feedbackButton as string}
          </a>
        </footer>
      </div>
    </main>
  );
}

function FieldGroup({ title, fields }: { title: string; fields: Field[] }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-bold text-slate-700">{title}</h3>
      <FieldGrid fields={fields} />
    </section>
  );
}

function CollapsibleFieldGroup({
  title,
  fields,
}: {
  title: string;
  fields: Field[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-3 lg:bg-white">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm font-bold text-slate-700 lg:hidden"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <h3 className="mb-2 hidden text-sm font-bold text-slate-700 lg:block">
        {title}
      </h3>
      <div className={`${isOpen ? "mt-3 block" : "hidden"} lg:block`}>
        <FieldGrid fields={fields} />
      </div>
    </section>
  );
}

function FieldGrid({ fields }: { fields: Field[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:gap-3">
      {fields.map((field) => (
        <label
          key={field.label}
          className="rounded-lg border border-slate-200 bg-white p-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100"
        >
          <span className="flex min-h-9 flex-col justify-center">
            <span className="text-sm font-semibold text-slate-800">
              {field.label}
            </span>
            <span className="text-xs leading-5 text-slate-500">
              {field.helper}
            </span>
          </span>
          <span className="mt-2 flex h-12 items-center rounded-md border border-slate-200 bg-slate-50 px-3">
            <input
              type="text"
              inputMode="decimal"
              min={0}
              step={field.step ?? "1"}
              value={field.value}
              onChange={(event) => field.setter(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold outline-none"
              aria-label={field.label}
            />
            <span className="ml-2 shrink-0 text-sm font-medium text-slate-500">
              {field.suffix}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

function SalarySummary({
  netLabel,
  netValue,
  grossLabel,
  grossValue,
}: {
  netLabel: string;
  netValue: string;
  grossLabel: string;
  grossValue: string;
}) {
  return (
    <section className="rounded-lg border border-slate-900 bg-slate-950 p-4 text-white shadow-sm lg:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <SalaryMetric label={netLabel} value={netValue} primary />
        <SalaryMetric label={grossLabel} value={grossValue} />
      </div>
    </section>
  );
}

function SalaryMetric({
  label,
  value,
  primary,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <div
      className={
        primary
          ? "rounded-lg bg-white/10 p-3 ring-1 ring-white/10"
          : "rounded-lg bg-slate-900 p-3 ring-1 ring-white/10"
      }
    >
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className={primary ? "mt-1 text-3xl font-bold" : "mt-1 text-2xl font-bold"}>
        {value}
      </p>
    </div>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-700">{title}</h2>
      <div className="mt-3 divide-y divide-slate-100">{children}</div>
    </section>
  );
}

function CollapsibleResultSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm font-bold text-slate-700 lg:hidden"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-slate-400 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <h2 className="hidden text-sm font-bold text-slate-700 lg:block">{title}</h2>
      <div className={`${isOpen ? "mt-4 block" : "hidden"} lg:mt-4 lg:block`}>
        <div className="space-y-5">{children}</div>
      </div>
    </section>
  );
}

function ResultBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase text-slate-500">{title}</h3>
      <div className="mt-2 divide-y divide-slate-100">{children}</div>
    </section>
  );
}

function ResultRow({
  label,
  value,
  formatter,
  strong,
}: {
  label: string;
  value: number;
  formatter: Intl.NumberFormat;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <p
        className={
          strong
            ? "text-sm font-semibold text-slate-800"
            : "text-xs font-medium text-slate-500"
        }
      >
        <BonusPercentLabel label={label} />
      </p>
      <p
        className={
          strong
            ? "shrink-0 text-sm font-semibold text-slate-800"
            : "shrink-0 text-sm font-semibold text-slate-600"
        }
      >
        {formatter.format(value)}
      </p>
    </div>
  );
}

function BonusPercentLabel({ label }: { label: string }) {
  const parts = label.split(/(\+100%|\+50%)/g);

  return (
    <>
      {parts.map((part, index) =>
        part === "+100%" || part === "+50%" ? (
          <span key={`${part}-${index}`} className="font-bold text-emerald-600">
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}
