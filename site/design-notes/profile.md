# Design Notes — Player Profile
## ROYALS INTELLIGENCE — Phase 07A

### 1. Reference Image Names
* Primary Master Mockup: `UI IMAGE REFERENCE/PLAYER PROFILE.png`
* Design Reference Folder: `design-references/05-player-profiles/README.md`

### 2. Layout Grid & Proportions
* **Hero Header ($320\text{px}$ height):**
  * Left: Large Player Portrait / Cutout ($220\text{px} \times 280\text{px}$) with team-branded studio gradient.
  * Center: Player Name (32px bold), Team badge, Franchise history, Batting/Bowling styles, Canonical ID.
  * Right: Large Rating Badge ($120\text{px} \times 120\text{px}$ card) with rating score (`91`), 90% credible interval, Tier pill, and rank badge (`Rank #1 Batter`).
* **Navigation Tab Bar:** 7 persistent tabs:
  1. `Overview` (Default dashboard summary)
  2. `Pressure` (Normal vs Pressure performance, Clutch Delta, context splits)
  3. `Batting` (Runs, strike rates, 0/1/2/3/4/6 breakdowns, dismissals)
  4. `Bowling` (Wickets, economy, bowling phases, dot ball %)
  5. `Matches` (Complete match log with sorting and filter by competition/year)
  6. `Seasons` (Year-by-year trajectory table and trend visualization)
  7. `Certificate` (Formal embedded rating certificate view)

### 3. Overview Tab Structure
* **Top Metric Grid:** 4 Key Performance Indicators (Pressure Value / 100b, Clutch Delta, Consistency, Effective Sample $n_{\text{eff}}$).
* **Two-Column Analytical Split:**
  * Left Column ($55\%$): Career Pressure Trajectory (`CHART-06`) line chart with 5-match rolling mean.
  * Right Column ($45\%$): 6-Axis Pressure DNA Radar (`CHART-08`) with archetype pill and versatility score.
* **Situational Splits Table:** Performance broken down by Competition (IPL vs T20I), Innings (1st vs 2nd), Phase (Powerplay vs Middle vs Death).

### 4. Batting & Bowling Tabs
* Pie / Donut charts for delivery outcome distribution (`dot`, `single`, `boundary_4`, `boundary_6`, `wicket`).
* Dismissal type breakdown (Caught, Bowled, LBW, Run Out).
* Highest score, milestone tallies (30s, 50s, 100s).

### 5. Ineligible Player Handling
* If a player did not meet qualification thresholds ($n < 60$ pressure balls):
  * Rating badge replaced by neutral "Unrated / Insufficient Exposure" banner.
  * Clear explanation: e.g., *"Player faced 24 pressure balls across 3 matches (qualification threshold: 60 balls). Rating cannot be certified reliably."*
  * Standard career statistics and match logs remain fully available.

### 6. Interactions & Visual Transitions
* Tab switching preserves scroll position and loads data instantly from local cache.
* Hover over trajectory points reveals exact match ID, opponent, date, and pressure value.
* Action button: "Compare Player" adds player to comparison tray.

### 7. Responsive Behavior
* Mobile ($390\text{px}$): Hero stacks vertically; tabs become horizontally scrollable pill strip; trajectory chart simplifies ticks; radar scales to $280\text{px}$ diameter.

### 8. Deviations from Reference
* Reference includes mock player photo; implementation supports authentic player portrait or high-fidelity arms-folded studio portrait with deterministic monogram fallback.

