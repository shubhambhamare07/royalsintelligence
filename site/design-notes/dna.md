# Design Notes — Pressure DNA & Radar Analysis
## ROYALS INTELLIGENCE — Phase 07A

### 1. Reference Image Names
* Design Reference Folder: `design-references/07-pressure-dna/README.md`
* Relevant Charts: `CHART-08` (Pressure DNA Radar), `CHART-09` (DNA Cohort Heatmap)

### 2. Layout Grid & Proportions
* **Top Hero & Player Selector:** Searchable player picker with current archetype badge (e.g. "Clutch Anchor", "Death Enforcer", "Spin Stifler") and Versatility Score index.
* **Primary Radar Section ($500\text{px}$ height):**
  * Center: 6-Axis interactive radar chart with population median 50th-percentile reference polygon.
  * Axis Labels: Domain titles + individual axis scores [0, 100].
  * Uncertainty Bands: Translucent ribbon along polygon vertices denoting Bayesian 90% credible intervals.
* **Secondary Dimension Ledger:** 6 modular cards explaining each axis:
  * Batting Axes: High-pressure Strike Rate, Collapse Resistance, Death Overs Acceleration, Spin Handling, Pace Counter, Consistency.
  * Bowling Axes: Death Economy, Powerplay Control, Wicket Taking Under Pressure, Dot Ball % in Crisis, Boundary Suppression, Boundary Recovery.
* **Over-by-Wicket Situational Pressure Heatmap:** $20 \times 10$ matrix showing empirical win probability leverage and scoring rates by match state. Minimum cell count rules enforced ($N \ge 10$ deliveries).

### 3. Visual Styling & Color Tokens
* Radar Polygon Fill: Royal Pink `#E6007E` at 25% opacity with 2.5px solid border.
* Population Median Ring: Dotted Slate-400 line (`#94A3B8`).
* Insufficient Evidence Axes: Hatched diagonal pattern with warning tooltip (`Sample < 20 balls; shrunk to prior mean`).

### 4. Interactions
* Hovering any vertex displays:
  * Exact Axis Score (e.g. `88.4 / 100`)
  * Cohort Percentile (`94th Percentile`)
  * Raw Underlying Rate (e.g. `Death Strike Rate: 212.5`)
* Toggle "Overlay Cohort Median" and "Compare with Benchmark".

### 5. Responsive Behavior
* Desktop: Side-by-side radar ($55\%$) and dimension cards ($45\%$).
* Mobile ($390\text{px}$): Scaled-down radar ($320\text{px}$) stacked above dimension cards.

### 6. Deviations from Reference
* Incomplete dimensions in source data are explicitly flagged with `UnavailableBadge` rather than fabricated or forced to 50.

