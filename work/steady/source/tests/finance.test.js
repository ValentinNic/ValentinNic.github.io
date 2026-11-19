import test from "node:test";
import assert from "node:assert/strict";
import {
  DAY,
  TRIGGERS,
  before,
  decide,
  life,
  localDay,
  safeURL,
  seed,
  totals,
  valid,
  weekStart,
} from "../src/lib/finance.js";

const now = +new Date(2026, 10, 19, 12);
test("sample state is valid and contains each trigger", () => {
  const data = seed(now);
  assert.ok(valid(data));
  assert.deepEqual(
    new Set(data.expenses.map((e) => e.trigger)),
    new Set(TRIGGERS),
  );
  assert.equal(totals(data, now).saved, 10400);
  assert.equal(totals(data, now).streak, 6);
});
test("locked items cannot be bought and a resolved purchase cannot be applied twice", () => {
  const data = seed(now);
  assert.equal(decide(data, "headphones", "bought", now, "Bored"), data);
  const until = data.items[0].until;
  assert.equal(decide(data, "headphones", "bought", until, ""), data);
  const bought = decide(data, "headphones", "bought", until, "Bored");
  assert.equal(bought.expenses.length, data.expenses.length + 1);
  assert.equal(bought.expenses[0].value, 8900);
  assert.equal(totals(bought, until).streak, 0);
  assert.equal(decide(bought, "headphones", "bought", until, "Bored"), bought);
});
test("fast-forward permits an immediate skip without recording an expense", () => {
  const data = seed(now);
  data.items[0].fast = true;
  const skipped = decide(data, "headphones", "skipped", now);
  assert.equal(totals(skipped, now).saved, 19300);
  assert.equal(skipped.expenses.length, data.expenses.length);
  assert.equal(decide(skipped, "headphones", "skipped", now), skipped);
});
test("weekly totals use local Monday midnight and count both spending types", () => {
  const data = seed(now),
    start = weekStart(now);
  data.expenses = [
    { value: 500, at: start - 1, trigger: "Bored" },
    { value: 275, at: start, trigger: "Planned" },
    { value: 300, at: now, trigger: "Convenience" },
  ];
  assert.equal(totals(data, now).weekly, 575);
  assert.equal(new Date(start).getDay(), 1);
  assert.equal(new Date(start).getHours(), 0);
  assert.equal(totals(data, start + 7 * DAY + 3600000).weekly, 0);
});
test("streak uses local calendar dates and begins on the first tracked day", () => {
  const data = seed(now);
  data.started = before(now, 2);
  data.expenses = [];
  assert.equal(totals(data, now).streak, 3);
  assert.equal(localDay(now) - localDay(before(now, 1)), 1);
});
test("life hours, data validation and external URL validation", () => {
  assert.equal(life(3750, 1500), "2.5");
  assert.equal(safeURL("javascript:alert(1)"), "");
  assert.equal(safeURL("https://example.com/a"), "https://example.com/a");
  assert.equal(valid({ ...seed(now), settings: {} }), false);
  assert.equal(valid({ ...seed(now), expenses: [null] }), false);
});
