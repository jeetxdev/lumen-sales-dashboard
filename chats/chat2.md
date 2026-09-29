# Design inconsistencies found

_Started 2026-09-28 04:32 UTC_

---

## User

Continuing from "Sales dashboard UI mockups".

## Assistant

We've been building a B2B sales dashboard for Lumen Goods (home-goods wholesale) in the Nocturne design system. It's a clickable desktop and mobile prototype with eight main screens.

Work done so far:

- Built core screens: Overview, Orders, Order detail, Accounts, Account detail, Products, Inventory, Invoices, Reports and Settings, with mobile routing through a "More" tab.
- Added B2B features: credit limits and payment terms on accounts, multi-warehouse inventory (Portland, Columbus, Reno) with inbound tracking.
- Restock workflow: low-stock items get a Restock button that lets you either draft a purchase order (with supplier, min order, arrival date) or transfer stock between warehouses. Orders show in an Inbound list until received.
- Product detail page: shows wholesale pricing by tier, cost and MSRP, 12-month sales, recent orders, top buyers, sourcing info and warehouse stock.
- Pricing controls: edit unit cost and MSRP per product (immediate or scheduled), set tier discounts globally (Standard/Silver/Gold %), and create promotions (% off specific products or categories, with stacking options).
- Accounts: set each account's pricing tier with a switch.
- Appearance settings: Light/Dark toggle, six colour swatches (Teal default) plus a custom colour picker, with live preview.
- Data display: replaced the earlier Visual/Hybrid/Tabular toggle with per-card chart/table switches on Overview Revenue, all Reports charts, and Product detail Units sold.

Current state: All features are built and passing checks. The dashboard is fully clickable and responsive.

Next steps: Confirm which colour should be the new default (or keep Teal), decide if the chart/table switches should be the only option going forward, and integrate real product/account data when you have it.

Files: Sales Dashboard v3.dc.html (the active version; v1 and v2 are archived).

## User

there are few design inconsistancy, like header buttons heights are not same,
the button switches borders are overlappig with selected colors borders(see attached image)

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: ready_for_verification]_

I made two fixes:
- **Switches:** the selected option now sits inside the control as its own rounded pill with a light tint, so its outline no longer overlaps the outer border or the divider next to it. This applies to every switch in the prototype.
- **Header:** the search box, date-range switch, theme button and main action button are all 36px tall now, so they line up.

