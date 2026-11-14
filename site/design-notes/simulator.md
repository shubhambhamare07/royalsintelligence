# Design Notes — Interactive Match Simulator (`/simulator`)
## ROYALS INTELLIGENCE — Phase 07C

### 1. Reference Image Names
* Design Reference Folder: `design-references/11-match-simulator/`
* Master Technical Specification: `outputs/site_data/simulator/spec.md` & `models/simulator/engine.py`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`), highlighting Simulator active link.
* **Top Header Utility Bar:** 64px height with Monte Carlo simulation count badge ("2,000 ITERATIONS") and Seed pill.
* **Content Canvas Layout (Split 2-Column on Desktop):**
  * Left Column ($40\%$, min 380px): Match Configuration Workspace (Batting Team selection, Bowling Squad selection, Overs, Seed, Target setting, Run/Cancel controls).
  * Right Column ($60\%$): Simulation Dashboard & Results Studio (Scoreboard cards, Inning score distribution KDE, phase run breakdowns, win probability, outcome frequencies).

### 3. Typography Scale
* Page Title: SF Pro Display 32px (2rem), font-extrabold (`text-slate-900`).
* Score Display: 36px font-extrabold font-mono (`font-mono`).
* Metric Values: 24px font-bold font-mono.
* Section Headings: 18px font-bold.
* Table / Label Text: 12px font-medium.
* Disclaimers: 11px text-slate-500 font-sans.

### 4. Color Palette
* Background: `#F8FAFC`
* Cards: `#FFFFFF` with `#E2E8F0` border
* Primary Brand Pink: `#E6007E` (Run Simulation CTA, primary win probability)
* Deep Navy: `#14213D` (Innings headers, contrast controls)
* Success / Winning Team: `#10B981` (Emerald)
* Warning Callout (Limitations): `#FEF3C7` (Amber 50) with `#92400E` text
* Progress Bar: Gradient from `#E6007E` to `#3B82F6`

### 5. Card Sizes & Spacing
* Configuration Form Card: Min-height 540px, padding 24px, rounded-2xl.
* Results HUD: Min-height 120px, padding 20px, rounded-2xl.
* Score Distribution Chart Box: Height 300px, padding 20px.
* Spacing: 24px grid gaps, 16px element rhythm.

### 6. Borders & Shadows
* 1px solid border `#E2E8F0`. Shadow elevation `shadow-card` default, elevating to `shadow-xl` on run completion.

### 7. Chart Placement & Dimensions
* Innings Total Score Distribution: ECharts smooth density / histogram curve with median marker line ($320\text{px} \times 100\%$).
* Phase Run Contribution Stacked Bar: Powerplay (overs 1-6), Middle (7-15), Death (16-20).
* Outcome Class Pie / Donut Chart: dot, non-boundary, boundary, wicket, extra proportions.

### 8. Web Worker & Parity Architecture
* Web Worker execution decoupled from main UI thread.
* Deterministic seeded PRNG using SplitMix32 / Mulberry32 / PCG reproducing Python results.
* Progress reporting at batched intervals ($10\%$, $25\%$, $50\%$, $75\%$, $100\%$).
* Cancellation support via Worker termination.

### 9. Responsive Behavior
* Mobile ($<768\text{px}$): Single-column stack (Config on top, results underneath), sticky Run button at bottom viewport.

### 10. Deviations & Disclaimers
* Explicit disclaimer: "Model projection — not an official Rajasthan Royals prediction. Simulations use Gamma-Poisson Empirical Bayes shrinkage over historical deliveries. Venue conditions and boundary dimensions are not explicitly parameterised."

