export const TRIGGERS = [
  "Stressed",
  "Bored",
  "Social Pressure",
  "Convenience",
  "Planned",
];
export const CATEGORIES = [
  "Technology",
  "Clothing",
  "Home",
  "Leisure",
  "Other",
];
export const CURRENCIES = ["£", "$", "€"];
export const DAY = 86400000;
export const KEY = "steady.accountability.v1";
export const stamp = () => Date.now();
export const cents = (value) => Math.round(Number(value) * 100);
export const amountOK = (value) =>
  Number.isSafeInteger(value) && value > 0 && value <= 999999999;
export function money(value, symbol) {
  return (
    symbol +
    (value / 100).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
export const life = (value, wage) =>
  (value / wage).toLocaleString("en-GB", { maximumFractionDigits: 2 });
export function localDay(timestamp) {
  const d = new Date(timestamp);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY;
}
export function weekStart(now) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return +d;
}
export function before(now, days) {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return +d;
}
export function countdown(ms) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  const parts = [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];
  return parts
    .map((v, i) => v + ["d", "h", "m", "s"][i])
    .filter((_, i) => i || parts[0])
    .join(" ");
}
export function totals(data, now) {
  const today = localDay(now);
  const unplanned = data.expenses.filter(
    (e) => e.trigger !== "Planned" && e.at <= now,
  );
  const last = Math.max(
    localDay(data.started) - 1,
    ...unplanned.map((e) => localDay(e.at)),
  );
  const weekly = data.expenses
    .filter((e) => e.at >= weekStart(now) && e.at <= now)
    .reduce((s, e) => s + e.value, 0);
  return {
    streak: Math.max(0, today - last),
    weekly,
    saved: data.items
      .filter((i) => i.status === "skipped")
      .reduce((s, i) => s + i.value, 0),
    unplanned: unplanned.reduce((s, e) => s + e.value, 0),
  };
}
export function decide(data, id, choice, now, trigger) {
  const item = data.items.find((i) => i.id === id);
  if (!item || item.status !== "active" || (!item.fast && now < item.until))
    return data;
  if (
    !["bought", "skipped"].includes(choice) ||
    (choice === "bought" && !TRIGGERS.includes(trigger))
  )
    return data;
  const expenses =
    choice === "bought"
      ? [
          {
            id: "purchase-" + id,
            note: item.name,
            value: item.value,
            at: now,
            trigger,
          },
          ...data.expenses,
        ]
      : data.expenses;
  return {
    ...data,
    expenses,
    items: data.items.map((i) =>
      i.id === id ? { ...i, status: choice, closed: now } : i,
    ),
  };
}
export function safeURL(s) {
  if (!s) return "";
  try {
    const u = new URL(s);
    return ["http:", "https:"].includes(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
}
export function seed(now = Date.now()) {
  const base = {
    started: before(now, 18),
    version: 1,
    settings: { wage: 1850, budget: 10000, currency: "£" },
    lastNudge: 0,
  };
  const rows = [
    ["Coffee with friends", 650, 0, "Planned"],
    ["Cinema night", 1400, 1, "Planned"],
    ["Weekend lunch", 1850, 2, "Planned"],
    ["Bookshop browse", 2299, 6, "Bored"],
    ["Takeaway dinner", 2480, 8, "Convenience"],
    ["After-work drinks", 1950, 10, "Social Pressure"],
    ["Late-night snacks", 875, 12, "Stressed"],
  ];
  const items = [
    {
      id: "headphones",
      name: "Wireless headphones",
      category: "Technology",
      value: 8900,
      until: now + 17 * 3600000,
      created: now - 7 * 3600000,
      status: "active",
    },
    {
      id: "trainers",
      name: "Everyday trainers",
      category: "Clothing",
      value: 7500,
      until: now + 50 * 3600000,
      created: now - 22 * 3600000,
      status: "active",
    },
    {
      id: "lamp",
      name: "Desk lamp",
      category: "Home",
      value: 4500,
      status: "skipped",
      created: before(now, 6),
      until: before(now, 5),
      closed: before(now, 4),
    },
    {
      id: "speaker",
      name: "Portable speaker",
      category: "Technology",
      value: 5900,
      status: "skipped",
      created: before(now, 12),
      until: before(now, 11),
      closed: before(now, 10),
    },
  ];
  return {
    ...base,
    items: items.map((i) => ({ ...i, url: "", fast: false })),
    expenses: rows.map(([note, value, days, trigger], i) => ({
      id: "expense-" + i,
      note,
      value,
      trigger,
      at: before(now, days),
    })),
  };
}
export function valid(d) {
  const finite = (x) => typeof x === "number" && Number.isFinite(x);
  return (
    d?.version === 1 &&
    finite(d.started) &&
    finite(d.lastNudge) &&
    amountOK(d.settings?.wage) &&
    amountOK(d.settings?.budget) &&
    CURRENCIES.includes(d.settings.currency) &&
    Array.isArray(d.expenses) &&
    d.expenses.every(
      (e) =>
        e &&
        typeof e.id === "string" &&
        typeof e.note === "string" &&
        amountOK(e.value) &&
        finite(e.at) &&
        TRIGGERS.includes(e.trigger),
    ) &&
    Array.isArray(d.items) &&
    d.items.every(
      (i) =>
        i &&
        typeof i.id === "string" &&
        typeof i.name === "string" &&
        CATEGORIES.includes(i.category) &&
        amountOK(i.value) &&
        finite(i.until) &&
        finite(i.created) &&
        ["active", "skipped", "bought"].includes(i.status),
    )
  );
}
