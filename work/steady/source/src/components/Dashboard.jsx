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
