import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateShiftPay,
  getShiftCalculatedHours,
  parseInputNumber,
  type WorkShift,
} from "../src/lib/earnings";

function shift(overrides: Partial<WorkShift>): WorkShift {
  return {
    id: crypto.randomUUID(),
    date: "2026-07-01",
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
    ...overrides,
  };
}

test("parses empty, invalid and comma decimal inputs safely", () => {
  assert.equal(parseInputNumber(""), 0);
  assert.equal(parseInputNumber("abc"), 0);
  assert.equal(parseInputNumber("12,5"), 12.5);
  assert.equal(parseInputNumber("12.5"), 12.5);
});

test("calculates evening and night hours for a shift crossing midnight", () => {
  const hours = getShiftCalculatedHours(
    shift({ date: "2026-07-10", startTime: "22:00", endTime: "02:00" }),
  );

  assert.equal(hours.normalHours, 4);
  assert.equal(hours.eveningHours, 1);
  assert.equal(hours.nightHours, 3);
});

test("calculates Sunday bonus hours from worked time", () => {
  const hours = getShiftCalculatedHours(
    shift({ date: "2026-07-12", startTime: "09:00", endTime: "17:00" }),
  );

  assert.equal(hours.normalHours, 8);
  assert.equal(hours.sundayHours, 8);
});

test("calculates estimated net pay with shared shift rules", () => {
  const pay = calculateShiftPay(
    [
      shift({ date: "2026-07-10", startTime: "22:00", endTime: "02:00" }),
      shift({
        date: "2026-07-12",
        holiday100Hours: "2",
        special50Hours: "1",
        startTime: "09:00",
        endTime: "17:00",
      }),
    ],
    10,
    20,
  );

  assert.equal(pay.totalHours, 12);
  assert.equal(pay.eveningBonusTotal, 0.73);
  assert.equal(pay.nightBonusTotal, 4.08);
  assert.equal(pay.sundayBonus, 80);
  assert.equal(pay.holidayBonus100, 20);
  assert.equal(pay.specialBonus50, 5);
  assert.equal(Math.round(pay.grossPay * 100) / 100, 229.81);
  assert.equal(Math.round(pay.estimatedNetPay * 100) / 100, 183.85);
});
