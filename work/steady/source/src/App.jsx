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
