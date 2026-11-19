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
