"use client";

import {
  BarChart3,
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Mail,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Language = "et" | "en" | "fi";
type AppView = "calculator" | "planner";
type ReportMode = "daily" | "weekly" | "monthly";
type StorageConsent = "checking" | "pending" | "accepted" | "declined";

type Field = {
  label: string;
  helper: string;
  value: string;
  setter: (value: string) => void;
  suffix: string;
  step?: string;
};

type WorkShift = {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  breakMinutes?: string;
  normalHours: string;
  eveningHours: string;
  nightHours: string;
  sundayHours: string;
  overtime50Hours: string;
  overtime100Hours: string;
  special50Hours: string;
  holiday100Hours: string;
  note: string;
};

const EVENING_BONUS = 0.73;
const NIGHT_BONUS = 1.36;
const DAY_MINUTES = 24 * 60;
const EVENING_START_MINUTES = 18 * 60;
const NIGHT_START_MINUTES = 23 * 60;
const NIGHT_END_MINUTES = 6 * 60;

const languageOptions: { code: Language; label: string }[] = [
  { code: "fi", label: "FI" },
  { code: "en", label: "EN" },
  { code: "et", label: "ET" },
];

const LANGUAGE_STORAGE_KEY = "palkkapro-language";
const CALCULATOR_STORAGE_KEY = "palkkapro-calculator-values";
const STORAGE_NOTICE_KEY = "palkkapro-storage-consent";
const SHIFTS_STORAGE_KEY = "palkkapro-work-shifts";
const USER_DATA_STORAGE_KEYS = [
  LANGUAGE_STORAGE_KEY,
  CALCULATOR_STORAGE_KEY,
  SHIFTS_STORAGE_KEY,
];
const FEEDBACK_EMAIL = "feedback@palkkapro.com";
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PalkkaPro",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  url: "https://palkkapro.com",
  image: "https://palkkapro.com/palkkapro-mark.svg",
  description:
    "A multilingual wage calculator for estimating gross and net pay for cleaning workers in Finland.",
  inLanguage: ["fi", "en", "et"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
};

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
  unemploymentPercentage: "0.89",
  otherDeductionsPercentage: "0",
};

type CalculatorValues = typeof defaults;
type SavedCalculatorSettings = Pick<
  CalculatorValues,
  | "hourlyWage"
  | "taxPercentage"
  | "pensionPercentage"
  | "unemploymentPercentage"
  | "otherDeductionsPercentage"
>;

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function addMonths(monthKey: string, change: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const nextDate = new Date(year, month - 1 + change, 1);

  return `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

function createEmptyShift(date = new Date().toISOString().slice(0, 10)): WorkShift {
  return {
    id: "",
    date,
    startTime: "09:00",
    endTime: "17:00",
    breakMinutes: "0",
    normalHours: "0",
    eveningHours: "0",
    nightHours: "0",
    sundayHours: "0",
    overtime50Hours: "0",
    overtime100Hours: "0",
    special50Hours: "0",
    holiday100Hours: "0",
    note: "",
  };
}

const copy = {
  et: {
    locale: "et-EE",
    languageLabel: "Keel",
    brand: "PalkkaPro",
    betaLabel: "Beta V1",
    intro:
      "Lihtne palgakalkulaator Soomes töötavale koristajale ja koristusala töötajale.",
    hoursBadge: "Tunnid",
    formTitle: "Sisesta andmed",
    formHelp: "Kõik väljad on muudetavad.",
    calculatorTab: "Kalkulaator",
    plannerTab: "Tööplaan",
    reset: "Taasta algväärtused",
    workSection: "Tunnid ja lisad",
    paySettingsSection: "Palgaseaded",
    basicSection: "Põhiandmed",
    overtimeSection: "Ületunnid",
    specialDaysSection: "Pühad ja eripäevad",
    detailsSection: "Detailne jaotus",
    deductionsSection: "Mahaarvamised",
    netPay: "Hinnanguline netopalk",
    netPayShort: "Hinnanguline netopalk",
    grossPay: "Brutopalk",
    grossPayShort: "Bruto",
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
    privacyLink: "Privaatsus",
    storageNoticeTitle: "Privaatsusseaded",
    storageNoticeText:
      "PalkkaPro saab kasutada brauseri salvestust, et mäletada sinu keelt, palgaseadeid ja kalendrisse lisatud tööpäevi. Kui keeldud, töötab kalkulaator edasi, aga andmeid ei salvestata.",
    storageNoticeAccept: "Nõustun",
    storageNoticeDecline: "Keeldun",
    premiumPreview: "Premium eelvaade",
    shiftPlannerTitle: "Tööpäevade planeerija",
    shiftPlannerIntro:
      "Vali kalendrist päev, sisesta tööaeg ja vaata kuu hinnangut.",
    selectedMonth: "Valitud kuu",
    addWorkday: "Lisa tööpäev",
    calendarTitle: "Kalender",
    clickDayToAdd: "Vali päev ja lisa tööaeg.",
    previousMonth: "Eelmine kuu",
    nextMonth: "Järgmine kuu",
    editWorkday: "Lisa tööpäev",
    edit: "Muuda",
    startTime: "Algus",
    endTime: "Lõpp",
    breakMinutes: "Paus",
    saveWorkday: "Salvesta tööpäev",
    close: "Sulge",
    autoCalculated: "Automaatselt arvutatud",
    totalWorked: "Töötunnid",
    eveningShort: "Õhtu",
    nightShort: "Öö",
    sundayShort: "Pühapäev",
    reportButton: "Vaata raportit",
    reportTitle: "Tasu raport",
    dailyReport: "Päevad",
    weeklyReport: "Nädalad",
    monthlyReport: "Kuu",
    bonusSummary: "Lisatasude kokkuvõte",
    noReportRows: "Raporti jaoks pole veel tööpäevi.",
    period: "Periood",
    hours: "Tunnid",
    amount: "Summa",
    weekdays: ["E", "T", "K", "N", "R", "L", "P"],
    savedWorkdays: "Salvestatud tööpäevad",
    recentWorkdays: "Viimased tööpäevad",
    allWorkdays: "Kõik tööpäevad",
    showAll: "Näita kõiki",
    noWorkdays: "Selles kuus pole veel tööpäevi.",
    shiftSummary: "Kuu kokkuvõte",
    earningsTrend: "Teenistuse trend",
    lastSixMonths: "Viimased 6 kuud",
    averageMonth: "Keskmine",
    workdays: "Tööpäevad",
    remove: "Kustuta",
    note: "Märkus",
    date: "Kuupäev",
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
    betaLabel: "Beta V1",
    intro:
      "A simple wage calculator for cleaners and cleaning industry workers in Finland.",
    hoursBadge: "Hours",
    formTitle: "Enter details",
    formHelp: "All fields are editable.",
    calculatorTab: "Calculator",
    plannerTab: "Work Planner",
    reset: "Reset values",
    workSection: "Hours and bonuses",
    paySettingsSection: "Pay settings",
    basicSection: "Basic details",
    overtimeSection: "Overtime",
    specialDaysSection: "Holidays and special days",
    detailsSection: "Detailed breakdown",
    deductionsSection: "Deductions",
    netPay: "Estimated net pay",
    netPayShort: "Estimated net pay",
    grossPay: "Gross pay",
    grossPayShort: "Gross",
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
    privacyLink: "Privacy",
    storageNoticeTitle: "Privacy preferences",
    storageNoticeText:
      "PalkkaPro can use browser storage to remember your language, wage settings and saved calendar workdays. If you decline, the calculator still works, but your data is not saved.",
    storageNoticeAccept: "Accept",
    storageNoticeDecline: "Decline",
    premiumPreview: "Premium preview",
    shiftPlannerTitle: "Workday planner",
    shiftPlannerIntro:
      "Pick a day, enter work times and see the monthly estimate.",
    selectedMonth: "Selected month",
    addWorkday: "Add workday",
    calendarTitle: "Calendar",
    clickDayToAdd: "Choose a day and add work time.",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    editWorkday: "Add workday",
    edit: "Edit",
    startTime: "Start",
    endTime: "End",
    breakMinutes: "Break",
    saveWorkday: "Save workday",
    close: "Close",
    autoCalculated: "Automatically calculated",
    totalWorked: "Worked hours",
    eveningShort: "Evening",
    nightShort: "Night",
    sundayShort: "Sunday",
    reportButton: "View report",
    reportTitle: "Pay report",
    dailyReport: "Days",
    weeklyReport: "Weeks",
    monthlyReport: "Month",
    bonusSummary: "Bonus summary",
    noReportRows: "Add workdays to see a report.",
    period: "Period",
    hours: "Hours",
    amount: "Amount",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    savedWorkdays: "Saved workdays",
    recentWorkdays: "Recent workdays",
    allWorkdays: "All workdays",
    showAll: "Show all",
    noWorkdays: "No workdays added for this month yet.",
    shiftSummary: "Monthly summary",
    earningsTrend: "Earnings trend",
    lastSixMonths: "Last 6 months",
    averageMonth: "Average",
    workdays: "Workdays",
    remove: "Remove",
    note: "Note",
    date: "Date",
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
    betaLabel: "Beta V1",
    intro:
      "Yksinkertainen palkkalaskuri Suomessa työskentelevälle siivoojalle ja siivousalan työntekijälle.",
    hoursBadge: "Tunnit",
    formTitle: "Syötä tiedot",
    formHelp: "Kaikkia kenttiä voi muuttaa.",
    calculatorTab: "Laskuri",
    plannerTab: "Työvuorot",
    reset: "Palauta arvot",
    workSection: "Tunnit ja lisät",
    paySettingsSection: "Palkka-asetukset",
    basicSection: "Perustiedot",
    overtimeSection: "Ylityöt",
    specialDaysSection: "Pyhät ja erityispäivät",
    detailsSection: "Tarkempi erittely",
    deductionsSection: "Vähennykset",
    netPay: "Arvioitu nettopalkka",
    netPayShort: "Arvioitu nettopalkka",
    grossPay: "Bruttopalkka",
    grossPayShort: "Brutto",
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
    privacyLink: "Tietosuoja",
    storageNoticeTitle: "Tietosuoja-asetukset",
    storageNoticeText:
      "PalkkaPro voi käyttää selaimen tallennustilaa muistaakseen kielen, palkka-asetukset ja kalenteriin tallennetut työpäivät. Jos kieltäydyt, laskuri toimii edelleen, mutta tietoja ei tallenneta.",
    storageNoticeAccept: "Hyväksyn",
    storageNoticeDecline: "Kieltäydyn",
    premiumPreview: "Premium-esikatselu",
    shiftPlannerTitle: "Työpäivien suunnittelija",
    shiftPlannerIntro:
      "Valitse päivä, lisää työaika ja katso kuukauden arvio.",
    selectedMonth: "Valittu kuukausi",
    addWorkday: "Lisää työpäivä",
    calendarTitle: "Kalenteri",
    clickDayToAdd: "Valitse päivä ja lisää työaika.",
    previousMonth: "Edellinen kuukausi",
    nextMonth: "Seuraava kuukausi",
    editWorkday: "Lisää työpäivä",
    edit: "Muokkaa",
    startTime: "Alku",
    endTime: "Loppu",
    breakMinutes: "Tauko",
    saveWorkday: "Tallenna työpäivä",
    close: "Sulje",
    autoCalculated: "Automaattisesti laskettu",
    totalWorked: "Työtunnit",
    eveningShort: "Ilta",
    nightShort: "Yö",
    sundayShort: "Sunnuntai",
    reportButton: "Näytä raportti",
    reportTitle: "Palkkaraportti",
    dailyReport: "Päivät",
    weeklyReport: "Viikot",
    monthlyReport: "Kuukausi",
    bonusSummary: "Lisien yhteenveto",
    noReportRows: "Lisää työpäiviä nähdäksesi raportin.",
    period: "Jakso",
    hours: "Tunnit",
    amount: "Summa",
    weekdays: ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"],
    savedWorkdays: "Tallennetut työpäivät",
    recentWorkdays: "Viimeisimmät työpäivät",
    allWorkdays: "Kaikki työpäivät",
    showAll: "Näytä kaikki",
    noWorkdays: "Tälle kuukaudelle ei ole vielä lisätty työpäiviä.",
    shiftSummary: "Kuukauden yhteenveto",
    earningsTrend: "Ansioiden kehitys",
    lastSixMonths: "Viimeiset 6 kuukautta",
    averageMonth: "Keskiarvo",
    workdays: "Työpäivät",
    remove: "Poista",
    note: "Muistiinpano",
    date: "Päivämäärä",
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

function roundHours(minutes: number) {
  return Math.round((minutes / 60) * 100) / 100;
}

function parseTimeToMinutes(time?: string) {
  if (!time || !time.includes(":")) {
    return null;
  }

  const [hoursValue, minutesValue] = time.split(":").map(Number);

  if (
    !Number.isFinite(hoursValue) ||
    !Number.isFinite(minutesValue) ||
    hoursValue < 0 ||
    hoursValue > 23 ||
    minutesValue < 0 ||
    minutesValue > 59
  ) {
    return null;
  }

  return hoursValue * 60 + minutesValue;
}

function getShiftCalculatedHours(shift: WorkShift) {
  const startMinutes = parseTimeToMinutes(shift.startTime);
  const endMinutes = parseTimeToMinutes(shift.endTime);

  if (startMinutes === null || endMinutes === null) {
    return {
      normalHours: parseInputNumber(shift.normalHours),
      eveningHours: parseInputNumber(shift.eveningHours),
      nightHours: parseInputNumber(shift.nightHours),
      sundayHours: parseInputNumber(shift.sundayHours),
      overtime50Hours: parseInputNumber(shift.overtime50Hours),
      overtime100Hours: parseInputNumber(shift.overtime100Hours),
      special50Hours: parseInputNumber(shift.special50Hours),
      holiday100Hours: parseInputNumber(shift.holiday100Hours),
    };
  }

  const endWithOvernight = endMinutes <= startMinutes ? endMinutes + DAY_MINUTES : endMinutes;
  const rawWorkedMinutes = Math.max(0, endWithOvernight - startMinutes);
  const breakMinutes = Math.min(
    rawWorkedMinutes,
    Math.max(0, parseInputNumber(shift.breakMinutes ?? "0")),
  );
  const workedMinutes = rawWorkedMinutes - breakMinutes;
  const minutesByType = {
    normal: 0,
    evening: 0,
    night: 0,
  };

  for (let minute = startMinutes; minute < endWithOvernight; minute += 1) {
    const minuteOfDay = minute % DAY_MINUTES;

    if (minuteOfDay < NIGHT_END_MINUTES || minuteOfDay >= NIGHT_START_MINUTES) {
      minutesByType.night += 1;
    } else if (minuteOfDay >= EVENING_START_MINUTES) {
      minutesByType.evening += 1;
    } else {
      minutesByType.normal += 1;
    }
  }

  let remainingBreak = breakMinutes;
  const subtractBreak = (key: keyof typeof minutesByType) => {
    const removed = Math.min(minutesByType[key], remainingBreak);
    minutesByType[key] -= removed;
    remainingBreak -= removed;
  };

  subtractBreak("normal");
  subtractBreak("evening");
  subtractBreak("night");

  const isSunday = new Date(`${shift.date}T12:00:00`).getDay() === 0;

  return {
    normalHours: roundHours(workedMinutes),
    eveningHours: roundHours(minutesByType.evening),
    nightHours: roundHours(minutesByType.night),
    sundayHours: isSunday ? roundHours(workedMinutes) : 0,
    overtime50Hours: parseInputNumber(shift.overtime50Hours),
    overtime100Hours: parseInputNumber(shift.overtime100Hours),
    special50Hours: parseInputNumber(shift.special50Hours),
    holiday100Hours: parseInputNumber(shift.holiday100Hours),
  };
}

function calculateShiftPay(
  shifts: WorkShift[],
  hourlyWage: number,
  totalDeductionsPercent: number,
) {
  const hours = shifts.reduce(
    (sum, shift) => {
      const shiftHours = getShiftCalculatedHours(shift);

      return {
        normalHours: sum.normalHours + shiftHours.normalHours,
        eveningHours: sum.eveningHours + shiftHours.eveningHours,
        nightHours: sum.nightHours + shiftHours.nightHours,
        sundayHours: sum.sundayHours + shiftHours.sundayHours,
        overtime50Hours: sum.overtime50Hours + shiftHours.overtime50Hours,
        overtime100Hours: sum.overtime100Hours + shiftHours.overtime100Hours,
        special50Hours: sum.special50Hours + shiftHours.special50Hours,
        holiday100Hours: sum.holiday100Hours + shiftHours.holiday100Hours,
      };
    },
    {
      normalHours: 0,
      eveningHours: 0,
      nightHours: 0,
      sundayHours: 0,
      overtime50Hours: 0,
      overtime100Hours: 0,
      special50Hours: 0,
      holiday100Hours: 0,
    },
  );

  const basePay = hourlyWage * hours.normalHours;
  const eveningBonusTotal = hours.eveningHours * EVENING_BONUS;
  const nightBonusTotal = hours.nightHours * NIGHT_BONUS;
  const sundayBonus = hourlyWage * hours.sundayHours;
  const holidayBonus100 = hourlyWage * hours.holiday100Hours;
  const specialBonus50 = hourlyWage * 0.5 * hours.special50Hours;
  const overtimePay =
    hours.overtime50Hours * hourlyWage * 1.5 +
    hours.overtime100Hours * hourlyWage * 2;
  const grossPay =
    basePay +
    eveningBonusTotal +
    nightBonusTotal +
    sundayBonus +
    holidayBonus100 +
    specialBonus50 +
    overtimePay;
  const estimatedNetPay = grossPay * (1 - totalDeductionsPercent / 100);
  const totalHours =
    hours.normalHours + hours.overtime50Hours + hours.overtime100Hours;

  return {
    ...hours,
    basePay,
    eveningBonusTotal,
    estimatedNetPay,
    grossPay,
    holidayBonus100,
    nightBonusTotal,
    overtimePay,
    specialBonus50,
    sundayBonus,
    totalHours,
  };
}

function getCalendarDays(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstDay = new Date(year, monthIndex - 1, 1);
  const daysInMonth = new Date(year, monthIndex, 0).getDate();
  const emptyDays = (firstDay.getDay() + 6) % 7;

  return [
    ...Array.from({ length: emptyDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return `${month}-${day.toString().padStart(2, "0")}`;
    }),
  ];
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekRangeLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  const mondayOffset = (date.getDay() + 6) % 7;
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - mondayOffset);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return `${formatDateKey(weekStart)} - ${formatDateKey(weekEnd)}`;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("fi");
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
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [shiftDraft, setShiftDraft] = useState<WorkShift>(createEmptyShift);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAllShiftsModalOpen, setIsAllShiftsModalOpen] = useState(false);
  const [storageConsent, setStorageConsent] =
    useState<StorageConsent>("checking");
  const [activeView, setActiveView] = useState<AppView>("calculator");
  const [reportMode, setReportMode] = useState<ReportMode>("daily");
  const hasLoadedCalculatorValues = useRef(false);
  const hasLoadedShifts = useRef(false);

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(STORAGE_NOTICE_KEY);

    if (savedConsent === "accepted" || savedConsent === "true") {
      const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (
        savedLanguage === "et" ||
        savedLanguage === "fi" ||
        savedLanguage === "en"
      ) {
        setLanguage(savedLanguage);
      }

      setStorageConsent("accepted");
    } else if (savedConsent === "declined") {
      setStorageConsent("declined");
    } else {
      setStorageConsent("pending");
    }
  }, []);

  useEffect(() => {
    if (storageConsent === "accepted") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language, storageConsent]);

  useEffect(() => {
    if (storageConsent !== "accepted") {
      return;
    }

    const savedValues = window.localStorage.getItem(CALCULATOR_STORAGE_KEY);

    window.setTimeout(() => {
      if (savedValues) {
        try {
          const parsed = JSON.parse(savedValues) as Partial<SavedCalculatorSettings>;

          if (typeof parsed.hourlyWage === "string") {
            setHourlyWage(parsed.hourlyWage);
          }

          if (typeof parsed.taxPercentage === "string") {
            setTaxPercentage(parsed.taxPercentage);
          }

          if (typeof parsed.pensionPercentage === "string") {
            setPensionPercentage(parsed.pensionPercentage);
          }

          if (typeof parsed.unemploymentPercentage === "string") {
            setUnemploymentPercentage(parsed.unemploymentPercentage);
          }

          if (typeof parsed.otherDeductionsPercentage === "string") {
            setOtherDeductionsPercentage(parsed.otherDeductionsPercentage);
          }
        } catch {
          window.localStorage.removeItem(CALCULATOR_STORAGE_KEY);
        }
      }

      hasLoadedCalculatorValues.current = true;
    }, 0);
  }, [storageConsent]);

  useEffect(() => {
    if (
      storageConsent !== "accepted" ||
      !hasLoadedCalculatorValues.current
    ) {
      return;
    }

    const values: SavedCalculatorSettings = {
      hourlyWage,
      taxPercentage,
      pensionPercentage,
      unemploymentPercentage,
      otherDeductionsPercentage,
    };

    window.localStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(values));
  }, [
    hourlyWage,
    otherDeductionsPercentage,
    pensionPercentage,
    storageConsent,
    taxPercentage,
    unemploymentPercentage,
  ]);

  useEffect(() => {
    if (storageConsent !== "accepted") {
      return;
    }

    const savedShifts = window.localStorage.getItem(SHIFTS_STORAGE_KEY);

    window.setTimeout(() => {
      if (savedShifts) {
        try {
          const parsed = JSON.parse(savedShifts);

          if (Array.isArray(parsed)) {
            setWorkShifts(parsed);
          }
        } catch {
          window.localStorage.removeItem(SHIFTS_STORAGE_KEY);
        }
      }

      hasLoadedShifts.current = true;
    }, 0);
  }, [storageConsent]);

  useEffect(() => {
    if (storageConsent === "accepted" && hasLoadedShifts.current) {
      window.localStorage.setItem(
        SHIFTS_STORAGE_KEY,
        JSON.stringify(workShifts),
      );
    }
  }, [storageConsent, workShifts]);

  useEffect(() => {
    const hasOpenModal =
      isShiftModalOpen || isAllShiftsModalOpen || isReportModalOpen;

    if (!hasOpenModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isAllShiftsModalOpen, isReportModalOpen, isShiftModalOpen]);

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

  const filteredShifts = useMemo(
    () =>
      workShifts
        .filter((shift) => shift.date.startsWith(selectedMonth))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [selectedMonth, workShifts],
  );

  const shiftTotals = useMemo(() => {
    const hourlyWageNumber = parseInputNumber(hourlyWage);
    const taxPercentageNumber = parseInputNumber(taxPercentage);
    const pensionPercentageNumber = parseInputNumber(pensionPercentage);
    const unemploymentPercentageNumber = parseInputNumber(unemploymentPercentage);
    const otherDeductionsPercentageNumber = parseInputNumber(
      otherDeductionsPercentage,
    );
    const totalsByHours = filteredShifts.reduce(
      (sum, shift) => {
        const shiftHours = getShiftCalculatedHours(shift);

        return {
          normalHours: sum.normalHours + shiftHours.normalHours,
          eveningHours: sum.eveningHours + shiftHours.eveningHours,
          nightHours: sum.nightHours + shiftHours.nightHours,
          sundayHours: sum.sundayHours + shiftHours.sundayHours,
          overtime50Hours: sum.overtime50Hours + shiftHours.overtime50Hours,
          overtime100Hours: sum.overtime100Hours + shiftHours.overtime100Hours,
          special50Hours: sum.special50Hours + shiftHours.special50Hours,
          holiday100Hours: sum.holiday100Hours + shiftHours.holiday100Hours,
        };
      },
      {
        normalHours: 0,
        eveningHours: 0,
        nightHours: 0,
        sundayHours: 0,
        overtime50Hours: 0,
        overtime100Hours: 0,
        special50Hours: 0,
        holiday100Hours: 0,
      },
    );

    const basePay = hourlyWageNumber * totalsByHours.normalHours;
    const eveningBonusTotal = totalsByHours.eveningHours * EVENING_BONUS;
    const nightBonusTotal = totalsByHours.nightHours * NIGHT_BONUS;
    const sundayBonus = hourlyWageNumber * totalsByHours.sundayHours;
    const holidayBonus100 = hourlyWageNumber * totalsByHours.holiday100Hours;
    const specialBonus50 = hourlyWageNumber * 0.5 * totalsByHours.special50Hours;
    const overtimePay =
      totalsByHours.overtime50Hours * hourlyWageNumber * 1.5 +
      totalsByHours.overtime100Hours * hourlyWageNumber * 2;
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
    const estimatedNetPay = grossPay * (1 - totalDeductionsPercent / 100);
    const totalHours =
      totalsByHours.normalHours +
      totalsByHours.overtime50Hours +
      totalsByHours.overtime100Hours;

    return {
      ...totalsByHours,
      basePay,
      eveningBonusTotal,
      grossPay,
      holidayBonus100,
      nightBonusTotal,
      overtimePay,
      specialBonus50,
      sundayBonus,
      estimatedNetPay,
      totalHours,
    };
  }, [
    filteredShifts,
    hourlyWage,
    otherDeductionsPercentage,
    pensionPercentage,
    taxPercentage,
    unemploymentPercentage,
  ]);

  const calendarDays = useMemo(
    () => getCalendarDays(selectedMonth),
    [selectedMonth],
  );

  const shiftsByDate = useMemo(
    () =>
      filteredShifts.reduce<Record<string, WorkShift[]>>((grouped, shift) => {
        grouped[shift.date] = [...(grouped[shift.date] ?? []), shift];
        return grouped;
      }, {}),
    [filteredShifts],
  );

  const shiftDraftPreview = useMemo(
    () => getShiftCalculatedHours(shiftDraft),
    [shiftDraft],
  );

  const recentShifts = useMemo(
    () => [...filteredShifts].reverse().slice(0, 5),
    [filteredShifts],
  );

  const earningsTrend = useMemo(() => {
    const hourlyWageNumber = parseInputNumber(hourlyWage);
    const totalDeductionsPercent =
      parseInputNumber(taxPercentage) +
      parseInputNumber(pensionPercentage) +
      parseInputNumber(unemploymentPercentage) +
      parseInputNumber(otherDeductionsPercentage);
    const months = Array.from({ length: 6 }, (_, index) =>
      addMonths(selectedMonth, index - 5),
    );

    const rows = months.map((month) => {
      const shifts = workShifts.filter((shift) => shift.date.startsWith(month));
      const pay = calculateShiftPay(
        shifts,
        hourlyWageNumber,
        totalDeductionsPercent,
      );

      return {
        month,
        ...pay,
      };
    });
    const maxGrossPay = Math.max(...rows.map((row) => row.grossPay), 1);
    const totalGrossPay = rows.reduce((sum, row) => sum + row.grossPay, 0);
    const totalNetPay = rows.reduce((sum, row) => sum + row.estimatedNetPay, 0);
    const totalHours = rows.reduce((sum, row) => sum + row.totalHours, 0);

    return {
      averageGrossPay: totalGrossPay / rows.length,
      maxGrossPay,
      rows,
      totalGrossPay,
      totalHours,
      totalNetPay,
    };
  }, [
    hourlyWage,
    otherDeductionsPercentage,
    pensionPercentage,
    selectedMonth,
    taxPercentage,
    unemploymentPercentage,
    workShifts,
  ]);

  const reportRows = useMemo(() => {
    const hourlyWageNumber = parseInputNumber(hourlyWage);
    const buildReportRow = (label: string, shifts: WorkShift[]) => {
      const hours = shifts.reduce(
        (sum, shift) => {
          const shiftHours = getShiftCalculatedHours(shift);

          return {
            normalHours: sum.normalHours + shiftHours.normalHours,
            eveningHours: sum.eveningHours + shiftHours.eveningHours,
            nightHours: sum.nightHours + shiftHours.nightHours,
            sundayHours: sum.sundayHours + shiftHours.sundayHours,
            overtime50Hours: sum.overtime50Hours + shiftHours.overtime50Hours,
            overtime100Hours:
              sum.overtime100Hours + shiftHours.overtime100Hours,
            special50Hours: sum.special50Hours + shiftHours.special50Hours,
            holiday100Hours: sum.holiday100Hours + shiftHours.holiday100Hours,
          };
        },
        {
          normalHours: 0,
          eveningHours: 0,
          nightHours: 0,
          sundayHours: 0,
          overtime50Hours: 0,
          overtime100Hours: 0,
          special50Hours: 0,
          holiday100Hours: 0,
        },
      );
      const basePay = hourlyWageNumber * hours.normalHours;
      const eveningBonusTotal = hours.eveningHours * EVENING_BONUS;
      const nightBonusTotal = hours.nightHours * NIGHT_BONUS;
      const sundayBonus = hourlyWageNumber * hours.sundayHours;
      const holidayBonus100 = hourlyWageNumber * hours.holiday100Hours;
      const specialBonus50 = hourlyWageNumber * 0.5 * hours.special50Hours;
      const overtimePay =
        hours.overtime50Hours * hourlyWageNumber * 1.5 +
        hours.overtime100Hours * hourlyWageNumber * 2;

      return {
        ...hours,
        basePay,
        eveningBonusTotal,
        grossPay:
          basePay +
          eveningBonusTotal +
          nightBonusTotal +
          sundayBonus +
          holidayBonus100 +
          specialBonus50 +
          overtimePay,
        holidayBonus100,
        label,
        nightBonusTotal,
        overtimePay,
        specialBonus50,
        sundayBonus,
      };
    };

    if (reportMode === "daily") {
      return Object.entries(shiftsByDate)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, shifts]) => buildReportRow(date, shifts));
    }

    if (reportMode === "monthly") {
      return filteredShifts.length > 0
        ? [buildReportRow(selectedMonth, filteredShifts)]
        : [];
    }

    const shiftsByWeek = filteredShifts.reduce<Record<string, WorkShift[]>>(
      (grouped, shift) => {
        const weekLabel = getWeekRangeLabel(shift.date);
        grouped[weekLabel] = [...(grouped[weekLabel] ?? []), shift];
        return grouped;
      },
      {},
    );

    return Object.entries(shiftsByWeek).map(([week, shifts]) =>
      buildReportRow(week, shifts),
    );
  }, [filteredShifts, hourlyWage, reportMode, selectedMonth, shiftsByDate]);

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

  const plannerPayFields: Field[] = [
    {
      label: fieldText.hourlyWage[0],
      helper: fieldText.hourlyWage[1],
      value: hourlyWage,
      setter: setHourlyWage,
      suffix: "€/h",
      step: "0.01",
    },
    ...deductionFields,
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

  function updateShiftDraft(field: keyof WorkShift, value: string) {
    setShiftDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function moveSelectedMonth(change: number) {
    setSelectedMonth((current) => {
      const [year, month] = current.split("-").map(Number);
      const nextDate = new Date(year, month - 1 + change, 1);

      return `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    });
  }

  function openShiftModal(date: string) {
    setShiftDraft(createEmptyShift(date));
    setEditingShiftId(null);
    setIsShiftModalOpen(true);
  }

  function openEditShiftModal(shift: WorkShift) {
    setShiftDraft({
      ...createEmptyShift(shift.date),
      ...shift,
    });
    setEditingShiftId(shift.id);
    setIsShiftModalOpen(true);
  }

  function saveShift(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const calculatedHours = getShiftCalculatedHours(shiftDraft);
    const savedShift = {
      ...shiftDraft,
      id: editingShiftId ?? crypto.randomUUID(),
      normalHours: calculatedHours.normalHours.toString(),
      eveningHours: calculatedHours.eveningHours.toString(),
      nightHours: calculatedHours.nightHours.toString(),
      sundayHours: calculatedHours.sundayHours.toString(),
    };

    setWorkShifts((current) =>
      editingShiftId
        ? current.map((shift) =>
            shift.id === editingShiftId ? savedShift : shift,
          )
        : [...current, savedShift],
    );
    setSelectedMonth(savedShift.date.slice(0, 7));
    setShiftDraft(createEmptyShift());
    setEditingShiftId(null);
    setIsShiftModalOpen(false);
  }

  function removeShift(id: string) {
    setWorkShifts((current) => current.filter((shift) => shift.id !== id));
  }

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);

    if (storageConsent === "accepted") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }
  }

  function acceptStorage() {
    const values: SavedCalculatorSettings = {
      hourlyWage,
      taxPercentage,
      pensionPercentage,
      unemploymentPercentage,
      otherDeductionsPercentage,
    };

    window.localStorage.setItem(STORAGE_NOTICE_KEY, "accepted");
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    window.localStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(values));
    window.localStorage.setItem(SHIFTS_STORAGE_KEY, JSON.stringify(workShifts));
    hasLoadedCalculatorValues.current = true;
    hasLoadedShifts.current = true;
    setStorageConsent("accepted");
  }

  function declineStorage() {
    USER_DATA_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    window.localStorage.setItem(STORAGE_NOTICE_KEY, "declined");
    hasLoadedCalculatorValues.current = false;
    hasLoadedShifts.current = false;
    setStorageConsent("declined");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:gap-5 lg:px-8">
        <header className="relative rounded-lg border border-slate-200 bg-white p-4 pr-20 shadow-sm lg:p-5 lg:pr-20">
            <label className="absolute right-3 top-3 lg:right-4 lg:top-4">
              <span className="sr-only">{t.languageLabel as string}</span>
              <select
                value={language}
                onChange={(event) => changeLanguage(event.target.value as Language)}
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
                  <Image
                    src="/palkkapro-mark.svg"
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 rounded-xl shadow-sm"
                    aria-hidden="true"
                  />
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
        </header>

        <div className="sticky top-0 z-30 -mx-4 border-b border-slate-200/80 bg-white/90 px-4 py-2 shadow-sm shadow-slate-900/5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0">
          <nav
            className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-fit"
            aria-label="PalkkaPro tools"
          >
            {(["calculator", "planner"] as AppView[]).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                className={`group relative h-10 min-w-0 flex-1 rounded-md px-2 text-[13px] font-bold transition sm:flex-none sm:px-4 sm:text-sm ${
                  activeView === view
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {view === "calculator" ? (
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <Calculator size={14} aria-hidden="true" />
                    <span>{t.calculatorTab as string}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <Lock size={13} aria-hidden="true" />
                    <span>{t.plannerTab as string}</span>
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {activeView === "calculator" ? (
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
              hoursLabel={t.hoursBadge as string}
              hoursValue={`${totals.totalHours} h`}
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
              hoursLabel={t.hoursBadge as string}
              hoursValue={`${totals.totalHours} h`}
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
        ) : null}

        {activeView === "planner" ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">
                  {t.shiftPlannerTitle as string}
                </h2>
                <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-bold uppercase text-teal-700">
                  {t.premiumPreview as string}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {t.shiftPlannerIntro as string}
              </p>
            </div>

            <label className="w-full max-w-56">
              <span className="text-xs font-bold uppercase text-slate-500">
                {t.selectedMonth as string}
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          </div>

          <div className="mt-4">
            <CollapsibleFieldGroup
              title={t.paySettingsSection as string}
              fields={plannerPayFields}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:mt-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)] xl:gap-5">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
              <div className="flex flex-col gap-2 rounded-md bg-white p-2.5 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:p-0 sm:ring-0">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-700">
                    {t.calendarTitle as string}
                  </h3>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {t.clickDayToAdd as string}
                  </p>
                </div>
                <div className="grid grid-cols-[32px_minmax(0,1fr)_32px] items-center gap-2 sm:flex sm:justify-end">
                  <button
                    type="button"
                    onClick={() => moveSelectedMonth(-1)}
                    className="grid size-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
                    aria-label={t.previousMonth as string}
                    title={t.previousMonth as string}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <p className="min-w-0 text-center text-sm font-bold text-slate-800 sm:min-w-24 sm:text-slate-700">
                    {selectedMonth}
                  </p>
                  <button
                    type="button"
                    onClick={() => moveSelectedMonth(1)}
                    className="grid size-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
                    aria-label={t.nextMonth as string}
                    title={t.nextMonth as string}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400 sm:mt-4 sm:text-[11px]">
                {(t.weekdays as string[]).map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>

              <div className="mt-1.5 grid grid-cols-7 gap-1 sm:mt-2">
                {calendarDays.map((date, index) => {
                  const dayShifts = date ? shiftsByDate[date] ?? [] : [];
                  const dayHours = dayShifts.reduce(
                    (sum, shift) => {
                      const shiftHours = getShiftCalculatedHours(shift);
                      return sum + shiftHours.normalHours;
                    },
                    0,
                  );
                  const isSunday =
                    date !== null && new Date(`${date}T12:00:00`).getDay() === 0;

                  return date ? (
                    <button
                      key={date}
                      type="button"
                      data-testid={`calendar-day-${date}`}
                      onClick={() => openShiftModal(date)}
                      className={`flex min-h-14 flex-col rounded-md border p-1.5 text-left transition hover:border-teal-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 sm:min-h-20 sm:p-2 ${
                        dayShifts.length > 0
                          ? "border-teal-200 bg-white"
                          : "border-slate-200 bg-white/70"
                      } ${isSunday ? "text-teal-800" : "text-slate-800"}`}
                    >
                      <span className="text-xs font-bold sm:text-sm">
                        {Number(date.slice(-2))}
                      </span>
                      {dayShifts.length > 0 ? (
                        <span className="mt-auto block rounded bg-teal-50 px-1 py-0.5 text-center text-[9px] font-bold leading-4 text-teal-700 sm:mt-2 sm:px-1.5 sm:py-1 sm:text-left sm:text-[11px]">
                          {dayShifts.length} / {roundHours(dayHours * 60)} h
                        </span>
                      ) : null}
                    </button>
                  ) : (
                    <span key={`empty-${index}`} className="min-h-14 sm:min-h-20" />
                  );
                })}
              </div>
            </section>

            <div className="space-y-3">
              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-bold text-slate-700">
                  {t.shiftSummary as string}
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2 lg:gap-3">
                  <MiniStat
                    label={t.workdays as string}
                    value={filteredShifts.length.toString()}
                  />
                  <MiniStat
                    label={t.hoursBadge as string}
                    value={`${shiftTotals.totalHours} h`}
                  />
                  <MiniStat
                    label={t.grossPayShort as string}
                    value={money.format(shiftTotals.grossPay)}
                  />
                  <MiniStat
                    label={t.netPayShort as string}
                    value={money.format(shiftTotals.estimatedNetPay)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:bg-white hover:text-teal-700"
                >
                  <BarChart3 size={14} />
                  {t.reportButton as string}
                </button>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">
                      {t.earningsTrend as string}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      {t.lastSixMonths as string}
                    </p>
                  </div>
                  <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700">
                    {t.premiumPreview as string}
                  </span>
                </div>

                <div className="mt-4 flex h-36 items-end gap-2 border-b border-slate-100 pb-2">
                  {earningsTrend.rows.map((row) => {
                    const barHeight = Math.max(
                      6,
                      Math.round((row.grossPay / earningsTrend.maxGrossPay) * 100),
                    );

                    return (
                      <div
                        key={row.month}
                        className="flex min-w-0 flex-1 flex-col items-center gap-2"
                      >
                        <div className="flex h-24 w-full items-end">
                          <div
                            className="w-full rounded-t bg-teal-500 transition"
                            style={{ height: `${barHeight}%` }}
                            aria-label={`${row.month}: ${money.format(
                              row.grossPay,
                            )}`}
                          />
                        </div>
                        <span className="truncate text-[10px] font-bold text-slate-400">
                          {row.month.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 grid grid-cols-[0.98fr_1.06fr_0.96fr] gap-2">
                  <MiniStat
                    label={t.grossPayShort as string}
                    value={money.format(earningsTrend.totalGrossPay)}
                  />
                  <MiniStat
                    label={t.netPayShort as string}
                    value={money.format(earningsTrend.totalNetPay)}
                  />
                  <MiniStat
                    label={t.averageMonth as string}
                    value={money.format(earningsTrend.averageGrossPay)}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-400">
                  {earningsTrend.totalHours} h
                </p>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-bold text-slate-700">
                  {t.recentWorkdays as string}
                </h3>
                <div className="mt-3 space-y-2">
                  {filteredShifts.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      {t.noWorkdays as string}
                    </p>
                  ) : (
                    recentShifts.map((shift) => (
                      <ShiftListItem
                        key={shift.id}
                        editLabel={t.edit as string}
                        removeLabel={t.remove as string}
                        shift={shift}
                        onEdit={openEditShiftModal}
                        onRemove={removeShift}
                      />
                    ))
                  )}
                </div>
                {filteredShifts.length > recentShifts.length ? (
                  <button
                    type="button"
                    onClick={() => setIsAllShiftsModalOpen(true)}
                    className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:bg-white hover:text-teal-700"
                  >
                    {t.showAll as string}
                  </button>
                ) : null}
              </section>
            </div>
          </div>
        </section>
        ) : null}

        {isShiftModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-3 sm:items-center sm:justify-center">
            <form
              onSubmit={saveShift}
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-teal-700">
                    {t.premiumPreview as string}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {editingShiftId
                      ? (t.edit as string)
                      : (t.editWorkday as string)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {shiftDraft.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingShiftId(null);
                    setIsShiftModalOpen(false);
                  }}
                  className="h-9 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {t.close as string}
                </button>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <PlannerInput
                  label={t.date as string}
                  value={shiftDraft.date}
                  onChange={(value) => updateShiftDraft("date", value)}
                  type="date"
                />
                <PlannerInput
                  label={t.breakMinutes as string}
                  value={shiftDraft.breakMinutes ?? "0"}
                  onChange={(value) => updateShiftDraft("breakMinutes", value)}
                  suffix="min"
                />
                <PlannerInput
                  label={t.startTime as string}
                  value={shiftDraft.startTime ?? ""}
                  onChange={(value) => updateShiftDraft("startTime", value)}
                  type="time"
                />
                <PlannerInput
                  label={t.endTime as string}
                  value={shiftDraft.endTime ?? ""}
                  onChange={(value) => updateShiftDraft("endTime", value)}
                  type="time"
                />
              </div>

              <section className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3">
                <h3 className="text-sm font-bold text-teal-900">
                  {t.autoCalculated as string}
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MiniStat
                    label={t.totalWorked as string}
                    value={`${shiftDraftPreview.normalHours} h`}
                  />
                  <MiniStat
                    label={t.eveningShort as string}
                    value={`${shiftDraftPreview.eveningHours} h`}
                  />
                  <MiniStat
                    label={t.nightShort as string}
                    value={`${shiftDraftPreview.nightHours} h`}
                  />
                  <MiniStat
                    label={t.sundayShort as string}
                    value={`${shiftDraftPreview.sundayHours} h`}
                  />
                </div>
              </section>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <PlannerInput
                  label={fieldText.overtime50Hours[0]}
                  value={shiftDraft.overtime50Hours}
                  onChange={(value) =>
                    updateShiftDraft("overtime50Hours", value)
                  }
                  suffix="h"
                />
                <PlannerInput
                  label={fieldText.overtime100Hours[0]}
                  value={shiftDraft.overtime100Hours}
                  onChange={(value) =>
                    updateShiftDraft("overtime100Hours", value)
                  }
                  suffix="h"
                />
                <PlannerInput
                  label={fieldText.special50Hours[0]}
                  value={shiftDraft.special50Hours}
                  onChange={(value) => updateShiftDraft("special50Hours", value)}
                  suffix="h"
                />
                <PlannerInput
                  label={fieldText.holiday100Hours[0]}
                  value={shiftDraft.holiday100Hours}
                  onChange={(value) =>
                    updateShiftDraft("holiday100Hours", value)
                  }
                  suffix="h"
                />
                <div>
                  <label className="block rounded-lg border border-slate-200 bg-white p-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                    <span className="text-xs font-bold text-slate-600">
                      {t.note as string}
                    </span>
                    <textarea
                      value={shiftDraft.note}
                      onChange={(event) =>
                        updateShiftDraft("note", event.target.value)
                      }
                      rows={2}
                      className="mt-2 min-h-20 w-full resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 sm:w-auto"
              >
                <Plus size={16} />
                {t.saveWorkday as string}
              </button>
            </form>
          </div>
        ) : null}

        {isAllShiftsModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-3 sm:items-center sm:justify-center">
            <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {t.allWorkdays as string}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedMonth}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAllShiftsModalOpen(false)}
                  className="h-9 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {t.close as string}
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {filteredShifts.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    {t.noWorkdays as string}
                  </p>
                ) : (
                  filteredShifts.map((shift) => (
                    <ShiftListItem
                      key={shift.id}
                      editLabel={t.edit as string}
                      removeLabel={t.remove as string}
                      shift={shift}
                      onEdit={(selectedShift) => {
                        setIsAllShiftsModalOpen(false);
                        openEditShiftModal(selectedShift);
                      }}
                      onRemove={removeShift}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}

        {isReportModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-3 sm:items-center sm:justify-center">
            <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-teal-700">
                    {t.premiumPreview as string}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {t.reportTitle as string}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedMonth}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="h-9 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {t.close as string}
                </button>
              </div>

              <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h3 className="text-sm font-bold text-slate-700">
                  {t.bonusSummary as string}
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <ReportMiniStat
                    label={t.eveningBonus as string}
                    hours={shiftTotals.eveningHours}
                    value={money.format(shiftTotals.eveningBonusTotal)}
                  />
                  <ReportMiniStat
                    label={t.nightBonus as string}
                    hours={shiftTotals.nightHours}
                    value={money.format(shiftTotals.nightBonusTotal)}
                  />
                  <ReportMiniStat
                    label={t.sundayBonus as string}
                    hours={shiftTotals.sundayHours}
                    value={money.format(shiftTotals.sundayBonus)}
                  />
                  <ReportMiniStat
                    label={t.specialBonus as string}
                    hours={shiftTotals.special50Hours}
                    value={money.format(shiftTotals.specialBonus50)}
                  />
                  <ReportMiniStat
                    label={t.holidayBonus as string}
                    hours={shiftTotals.holiday100Hours}
                    value={money.format(shiftTotals.holidayBonus100)}
                  />
                  <ReportMiniStat
                    label={t.overtimePay as string}
                    hours={
                      shiftTotals.overtime50Hours + shiftTotals.overtime100Hours
                    }
                    value={money.format(shiftTotals.overtimePay)}
                  />
                </div>
              </section>

              <div className="mt-4 inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
                {(["daily", "weekly", "monthly"] as ReportMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setReportMode(mode)}
                    className={`h-8 rounded px-3 text-xs font-bold transition ${
                      reportMode === mode
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {
                      {
                        daily: t.dailyReport as string,
                        weekly: t.weeklyReport as string,
                        monthly: t.monthlyReport as string,
                      }[mode]
                    }
                  </button>
                ))}
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                <div className="grid grid-cols-[1.15fr_0.7fr_0.85fr] bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase text-slate-500">
                  <span>{t.period as string}</span>
                  <span className="text-right">{t.hours as string}</span>
                  <span className="text-right">{t.amount as string}</span>
                </div>
                {reportRows.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-slate-500">
                    {t.noReportRows as string}
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {reportRows.map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-[1.15fr_0.7fr_0.85fr] px-3 py-2 text-sm"
                      >
                        <span className="font-semibold text-slate-800">
                          {row.label}
                        </span>
                        <span className="text-right text-slate-600">
                          {row.normalHours} h
                        </span>
                        <span className="text-right font-bold text-slate-900">
                          {money.format(row.grossPay)}
                        </span>
                        <span className="col-span-3 mt-1 text-xs leading-5 text-slate-500">
                          {t.eveningShort as string}: {row.eveningHours} h /{" "}
                          {money.format(row.eveningBonusTotal)} ·{" "}
                          {t.nightShort as string}: {row.nightHours} h /{" "}
                          {money.format(row.nightBonusTotal)} ·{" "}
                          {t.sundayShort as string}: {row.sundayHours} h /{" "}
                          {money.format(row.sundayBonus)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : null}

        <footer className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>{t.disclaimer as string}</p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {t.feedbackText as string}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href="/privacy"
              className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              {t.privacyLink as string}
            </Link>
            <a
              href={feedbackHref}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:bg-white hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <Mail size={14} />
              {t.feedbackButton as string}
            </a>
          </div>
        </footer>
      </div>

      {storageConsent === "pending" ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5 sm:pb-5">
          <section className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-3 overflow-hidden rounded-lg border border-slate-300 bg-white text-sm text-slate-600 shadow-2xl shadow-slate-950/25 ring-1 ring-slate-950/5 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-1 bg-teal-500 sm:h-auto sm:w-1 self-stretch" />
            <div className="px-4 pb-1 pt-3 sm:flex-1 sm:px-0 sm:py-4">
              <h2 className="text-sm font-black uppercase tracking-normal text-slate-950">
                {t.storageNoticeTitle as string}
              </h2>
              <p className="mt-1 leading-6">{t.storageNoticeText as string}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 px-4 pb-4 sm:flex-row sm:pr-4 sm:pt-4">
              <button
                type="button"
                onClick={declineStorage}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                {t.storageNoticeDecline as string}
              </button>
              <button
                type="button"
                onClick={acceptStorage}
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
              >
                {t.storageNoticeAccept as string}
              </button>
            </div>
          </section>
        </div>
      ) : null}
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

function PlannerInput({
  label,
  value,
  onChange,
  suffix,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  type?: "date" | "text" | "time";
}) {
  return (
    <label className="rounded-lg border border-slate-200 bg-white p-3 transition focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <span className="mt-2 flex h-11 items-center rounded-md border border-slate-200 bg-slate-50 px-3">
        <input
          type={type}
          inputMode={type === "text" ? "decimal" : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
        />
        {suffix ? (
          <span className="ml-2 shrink-0 text-xs font-semibold text-slate-500">
            {suffix}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-slate-50 p-2.5 sm:p-3">
      <p className="whitespace-normal text-[10px] font-semibold leading-3 text-slate-500 sm:text-xs sm:leading-4">
        {label}
      </p>
      <p className="mt-1 break-words text-[13px] font-bold leading-4 text-slate-900 sm:text-base sm:leading-5">
        {value}
      </p>
    </div>
  );
}

function ShiftListItem({
  editLabel,
  onEdit,
  onRemove,
  removeLabel,
  shift,
}: {
  editLabel: string;
  onEdit: (shift: WorkShift) => void;
  onRemove: (id: string) => void;
  removeLabel: string;
  shift: WorkShift;
}) {
  const calculatedShift = getShiftCalculatedHours(shift);

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
      <button
        type="button"
        onClick={() => onEdit(shift)}
        className="min-w-0 flex-1 text-left"
      >
        <p className="text-sm font-bold text-slate-800">
          {shift.date}
          {shift.startTime && shift.endTime
            ? `, ${shift.startTime}-${shift.endTime}`
            : ""}
        </p>
        <p className="text-xs text-slate-500">
          {calculatedShift.normalHours} h{shift.note ? ` - ${shift.note}` : ""}
        </p>
      </button>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(shift)}
          className="grid size-8 place-items-center rounded-md text-slate-400 transition hover:bg-white hover:text-teal-700"
          aria-label={editLabel}
          title={editLabel}
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(shift.id)}
          className="grid size-8 place-items-center rounded-md text-slate-400 transition hover:bg-white hover:text-red-600"
          aria-label={removeLabel}
          title={removeLabel}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function ReportMiniStat({
  label,
  hours,
  value,
}: {
  label: string;
  hours: number;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-md bg-white p-3">
      <p className="break-words text-xs font-semibold leading-4 text-slate-500">
        <BonusPercentLabel label={label} />
      </p>
      <p className="mt-1 break-words text-sm font-bold leading-5 text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{hours} h</p>
    </div>
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
  hoursLabel,
  hoursValue,
}: {
  netLabel: string;
  netValue: string;
  grossLabel: string;
  grossValue: string;
  hoursLabel: string;
  hoursValue: string;
}) {
  return (
    <section className="rounded-lg border border-slate-900 bg-slate-950 p-4 text-white shadow-sm lg:p-5">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <SalaryMetric label={netLabel} value={netValue} primary />
        <SalaryMetric label={grossLabel} value={grossValue} />
        <SalaryMetric label={hoursLabel} value={hoursValue} />
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
