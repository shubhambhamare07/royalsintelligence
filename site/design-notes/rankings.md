# Design Notes — Pressure Performance Rankings
## ROYALS INTELLIGENCE — Phase 07A

### 1. Reference Image Names
* Primary Master Mockup: `UI IMAGE REFERENCE/RANKINGS REF.png`
* Design Reference Folders: `design-references/02-rankings/`, `03-batter-rankings/`, `04-bowler-rankings/`

### 2. Layout Grid & Proportions
* **Permanent Ranking Banner:** Fixed top governance banner displaying model version (`pressure-v1.1`), frozen config hash, and total qualified sample size ($N_{\text{bat}}=152, N_{\text{bowl}}=154$).
* **Role Switcher Tabs:** Full-width segmented pill control: Batting Rankings (`/rankings/batters`) vs Bowling Rankings (`/rankings/bowlers`).
* **Table Canvas:** Full-width container with sticky horizontal scroll and pinned left columns (Rank, Player Identity).
* **"Why This Rank" Drawer:** 460px right-side slide-over drawer accessible by clicking any ranking row or drawer button.

### 3. Typography & Numerical Precision
* Table Headers: 11px uppercase, weight 700, Slate 500, tracking wide (`0.05em`).
* Rank Numerals: 16px, weight 800, JetBrains Mono. Top 3 highlighted with Gold (`#C6A15B`), Silver (`#94A3B8`), Bronze (`#B45309`) badges.
* Player Name: 14px, weight 600, Navy 800.
* Rating Number: 18px, weight 800, JetBrains Mono, tabular nums (`95.57`).
* Credible Interval: 12px, tabular nums, bracket format `[76.64, 100.00]`.
* Scaled Metric Z-scores (PV, CD, PC): 13px, weight 500, tabular nums with color coding (+green / -red).

### 4. Table Columns Specification
1. **Rank:** Numeric rank with Top 10 crown/medal indicator.
2. **Player:** Avatar + Canonical Name + Team Badge + Player ID.
3. **Rating:** Rating number + 90% Credible Interval Whisker Bar.
4. **Tier:** Proven / Promising / Unproven pill.
5. **$P(\text{outperform})$:** Probability of exceeding baseline cohort ($1.000$).
6. **Pressure Value (PV):** Runs generated/saved per 100 pressure balls.
7. **Clutch Delta (CD):** Differential performance vs normal phase ($\Delta = \text{PV} - \text{NV}$).
8. **Consistency (PC):** Hit rate across pressure match appearances.
9. **Exposure ($n / n_{\text{eff}}$):** Pressure deliveries faced/bowled and effective sample size.
10. **Action:** "Why This Rank?" drawer trigger button.

### 5. Drawer Anatomy
* Header: Rank badge, Player Portrait, Canonical Name, Formal Rating.
* Section 1 — Rating Breakdown: Point estimate, 90% credible interval, Top 10 inclusion probability.
* Section 2 — Three Components: PV (Scaled), CD (Scaled), PC (Scaled) with percentile bars.
* Section 3 — Natural Language Explanation: Precomputed certified narrative explanation.
* Section 4 — Navigation Links: "View Full Profile", "Inspect Pressure DNA", "Print Reliability Certificate".

### 6. Interactions & Animation
* Staggered row reveal on initial load (15ms stagger per row up to first 20 rows).
* Rating numbers count up smoothly from 0 to exact final value.
* Click row opens drawer; Escape key closes drawer.
* Column header click toggles descending/ascending sort (default: strictly rank order 1 to 152/154).

### 7. Responsive Behavior
* Desktop: Full 10-column table with expanded interval bars.
* Mobile ($390\text{px}$): Sticky Rank + Player Name column on left; scrollable right metrics. Quick-tap card view alternative available via toggle.

### 8. Deviations from Reference
* Reference table shows unscaled raw metrics; implementation displays both scaled z-scores and raw per-100 balls rates according to approved methodology.

