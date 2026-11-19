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
