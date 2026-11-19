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
