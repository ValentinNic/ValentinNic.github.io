# Steady — complete React project

## Project structure

```text
Steady/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── ExpenseLogger.jsx
│   │   ├── ImpulseVault.jsx
│   │   ├── Insights.jsx
│   │   ├── Settings.jsx
│   │   └── UI.jsx
│   ├── hooks/
│   │   └── useLocalStorage.js
│   ├── lib/
│   │   └── finance.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── tests/
│   └── finance.test.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js
```

## Dependencies

Pinned dependencies and scripts are in package.json below. The npm lockfile appears last.

## Files

### package.json

````json
{
  "name": "steady-accountability",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test"
  },
  "dependencies": {
    "lucide-react": "0.468.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "recharts": "3.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "4.7.0",
    "autoprefixer": "10.4.21",
    "postcss": "8.5.15",
    "tailwindcss": "3.4.19",
    "vite": "6.4.3"
  }
}
````

### README.md

````markdown
# Steady

A browser-local finance accountability app built with React, Vite, Tailwind CSS, Lucide and Recharts. Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Run `npm test` for the finance-model checks, `npm run build` for the static production bundle and `npm run preview` to serve the production build locally. Deploy the contents of dist to a static host over HTTPS. Relative asset paths and hash navigation support hosting under a portfolio subdirectory.

## How it works

The first visit seeds fictional purchases, locked items and previously skipped items. Changes persist in the current browser and origin. Storage failure falls back to session memory and shows a warning. Settings can restore the original demo pattern using today's date.

All amounts are stored in minor currency units. All logged expenses consume the weekly allowance, starting Monday at local midnight. Any trigger other than Planned counts as unplanned. The streak counts consecutive tracked calendar dates without an unplanned expense, including today. Life hours use the current hourly take-home wage. Changing currency changes the symbol only.

Vault deadlines use absolute timestamps. The demo fast-forward switch previews the unlocked state without altering the original deadline. Skipping adds the item's value to Saved by Waiting. Buying requires a trigger and commits the expense and vault decision together. An item can be resolved only once. The saved total represents avoided purchases, not a bank transfer.

The Money Buddy is fictional. A nudge changes a local once-per-day status and displays a simulated confirmation. No accounts, banking connections, partner balances, analytics or outbound notifications are used.
````

### index.html

````html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#12483b" />
    <meta
      name="description"
      content="Track mindful spending, pause impulse purchases and see your financial habits with Steady."
    />
    <title>Steady · Finance accountability</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
````

### postcss.config.js

````js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
````

### src/App.jsx

````jsx
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Vault,
  ReceiptText,
  ChartNoAxesColumnIncreasing,
  Settings2,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import ImpulseVault from "./components/ImpulseVault";
import ExpenseLogger from "./components/ExpenseLogger";
const Insights = React.lazy(() => import("./components/Insights"));
import Settings from "./components/Settings";
import useLocalStorage from "./hooks/useLocalStorage";

const pages = [
  ["dashboard", "Overview", "Home", LayoutDashboard, Dashboard],
  ["vault", "Impulse vault", "Vault", Vault, ImpulseVault],
  ["expenses", "Expense log", "Expenses", ReceiptText, ExpenseLogger],
  ["insights", "Insights", "Insights", ChartNoAxesColumnIncreasing, Insights],
  ["settings", "Settings", "Settings", Settings2, Settings],
];
function locationPage() {
  return pages.some((p) => p[0] === location.hash.slice(1))
    ? location.hash.slice(1)
    : "dashboard";
}
function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      Steady<span className="brand-point">.</span>
    </div>
  );
}
export default function App() {
  const { data, update, warning } = useLocalStorage();
  const [page, setPage] = useState(locationPage);
  const [now, setNow] = useState(Date.now);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    function change() {
      setPage(locationPage());
      window.scrollTo(0, 0);
      document.querySelector("main")?.focus();
    }
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, page === "vault" ? 1000 : 15000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [page]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);
  const current = pages.find((p) => p[0] === page),
    View = current[4];
  useEffect(() => {
    document.title = current[1] + " · Steady";
  }, [current]);
  function notify(text) {
    setNow(Date.now());
    setToast({ text });
  }
  function go(id) {
    location.hash = id;
  }
  function nav(mobile) {
    return pages.map(([id, label, short, Icon]) => (
      <a
        key={id}
        href={"#" + id}
        className={page === id ? "selected" : ""}
        aria-current={page === id ? "page" : undefined}
      >
        <Icon size={20} />
        <span>{mobile ? short : label}</span>
      </a>
    ));
  }
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main").focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        <nav aria-label="Main navigation">{nav(false)}</nav>
        <div className="local">
          <ShieldCheck size={19} />
          <div>
            <b>Private workspace</b>
            <small>Stored on this device</small>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="desktop-crumb">
            Workspace <span>/</span> <b>{current[1]}</b>
          </span>
          <div className="mobile-brand">
            <Brand />
          </div>
          <span className="date">
            <CalendarDays size={16} />
            {new Date(now).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
        </header>
        <main id="main" tabIndex="-1">
          {warning && (
            <div role="alert" className="warning">
              {warning}
            </div>
          )}
          <React.Suspense fallback={<p role="status">Loading insights…</p>}>
            <View {...{ data, update, notify, now, go }} />
          </React.Suspense>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav(true)}
      </nav>
      <div
        role="status"
        aria-live="polite"
        className={toast ? "toast" : "sr-only"}
      >
        {toast && (
          <>
            <CheckCircle2 size={18} />
            {toast.text}
          </>
        )}
      </div>
    </>
  );
}
````

### src/components/Dashboard.jsx

````jsx
import React from "react";
import {
  Flame,
  Plus,
  LockKeyhole,
  Wallet,
  Check,
  Bell,
  Users,
  Trophy,
  CircleCheck,
  Clock3,
  ChevronRight,
} from "lucide-react";
import { before, localDay, money, totals, weekStart } from "../lib/finance";
import { ItemIcon, PanelTitle, PageHeading } from "./UI";

export default function Dashboard({ data, now, go, update, notify }) {
  const { streak, weekly, saved } = totals(data, now);
  const { budget, currency } = data.settings;
  const remaining = budget - weekly;
  const spentDays = new Set(
    data.expenses
      .filter((e) => e.trigger !== "Planned")
      .map((e) => localDay(e.at)),
  );
  const days = Array.from({ length: 7 }, (_, i) => before(now, 6 - i));
  const recent = [...data.expenses].sort((a, b) => b.at - a.at).slice(0, 3);
  const nudged =
    data.lastNudge > 0 && localDay(data.lastNudge) === localDay(now);
  return (
    <>
      <div className="heading-actions">
        <PageHeading
          title="Your overview"
          subtitle="A little perspective on your spending habits."
        />
        <div className="actions">
          <button className="secondary" onClick={() => go("vault")}>
            <LockKeyhole /> Lock an impulse
          </button>
          <button className="primary" onClick={() => go("expenses")}>
            <Plus /> Log an expense
          </button>
        </div>
      </div>
      <div className="dash-grid">
        <section className="streak">
          <div className="contours" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <i
                key={i}
                style={{ width: 150 + i * 25, height: 190 + i * 21 }}
              />
            ))}
          </div>
          <div className="streak-content">
            <div className="hero-tag">
              <Flame size={17} /> No-spend streak
            </div>
            <div className="streak-number">
              {streak} <span>{streak === 1 ? "day" : "days"}</span>
            </div>
            <p>Without an unplanned purchase</p>
            <div className="weekdots">
              {days.map((d) => {
                const tracked = localDay(d) >= localDay(data.started);
                const clean = tracked && !spentDays.has(localDay(d));
                return (
                  <div
                    key={d}
                    title={
                      new Date(d).toLocaleDateString("en-GB") +
                      " · " +
                      (clean
                        ? "Impulse-free"
                        : tracked
                          ? "Unplanned spend"
                          : "Before tracking")
                    }
                  >
                    <span className={clean ? "clean" : ""}>
                      {clean ? <Check size={14} /> : "–"}
                    </span>
                    <small>
                      {new Date(d).toLocaleDateString("en-GB", {
                        weekday: "short",
                      })}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <section className="card budget">
          <PanelTitle icon={Wallet}>Weekly fun money</PanelTitle>
          <div className="big-number">
            {money(Math.abs(remaining), currency)}
          </div>
          <p>
            {remaining >= 0
              ? "left to enjoy this week"
              : "over your weekly allowance"}
          </p>
          <progress
            aria-label="Weekly allowance spent"
            max={budget}
            value={Math.min(weekly, budget)}
            className={remaining < 0 ? "over" : ""}
          />
          <div className="between small">
            <span>{money(weekly, currency)} spent</span>
            <span>{money(budget, currency)} budget</span>
          </div>
          <div className="card-foot">
            <Clock3 size={15} /> Week of{" "}
            {new Date(weekStart(now)).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
            })}
          </div>
        </section>
        <section className="card">
          <PanelTitle
            icon={Users}
            aside={<span className="chip">Simulated</span>}
          >
            Money buddy
          </PanelTitle>
          <div className="buddy">
            <span className="avatar">A</span>
            <div>
              <strong>Alex</strong>
              <small>Your accountability partner</small>
            </div>
          </div>
          <div className="signals">
            <span>
              <Flame />
              9-day streak
            </span>
            <span>
              <span className="dot" />
              Green week
            </span>
            <span>
              <CircleCheck />
              Sunday check-in done
            </span>
          </div>
          <button
            className="secondary compact"
            disabled={nudged}
            onClick={() => {
              update((s) => ({ ...s, lastNudge: Date.now() }));
              notify("Nudge sent to your simulated buddy, Alex.");
            }}
          >
            <Bell size={15} />
            {nudged ? "Nudged today" : "Send nudge"}
          </button>
        </section>
        <section className="card savings">
          <PanelTitle icon={Trophy}>Saved by waiting</PanelTitle>
          <div className="big-number">{money(saved, currency)}</div>
          <p>Value of items you chose to skip.</p>
          <button className="text-btn" onClick={() => go("vault")}>
            Open your vault <ChevronRight size={16} />
          </button>
        </section>
      </div>
      <section className="card recent">
        <PanelTitle
          aside={
            <button className="text-btn" onClick={() => go("expenses")}>
              View all <ChevronRight size={15} />
            </button>
          }
        >
          Recent expenses
        </PanelTitle>
        {recent.map((e) => (
          <div className="row" key={e.id}>
            <ItemIcon name={e.note} />
            <div className="grow">
              <strong>{e.note}</strong>
              <small>
                {new Date(e.at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                · {e.trigger}
              </small>
            </div>
            <b>{money(e.value, currency)}</b>
          </div>
        ))}
      </section>
    </>
  );
}
````

### src/components/ExpenseLogger.jsx

````jsx
import React, { useState } from "react";
import { Plus, ReceiptText, Search } from "lucide-react";
import { TRIGGERS, amountOK, cents, life, money } from "../lib/finance";
import { ItemIcon, MoneyInput, PageHeading, PanelTitle } from "./UI";

export default function ExpenseLogger({ data, update, notify }) {
  const [filter, setFilter] = useState("All triggers");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const { currency, wage } = data.settings;
  const rows = data.expenses
    .filter(
      (e) =>
        (filter === "All triggers" || e.trigger === filter) &&
        e.note.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => b.at - a.at);
  function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      value = cents(f.get("amount")),
      note = f.get("note").trim(),
      trigger = f.get("trigger");
    if (!amountOK(value) || !note || !TRIGGERS.includes(trigger)) {
      setError("Enter an amount, a short note and an emotional trigger.");
      return;
    }
    const expense = {
      id: crypto.randomUUID(),
      value,
      note,
      trigger,
      at: Date.now(),
    };
    update((s) => ({ ...s, expenses: [expense, ...s.expenses] }));
    e.currentTarget.reset();
    setError("");
    setFilter("All triggers");
    setQuery("");
    notify("Expense logged.");
  }
  return (
    <>
      <PageHeading
        title="Expense log"
        subtitle="Record what you spent and what prompted it."
      />
      <div className="workspace">
        <section className="card">
          <PanelTitle icon={ReceiptText}>Log an expense</PanelTitle>
          <form className="form" onSubmit={submit}>
            <MoneyInput label={"Amount (" + currency + ")"} name="amount" />
            <label>
              Note
              <input
                required
                maxLength={140}
                name="note"
                placeholder="e.g. Lunch with a friend"
              />
            </label>
            <label>
              Emotional trigger
              <select name="trigger" defaultValue="" required>
                <option value="" disabled>
                  Choose a trigger
                </option>
                {TRIGGERS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            {error && <p role="alert">{error}</p>}
            <button className="primary">
              <Plus />
              Save expense
            </button>
          </form>
        </section>
        <section className="card">
          <PanelTitle>Recent expenses</PanelTitle>
          <div className="filters">
            <label>
              Search notes
              <div className="search">
                <Search size={16} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search expenses"
                />
              </div>
            </label>
            <label>
              Filter by trigger
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {["All triggers", ...TRIGGERS].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          {rows.length ? (
            rows.map((e) => (
              <div className="row" key={e.id}>
                <ItemIcon name={e.note} />
                <div className="grow">
                  <strong>{e.note}</strong>
                  <small>
                    {e.trigger} ·{" "}
                    {new Date(e.at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </small>
                </div>
                <div className="amount">
                  <b>{money(e.value, currency)}</b>
                  <small>{life(e.value, wage)} life hours</small>
                </div>
              </div>
            ))
          ) : (
            <p className="empty">No expenses match these filters.</p>
          )}
        </section>
      </div>
    </>
  );
}
````

### src/components/ImpulseVault.jsx

````jsx
import React, { useState } from "react";
import {
  LockKeyhole,
  Plus,
  Trophy,
  ExternalLink,
  Timer,
  Check,
} from "lucide-react";
import {
  CATEGORIES,
  TRIGGERS,
  amountOK,
  cents,
  countdown,
  decide,
  life,
  money,
  safeURL,
  totals,
} from "../lib/finance";
import { ItemIcon, MoneyInput, PageHeading, PanelTitle } from "./UI";

function VaultItem({ item, now, settings, update, notify }) {
  const [trigger, setTrigger] = useState("");
  const ready = item.fast || item.until <= now;
  const decideItem = (choice) => {
    update((s) => decide(s, item.id, choice, Date.now(), trigger));
    notify(
      choice === "skipped"
        ? "Item skipped. Your saved total has been updated."
        : "Purchase recorded in your expense log.",
    );
  };
  return (
    <article className="vault-item">
      <div className="row">
        <ItemIcon category={item.category} />
        <div className="grow">
          <strong>{item.name}</strong>
          <small>{item.category}</small>
        </div>
        <b>{money(item.value, settings.currency)}</b>
      </div>
      <div className="between wrap small">
        <span>{life(item.value, settings.wage)} life hours</span>
        {safeURL(item.url) && (
          <a href={safeURL(item.url)} target="_blank" rel="noreferrer">
            Product link <ExternalLink size={13} />
          </a>
        )}
      </div>
      <div className={"timer " + (ready ? "ready" : "")}>
        <Timer size={16} />
        {ready
          ? "Ready for a decision"
          : countdown(item.until - now) + " remaining"}
      </div>
      <label className="switch">
        <input
          type="checkbox"
          checked={item.fast}
          onChange={(e) => {
            const fast = e.target.checked;
            update((s) => ({
              ...s,
              items: s.items.map((i) =>
                i.id === item.id ? { ...i, fast } : i,
              ),
            }));
          }}
        />
        Fast-forward timer <small>Demo</small>
      </label>
      {ready && (
        <div className="decision">
          <button className="primary" onClick={() => decideItem("skipped")}>
            <Check />
            Skipped · I didn’t need it
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              decideItem("bought");
            }}
          >
            <label>
              Purchase trigger
              <select
                required
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
              >
                <option value="">Choose a trigger</option>
                {TRIGGERS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <button className="secondary">Bought it</button>
          </form>
        </div>
      )}
    </article>
  );
}
export default function ImpulseVault({ data, update, notify, now }) {
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const active = data.items.filter((i) => i.status === "active");
  const history = data.items
    .filter((i) => i.status !== "active")
    .sort((a, b) => b.closed - a.closed);
  const { wage, currency } = data.settings;
  function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      name = f.get("name").trim(),
      url = f.get("url").trim(),
      value = cents(price);
    if (!name || !amountOK(value) || (url && !safeURL(url))) {
      setError(
        "Enter an item name, a positive price and an optional http or https link.",
      );
      return;
    }
    const created = Date.now(),
      item = {
        id: crypto.randomUUID(),
        name,
        value,
        url,
        category: f.get("category"),
        created,
        until: created + Number(f.get("duration")) * 3600000,
        fast: false,
        status: "active",
      };
    update((s) => ({ ...s, items: [item, ...s.items] }));
    e.currentTarget.reset();
    setPrice("");
    setError("");
    notify("Item locked. Your cooldown has started.");
  }
  return (
    <>
      <PageHeading
        title="Impulse vault"
        subtitle="Give a purchase time before giving it your money."
      />
      <section className="trophy-strip">
        <Trophy />
        <div>
          <small>Saved by waiting</small>
          <strong>{money(totals(data, now).saved, currency)}</strong>
        </div>
      </section>
      <div className="workspace">
        <section className="card">
          <PanelTitle icon={LockKeyhole}>Lock an impulse</PanelTitle>
          <form onSubmit={submit} className="form">
            <label>
              Item name
              <input
                name="name"
                required
                maxLength={100}
                placeholder="e.g. Wireless headphones"
              />
            </label>
            <MoneyInput
              name="price"
              label={"Price (" + currency + ")"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <div className="hint">
              Cost in life hours{" "}
              <b>{life(amountOK(cents(price)) ? cents(price) : 0, wage)} h</b>
            </div>
            <label>
              Category
              <select name="category">
                {CATEGORIES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Product URL (optional)
              <input name="url" type="url" placeholder="https://…" />
            </label>
            <label>
              Cooldown duration
              <select name="duration" defaultValue="72">
                <option value="24">24 hours</option>
                <option value="72">72 hours</option>
                <option value="168">7 days</option>
              </select>
            </label>
            {error && <p role="alert">{error}</p>}
            <button className="primary">
              <Plus />
              Lock item
            </button>
          </form>
        </section>
        <section className="card">
          <PanelTitle
            aside={<span className="chip">{active.length} active</span>}
          >
            In your vault
          </PanelTitle>
          {active.length ? (
            active.map((i) => (
              <VaultItem
                key={i.id}
                item={i}
                settings={data.settings}
                {...{ now, update, notify }}
              />
            ))
          ) : (
            <p>Your vault is clear. Add an item to start a cooldown.</p>
          )}
        </section>
      </div>
      <section className="card recent">
        <PanelTitle>Past decisions</PanelTitle>
        {history.length ? (
          history.map((i) => (
            <div className="row" key={i.id}>
              <ItemIcon category={i.category} />
              <div className="grow">
                <strong>{i.name}</strong>
                <small>
                  {i.status === "skipped" ? "Skipped" : "Bought"} ·{" "}
                  {new Date(i.closed).toLocaleDateString("en-GB")}
                </small>
              </div>
              <b>{money(i.value, currency)}</b>
            </div>
          ))
        ) : (
          <p>Your completed decisions will appear here.</p>
        )}
      </section>
    </>
  );
}
````

### src/components/Insights.jsx

````jsx
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { ChartNoAxesColumnIncreasing, Trophy, ReceiptText } from "lucide-react";
import { TRIGGERS, money, totals } from "../lib/finance";
import { PageHeading, PanelTitle } from "./UI";

export default function Insights({ data, now }) {
  const { currency } = data.settings;
  const groups = TRIGGERS.map((name) => ({
    name,
    value:
      data.expenses
        .filter((e) => e.trigger === name)
        .reduce((s, e) => s + e.value, 0) / 100,
  }));
  const { saved, unplanned } = totals(data, now);
  return (
    <>
      <PageHeading
        title="Behavioural insights"
        subtitle="See the patterns behind your discretionary spending."
      />
      <div className="two-col">
        <section className="card savings">
          <PanelTitle icon={Trophy}>Total impulse money saved</PanelTitle>
          <div className="big-number">{money(saved, currency)}</div>
          <p>Value of skipped vault purchases, all time.</p>
        </section>
        <section className="card">
          <PanelTitle icon={ReceiptText}>Total unplanned spend</PanelTitle>
          <div className="big-number amber">{money(unplanned, currency)}</div>
          <p>Logged expenses tagged with a trigger other than Planned.</p>
        </section>
      </div>
      <section className="card recent">
        <PanelTitle
          icon={ChartNoAxesColumnIncreasing}
          aside={<span className="chip">All time</span>}
        >
          Spending by trigger
        </PanelTitle>
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={groups}
              margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
              accessibilityLayer
            >
              <CartesianGrid
                horizontal={false}
                stroke="#e3eae6"
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                tickFormatter={(v) => currency + v}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={99}
                tick={{ fontSize: 12, fill: "#42544c" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [
                  money(Math.round(Number(v) * 100), currency),
                  "Spent",
                ]}
                cursor={{ fill: "#eef5f0" }}
              />
              <Bar
                dataKey="value"
                barSize={22}
                radius={[0, 6, 6, 0]}
                isAnimationActive={false}
              >
                {groups.map((g) => (
                  <Cell
                    key={g.name}
                    fill={g.name === "Planned" ? "#16815a" : "#819e90"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <details>
          <summary>View chart data</summary>
          <dl>
            {groups.map((g) => (
              <div className="between data-line" key={g.name}>
                <dt>{g.name}</dt>
                <dd>{money(Math.round(g.value * 100), currency)}</dd>
              </div>
            ))}
          </dl>
        </details>
      </section>
    </>
  );
}
````

### src/components/Settings.jsx

````jsx
import React, { useState } from "react";
import { Save, RotateCcw, SlidersHorizontal } from "lucide-react";
import { CURRENCIES, amountOK, cents, seed } from "../lib/finance";
import { MoneyInput, PageHeading, PanelTitle } from "./UI";

export default function Settings({ data, update, notify }) {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const { currency, wage, budget } = data.settings;
  function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const settings = {
      wage: cents(form.get("wage")),
      budget: cents(form.get("budget")),
      currency: form.get("currency"),
    };
    if (
      !amountOK(settings.wage) ||
      !amountOK(settings.budget) ||
      !CURRENCIES.includes(settings.currency)
    ) {
      setError("Enter positive amounts and select a currency.");
      return;
    }
    update((s) => ({ ...s, settings }));
    setError("");
    notify("Preferences saved.");
  }
  return (
    <>
      <PageHeading
        title="Settings"
        subtitle="Make the numbers work for your week."
      />
      <section className="card narrow">
        <PanelTitle icon={SlidersHorizontal}>Spending preferences</PanelTitle>
        <form
          key={[wage, budget, currency, data.started].join("/")}
          className="form"
          onSubmit={submit}
        >
          <MoneyInput
            name="wage"
            label="Hourly take-home wage"
            defaultValue={(wage / 100).toFixed(2)}
          />
          <p className="help">
            Life hours are the cost of a purchase divided by this hourly rate.
          </p>
          <MoneyInput
            name="budget"
            label="Weekly fun money budget"
            defaultValue={(budget / 100).toFixed(2)}
          />
          <p className="help">
            Your week starts on Monday in your local time zone.
          </p>
          <label>
            Currency symbol
            <select name="currency" defaultValue={currency}>
              {CURRENCIES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <p className="help">
            Changes the display symbol for all amounts. No currency conversion
            is applied.
          </p>
          {error && <p role="alert">{error}</p>}
          <button className="primary">
            <Save />
            Save preferences
          </button>
        </form>
      </section>
      <section className="card recent narrow">
        <PanelTitle>Demo data</PanelTitle>
        <p>
          Your records stay in this browser. Resetting replaces your entries and
          preferences with fresh sample data.
        </p>
        {confirm ? (
          <div className="actions">
            <button
              className="danger"
              onClick={() => {
                update(() => seed(), true);
                setConfirm(false);
                setError("");
                notify("Demo data restored.");
              }}
            >
              Confirm reset
            </button>
            <button className="secondary" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="secondary" onClick={() => setConfirm(true)}>
            <RotateCcw />
            Reset Demo Data
          </button>
        )}
      </section>
    </>
  );
}
````

### src/components/UI.jsx

````jsx
import React from "react";
import {
  BookOpen,
  Coffee,
  Headphones,
  Shirt,
  House,
  Package,
  ShoppingBag,
  Utensils,
  Film,
} from "lucide-react";

export function ItemIcon({ name = "", category = "" }) {
  let Icon =
    {
      Technology: Headphones,
      Clothing: Shirt,
      Home: House,
      Other: Package,
      Leisure: BookOpen,
    }[category] || ShoppingBag;
  if (/coffee/i.test(name)) Icon = Coffee;
  else if (/cinema/i.test(name)) Icon = Film;
  else if (/lunch|dinner/i.test(name)) Icon = Utensils;
  return (
    <span className={"item-icon " + (category === "Clothing" ? "peach" : "")}>
      <Icon size={20} />
    </span>
  );
}
export function PanelTitle({ icon: Icon, children, aside }) {
  return (
    <div className="panel-title">
      <h2>
        {Icon && <Icon size={19} />} {children}
      </h2>
      {aside}
    </div>
  );
}
export function MoneyInput({
  label,
  name,
  defaultValue,
  required = true,
  value,
  onChange,
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type="number"
        min=".01"
        max="9999999.99"
        step=".01"
        inputMode="decimal"
        placeholder="0.00"
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}
export function PageHeading({ title, subtitle }) {
  return (
    <div className="page-heading">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
````

### src/hooks/useLocalStorage.js

````js
import { useCallback, useEffect, useRef, useState } from "react";
import { KEY, seed, valid } from "../lib/finance";

function read() {
  const raw = window.localStorage.getItem(KEY);
  if (raw === null) return null;
  const parsed = JSON.parse(raw);
  if (!valid(parsed)) throw Error("Invalid saved data");
  return parsed;
}
export default function useLocalStorage() {
  const [initial] = useState(() => {
    try {
      return { data: read() || seed(), warning: "" };
    } catch {
      return {
        data: seed(),
        warning:
          "Saved data could not be read. Changes are available for this session.",
      };
    }
  });
  const [data, setData] = useState(initial.data);
  const [warning, setWarning] = useState(initial.warning);
  const current = useRef(data);
  const volatile = useRef(Boolean(initial.warning));
  const apply = useCallback((next) => {
    current.current = next;
    setData(next);
  }, []);
  useEffect(() => {
    try {
      if (!volatile.current && !read())
        localStorage.setItem(KEY, JSON.stringify(current.current));
    } catch {
      volatile.current = true;
      setWarning(
        "Browser storage is unavailable. Changes last for this session.",
      );
    }
    function sync(event) {
      if (event.key !== KEY && event.key !== null) return;
      try {
        const next = read();
        apply(next || seed());
        volatile.current = false;
        setWarning("");
      } catch {
        volatile.current = true;
        setWarning(
          "Saved data could not be read. Changes last for this session.",
        );
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [apply]);
  const update = useCallback(
    (transform, reset = false) => {
      let base = current.current;
      if (!volatile.current) {
        try {
          base = read() || base;
        } catch {
          volatile.current = true;
        }
      }
      const next = transform(base);
      if (reset) volatile.current = false;
      try {
        if (volatile.current) throw Error();
        localStorage.setItem(KEY, JSON.stringify(next));
        setWarning("");
      } catch {
        volatile.current = true;
        setWarning(
          "Changes last for this session. Use Settings to reset browser storage.",
        );
      }
      apply(next);
    },
    [apply],
  );
  return { data, update, warning };
}
````

### src/lib/finance.js

````js
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
````

### src/main.jsx

````jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
````

### src/styles.css

````css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family:
    Inter,
    ui-sans-serif,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: #1b3029;
  background: #f4f7f5;
  font-synthesis: none;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
button,
input,
select {
  font: inherit;
}
button,
a,
input,
select,
summary {
  touch-action: manipulation;
}
button,
summary,
select {
  cursor: pointer;
}
button:disabled {
  opacity: 0.65;
  cursor: default;
}
button,
a,
input,
select,
summary {
  outline-offset: 4px;
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
summary:focus-visible {
  outline: 3px solid #269566;
}
p {
  color: #52645c;
  line-height: 1.6;
  margin: 0.3rem 0 0.8rem;
}
h1,
h2,
strong,
b {
  color: #192e25;
}
h1 {
  font-size: clamp(2rem, 4vw, 3.15rem);
  font-weight: 650;
  line-height: 1.12;
  letter-spacing: -0.06em;
}
h2 {
  font-size: 1.12rem;
  font-weight: 680;
  letter-spacing: -0.035em;
}
small,
.small {
  font-size: 0.875rem;
  color: #52665b;
}
small {
  display: block;
}
svg {
  flex-shrink: 0;
}
a {
  color: #126549;
}
button {
  transition: background 0.15s ease;
}
button svg {
  width: 17px;
  height: 17px;
}
.skip {
  position: fixed;
  left: 1rem;
  top: -5rem;
  z-index: 100;
  background: white;
  padding: 1rem;
}
.skip:focus {
  top: 1rem;
}
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 218px;
  display: flex;
  flex-direction: column;
  background: #fcfdfb;
  border-right: 1px solid #dde5df;
  padding: 2rem 1.05rem;
  z-index: 4;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 2rem;
  font-weight: 740;
  letter-spacing: -0.085em;
  color: #143e2e;
  line-height: 1;
}
.sidebar .brand {
  padding-left: 0.65rem;
}
.brand-point {
  margin-left: -0.29em;
  color: #42a273;
}
.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: #1c694c;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  transform: rotate(-3deg);
}
.brand-mark i {
  display: block;
  background: #c8f4cb;
  width: 4px;
  height: 10px;
  transform: skewY(-28deg);
  border-radius: 2px;
}
.brand-mark i:nth-child(2) {
  height: 16px;
}
.brand-mark i:nth-child(3) {
  height: 22px;
}
.sidebar nav {
  display: grid;
  gap: 0.45rem;
  margin-top: 3rem;
}
.sidebar nav a {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.72rem 0.85rem;
  color: #52645c;
  font-weight: 550;
  border-radius: 0.65rem;
}
.sidebar nav a:hover,
.mobile-nav a:hover {
  background: #ecf3ee;
}
.sidebar nav a.selected,
.mobile-nav a.selected {
  color: #135c3e;
  background: #e2f1e5;
}
.sidebar nav a:last-child {
  margin-top: 1.3rem;
}
.local {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 1rem 0.6rem 0;
  border-top: 1px solid #dce6df;
  color: #51826a;
}
.local b,
.local small {
  font-size: 0.82rem;
}
.main-shell {
  margin-left: 218px;
}
.topbar {
  height: 66px;
  border-bottom: 1px solid #dce4df;
  background: #fdfefc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(20px, 3.5vw, 55px);
  font-size: 0.88rem;
}
.desktop-crumb,
.date {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: #53655c;
}
.desktop-crumb > span {
  color: #a4b2a8;
}
.date {
  gap: 0.45rem;
}
.mobile-brand,
.mobile-nav {
  display: none;
}
main {
  max-width: 1350px;
  margin: auto;
  padding: clamp(22px, 3vw, 46px) clamp(18px, 3.5vw, 55px) 3rem;
}
main:focus {
  outline: none;
}
.heading-actions,
.actions,
.between,
.panel-title,
.row,
.signals,
.hero-tag,
.text-btn,
.card-foot,
.switch,
.hint,
.trophy-strip,
.buddy,
.search {
  display: flex;
  align-items: center;
}
.heading-actions,
.between,
.panel-title,
.hint {
  justify-content: space-between;
}
.heading-actions {
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.actions,
.wrap {
  flex-wrap: wrap;
}
.actions {
  gap: 0.55rem;
}
.page-heading {
  margin-bottom: 1.45rem;
}
.heading-actions .page-heading {
  margin: 0;
}
.page-heading p {
  margin: 0.45rem 0 0;
}
.primary,
.secondary,
.danger {
  @apply inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold;
  min-height: 43px;
}
.primary {
  background: #176343;
  color: white;
}
.primary:hover {
  background: #104b35;
}
.secondary {
  background: #fff;
  color: #284435;
  border: 1px solid #cbd9cf;
}
.secondary:hover {
  background: #f1f7f1;
}
.danger {
  background: #983e3f;
  color: white;
}
.compact {
  min-height: 36px;
  padding: 0.4rem 0.8rem;
}
.text-btn {
  gap: 0.25rem;
  font-weight: 650;
  color: #176044;
  font-size: 0.88rem;
}
.text-btn:hover {
  text-decoration: underline;
}
.dash-grid,
.two-col,
.workspace {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1.15fr 1fr;
}
.card,
.streak,
.trophy-strip {
  border-radius: 1.1rem;
}
.card {
  min-width: 0;
  background: #fff;
  border: 1px solid #dce5dd;
  padding: clamp(18px, 2vw, 29px);
  box-shadow: 0 2px 4px #16352104;
}
.panel-title {
  gap: 0.7rem;
  margin-bottom: 1rem;
}
.panel-title h2 {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.panel-title h2 svg {
  color: #48775c;
}
.streak {
  position: relative;
  overflow: hidden;
  background: #104a3b;
  color: #f1fff1;
  padding: clamp(20px, 2.2vw, 32px);
  isolation: isolate;
}
.streak-content {
  position: relative;
  z-index: 1;
}
.contours {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.contours i {
  position: absolute;
  right: -64px;
  bottom: -100px;
  transform: rotate(-37deg);
  border: 1px solid #75ba8a50;
  border-radius: 46% 57% 33% 61%;
}
.hero-tag {
  gap: 0.45rem;
  color: #def3d7;
  font-size: 1rem;
  font-weight: 600;
}
.hero-tag svg {
  color: #c4e887;
}
.streak-number {
  font-size: clamp(3.6rem, 6vw, 5.1rem);
  line-height: 1;
  letter-spacing: -0.065em;
  font-weight: 620;
  margin-top: 0.85rem;
}
.streak-number span {
  font-size: 1.55rem;
  letter-spacing: -0.04em;
  font-weight: 450;
}
.streak p {
  color: #d9e9dc;
  font-size: 0.9rem;
}
.weekdots {
  display: flex;
  gap: clamp(5px, 1vw, 16px);
  margin-top: 1.15rem;
}
.weekdots > div {
  text-align: center;
}
.weekdots span {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 1px solid #98bd9b;
  color: #f3f9ed;
}
.weekdots .clean {
  background: #d0eba4;
  color: #234a32;
  border: 0;
}
.weekdots small {
  font-size: 0.75rem;
  color: #dcead8;
  margin-top: 0.3rem;
}
.big-number {
  font-size: clamp(2.1rem, 3.5vw, 3rem);
  line-height: 1.15;
  font-weight: 650;
  letter-spacing: -0.055em;
  font-variant-numeric: tabular-nums;
}
.budget progress {
  appearance: none;
  display: block;
  width: 100%;
  height: 9px;
  border: 0;
  background: #e5ede6;
  border-radius: 9px;
  margin: 1rem 0 0.55rem;
}
.budget progress::-webkit-progress-bar {
  background: #e5ede6;
  border-radius: 9px;
}
.budget progress::-webkit-progress-value {
  background: #4b996c;
  border-radius: 9px;
}
.budget progress::-moz-progress-bar {
  background: #4b996c;
}
.budget progress.over::-webkit-progress-value {
  background: #b65d36;
}
.card-foot {
  gap: 0.4rem;
  border-top: 1px solid #e3eae4;
  margin-top: 1.1rem;
  padding-top: 0.8rem;
  color: #64736a;
  font-size: 0.82rem;
}
.chip {
  border-radius: 12px;
  background: #eff4ef;
  padding: 0.2rem 0.65rem;
  color: #4b6655;
  font-size: 0.78rem;
}
.buddy {
  gap: 0.7rem;
  margin: 0.5rem 0;
}
.avatar,
.item-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 13px;
  color: #45694f;
  background: #e8f0e2;
}
.avatar {
  border-radius: 50%;
  background: #eedbd1;
  color: #764a37;
  font-weight: 650;
}
.buddy small {
  font-size: 0.82rem;
}
.signals {
  flex-wrap: wrap;
  gap: 0.4rem 0.8rem;
  margin: 0.8rem 0 1rem;
}
.signals span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.82rem;
  color: #44604d;
}
.signals svg {
  width: 14px;
  height: 14px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #31835c;
}
.savings,
.trophy-strip {
  background: #e8f2e8;
  border: 1px solid #cedfce;
}
.savings .big-number {
  color: #256b46;
}
.savings .text-btn {
  margin-top: 1.1rem;
}
.recent {
  margin-top: 1rem;
}
.row {
  gap: 0.75rem;
  padding: 0.8rem 0;
  border-top: 1px solid #e7ede8;
}
.row strong,
.buddy strong {
  display: block;
  font-weight: 620;
}
.grow {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.row b {
  white-space: nowrap;
}
.peach {
  background: #f3e8dd;
  color: #806446;
}
.amount {
  text-align: right;
}
.workspace {
  grid-template-columns: minmax(240px, 0.85fr) minmax(0, 1.25fr);
  align-items: start;
}
.two-col {
  grid-template-columns: 1fr 1fr;
}
.form {
  display: grid;
  gap: 1rem;
}
label {
  display: grid;
  gap: 0.36rem;
  font-size: 0.89rem;
  font-weight: 600;
  color: #33483b;
}
input:not([type="checkbox"]),
select {
  width: 100%;
  border: 1px solid #c8d6cc;
  background: white;
  border-radius: 0.55rem;
  padding: 0.6rem 0.7rem;
  color: #23372b;
  font-size: 1rem;
  min-height: 42px;
}
input::placeholder {
  color: #6a7b70;
}
.form .primary {
  justify-self: start;
}
.hint,
.timer,
.warning {
  background: #f2f6ef;
  color: #476148;
  padding: 0.65rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.88rem;
}
.trophy-strip {
  gap: 0.85rem;
  padding: 1rem 1.3rem;
  margin-bottom: 1rem;
  color: #377546;
}
.trophy-strip strong {
  font-size: 1.7rem;
}
.vault-item + .vault-item {
  border-top: 1px solid #dce5de;
  margin-top: 1rem;
  padding-top: 0.8rem;
}
.vault-item .row {
  border: 0;
  padding-top: 0;
}
.timer {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  margin: 0.7rem 0;
  background: #faf1df;
  color: #804f14;
  font-variant-numeric: tabular-nums;
}
.ready {
  background: #e5f3e6;
  color: #296535;
}
.switch {
  gap: 0.5rem;
  font-weight: 500;
}
.switch input {
  width: 17px;
  height: 17px;
  accent-color: #226849;
}
.switch small {
  margin-left: auto;
}
.decision {
  display: grid;
  gap: 0.7rem;
  padding-top: 1rem;
}
.decision form,
.filters {
  display: flex;
  align-items: end;
  gap: 0.6rem;
}
.decision label,
.filters label {
  flex: 1;
  min-width: 0;
}
.filters {
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.filters label {
  min-width: 130px;
}
.search {
  position: relative;
}
.search svg {
  position: absolute;
  left: 0.55rem;
}
.search input {
  padding-left: 1.9rem;
}
.empty {
  padding: 1rem 0;
}
.chart {
  width: 100%;
  height: 285px;
}
.data-line {
  padding: 0.4rem 0;
  border-bottom: 1px solid #e4ebe5;
}
.amber {
  color: #975626;
}
.narrow {
  max-width: 640px;
}
.help {
  font-size: 0.87rem;
  margin: -0.65rem 0 0;
}
.warning {
  background: #fff0d9;
  margin-bottom: 1rem;
}
.toast {
  position: fixed;
  bottom: 22px;
  right: 22px;
  z-index: 10;
  background: #163c30;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.85rem 1.1rem;
  border-radius: 12px;
  box-shadow: 0 4px 24px #0002;
  max-width: calc(100% - 32px);
}
.small a {
  display: inline-flex;
  gap: 0.2rem;
  align-items: center;
}
@media (max-width: 1100px) {
  .sidebar {
    width: 184px;
  }
  .main-shell {
    margin-left: 184px;
  }
  .heading-actions {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .dash-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 800px) {
  .sidebar,
  .desktop-crumb {
    display: none;
  }
  .main-shell {
    margin-left: 0;
  }
  .topbar {
    height: 58px;
  }
  .mobile-brand {
    display: block;
  }
  .mobile-brand .brand {
    font-size: 1.55rem;
  }
  .mobile-brand .brand-mark {
    height: 29px;
    width: 29px;
  }
  .mobile-nav {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.35rem 0.4rem calc(0.35rem + env(safe-area-inset-bottom));
    background: #fcfefb;
    border-top: 1px solid #d5e2d8;
    z-index: 5;
  }
  .mobile-nav a {
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 2px;
    min-height: 48px;
    border-radius: 9px;
    font-size: 0.75rem;
    color: #455a4b;
  }
  .toast {
    bottom: calc(76px + env(safe-area-inset-bottom));
  }
  main {
    padding-bottom: calc(85px + env(safe-area-inset-bottom));
  }
}
@media (max-width: 620px) {
  .dash-grid,
  .two-col,
  .workspace {
    grid-template-columns: 1fr;
  }
  .heading-actions {
    gap: 1rem;
  }
  .weekdots {
    gap: 0.9rem;
  }
  .card,
  .streak {
    padding: 1.15rem;
  }
  .streak-number {
    font-size: 4rem;
  }
  .actions .primary,
  .actions .secondary {
    padding: 0.55rem 0.75rem;
  }
  .recent .row .item-icon {
    width: 34px;
    height: 34px;
  }
  .decision form {
    flex-wrap: wrap;
  }
  .topbar {
    padding: 0 18px;
  }
  .chart {
    height: 250px;
  }
}
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
````

### tailwind.config.js

````js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
````

### tests/finance.test.js

````js
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
````

### vite.config.js

````js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({ base: "./", plugins: [react()] });
````

### package-lock.json

````json
{
  "name": "steady-accountability",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "steady-accountability",
      "version": "1.0.0",
      "dependencies": {
        "lucide-react": "0.468.0",
        "react": "18.3.1",
        "react-dom": "18.3.1",
        "recharts": "3.6.0"
      },
      "devDependencies": {
        "@vitejs/plugin-react": "4.7.0",
        "autoprefixer": "10.4.21",
        "postcss": "8.5.15",
        "tailwindcss": "3.4.19",
        "vite": "6.4.3"
      }
    },
    "node_modules/@alloc/quick-lru": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.3.0.tgz",
      "integrity": "sha512-U4+70Pc5ZS9osnCBCE5Jha/ciHM+Yp+CNMNC/7HvYbNRk1Ldd+f7qO65W5qfhu/TCv+/ozljlXXe9Nj8419DMA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.29.7",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz",
      "integrity": "sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.29.13",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.29.13.tgz",
      "integrity": "sha512-j1nvOQCZYSgp7HLmisnCXFTpVvFODiijQ9QHkORfGKWH6YDtskTEeCJS7eV545GZ9UBzrq0e2xsOd5QQ5PjIqw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.13",
        "@babel/helper-compilation-targets": "^7.29.13",
        "@babel/helper-module-transforms": "^7.29.13",
        "@babel/helpers": "^7.29.13",
        "@babel/parser": "^7.29.13",
        "@babel/template": "^7.29.7",
        "@babel/traverse": "^7.29.13",
        "@babel/types": "^7.29.11",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.29.14",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.29.14.tgz",
      "integrity": "sha512-qSY56jgW5JnSXzuekLVil6zaOQxOCtOHidr65KkaMBw772IuAY28Qx4ZykAcDn8+FRF15qk80XzKwgSc/RYW6g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.29.14",
        "@babel/types": "^7.29.14",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.29.13",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.13.tgz",
      "integrity": "sha512-8WxJ4/Vmes3ghacj8VOJy3NW8eyHiFY/4thU/LSBuBE470+igjR/j1ZTNn8fV5VdNrLx6iXUwig526UdOvfP0w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.29.7",
        "@babel/helper-validator-option": "^7.29.7",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz",
      "integrity": "sha512-3nQVUAtvkKH9zahfWgw96Jc/uFOmjACE1kQz82E2lqWmHBgjzbNlsC22nuQTfahmWeQtTq5nQ/4Nnd2A1wj4zA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz",
      "integrity": "sha512-ejHwrQQYcm9xnTivShn2IDOlIzInN34AXskvq9QicvCtEzq1Vzclu/tKF8Jq1Cg8JG2GL6/EmjgsCT7lXepE3g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.29.14",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.14.tgz",
      "integrity": "sha512-2XDvQVd9JESaOgGc4jT2/jquTAO7ppA5noTZQqH+MmZ89yjCzScLwtCPbWtkPZylL+TLWR49IwWmk+QkRR4GsA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7",
        "@babel/traverse": "^7.29.14"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-plugin-utils": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.29.7.tgz",
      "integrity": "sha512-G7sHYigPY17oO5SYWnfD/0MTBwVR781S/JI643e/JhUYgVgWE/61SoW3NH9KWUKyKq5LVh3npif99Wkt6j86Jw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.29.14",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.14.tgz",
      "integrity": "sha512-CXvKMFvM80ihI7Vox9jb+kQjnyjESQNPM+vB7U0Zz6TWuZA+Z/FL0QPMH300h33qJtIx+REeBhXqWOPW48TcAQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz",
      "integrity": "sha512-N9ZErrD+yW5geCDtBqnOoxmR8+tNKiGuxKlDpuJxfsqpa2dFcexaziGAE/qoHLiDDreVNMupxGmSoNlyvsA3gw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.29.14",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.14.tgz",
      "integrity": "sha512-6E3Mi1r0B0umq6vmZa4/78q+64fqO2YY0THUdjDPKUCKhNb0yQy5NQIaPHCSD3ryTgiTss//P4JsWS80AsZ6LQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.14"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.29.14",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.29.14.tgz",
      "integrity": "sha512-VL220vXuyO2z3rNIQwY7ftj9UwpqOt+33sH+sBWkOekbsSR2g7EEMnOx24ZlCH0xOA3DM/33SifVFGbnJD8r/w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.14"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-self": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-self/-/plugin-transform-react-jsx-self-7.29.7.tgz",
      "integrity": "sha512-TL0hMc9xzy86VD31nUiwzd5otRAcyEPcsegCxolO0PvcXuH1v0kECe/UIznYFihpkvU5wg/jk4v0TTEFfm53fw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-source": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-source/-/plugin-transform-react-jsx-source-7.29.7.tgz",
      "integrity": "sha512-06IyK09H3wi4cGbhDBwp5gUGo0IKtnYa8tyTiephirPCK6fbobVGiXMMI5zLQ4aKEYP3wZ3ArU44o+8KMrSG/Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz",
      "integrity": "sha512-puq+Gf35oI24FeN11LkoUQFqv9uwNeWpxXZi/Ji3rRIoKAzKnxRaZ+Gkj0vKS9ZCiTESfng1N9LyOyXvo+m+Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.29.14",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.14.tgz",
      "integrity": "sha512-RAdQJrBgmIH1FWvN0X+1hoDxzMzlP4cv/1Zi4dn4tG1H0cTb+rw7CzUxQJhp1f4ANd8j5vH3fy8BAWFGkBDEsA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.14",
        "@babel/helper-globals": "^7.29.7",
        "@babel/parser": "^7.29.14",
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.14",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.29.14",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.29.14.tgz",
      "integrity": "sha512-UjI/dKmwJwT9pOszJitq2G6EObZPnsZUfdCr92z2TlF3EZK9J3EdfOKUrCzHl6wFthbzwhzl1Soc/UIwxRiq6w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-string-parser": "^7.29.14",
        "@babel/helper-validator-identifier": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.25.12.tgz",
      "integrity": "sha512-Hhmwd6CInZ3dwpuGTF8fJG6yoWmsToE+vYgD4nytZVxcu1ulHpUQRAB1UJ8+N1Am3Mz4+xOByoQoSZf4D+CpkA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.25.12.tgz",
      "integrity": "sha512-VJ+sKvNA/GE7Ccacc9Cha7bpS8nyzVv0jdVgwNDaR4gDMC/2TTRc33Ip8qrNYUcpkOHUT5OZ0bUcNNVZQ9RLlg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.25.12.tgz",
      "integrity": "sha512-6AAmLG7zwD1Z159jCKPvAxZd4y/VTO0VkprYy+3N2FtJ8+BQWFXU+OxARIwA46c5tdD9SsKGZ/1ocqBS/gAKHg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.25.12.tgz",
      "integrity": "sha512-5jbb+2hhDHx5phYR2By8GTWEzn6I9UqR11Kwf22iKbNpYrsmRB18aX/9ivc5cabcUiAT/wM+YIZ6SG9QO6a8kg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.25.12.tgz",
      "integrity": "sha512-N3zl+lxHCifgIlcMUP5016ESkeQjLj/959RxxNYIthIg+CQHInujFuXeWbWMgnTo4cp5XVHqFPmpyu9J65C1Yg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.25.12.tgz",
      "integrity": "sha512-HQ9ka4Kx21qHXwtlTUVbKJOAnmG1ipXhdWTmNXiPzPfWKpXqASVcWdnf2bnL73wgjNrFXAa3yYvBSd9pzfEIpA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.25.12.tgz",
      "integrity": "sha512-gA0Bx759+7Jve03K1S0vkOu5Lg/85dou3EseOGUes8flVOGxbhDDh/iZaoek11Y8mtyKPGF3vP8XhnkDEAmzeg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.25.12.tgz",
      "integrity": "sha512-TGbO26Yw2xsHzxtbVFGEXBFH0FRAP7gtcPE7P5yP7wGy7cXK2oO7RyOhL5NLiqTlBh47XhmIUXuGciXEqYFfBQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.25.12.tgz",
      "integrity": "sha512-lPDGyC1JPDou8kGcywY0YILzWlhhnRjdof3UlcoqYmS9El818LLfJJc3PXXgZHrHCAKs/Z2SeZtDJr5MrkxtOw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.25.12.tgz",
      "integrity": "sha512-8bwX7a8FghIgrupcxb4aUmYDLp8pX06rGh5HqDT7bB+8Rdells6mHvrFHHW2JAOPZUbnjUpKTLg6ECyzvas2AQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.25.12.tgz",
      "integrity": "sha512-0y9KrdVnbMM2/vG8KfU0byhUN+EFCny9+8g202gYqSSVMonbsCfLjUO+rCci7pM0WBEtz+oK/PIwHkzxkyharA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.25.12.tgz",
      "integrity": "sha512-h///Lr5a9rib/v1GGqXVGzjL4TMvVTv+s1DPoxQdz7l/AYv6LDSxdIwzxkrPW438oUXiDtwM10o9PmwS/6Z0Ng==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.25.12.tgz",
      "integrity": "sha512-iyRrM1Pzy9GFMDLsXn1iHUm18nhKnNMWscjmp4+hpafcZjrr2WbT//d20xaGljXDBYHqRcl8HnxbX6uaA/eGVw==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.25.12.tgz",
      "integrity": "sha512-9meM/lRXxMi5PSUqEXRCtVjEZBGwB7P/D4yT8UG/mwIdze2aV4Vo6U5gD3+RsoHXKkHCfSxZKzmDssVlRj1QQA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.25.12.tgz",
      "integrity": "sha512-Zr7KR4hgKUpWAwb1f3o5ygT04MzqVrGEGXGLnj15YQDJErYu/BGg+wmFlIDOdJp0PmB0lLvxFIOXZgFRrdjR0w==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.25.12.tgz",
      "integrity": "sha512-MsKncOcgTNvdtiISc/jZs/Zf8d0cl/t3gYWX8J9ubBnVOwlk65UIEEvgBORTiljloIWnBzLs4qhzPkJcitIzIg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.25.12.tgz",
      "integrity": "sha512-uqZMTLr/zR/ed4jIGnwSLkaHmPjOjJvnm6TVVitAa08SLS9Z0VM8wIRx7gWbJB5/J54YuIMInDquWyYvQLZkgw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.25.12.tgz",
      "integrity": "sha512-xXwcTq4GhRM7J9A8Gv5boanHhRa/Q9KLVmcyXHCTaM4wKfIpWkdXiMog/KsnxzJ0A1+nD+zoecuzqPmCRyBGjg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.25.12.tgz",
      "integrity": "sha512-Ld5pTlzPy3YwGec4OuHh1aCVCRvOXdH8DgRjfDy/oumVovmuSzWfnSJg+VtakB9Cm0gxNO9BzWkj6mtO1FMXkQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.25.12.tgz",
      "integrity": "sha512-fF96T6KsBo/pkQI950FARU9apGNTSlZGsv1jZBAlcLL1MLjLNIWPBkj5NlSz8aAzYKg+eNqknrUJ24QBybeR5A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.25.12.tgz",
      "integrity": "sha512-MZyXUkZHjQxUvzK7rN8DJ3SRmrVrke8ZyRusHlP+kuwqTcfWLyqMOE3sScPPyeIXN/mDJIfGXvcMqCgYKekoQw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.25.12.tgz",
      "integrity": "sha512-rm0YWsqUSRrjncSXGA7Zv78Nbnw4XL6/dzr20cyrQf7ZmRcsovpcRBdhD43Nuk3y7XIoW2OxMVvwuRvk9XdASg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.25.12.tgz",
      "integrity": "sha512-3wGSCDyuTHQUzt0nV7bocDy72r2lI33QL3gkDNGkod22EsYl04sMf0qLb8luNKTOmgF/eDEDP5BFNwoBKH441w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.25.12.tgz",
      "integrity": "sha512-rMmLrur64A7+DKlnSuwqUdRKyd3UE7oPJZmnljqEptesKM8wx9J8gx5u0+9Pq0fQQW8vqeKebwNXdfOyP+8Bsg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.25.12.tgz",
      "integrity": "sha512-HkqnmmBoCbCwxUKKNPBixiWDGCpQGVsrQfJoVGYLPT41XWF8lHuE5N6WhVia2n4o5QK5M4tYr21827fNhi4byQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.25.12.tgz",
      "integrity": "sha512-alJC0uCZpTFrSL0CCDjcgleBXPnCrEAhTBILpeAp7M/OFgoqtAetfBzX0xM00MUsVVPpVjlPuMbREqnZCXaTnA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.3.tgz",
      "integrity": "sha512-lhTtjtoEArWBjismtfS761S9Hlyn+nIZqOZVYoZ1Xn82PMNMVnk+jj/NhC4fAXGTs7ydONcJiR5vyQBTMDu27g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz",
      "integrity": "sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@reduxjs/toolkit": {
      "version": "2.15.0",
      "resolved": "https://registry.npmjs.org/@reduxjs/toolkit/-/toolkit-2.15.0.tgz",
      "integrity": "sha512-tHrFdR/AAbhhnL0/D3Abu60mAeyRqMAaq3pMeIKWRFWpzZek9LbGKk9J2U+Cl43FixzEDaYKk3zUoK7sFl98FA==",
      "license": "MIT",
      "dependencies": {
        "@standard-schema/spec": "^1.0.0",
        "@standard-schema/utils": "^0.3.0",
        "immer": "^11.2.9",
        "redux": "^5.0.1",
        "redux-thunk": "^3.1.0",
        "reselect": "^5.1.0"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.9.0 || ^17.0.0 || ^18 || ^19",
        "react-redux": "^7.2.1 || ^8.1.3 || ^9.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "react": {
          "optional": true
        },
        "react-redux": {
          "optional": true
        }
      }
    },
    "node_modules/@reduxjs/toolkit/node_modules/immer": {
      "version": "11.2.10",
      "resolved": "https://registry.npmjs.org/immer/-/immer-11.2.10.tgz",
      "integrity": "sha512-pzANBj+0A9u+prdhBJ14DVi44vCvVUQzBa8DKt6I0AMCokPHtt722BK9IX5bFC70xUSU9TnzLRIJLTGqIzjEFw==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/immer"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.0-beta.27",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.0-beta.27.tgz",
      "integrity": "sha512-+d0F4MKMCbeVUJwG96uQ4SgAznZNSq93I3V+9NHA4OpvqG8mRCpGdKmK8l/dl02h2CCDHwW2FqilnTyDcAnqjA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@rollup/rollup-android-arm-eabi": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.68.7.tgz",
      "integrity": "sha512-ZL7MgOeMUiBum1bjzzyBotE3DuHVz+UUxcDVlLL7gpdhDM4RpjG4bZOIly7ensIcXw9jhWl7HTIIQ9KsgjykGQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-android-arm64": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.68.7.tgz",
      "integrity": "sha512-cKZ2Hz/xt5DLY/vdUmMXEn3gnjLgwdeB/npHagbdTljLvBE6b/xKcPCcRWTiT0pHeVf8akl5Cb9K7ylRxbtHng==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-android-x64": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-x64/-/rollup-android-x64-4.68.7.tgz",
      "integrity": "sha512-P9vs1uCC2drepKKuiXrhY+r7ry/jtDCrBS8SUCYm2Rr7rVTR9eFH6XVAmD9TdfYFlDgRe5r1eH8tLQVuz+l/VA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-darwin-arm64": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.68.7.tgz",
      "integrity": "sha512-Lgu2AV7jbOTNNhkQ/OurNm7Snqu1Ux/3y7k8q47fbpPa3q63aIzKKp1xFzax5KH4pcdUzbnX/riuFsxKflsF+g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-darwin-x64": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.68.7.tgz",
      "integrity": "sha512-wKo6rOzla+/3rN8QBqTgcrsQMfyqwa3y14TvCTotLLib/ACWTxX1zWDTYze90s2RWtYiSfTlavHLmZv0Jsafrw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-arm64": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.68.7.tgz",
      "integrity": "sha512-vAeCwbFyEu/vBt9O/uHCHJSvwtOpTSssnM/PoZgn8rmvAkS+9ixaUfJZ2IP3ltom+rvpuQQEIEqltPY7qhC9lQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-x64": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.68.7.tgz",
      "integrity": "sha512-HvjSxOKI+6Si4ytmaoCEpjwDMrH/1s0uWeTAhdE5oXY8/RMI92hCePI/psZuJtY5EHWoT7MfyvTz0HBDZb1ZwQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.68.7.tgz",
      "integrity": "sha512-nz/Eu1sag3w5gPiKLJhAbKa4D9hUUJpDc9XzKXxGNHZqwgT2AbuVS2e4k9CIoLQp5dPhSN9ntiEVuz2jTzu1Gg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.68.7.tgz",
      "integrity": "sha512-05CEv2G/kI261A1WQBZL8gx6xXULjPfVnTKAkfnV/0uqHeLo+dNEOeUzMaiK/HDGR0Z1Nn7KJjm/34bNbNcfTA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-gnu": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.68.7.tgz",
      "integrity": "sha512-wrqk3EkxQt98lTdiYhjcaWmFHwvKiSgHFi7XmPTSF4X8+uGUTBOAc0CaynEvpUhBgkPRbwASrYoU/5uJPF+LFA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-musl": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.68.7.tgz",
      "integrity": "sha512-DnuEUWvzeSxHxzu5lvrN+I/UzrcQkR/fQ4Bibetdp73Rf7aP0XgFpalSDuHmVWsCLETE+Lrl3GVOqIvFP7rcjw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-gnu": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.68.7.tgz",
      "integrity": "sha512-n0sr2s+rzVw8ntRucOxGhWeJ9lEl9KxCRzF3RmnZLE/tRnfKiloLuK8UqWrKFqVigEAh0IkRkPz5LVaV9/ZfvA==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-musl": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.68.7.tgz",
      "integrity": "sha512-qDVJyMCbh7ekjt1kM9CZsyCFZvv5UW1QTIx3YfJ/gh8LkqpoPNpl9dCeYeOa+bsDOGTWZiMG2riXuoFSRISimQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.68.7.tgz",
      "integrity": "sha512-GiIOHHIzgpMoR5DT1pA1b9qMk5i0Ngg2FRj4D6XFSBC8e/axHuIdB7K/OBozO2RtCVAMnH1rXcuJrGScg+bvzA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-musl": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.68.7.tgz",
      "integrity": "sha512-B132V2fwDl7UGLhvK6s3Ay7eNQ4dmDSDgsBm/Wwbz+Wgnunz0le4R2wzDp6TL5ExMu3MC1auJIrVtk2gOyxbyw==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.68.7.tgz",
      "integrity": "sha512-3NueHQilbssjxgJMx9hXBV+U5keb3CBzmW5WhoBG3iSLFcmz9U2FVoG4MUYpZoZ+KSNMQPN2AA79dTxlEF0VxQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-musl": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.68.7.tgz",
      "integrity": "sha512-8XRwbf76oAF1zZzg6OT8EY3swvCptZnLmiqMgO5+STyhTZ9s7rXa+tY8jESZW9IDyKACcVBGqa/RACDaLzRVjQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-s390x-gnu": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.68.7.tgz",
      "integrity": "sha512-pvqqfjNdxVLvmovH681K5cPIL9DXj5n1RROaa0vb9JrtHddiScLrkHPRKj5flTKHF1M7xvRy0SS2yTRIc2TO0Q==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-gnu": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.68.7.tgz",
      "integrity": "sha512-rsTjTf5HAm6F4sI6uUfJf2pc+7AWBKxgc2RveGvwB2OvVa1GezSSCDD1rtXPuFhcg3itPv7iHgcZsq/RwWvJ4Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-musl": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.68.7.tgz",
      "integrity": "sha512-VNLvsYMD5+zLCi5SohwDdL8PpicC9PnArLwyMJXXUcAduzrM3k9aZT9XiHw+mn5dOWr3UEyfyqJbOvxwJ2fCWQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-openbsd-x64": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.68.7.tgz",
      "integrity": "sha512-7aOjdahkwiECWWOmjAemPd21yeQ18TW59DUiLWttzolMe5tDwHyBhlOfmxRUHOQnepTNkZ2Qwp1T6LxFZ5v7yQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ]
    },
    "node_modules/@rollup/rollup-openharmony-arm64": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.68.7.tgz",
      "integrity": "sha512-BnNkTwE4FMCAoz3UYiJ6D6Y3pGozYIYZ2W+onH64uhiTI2iwD3KOaNSlkuHYfupZVemls3YTlvbPnuKwHsraiQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ]
    },
    "node_modules/@rollup/rollup-win32-arm64-msvc": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.68.7.tgz",
      "integrity": "sha512-OH8tGWsJcRW6Vn0dmndyWJGdQa46bH2/2/PVfleBGUWuBd5/HVkIvw2UslgBwUZdtV78bJaoCNBmYI5+bcTJ4A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-ia32-msvc": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.68.7.tgz",
      "integrity": "sha512-SpYx5X9+2JOF3hXe1cRaiFn562h4AMJhfgxkyHyiuh9dJ7PanPm7FTp8GJReSbS9N+TfjRiBbKacVk1g35kKxg==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-gnu": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.68.7.tgz",
      "integrity": "sha512-0ncKtQ55fqElV9Sk4cZ/4tiXVGlWxaH5PvDOlx1Sx8GuHIpSWgYrTcyrO51JnVFfy7LvAJiffkEg63ZHKwTMag==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-msvc": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.68.7.tgz",
      "integrity": "sha512-XY9DYHO5UxxVR8G6AErXDlccQmDpvGTLgKHFpvkgsyjwG/PrQuInRjQQfpEzBRuT+bhBtwfS8yDe9sPhVcq/9A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@standard-schema/spec": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.1.0.tgz",
      "integrity": "sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==",
      "license": "MIT"
    },
    "node_modules/@standard-schema/utils": {
      "version": "0.3.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/utils/-/utils-0.3.0.tgz",
      "integrity": "sha512-e7Mew686owMaPJVNNLs55PUvgz371nKgwsc4vxE49zsODpJEnxgxRo2y/OKrqueavXgZNMDVj3DdHFlaSAeU8g==",
      "license": "MIT"
    },
    "node_modules/@types/babel__core": {
      "version": "7.20.5",
      "resolved": "https://registry.npmjs.org/@types/babel__core/-/babel__core-7.20.5.tgz",
      "integrity": "sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.20.7",
        "@babel/types": "^7.20.7",
        "@types/babel__generator": "*",
        "@types/babel__template": "*",
        "@types/babel__traverse": "*"
      }
    },
    "node_modules/@types/babel__generator": {
      "version": "7.27.0",
      "resolved": "https://registry.npmjs.org/@types/babel__generator/-/babel__generator-7.27.0.tgz",
      "integrity": "sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__template": {
      "version": "7.4.4",
      "resolved": "https://registry.npmjs.org/@types/babel__template/-/babel__template-7.4.4.tgz",
      "integrity": "sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.1.0",
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__traverse": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@types/babel__traverse/-/babel__traverse-7.28.0.tgz",
      "integrity": "sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.28.2"
      }
    },
    "node_modules/@types/d3-array": {
      "version": "3.2.2",
      "resolved": "https://registry.npmjs.org/@types/d3-array/-/d3-array-3.2.2.tgz",
      "integrity": "sha512-hOLWVbm7uRza0BYXpIIW5pxfrKe0W+D5lrFiAEYR+pb6w3N2SwSMaJbXdUfSEv+dT4MfHBLtn5js0LAWaO6otw==",
      "license": "MIT"
    },
    "node_modules/@types/d3-color": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/@types/d3-color/-/d3-color-3.1.3.tgz",
      "integrity": "sha512-iO90scth9WAbmgv7ogoq57O9YpKmFBbmoEoCHDB2xMBY0+/KVrqAaCDyCE16dUspeOvIxFFRI+0sEtqDqy2b4A==",
      "license": "MIT"
    },
    "node_modules/@types/d3-ease": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/@types/d3-ease/-/d3-ease-3.0.2.tgz",
      "integrity": "sha512-NcV1JjO5oDzoK26oMzbILE6HW7uVXOHLQvHshBUW4UMdZGfiY6v5BeQwh9a9tCzv+CeefZQHJt5SRgK154RtiA==",
      "license": "MIT"
    },
    "node_modules/@types/d3-interpolate": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@types/d3-interpolate/-/d3-interpolate-3.0.4.tgz",
      "integrity": "sha512-mgLPETlrpVV1YRJIglr4Ez47g7Yxjl1lj7YKsiMCb27VJH9W8NVM6Bb9d8kkpG/uAQS5AmbA48q2IAolKKo1MA==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-color": "*"
      }
    },
    "node_modules/@types/d3-path": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/@types/d3-path/-/d3-path-3.1.1.tgz",
      "integrity": "sha512-VMZBYyQvbGmWyWVea0EHs/BwLgxc+MKi1zLDCONksozI4YJMcTt8ZEuIR4Sb1MMTE8MMW49v0IwI5+b7RmfWlg==",
      "license": "MIT"
    },
    "node_modules/@types/d3-scale": {
      "version": "4.0.9",
      "resolved": "https://registry.npmjs.org/@types/d3-scale/-/d3-scale-4.0.9.tgz",
      "integrity": "sha512-dLmtwB8zkAeO/juAMfnV+sItKjlsw2lKdZVVy6LRr0cBmegxSABiLEpGVmSJJ8O08i4+sGR6qQtb6WtuwJdvVw==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-time": "*"
      }
    },
    "node_modules/@types/d3-shape": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/@types/d3-shape/-/d3-shape-3.2.0.tgz",
      "integrity": "sha512-kVd74ta9eof3eJOvbNd1vGKS/XERRyQbT26Og63hIsvDO84cjD5gEOhsXf26w3FSoNlPVz84DOFcKv/oou+fMw==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-path": "*"
      }
    },
    "node_modules/@types/d3-time": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@types/d3-time/-/d3-time-3.0.4.tgz",
      "integrity": "sha512-yuzZug1nkAAaBlBBikKZTgzCeA+k1uy4ZFwWANOfKw5z5LRhV0gNA7gNkKm7HoK+HRN0wX3EkxGk0fpbWhmB7g==",
      "license": "MIT"
    },
    "node_modules/@types/d3-timer": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/@types/d3-timer/-/d3-timer-3.0.2.tgz",
      "integrity": "sha512-Ps3T8E8dZDam6fUyNiMkekK3XUsaUEik+idO9/YjPtfj2qruF8tFBXS7XhtE4iIXBLxhmLjP3SXpLhVf21I9Lw==",
      "license": "MIT"
    },
    "node_modules/@types/estree": {
      "version": "1.0.10",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.10.tgz",
      "integrity": "sha512-lTyOMnOcmRBzdCv6/4zUZCrEhV0xrqQiUZBZtVcbmLHBXKLnN8q89v/wKRF/Q0HbwVsqbIG3o5HDoFl9sduM+g==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/use-sync-external-store": {
      "version": "0.0.6",
      "resolved": "https://registry.npmjs.org/@types/use-sync-external-store/-/use-sync-external-store-0.0.6.tgz",
      "integrity": "sha512-zFDAD+tlpf2r4asuHEj0XH6pY6i0g5NeAHPn+15wk3BV6JA69eERFXC1gyGThDkVa1zCyKr5jox1+2LbV/AMLg==",
      "license": "MIT"
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "4.7.0",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-4.7.0.tgz",
      "integrity": "sha512-gUu9hwfWvvEDBBmgtAowQCojwZmJ5mcLn3aufeCsitijs3+f2NsrPtlAWIR6OPiqljl96GVCUbLe0HyqIpVaoA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.28.0",
        "@babel/plugin-transform-react-jsx-self": "^7.27.1",
        "@babel/plugin-transform-react-jsx-source": "^7.27.1",
        "@rolldown/pluginutils": "1.0.0-beta.27",
        "@types/babel__core": "^7.20.5",
        "react-refresh": "^0.17.0"
      },
      "engines": {
        "node": "^14.18.0 || >=16.0.0"
      },
      "peerDependencies": {
        "vite": "^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"
      }
    },
    "node_modules/any-promise": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
      "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/anymatch": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "normalize-path": "^3.0.0",
        "picomatch": "^2.0.4"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/arg": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/arg/-/arg-5.0.2.tgz",
      "integrity": "sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/autoprefixer": {
      "version": "10.4.21",
      "resolved": "https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.4.21.tgz",
      "integrity": "sha512-O+A6LWV5LDHSJD3LjHYoNi4VLsj/Whi7k6zG12xTYaU4cQ8oxQGckXNX8cRHK5yOZ/ppVHe0ZBXGzSV9jXdVbQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/autoprefixer"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "browserslist": "^4.24.4",
        "caniuse-lite": "^1.0.30001702",
        "fraction.js": "^4.3.7",
        "normalize-range": "^0.1.2",
        "picocolors": "^1.1.1",
        "postcss-value-parser": "^4.2.0"
      },
      "bin": {
        "autoprefixer": "bin/autoprefixer"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      },
      "peerDependencies": {
        "postcss": "^8.1.0"
      }
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.11.38",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.38.tgz",
      "integrity": "sha512-rMgy5YW7x28SMfXHLlVZDBqlWzYZ0x2rVR/6FWrNBF0chjigARK1H6nM0hKA1Um3kPOlkQFVtjJs00d2N1ezuw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/binary-extensions": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.3.0.tgz",
      "integrity": "sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.29.6",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.29.6.tgz",
      "integrity": "sha512-CmVVIQ3RVc5HxYEc9X84GvxK/C8C1wH8TlKAiO7uTxF8PDwt7r8t9Qk3J9NkMOVzX5O/HbLv3yzxZg9HPrnI9w==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.11.37",
        "caniuse-lite": "^1.0.30001826",
        "electron-to-chromium": "^1.5.486",
        "node-releases": "^2.0.64",
        "update-browserslist-db": "^1.4.0"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/camelcase-css": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/camelcase-css/-/camelcase-css-2.0.1.tgz",
      "integrity": "sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001826",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001826.tgz",
      "integrity": "sha512-wTB+9tIbLro/BCXwLuNV1meHE4L9dS6dArMDwgYfNBPMYScqClHyGunhkCSDtHhe/69Xl0sHlKgBVZ+fNsYtWA==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chokidar": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.6.0.tgz",
      "integrity": "sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "anymatch": "~3.1.2",
        "braces": "~3.0.2",
        "glob-parent": "~5.1.2",
        "is-binary-path": "~2.1.0",
        "is-glob": "~4.0.1",
        "normalize-path": "~3.0.0",
        "readdirp": "~3.6.0"
      },
      "engines": {
        "node": ">= 8.10.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/chokidar/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/clsx": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/commander": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
      "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/d3-array": {
      "version": "3.2.5",
      "resolved": "https://registry.npmjs.org/d3-array/-/d3-array-3.2.5.tgz",
      "integrity": "sha512-Th8qGXoBalmWsstpkuhmBuTsBQIFqYOJtjlBvNVvBfJ8E3uYusBUwUR8HU20U0qKKQkgCvKyR1YjiozWadk5QA==",
      "license": "ISC",
      "dependencies": {
        "internmap": "1 - 2"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-color": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/d3-color/-/d3-color-3.1.1.tgz",
      "integrity": "sha512-lfab8x0Bj0UO7SNsY8dZSbNIA6ipbkE3X0NG9nqjCu6CfCHZseuDnOSJY7hidKrjpP++i1M2qT+FlAdPKYRilA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-ease": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/d3-ease/-/d3-ease-3.0.2.tgz",
      "integrity": "sha512-B5znKqRmKROAN4oHWQ50W/qisVjA9GXh2WMsVKdFVp4DxWmcrOsweqgUOUVsv5th96kwaZlokU6SlV4J3gak1w==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-format": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/d3-format/-/d3-format-3.1.3.tgz",
      "integrity": "sha512-+F+/49swqmGuQJmSKnVMIDH/QkEFV5li9QRj0xm/KhyAUBv099O5PrvpQFxBp24PYph17Mnvt9mjKQV0ii0nMA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-interpolate": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/d3-interpolate/-/d3-interpolate-3.0.2.tgz",
      "integrity": "sha512-IRzGU62DtxhvsnSTWMQIdnoZ6gA+BCWwBon1EJI6SjoN595799b6z/QRBzXfFhE8iupUPp3042yBNo0STPqnzQ==",
      "license": "ISC",
      "dependencies": {
        "d3-color": "1 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-path": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/d3-path/-/d3-path-3.1.1.tgz",
      "integrity": "sha512-jsbgV8zIT38ReB9O7X7gcLndTQRONSqNNd+oGIaTBdUug4r5jFmp0N6RY9R5GWbdUDucn0qoTGyfjapT4tDhcg==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-scale": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/d3-scale/-/d3-scale-4.0.3.tgz",
      "integrity": "sha512-66cWobCNzcMvlfoaDHCxuIv9TBUWG1BLOWdv9kHHFuCr1JdqAWPvTmsaEYDD5NRMyWZ5+7u0GqiCDfMXMqh3hg==",
      "license": "ISC",
      "dependencies": {
        "d3-array": "2.10.0 - 3",
        "d3-format": "1 - 3",
        "d3-interpolate": "1.2.0 - 3",
        "d3-time": "2.1.1 - 3",
        "d3-time-format": "2 - 4"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-shape": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/d3-shape/-/d3-shape-3.2.1.tgz",
      "integrity": "sha512-dm2o+lbKdzg9tY7GEag/dB9hcbodLfwkE/DkvqbELJXaMz0yKzWWhZqhbI7CKubukA7HnRyz0avdtvi7EPxPvw==",
      "license": "ISC",
      "dependencies": {
        "d3-path": "^3.1.1"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-time": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/d3-time/-/d3-time-3.1.1.tgz",
      "integrity": "sha512-Ze7rjrhMzdeulh0/hjcfFj7XLAHOfowtEMfsoG6DU866HPynQNW7Wfen6hzXcqKTv8XzxvF6Hzr5XD6bMHr2ug==",
      "license": "ISC",
      "dependencies": {
        "d3-array": "2 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-time-format": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/d3-time-format/-/d3-time-format-4.1.1.tgz",
      "integrity": "sha512-22XaqjyCjpqgda20erhsOjGmC3vvYwTNYniKAd45W5UWLDF43moeOuV9qYpRqobIlsnK0UhnKZjUUJm3VgORUA==",
      "license": "ISC",
      "dependencies": {
        "d3-time": "1 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-timer": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/d3-timer/-/d3-timer-3.0.2.tgz",
      "integrity": "sha512-1Il1aliroVSErrv5aulRBxAY+7+DnaoLIWGd1C6SsBTWDeobWiP/V69vwb8vT6abR1kKwaNe1196pmaQ1fK90A==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/decimal.js-light": {
      "version": "2.5.1",
      "resolved": "https://registry.npmjs.org/decimal.js-light/-/decimal.js-light-2.5.1.tgz",
      "integrity": "sha512-qIMFpTMZmny+MMIitAB6D7iVPEorVw6YQRWkvarTkT4tBeSLLiHzcwj6q0MmYSFCiVpiqPJTJEYIrpcPzVEIvg==",
      "license": "MIT"
    },
    "node_modules/didyoumean": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/didyoumean/-/didyoumean-1.2.2.tgz",
      "integrity": "sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/dlv": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/dlv/-/dlv-1.1.3.tgz",
      "integrity": "sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.491",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.491.tgz",
      "integrity": "sha512-zMOQrvaTekJMwENqx1Rnyl3qieqGxIui5CRu9g6ktKzQ/T54fq0Qfr3V/SEhGrkStWI3eYMSzMN4rbyFwfQSzA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-toolkit": {
      "version": "1.53.2",
      "resolved": "https://registry.npmjs.org/es-toolkit/-/es-toolkit-1.53.2.tgz",
      "integrity": "sha512-iUqZ+NlwH4jUgRmXZUxFBsV/9762TQEa1O4IXLFBmDEjVHScBytKuseX23I0+v9ShZ5MYxEx6WKNzm6IPnex8g==",
      "license": "MIT",
      "workspaces": [
        "docs",
        "benchmarks",
        "tests/types",
        "tests/browser-compat"
      ]
    },
    "node_modules/esbuild": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.25.12.tgz",
      "integrity": "sha512-bbPBYYrtZbkt6Os6FiTLCTFxvq4tt3JKall1vRwshA3fdVztsLAatFaZobhkBC8/BrPetoa0oksYoKXoG4ryJg==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.25.12",
        "@esbuild/android-arm": "0.25.12",
        "@esbuild/android-arm64": "0.25.12",
        "@esbuild/android-x64": "0.25.12",
        "@esbuild/darwin-arm64": "0.25.12",
        "@esbuild/darwin-x64": "0.25.12",
        "@esbuild/freebsd-arm64": "0.25.12",
        "@esbuild/freebsd-x64": "0.25.12",
        "@esbuild/linux-arm": "0.25.12",
        "@esbuild/linux-arm64": "0.25.12",
        "@esbuild/linux-ia32": "0.25.12",
        "@esbuild/linux-loong64": "0.25.12",
        "@esbuild/linux-mips64el": "0.25.12",
        "@esbuild/linux-ppc64": "0.25.12",
        "@esbuild/linux-riscv64": "0.25.12",
        "@esbuild/linux-s390x": "0.25.12",
        "@esbuild/linux-x64": "0.25.12",
        "@esbuild/netbsd-arm64": "0.25.12",
        "@esbuild/netbsd-x64": "0.25.12",
        "@esbuild/openbsd-arm64": "0.25.12",
        "@esbuild/openbsd-x64": "0.25.12",
        "@esbuild/openharmony-arm64": "0.25.12",
        "@esbuild/sunos-x64": "0.25.12",
        "@esbuild/win32-arm64": "0.25.12",
        "@esbuild/win32-ia32": "0.25.12",
        "@esbuild/win32-x64": "0.25.12"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/eventemitter3": {
      "version": "5.0.4",
      "resolved": "https://registry.npmjs.org/eventemitter3/-/eventemitter3-5.0.4.tgz",
      "integrity": "sha512-mlsTRyGaPBjPedk6Bvw+aqbsXDtoAyAzm5MO7JgU+yVRyMQ5O8bD4Kcci7BS85f93veegeCPkL8R4GLClnjLFw==",
      "license": "MIT"
    },
    "node_modules/fast-glob": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
      "integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.8"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-glob/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fastq": {
      "version": "1.20.3",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.20.3.tgz",
      "integrity": "sha512-XKv5nnLs6nLF71NgiKJLIZFLkPyIEuOselLG7ujZnGrRfQK8HpvY+WqKhAJUAdLomwVHErVS4LfxFlPq0/FTAw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/fraction.js": {
      "version": "4.3.7",
      "resolved": "https://registry.npmjs.org/fraction.js/-/fraction.js-4.3.7.tgz",
      "integrity": "sha512-ZsDfxO51wGAXREY55a7la9LScWpwv9RxIrYABrlvOFBlH/ShPnrtsXeuUIfXKKOVicNxQ+o8JTbJvjS4M89yew==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "*"
      },
      "funding": {
        "type": "patreon",
        "url": "https://github.com/sponsors/rawify"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",
      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/immer": {
      "version": "10.2.0",
      "resolved": "https://registry.npmjs.org/immer/-/immer-10.2.0.tgz",
      "integrity": "sha512-d/+XTN3zfODyjr89gM3mPq1WNX2B8pYsu7eORitdwyA2sBubnTl3laYlBk4sXY5FUa5qTZGBDPJICVbvqzjlbw==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/immer"
      }
    },
    "node_modules/internmap": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/internmap/-/internmap-2.0.3.tgz",
      "integrity": "sha512-5Hh7Y1wQbvY5ooGgPbDaL5iYLAPzMTUrjMulskHLH6wnv/A+1q5rgEaiuqEjB+oxGXIVZs1FF+R/KPN3ZSQYYg==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/is-binary-path": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
      "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "binary-extensions": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.18.0",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.18.0.tgz",
      "integrity": "sha512-qyax9fgaKOEC4qK8WZn7Q4IcoZC9RC1O1fFxRcRTq/oMMkWT/uXpqpXa12kzWR409zAt1drYN9N9BO26UmBCmw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/jiti": {
      "version": "1.21.7",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-1.21.7.tgz",
      "integrity": "sha512-/imKNG4EbWNrVjoNC/1H5/9GFy+tqjGBHCaSsN+P2RnPqjsLmv6UD3Ej+Kj8nBWaRAwyk7kK5ZUc+OEatnTR3A==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jiti": "bin/jiti.js"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "license": "MIT"
    },
    "node_modules/jsesc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/lilconfig": {
      "version": "3.1.5",
      "resolved": "https://registry.npmjs.org/lilconfig/-/lilconfig-3.1.5.tgz",
      "integrity": "sha512-aRAOI9Ia43ygL4o1EOmC/sc/0OFxrm7qcQngiIyWaqVnSnz932ybJ07zyCcgMNGSDP8Yxaf88Xj1zHEXmvQ4SA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/antonk52"
      }
    },
    "node_modules/lines-and-columns": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
      "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/lucide-react": {
      "version": "0.468.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-0.468.0.tgz",
      "integrity": "sha512-6koYRhnM2N0GGZIdXzSeiNwguv1gt/FAjZOiPl76roBi3xKEXa4WmfpxgQwTTL4KipXjefrnf3oV4IsYhi4JFA==",
      "license": "ISC",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0-rc"
      }
    },
    "node_modules/merge2": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/mz": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
      "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0",
        "object-assign": "^4.0.1",
        "thenify-all": "^1.0.0"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.20",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.20.tgz",
      "integrity": "sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.65",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.65.tgz",
      "integrity": "sha512-PfvofsGQ+MiOQIPkX9fU8ELUWmy5zL74CdQaph/ismKszfFkfwXaw0cGiwbwym2hT9k5+mdyl8O5WQ1MD8EHmA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/normalize-path": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
      "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/normalize-range": {
      "version": "0.1.2",
      "resolved": "https://registry.npmjs.org/normalize-range/-/normalize-range-0.1.2.tgz",
      "integrity": "sha512-bdok/XvKII3nUpklnV6P2hxtMNrCboOjAcyBuQnWEhO665FwrSNRxU+AqpsyvO6LgGYPspN+lu5CLtw4jPRKNA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-hash": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/object-hash/-/object-hash-3.0.0.tgz",
      "integrity": "sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.2.tgz",
      "integrity": "sha512-V7+vQEJ06Z+c5tSye8S+nHUfI51xoXIXjHQ99cQtKUkQqqO1kO/KCJUfZXuB47h/YBlDhah2H3hdUGXn8ie0oA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pirates": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.7.tgz",
      "integrity": "sha512-TfySrs/5nm8fQJDcBDuUng3VOUKsd7S+zqvbOTiGXHfxX4wK31ard+hoNuvkicM/2YFzlpDgABOevKSsB4G/FA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.15",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.15.tgz",
      "integrity": "sha512-FfR8sjd4em2T6fb3I2MwAJU7HWVMr9zba+enmQeeWFfCbm+UOC/0X4DS8XtpUTMwWMGbjKYP7xjfNekzyGmB3A==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.12",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postcss-import": {
      "version": "15.1.0",
      "resolved": "https://registry.npmjs.org/postcss-import/-/postcss-import-15.1.0.tgz",
      "integrity": "sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "postcss-value-parser": "^4.0.0",
        "read-cache": "^1.0.0",
        "resolve": "^1.1.7"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "postcss": "^8.0.0"
      }
    },
    "node_modules/postcss-js": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/postcss-js/-/postcss-js-4.1.0.tgz",
      "integrity": "sha512-oIAOTqgIo7q2EOwbhb8UalYePMvYoIeRY2YKntdpFQXNosSu3vLrniGgmH9OKs/qAkfoj5oB3le/7mINW1LCfw==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "camelcase-css": "^2.0.1"
      },
      "engines": {
        "node": "^12 || ^14 || >= 16"
      },
      "peerDependencies": {
        "postcss": "^8.4.21"
      }
    },
    "node_modules/postcss-load-config": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/postcss-load-config/-/postcss-load-config-6.0.1.tgz",
      "integrity": "sha512-oPtTM4oerL+UXmx+93ytZVN82RrlY/wPUV8IeDxFrzIjXOLF1pN+EmKPLbubvKHT2HC20xXsCAH2Z+CKV6Oz/g==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "lilconfig": "^3.1.1"
      },
      "engines": {
        "node": ">= 18"
      },
      "peerDependencies": {
        "jiti": ">=1.21.0",
        "postcss": ">=8.0.9",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        },
        "postcss": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/postcss-nested": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/postcss-nested/-/postcss-nested-6.2.0.tgz",
      "integrity": "sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "postcss-selector-parser": "^6.1.1"
      },
      "engines": {
        "node": ">=12.0"
      },
      "peerDependencies": {
        "postcss": "^8.2.14"
      }
    },
    "node_modules/postcss-selector-parser": {
      "version": "6.1.6",
      "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.1.6.tgz",
      "integrity": "sha512-BK87/Qgti3DIcgS2PaCVoteFIkjIFvCJBizZDIVSjdlFNg4Jv+SRqbN2JONb/qQUH4ZFqfXYF+izg15W2HVRvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "util-deprecate": "^1.0.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postcss-value-parser": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/queue-microtask": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.23.2"
      },
      "peerDependencies": {
        "react": "^18.3.1"
      }
    },
    "node_modules/react-is": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-18.3.1.tgz",
      "integrity": "sha512-/LLMVyas0ljjAtoYiPqYiL8VWXzUUdThrmU5+n20DZv+a+ClRoevUzw5JxU+Ieh5/c87ytoTBV9G1FiKfNJdmg==",
      "license": "MIT",
      "peer": true
    },
    "node_modules/react-redux": {
      "version": "9.3.1",
      "resolved": "https://registry.npmjs.org/react-redux/-/react-redux-9.3.1.tgz",
      "integrity": "sha512-vxMLT0lalUjbZPkoTepWyKAZbjIIFssNx/CEL9lTfwQBU6XpkGSmCNdcCIrkOBUgB68uftZMnbXVb6DwGnhRKQ==",
      "license": "MIT",
      "dependencies": {
        "@types/use-sync-external-store": "^0.0.6",
        "use-sync-external-store": "^1.4.0"
      },
      "peerDependencies": {
        "@types/react": "^18.2.25 || ^19",
        "react": "^18.0 || ^19",
        "redux": "^5.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "redux": {
          "optional": true
        }
      }
    },
    "node_modules/react-refresh": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/react-refresh/-/react-refresh-0.17.0.tgz",
      "integrity": "sha512-z6F7K9bV85EfseRCp2bzrpyQ0Gkw1uLoCel9XBVWPg/TjRj94SkJzUTGfOa4bs7iJvBWtQG0Wq7wnI0syw3EBQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/read-cache": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/read-cache/-/read-cache-1.0.2.tgz",
      "integrity": "sha512-/peqiBB/n07gQGLsWaHho3WfvUyRscw0gYTsEFMhrIe/nWLkYaf5SbKYjGYqtRV3aPwykJgF2VEMo1ac4bnsGA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/readdirp": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
      "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "picomatch": "^2.2.1"
      },
      "engines": {
        "node": ">=8.10.0"
      }
    },
    "node_modules/recharts": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/recharts/-/recharts-3.6.0.tgz",
      "integrity": "sha512-L5bjxvQRAe26RlToBAziKUB7whaGKEwD3znoM6fz3DrTowCIC/FnJYnuq1GEzB8Zv2kdTfaxQfi5GoH0tBinyg==",
      "license": "MIT",
      "workspaces": [
        "www"
      ],
      "dependencies": {
        "@reduxjs/toolkit": "1.x.x || 2.x.x",
        "clsx": "^2.1.1",
        "decimal.js-light": "^2.5.1",
        "es-toolkit": "^1.39.3",
        "eventemitter3": "^5.0.1",
        "immer": "^10.1.1",
        "react-redux": "8.x.x || 9.x.x",
        "reselect": "5.1.1",
        "tiny-invariant": "^1.3.3",
        "use-sync-external-store": "^1.2.2",
        "victory-vendor": "^37.0.2"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-is": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/redux": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/redux/-/redux-5.0.1.tgz",
      "integrity": "sha512-M9/ELqF6fy8FwmkpnF0S3YKOqMyoWJ4+CS5Efg2ct3oY9daQvd/Pc71FpGZsVsbl3Cpb+IIcjBDUnnyBdQbq4w==",
      "license": "MIT"
    },
    "node_modules/redux-thunk": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/redux-thunk/-/redux-thunk-3.1.0.tgz",
      "integrity": "sha512-NW2r5T6ksUKXCabzhL9z+h206HQw/NJkcLm1GPImRQ8IzfXwRGqjVhKJGauHirT0DAuyy6hjdnMZaRoAcy0Klw==",
      "license": "MIT",
      "peerDependencies": {
        "redux": "^5.0.0"
      }
    },
    "node_modules/reselect": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/reselect/-/reselect-5.1.1.tgz",
      "integrity": "sha512-K/BG6eIky/SBpzfHZv/dd+9JBFiS4SWV7FIujVyJRux6e45+73RaUHXLmIR1f7WOMaQ0U1km6qwklRQxpJJY0w==",
      "license": "MIT"
    },
    "node_modules/resolve": {
      "version": "1.22.14",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.14.tgz",
      "integrity": "sha512-1ZjYvR9sbkiwC5+9QHetqW5HmA2pHRMaoupD01t2HlYnV/vydC2zPwLixhsMieSWVZt0JJRg5LVIk0Ow1D/TrA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "is-core-module": "^2.18.0",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/reusify": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
      "integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/rollup": {
      "version": "4.68.7",
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.68.7.tgz",
      "integrity": "sha512-CxhzUIc+ocxPAWxHuff+PAluoW1otD6dHqqPK2h2Q38WA1VYk+3gizX6NEg5t2a8yNGQaiHM1R7V+qdwWuvp5Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "^1.0.10"
      },
      "bin": {
        "rollup": "dist/bin/rollup"
      },
      "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      },
      "optionalDependencies": {
        "@rollup/rollup-android-arm-eabi": "4.68.7",
        "@rollup/rollup-android-arm64": "4.68.7",
        "@rollup/rollup-android-x64": "4.68.7",
        "@rollup/rollup-darwin-arm64": "4.68.7",
        "@rollup/rollup-darwin-x64": "4.68.7",
        "@rollup/rollup-freebsd-arm64": "4.68.7",
        "@rollup/rollup-freebsd-x64": "4.68.7",
        "@rollup/rollup-linux-arm-gnueabihf": "4.68.7",
        "@rollup/rollup-linux-arm-musleabihf": "4.68.7",
        "@rollup/rollup-linux-arm64-gnu": "4.68.7",
        "@rollup/rollup-linux-arm64-musl": "4.68.7",
        "@rollup/rollup-linux-loong64-gnu": "4.68.7",
        "@rollup/rollup-linux-loong64-musl": "4.68.7",
        "@rollup/rollup-linux-ppc64-gnu": "4.68.7",
        "@rollup/rollup-linux-ppc64-musl": "4.68.7",
        "@rollup/rollup-linux-riscv64-gnu": "4.68.7",
        "@rollup/rollup-linux-riscv64-musl": "4.68.7",
        "@rollup/rollup-linux-s390x-gnu": "4.68.7",
        "@rollup/rollup-linux-x64-gnu": "4.68.7",
        "@rollup/rollup-linux-x64-musl": "4.68.7",
        "@rollup/rollup-openbsd-x64": "4.68.7",
        "@rollup/rollup-openharmony-arm64": "4.68.7",
        "@rollup/rollup-win32-arm64-msvc": "4.68.7",
        "@rollup/rollup-win32-ia32-msvc": "4.68.7",
        "@rollup/rollup-win32-x64-gnu": "4.68.7",
        "@rollup/rollup-win32-x64-msvc": "4.68.7",
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/run-parallel": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "queue-microtask": "^1.2.2"
      }
    },
    "node_modules/scheduler": {
      "version": "0.23.2",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/semver": {
      "version": "6.3.2",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.2.tgz",
      "integrity": "sha512-GYrCADwpu6yV5OAvchkQ27Z5wwMxWAEMg5NNWjyHh/5DboFFqbdbvYNIvZouQpxXyeMPoTOh0vdPYKlf0ZswdQ==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.3.tgz",
      "integrity": "sha512-xj+WrAkyv5Qp+t7r9N5HvCBu7g1qOe6CKRNpq22X1GGcPEQADFU54v5qsPVs3/vrUFQ7XivFrcAVKA2stI0kWA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/sucrase": {
      "version": "3.35.1",
      "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.1.tgz",
      "integrity": "sha512-DhuTmvZWux4H1UOnWMB3sk0sbaCVOoQZjv8u1rDoTV0HTdGem9hkAZtl4JZy8P2z4Bg0nT+YMeOFyVr4zcG5Tw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.2",
        "commander": "^4.0.0",
        "lines-and-columns": "^1.1.6",
        "mz": "^2.7.0",
        "pirates": "^4.0.1",
        "tinyglobby": "^0.2.11",
        "ts-interface-checker": "^0.1.9"
      },
      "bin": {
        "sucrase": "bin/sucrase",
        "sucrase-node": "bin/sucrase-node"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/tailwindcss": {
      "version": "3.4.19",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-3.4.19.tgz",
      "integrity": "sha512-3ofp+LL8E+pK/JuPLPggVAIaEuhvIz4qNcf3nA1Xn2o/7fb7s/TYpHhwGDv1ZU3PkBluUVaF8PyCHcm48cKLWQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@alloc/quick-lru": "^5.2.0",
        "arg": "^5.0.2",
        "chokidar": "^3.6.0",
        "didyoumean": "^1.2.2",
        "dlv": "^1.1.3",
        "fast-glob": "^3.3.2",
        "glob-parent": "^6.0.2",
        "is-glob": "^4.0.3",
        "jiti": "^1.21.7",
        "lilconfig": "^3.1.3",
        "micromatch": "^4.0.8",
        "normalize-path": "^3.0.0",
        "object-hash": "^3.0.0",
        "picocolors": "^1.1.1",
        "postcss": "^8.4.47",
        "postcss-import": "^15.1.0",
        "postcss-js": "^4.0.1",
        "postcss-load-config": "^4.0.2 || ^5.0 || ^6.0",
        "postcss-nested": "^6.2.0",
        "postcss-selector-parser": "^6.1.2",
        "resolve": "^1.22.8",
        "sucrase": "^3.35.0"
      },
      "bin": {
        "tailwind": "lib/cli.js",
        "tailwindcss": "lib/cli.js"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/thenify": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
      "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0"
      }
    },
    "node_modules/thenify-all": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
      "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "thenify": ">= 3.1.0 < 4"
      },
      "engines": {
        "node": ">=0.8"
      }
    },
    "node_modules/tiny-invariant": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/tiny-invariant/-/tiny-invariant-1.3.3.tgz",
      "integrity": "sha512-+FbBPE1o9QAYvviau/qC5SE3caw21q3xkvWKBtja5vgqOWIHHJ3ioaq1VPfn/Szqctz2bU/oYeKd9/z5BL+PVg==",
      "license": "MIT"
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinyglobby/node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/tinyglobby/node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/ts-interface-checker": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
      "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/update-browserslist-db": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.4.0.tgz",
      "integrity": "sha512-WPJuOnjI9FWDct4fB+ej4Mz8opLaw5CDcZ2t44tFZ0vIQVYWzBhWR3mkixuUj/A7+vY4V9+ApOZ2YYLwdgq46w==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/use-sync-external-store": {
      "version": "1.7.0",
      "resolved": "https://registry.npmjs.org/use-sync-external-store/-/use-sync-external-store-1.7.0.tgz",
      "integrity": "sha512-6L+EeigHMQhdaIPNIFUKwfWJSwWFQ8gJbJ2DLOs5sDIegTwR9fRxvnM3uciHKjIZhFz+KAv2emhWMRvDmMcY8A==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/util-deprecate": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/victory-vendor": {
      "version": "37.4.1",
      "resolved": "https://registry.npmjs.org/victory-vendor/-/victory-vendor-37.4.1.tgz",
      "integrity": "sha512-geV4p2GVfVM9lgm9ZRS3pvsbAPS+BUGhM9W9nPzPHTKi+/+KjNrFXdgP6KkG+XspNZuvcXmchcrtklfuQ4gniw==",
      "license": "MIT AND ISC AND BSD-3-Clause",
      "dependencies": {
        "@types/d3-array": "^3.0.3",
        "@types/d3-ease": "^3.0.0",
        "@types/d3-interpolate": "^3.0.1",
        "@types/d3-scale": "^4.0.2",
        "@types/d3-shape": "^3.1.0",
        "@types/d3-time": "^3.0.0",
        "@types/d3-timer": "^3.0.0",
        "d3-array": "^3.1.6",
        "d3-ease": "^3.0.1",
        "d3-interpolate": "^3.0.1",
        "d3-scale": "^4.0.2",
        "d3-shape": "^3.1.0",
        "d3-time": "^3.0.0",
        "d3-timer": "^3.0.1"
      }
    },
    "node_modules/vite": {
      "version": "6.4.3",
      "resolved": "https://registry.npmjs.org/vite/-/vite-6.4.3.tgz",
      "integrity": "sha512-NTKlcQjlAK7MlQoyb6LgaqHc8sso/pVyUJYWMws3jg21uTJw/LddqIFPcPqP6PzpgbIcZyKI85sFE4HBrQDA8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "^0.25.0",
        "fdir": "^6.4.4",
        "picomatch": "^4.0.2",
        "postcss": "^8.5.3",
        "rollup": "^4.34.9",
        "tinyglobby": "^0.2.13"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^18.0.0 || ^20.0.0 || >=22.0.0",
        "jiti": ">=1.21.0",
        "less": "*",
        "lightningcss": "^1.21.0",
        "sass": "*",
        "sass-embedded": "*",
        "stylus": "*",
        "sugarss": "*",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "lightningcss": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/vite/node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/vite/node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "dev": true,
      "license": "ISC"
    }
  }
}
````
