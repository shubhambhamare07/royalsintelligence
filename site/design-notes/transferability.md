# Design Notes — Transferability Analysis (`/transferability`)
## ROYALS INTELLIGENCE — Phase 07B

### 1. Reference Image Names
* Design Reference Folder: `design-references/06-transferability/`
* Primary Source Data: `outputs/site_data/transferability.json`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`).
* **Header Bar:** 64px height with "RESEARCH INSIGHT: IPL VS T20I TRANSFERABILITY" title badge.
* **Canvas Layout:**
  * Top Summary Metric Row (4 Cards):
    1. Spearman Correlation ($\rho = 0.3449$, $p = 0.0189$)
    2. Disattenuated True Correlation ($\rho_{\text{dis}} \approx 1.0$)
    3. Sample Size (46 Qualified Batters, 44 Qualified Bowlers with $\ge 60$ balls in both domains)
    4. 95% Bootstrap Confidence Interval ($[0.0626, 0.5822]$)
  * Interactive Quadrant Scatter Chart Canvas: 70% width or full width with side filter drawer.
  * Quadrant Breakdown Grid: 4 cards summarizing the 4 quadrants:
    - High IPL + High T20I (Universal Performers)
    - High IPL + Low T20I (League Specialists)
    - Low IPL + High T20I (International Cross-Overs)
    - Low IPL + Low T20I (Strugglers)
  * Qualified Players Comparison Table with dual error bars (IPL CI90 vs T20I CI90).

### 3. Typography Scale
* Page Title: SF Pro Display 32px (2rem), font-extrabold.
* Statistical Badges: 14px font-mono, font-semibold.
* Big Metric Value: 28px font-mono.
* Quadrant Titles: 16px font-bold.
* Table Typography: 13px font-medium.

### 4. Color Palette
* Background: `#F8FAFC`
* Cards: `#FFFFFF`
* Scatter Dots (Batters): `#E6007E` (Royal Pink)
* Scatter Dots (Bowlers): `#3B82F6` (Electric Blue)
* Regression Line: `#14213D` with shaded $95\%$ bootstrap confidence ribbon
* Quadrant Lines: Dashed `#94A3B8` (median crosshairs)
* Quadrant Highlights:
  * Universal Elite (Top-Right): `#F0FDF4` (Soft Emerald)
  * International Cross-Overs (Top-Left): `#EFF6FF` (Soft Blue)
  * League Specialists (Bottom-Right): `#FFFBEB` (Soft Amber)
  * Low/Low (Bottom-Left): `#F8FAFC`

### 5. Card Sizes & Spacing
* Scatter Chart Box: Height 520px, full responsive width, padded 24px.
* Quadrant Summary Cards: Min-height 120px, 16px padding.
* Player Inspection Table: Padded 20px, sortable columns.

### 6. Borders & Shadows
* Subtle card borders (`border-slate-200`).
* Chart container with clean gridlines (`#F1F5F9`).

### 7. Chart Specifications (ECharts / SVG)
* X-Axis: IPL Pressure Rating (Scale 0–100 or standardized value)
* Y-Axis: T20I Pressure Rating (Scale 0–100 or standardized value)
* Data points: 46 dual-qualified batters or 44 dual-qualified bowlers.
* Visual error bars (whiskers) in X and Y dimensions representing respective CI90 intervals.
* Median divider lines partitioning into 4 quadrants.
* Tooltip on hover showing:
  - Player Name
  - IPL Rating + CI90
  - T20I Rating + CI90
  - Exposure (Balls in IPL vs Balls in T20I)
  - Quadrant classification

### 8. Interactions & Motion
* Role Selector: Toggle between Batters ($N=46$) and Bowlers ($N=44$).
* Quadrant Filter: Clicking a quadrant card filters the scatter plot and table to only players in that quadrant.
* Hover highlight linking scatter dot to table row.
* Click to navigate to `/player/:id`.

### 9. Responsive Behavior
* Mobile: Scatter chart touch-draggable, table horizontal scrollable, metric cards stack $2\times 2$.

### 10. Deviations from Reference
* Authentic data binding to `transferability.json`. Explicitly discloses measurement error attenuation and statistical caveats.

