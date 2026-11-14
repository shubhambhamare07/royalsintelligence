# Design Notes — Sensitivity Lab (`/lab`)
## ROYALS INTELLIGENCE — Phase 07B

### 1. Reference Image Names
* Design Reference Folder: `design-references/05-sensitivity/` or research lab UI references
* Primary Architectural Reference: `outputs/site_data/sensitivity/summary.json` & `reports/phase_03_report.md`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`), highlighting Sensitivity Lab active tab.
* **Top Header Utility Bar:** 64px height, displaying Phase indicator ("PHASE 07B — RESEARCH LAB") and Monte Carlo simulation badge ("500 MC SIMULATIONS").
* **Content Canvas:** Fluid width ($1200\text{px}$ to $1600\text{px}$ max), 32px padding (`p-8`).
* **Grid Hierarchy:**
  * Executive Overview Banner: 3 summary metric tiles (Simulation Replicates $N=500$, Mean Batter Top-10 Overlap $28.94\%$, Mean Bowler Top-10 Overlap $21.48\%$).
  * Main Section Split (2 Columns, $1\text{fr}\;1\text{fr}$ on desktop):
    * Left Column: Primary Batters Top-10 Inclusion Probabilities & Fragile Picks list.
    * Right Column: Primary Bowlers Top-10 Inclusion Probabilities & Fragile Picks list.
  * Deep-Dive Section: Kendall $\tau$ rank correlation matrix and stability commentary explaining why low overlap occurs (tight rating clusters around boundaries).

### 3. Typography Scale
* Page Title: SF Pro Display 32px (2rem), font-extrabold (`text-slate-900`).
* Section Headings: 20px (1.25rem), font-bold (`text-slate-800`).
* Metric Value: 28px (1.75rem), font-bold, JetBrains Mono tabular (`font-mono`).
* Player Name: 15px (0.9375rem), font-semibold.
* Table / Label Text: 13px (0.8125rem), font-medium.
* Explanatory / Footnote Text: 12px (0.75rem), text-slate-500.

### 4. Color Palette
* Background: `#F8FAFC` (Slate 50)
* Cards: `#FFFFFF`, border `#E2E8F0`
* High Confidence / Stable (>50% Inclusion): Emerald `#10B981` / Emerald background `#ECFDF5`
* Moderate Confidence (20%–50% Inclusion): Amber `#F59E0B` / Amber background `#FFFBEB`
* Fragile / Volatile (<20% Inclusion): Rose `#EF4444` / Rose background `#FEF2F2`
* Primary Brand Accent: `#E6007E` (Royal Pink)
* Dark Navy Accent: `#14213D`

### 5. Card Sizes & Spacing
* Top Summary KPI Cards: Min-height 100px, padding 20px, rounded-xl.
* Inclusion Bar Chart Container: Min-height 380px, padding 24px, rounded-xl.
* Fragile Picks Table: Full width within card, striped rows, 12px vertical padding per row.
* Gap: 24px grid gap between major sections.

### 6. Borders & Shadows
* Borders: 1px solid `#E2E8F0` (light gray).
* Shadows: Subtle elevation `shadow-sm` on rest, `shadow-md` on hover.
* Warning callout boxes: Left border 4px solid `#EF4444` for fragile player disclosures.

### 7. Chart Placement & Dimensions
* Horizontal Inclusion Probability Bars:
  * Width: $100\%$, Bar height 12px, custom SVG / CSS bar with hover tooltip showing exact fraction (e.g. $47.2\%$ for Virat Kohli).
  * Ranked by baseline Top-10 order.
  * Threshold guideline at $50\%$ probability line.

### 8. Interactions & Motion
* Interactive Role Toggle (Batters vs Bowlers vs Combined).
* Hover tooltip on bar revealing: player rank, raw rating, CI90 bounds, and simulation count ($k / 500$).
* Quick link from player row directly to `/player/:id`.

### 9. Responsive Behavior
* Desktop ($>1024\text{px}$): 2-column side-by-side batting vs bowling stability.
* Tablet ($768\text{px} - 1024\text{px}$): Stacked 1-column layout, full width charts.
* Mobile ($<768\text{px}$): Single-column stack, horizontal overflow table with sticky player names.

### 10. Deviations from Reference
* Authentic data binding to `sensitivity/summary.json` containing 500 Monte Carlo runs with target score noise ($\sigma \approx 3.6$). Explicitly highlights fragile picks (Kusal Mendis, Shimron Hetmyer at 0% inclusion) with mathematical honesty.

