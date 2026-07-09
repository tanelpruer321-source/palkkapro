"use client";

import { Calculator, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

type Language = "et" | "en" | "fi";

type Field = {
  label: string;
  helper: string;
  value: number;
  setter: (value: number) => void;
  suffix: string;
  step?: string;
};

const EVENING_BONUS = 0.73;
const NIGHT_BONUS = 1.36;

const languageOptions: { code: Language; label: string }[] = [
  { code: "et", label: "EE" },
  { code: "en", label: "EN" },
  { code: "fi", label: "FI" },
];

const defaults = {
  hourlyWage: 12.59,
  normalHours: 80,
  eveningHours: 8,
  nightHours: 0,
  sundayHours: 0,
  overtime50Hours: 0,
  overtime100Hours: 0,
  special50Hours: 0,
  holiday100Hours: 0,
  taxPercentage: 20,
  pensionPercentage: 7.15,
  unemploymentPercentage: 0.59,
  otherDeductionsPercentage: 0,
};

const copy = {
  et: {
    locale: "et-EE",
    languageLabel: "Keel",
    brand: "PalkkaPro",
    intro:
      "Lihtne palgakalkulaator Soomes töötavale koristusala töötajale.",
    hoursBadge: "Tunnid",
    formTitle: "Sisesta andmed",
    formHelp: "Kõik väljad on muudetavad.",
    reset: "Taasta algväärtused",
    workSection: "Tunnid ja lisad",
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
    intro:
      "A simple wage calculator for cleaning workers working in Finland.",
    hoursBadge: "Hours",
    formTitle: "Enter details",
    formHelp: "All fields are editable.",
    reset: "Reset values",
    workSection: "Hours and bonuses",
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
    intro:
      "Yksinkertainen palkkalaskuri Suomessa työskentelevälle siivousalan työntekijälle.",
    hoursBadge: "Tunnit",
    formTitle: "Syötä tiedot",
    formHelp: "Kaikkia kenttiä voi muuttaa.",
    reset: "Palauta arvot",
    workSection: "Tunnit ja lisät",
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

function toNumber(value: string) {
  return Number(value.replace(",", ".")) || 0;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("et");
  const t = copy[language];
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

  const totals = useMemo(() => {
    const basePay = hourlyWage * normalHours;
    const eveningBonusTotal = eveningHours * EVENING_BONUS;
    const nightBonusTotal = nightHours * NIGHT_BONUS;
    const sundayBonus = hourlyWage * sundayHours;
    const holidayBonus100 = hourlyWage * holiday100Hours;
    const specialBonus50 = hourlyWage * 0.5 * special50Hours;
    const overtimePay =
      overtime50Hours * hourlyWage * 1.5 +
      overtime100Hours * hourlyWage * 2;
    const grossPay =
      basePay +
      eveningBonusTotal +
      nightBonusTotal +
      sundayBonus +
      holidayBonus100 +
      specialBonus50 +
      overtimePay;
    const totalDeductionsPercent =
      taxPercentage +
      pensionPercentage +
      unemploymentPercentage +
      otherDeductionsPercentage;
    const estimatedTaxAmount = grossPay * (taxPercentage / 100);
    const pensionContributionAmount = grossPay * (pensionPercentage / 100);
    const unemploymentInsuranceAmount =
      grossPay * (unemploymentPercentage / 100);
    const otherDeductionsAmount =
      grossPay * (otherDeductionsPercentage / 100);
    const totalDeductions =
      estimatedTaxAmount +
      pensionContributionAmount +
      unemploymentInsuranceAmount +
      otherDeductionsAmount;
    const estimatedNetPay = grossPay * (1 - totalDeductionsPercent / 100);
    const totalHours = normalHours + overtime50Hours + overtime100Hours;

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

  const workFields: Field[] = [
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              {t.brand as string}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              {t.brand as string}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {t.intro as string}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
              <span className="px-2 text-xs font-semibold text-slate-500">
                {t.languageLabel as string}
              </span>
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLanguage(option.code)}
                  className={`h-8 rounded-md px-3 text-sm font-bold transition ${
                    language === option.code
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white"
                  }`}
                  aria-pressed={language === option.code}
                >
                  {option.label}
                </button>
              ))}
            </div>

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

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.06fr)_minmax(360px,0.94fr)]">
          <form className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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

            <FieldGroup title={t.workSection as string} fields={workFields} />
            <FieldGroup
              title={t.deductionsSection as string}
              fields={deductionFields}
            />
          </form>

          <aside className="flex flex-col gap-4">
            <section className="rounded-lg border border-slate-900 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-sm font-medium text-slate-300">
                {t.netPay as string}
              </p>
              <p className="mt-2 text-4xl font-bold">
                {money.format(totals.estimatedNetPay)}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Summary
                  label={t.grossPay as string}
                  value={money.format(totals.grossPay)}
                  dark
                />
                <Summary
                  label={t.deductions as string}
                  value={`${totals.totalDeductionsPercent.toFixed(2)} %`}
                  dark
                />
              </div>
            </section>

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
                strong
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
                strong
              />
            </ResultSection>
          </aside>
        </section>

        <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
          {t.disclaimer as string}
        </p>
      </div>
    </main>
  );
}

function FieldGroup({ title, fields }: { title: string; fields: Field[] }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold text-slate-700">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.label}
            className="rounded-lg border border-slate-200 bg-white p-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100"
          >
            <span className="flex min-h-10 flex-col justify-center">
              <span className="text-sm font-semibold text-slate-800">
                {field.label}
              </span>
              <span className="text-xs leading-5 text-slate-500">
                {field.helper}
              </span>
            </span>
            <span className="mt-3 flex h-11 items-center rounded-md border border-slate-200 bg-slate-50 px-3">
              <input
                type="number"
                min={0}
                step={field.step ?? "1"}
                value={field.value}
                onChange={(event) => field.setter(toNumber(event.target.value))}
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
    </section>
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4 divide-y divide-slate-100">{children}</div>
    </section>
  );
}

function Summary({
  label,
  value,
  dark,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div>
      <p className={dark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
        {label}
      </p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
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
    <div className="flex items-center justify-between gap-4 py-3">
      <p
        className={
          strong
            ? "text-sm font-bold text-slate-950"
            : "text-sm font-medium text-slate-600"
        }
      >
        {label}
      </p>
      <p className="shrink-0 text-base font-bold text-slate-950">
        {formatter.format(value)}
      </p>
    </div>
  );
}
