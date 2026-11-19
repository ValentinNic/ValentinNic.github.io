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
