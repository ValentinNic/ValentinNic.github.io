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
