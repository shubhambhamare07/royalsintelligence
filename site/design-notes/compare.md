# Design Notes — Player Comparison Matrix
## ROYALS INTELLIGENCE — Phase 07A

### 1. Reference Image Names
* Design Reference Folder: `design-references/06-comparison-centre/README.md`
* Relevant Charts: `CHART-11` (Dual Radar Comparison), `CHART-12` (Metric Delta Bar)

### 2. Layout Grid & Proportions
* **Player Selection Bar:** Sticky top selection bar supporting 2 to 3 players with search picker, role guard (enforces comparing batters with batters, bowlers with bowlers), and remove buttons.
* **Header Cards Grid:** Equal-width comparison cards for each selected player (Player 1 Deep Navy `#14213D`, Player 2 Royal Pink `#E6007E`, Player 3 Metallic Gold `#C6A15B`).
* **Visual Comparison Canvas (2 Columns on Desktop):**
  * Left Column: Overlaid 6-Axis Pressure DNA Radar (`CHART-11`).
  * Right Column: Paired Diverging Delta Bars (`CHART-12`) showing relative performance advantage.
* **Side-by-Side Detailed Metric Table:** Grouped rows for Rating, Interval, PV, CD, PC, Volume, Boundary Rate, Dot %, Milestone Counts.

### 3. Role Guard Enforcement
* When comparing players, if an analyst attempts to compare a batter with a bowler, a clear notification banner appears:
  `Role Incompatibility: Cannot compare Batter with Bowler directly. Metrics (Strike Rate vs Economy, PV Bat vs PV Bowl) operate on mutually exclusive scales.`

### 4. Pairwise Posterior Probability
* Where precomputed posterior draws exist, display:
  `P(Player A > Player B under Pressure) = 87.4%`
* Explanatory footnote: Derived from 500 Monte Carlo draws of the joint Dirichlet-Laplace posterior distribution.

### 5. URL State Persistence
* Selected player IDs are strictly encoded into the URL search params:
  `/compare?ids=6931,4260`
* Refreshing or sharing the URL preserves the exact comparison state.

### 6. Responsive Behavior
* Desktop ($>1024\text{px}$): 3-column side-by-side comparison.
* Mobile ($390\text{px}$): 2-player tabbed toggle or compact stacked cards with swipeable metric tables.

### 7. Deviations from Reference
* Reference uses mock delta bars; implementation binds to real normalized z-scores and raw per-100 differences.

