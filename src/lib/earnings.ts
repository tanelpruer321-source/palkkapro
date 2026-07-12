export type WorkShift = {
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

export const EVENING_BONUS = 0.73;
export const NIGHT_BONUS = 1.36;

const DAY_MINUTES = 24 * 60;
const EVENING_START_MINUTES = 18 * 60;
const NIGHT_START_MINUTES = 23 * 60;
const NIGHT_END_MINUTES = 6 * 60;

export function parseInputNumber(value: string) {
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

export function getShiftCalculatedHours(shift: WorkShift) {
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

  const endWithOvernight =
    endMinutes <= startMinutes ? endMinutes + DAY_MINUTES : endMinutes;
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

export function calculateShiftPay(
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
