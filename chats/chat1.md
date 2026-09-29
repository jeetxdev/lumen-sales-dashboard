# Sales dashboard UI mockups

_Started 2026-09-24 05:02 UTC_

---

## User

Make UI mockups for a sales dashboard(included not limited to customers, inventory, orders etc)

## Assistant



## User

Answered — Asked for follow-up questions; screens: Overview, Customers, Customer detail, Inventory, Orders, Order detail, Products, Reports/analytics, Settings; business: B2B wholesale; fidelity: Clickable prototype; layout: Left sidebar; variations: 2–3 layout options; viewport: Desktop + mobile

## Assistant



## Assistant

_[tool: ask_user]_

_[tool: list_files]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: dc_write]_

_[tool: ask_user]_

_[tool: ask_user]_

I added a few follow-up questions to the form: what you sell and to whom, what the layout options should differ on, and which B2B features to include. I'll keep building once you answer.

## User

Answered — variation_axis: Data-display style (charts vs tables); b2b_features: Credit terms & invoices, Multi-warehouse stock

## Assistant

_[tool: dc_write]_

## Assistant

_[tool: dc_write]_

_[tool: ready_for_verification]_

I've built **Sales Dashboard.dc.html**, a clickable wholesale prototype for a made-up home-goods business called Lumen Goods. It's out for a final check now.

- **Screens:** Overview, Orders, Order detail, Accounts (your Customers screen), Account detail, Products, Inventory, Invoices, Reports and Settings. On mobile, Products, Invoices, Reports and Settings sit under a "More" tab.
- **Clickable parts:** table rows open detail pages, and there's a back button to return. Filters and search work, as do the warehouse cards on Inventory. Buttons for drafting a purchase order, sending an invoice reminder and moving an order to its next status all update the screen.
- **Your two B2B features:**
  - **Credit terms and invoices:** credit limits, balances and payment terms on accounts. Accounts over their limit are put on hold. There's a receivables-aging view and invoice reminders.
  - **Multi-warehouse stock:** stock is split across three warehouses (Portland, Columbus and Reno), with capacity for each.
- **Layout options:** a panel in the bottom-right corner switches between **Visual** (mostly charts), **Hybrid** and **Tabular** (mostly tables), and between **Desktop** and a **Mobile** phone view. The same choices are also in the Tweaks panel.

You didn't say what the business sells, so all the products, accounts and numbers are placeholders. Tell me the real product line and I'll swap them in.

## User

When they have low quantity, how they will refill stock?

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

I've added two ways to refill stock on the Inventory screen: order from the supplier, or move stock from one warehouse to another. It's out for a check now.

- **Restock button:** every low or "Reorder" item gets one. It opens a window with two choices:
  - **Purchase order:** fills in the item's supplier and delivery time, and suggests a quantity. You can change it one case at a time, and it warns if you go below the supplier's minimum order. It shows the order total, the expected arrival date and the stock you'll have afterwards.
  - **Transfer:** pick the warehouse to take from and the one to deliver to; each option shows its current stock. It warns if the source doesn't have enough units, and notes that total stock stays the same because it only moves units around.
- **After you confirm:**
  - The item's status changes to "On order".
  - A new **Incoming** column shows the quantity, destination and arrival date.
  - The order appears in a new **Inbound** list with two example orders already in it.
- **Receive:** clicking this on an inbound order adds the stock to that warehouse and updates the item's status.
- **Settings:** there's a new "Auto-draft purchase orders" switch. It's only a setting on screen; nothing actually drafts orders automatically.

The suggested quantity tops stock up to twice the reorder point, rounded up to whole cases. Tell me if you use a different rule.

## User

not liking the colors, looks too purple, also not dark I need light mode by default. option to switch in dark mode

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: dc_set_props]_

_[tool: show_html]_

_[tool: ready_for_verification]_

I've made a new version, **Sales Dashboard v2**, in the Modernist style: light by default, with dark mode as an option. It's out for a check now. The purple dark version is still there unchanged as the original file.

- **New look:** light background with a single red accent, the Archivo typeface, square corners and heavier divider lines. The glows, gradients and card shadows are gone, and the icons are swapped to the Lucide set.
- **Dark mode:** use the sun/moon button in the header, the new Light/Dark switch in the Mockup options panel, or the new `theme` setting in Tweaks. Dark mode flips the same greys and reds, so nothing turns purple.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I fixed both problems the check found in v2, and it's being checked again now.

- **Restock window:** the Purchase order / Transfer switch had shrunk to nothing when the window was short, so you couldn't pick Transfer. It now stays full size.
- **Inventory table:** on narrower screens it pushed the whole page sideways. It now scrolls sideways inside its own box instead.

## User

change it to nocturne and but use some other primary color or give me option I will choose

## Assistant

_[tool: run_script]_

_[tool: run_script]_

_[tool: dc_set_props]_

_[tool: ready_for_verification]_

I've made **Sales Dashboard v3**: back in the Nocturne style, with six main colours to choose from. It's out for a check now.

- **Colours:** Teal (the default), Azure, Emerald, Amber, Coral, and the original Blurple. Pick one from the swatches in the Mockup options panel or from the `accent` setting in Tweaks. Each colour has the same brightness steps as Nocturne's original purple, so contrast stays the same.
- **Light or dark:** light is the default, and the sun/moon button in the header switches to dark. Nocturne itself only comes in dark, so I made the light version from its own greys, with a slightly deeper shade of the main colour so it's easy to read on a light background.
- **Earlier fixes:** the Restock window and the sideways-scrolling Inventory table from v2 are fixed here too.

Tell me which colour you pick and I'll set it as the default and remove the option.

## User

super, can we add this accent option in settings, and let user choose? maybe few choices and a color picker? or color picker will make it too complex to implement via code?

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

I added an **Appearance** card at the top of Settings, and it's out for a check now. It has a Light/Dark switch, the six colour swatches, and a custom colour picker (the eyedropper circle). Below them is a small preview with a button and two status tags so you can see the colour in use.

A colour picker isn't too complex to build. The app takes the colour the user picks, keeps its hue and intensity, and adjusts its brightness to match the built-in colours. That way even a very light yellow or very dark navy stays readable in both light and dark mode. A real app would do the same, then save the choice to the user's account.

Your Emerald pick in Tweaks only shows in your own view. Tell me if you want it saved as the default.

## User

for products and inventory items, what will happen when we click on the product name?

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: read_file]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Before this, clicking a product did nothing. Now any product row in Products or Inventory, on desktop or mobile, opens a **Product detail** page. It's out for a check now.

The page shows:
- **Summary cards:** wholesale price and MSRP, margin and cost, stock on hand and how much is set aside for orders, and what's available against the reorder point.
- **Stock by warehouse:** a bar for each of Portland, Columbus and Reno, flagged when it's low for that warehouse, plus any incoming order with its arrival date.
- **Units sold:** 12 months of sales, as bars in Visual/Hybrid and as numbers in Tabular.
- **Recent orders** with this product; clicking one opens that order.
- **Wholesale pricing** for Standard, Silver and Gold accounts, with the margin at each.
- **Sourcing:** supplier, delivery time, case pack, minimum order and category.
- **Top buyers:** the accounts buying it most; clicking one opens that account.
- **Header button:** Restock opens the same restock window as Inventory. If the product is already on order, it shows Edit product instead, which is a placeholder.

The Restock button inside an inventory row still opens the restock window, not the product page. The back button returns you to whichever list you came from.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

The product detail page was showing its headings with nothing under them: the page's data wasn't being passed to the screen. That's fixed, so its cards, charts and lists should now fill in. It's being checked again.

## User

how/where admin will set item price?

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Prices are now set in two places. It's out for a check now.

**1. Each product's own price** (open a product, then **Edit** on the Wholesale pricing card):
- An edit window has fields for unit cost, wholesale price and MSRP.
- As you type, it shows your margin, the shop's margin if it sells at MSRP, and the price for each tier. It also shows how the new price compares with the current one.
- **Takes effect:** you can choose Immediately, Oct 1 or Nov 1. A scheduled change appears on the product page as "Scheduled: …".
- It blocks prices at or below cost, and warns when MSRP is lower than wholesale.
- Saving updates the product and adds the change to a new **Price history** list on the product page.

**2. Tier discounts for all products** (Settings → **Price tiers**):
- Silver and Gold each get a percentage off the wholesale price; Standard pays the full price. Changing these updates the tier prices on every product.

Existing orders keep the prices they were placed at. Other product details such as name, case pack and supplier aren't editable yet.

## User

there is no edit button in wholesale card

## Assistant

_[tool: grep]_

_[tool: eval_js_user_view]_

_[tool: dc_html_str_replace]_

I checked your screen and the button was there, but it was a small, plain "Edit" link next to the card label, so it was easy to miss. I've made it an outlined **Edit prices** button in the top-right corner of the Wholesale pricing card, on any product page. If you still don't see it, refresh the page.

## User

where I will select discount tier?

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

You choose each account's discount tier on its own page: go to **Accounts**, open an account, and use the new **Pricing tier** switch at the top of the right-hand card.

- **Options:** Standard (full wholesale price), Silver or Gold. Each shows its current discount, such as "−4%".
- **Effect:** switching updates the account's tier on the Accounts list and the account counts under Settings → Price tiers.
- **Discount amounts** are still set for all accounts at once in Settings → Price tiers. Each product's full wholesale price is set on its product page.

## User

what if I want to apply discount on certain products?

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

I added **Promotions**, which are discounts on selected products, separate from account tiers. It's out for a check now.

- **Where:** a new **Promotions** item in the sidebar, under "More" on mobile. It lists each promotion with the products it covers, the discount, which accounts can use it, dates and status. Each has an **End now** or **Reactivate** button, and there are two example promotions.
- **New promotion** (from the header, or **Add promotion** on any product page):
  - A name and a percentage off.
  - **Applies to:** a whole category, or specific products ticked from a list.
  - **Eligible accounts:** all accounts, Silver & Gold only, or Gold only.
  - **Ends:** Oct 31, Nov 30, or no end date.
  - **Stack with tier discount:** when on, the promotion is taken off after the account's tier discount. When off, the account gets whichever discount is bigger.
  - A live example price, such as "$15.00 → $12.75".
- **Where it shows:** products on promotion get a "−15%" tag in the Products list. The product page shows the promotion and the sale price in its Wholesale pricing card.

## User

these option visual/hybrid/tabular, what is difference between these ?

## Assistant

They're three layout options you asked for early on: the same data shown mostly as charts, mostly as tables, or a mix. The screens, figures and clicks are the same in all three; only how the numbers are displayed changes.

**Visual (mostly charts)**
- Overview: the revenue chart is a line with last year shown dashed, and the right-hand card shows stock per warehouse as bars.
- Tables get small bars inside the cells, for credit used, stock level and margin.
- The summary cards at the top show little trend lines.
- Reports use charts and bars.

**Hybrid (a mix, and the default)**
- Overview: revenue is shown as monthly bars, and the right-hand card is a low-stock list with small bars.
- It keeps the in-cell bars and trend lines from Visual, but uses lists and tables for detail.

**Tabular (mostly tables)**
- Charts are replaced by tables: revenue becomes a month-by-month table with orders, margin and change from last year, and units sold becomes a grid of numbers.
- There are no bars or trend lines anywhere; credit, stock and margin show as plain numbers and percentages.
- It's the densest option, suited to people who mostly scan figures.

To compare them, open the Overview or Reports page and switch between the options in the bottom-right panel; the difference shows most there. Once you pick one, I can remove the other two and the switcher.

## User

instead of these, can you add a view option on these screens/places, so that user can toggle between graphs and table?

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_set_props]_

_[tool: ready_for_verification]_

I replaced the Visual/Hybrid/Tabular option with a small chart/table switch in the corner of each chart card. It's out for a check now.

The switch is on:
- **Overview → Revenue:** a line chart with last year dashed, or a month-by-month table.
- **Reports → Revenue vs last year:** the same chart, or a full 12-month table.
- **Reports → Revenue by category** and **Revenue by rep:** bars or a table, each switched separately.
- **Product detail → Units sold:** monthly bars or a grid of numbers.

Everything starts on the chart view. The small bars inside table cells (credit used, stock and margin) and the trend lines on the summary cards now always show. The Visual/Hybrid/Tabular option is gone from the Mockup options panel and from Tweaks.

The Overview's bottom-right card is now always the Low stock list; the "Stock by warehouse" bars from the old Visual option are only on the Inventory page now.

