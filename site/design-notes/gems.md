# Design Notes — Hidden Gems Discovery (`/gems`)
## ROYALS INTELLIGENCE — Phase 07B

### 1. Reference Image Names
* Design Reference Folder: `design-references/03-analytics/`
* Primary Source Data: `outputs/site_data/hidden_gems.json`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`).
* **Header Bar:** 64px height with "AUCTION VALUE DISCOVERY — HIDDEN GEMS" title and filter chips.
* **Content Canvas Layout:**
  * Top Metric Strip:
    * Total Discovered Gems: 11 Players (10 Batters, 1 Bowler)
    * Identification Rule: $P(\text{outperform}) \ge 0.80$ AND (Low Exposure OR Concealed Strike Rate / Economy)
    * Median Thresholds: Batter Exposure 155 balls, Strike Rate 143.93 | Bowler Exposure 157 balls, Economy 8.62 rpo
  * Interactive Discovery Scatter / Quadrant Visualizer:
    * X-Axis: Exposure (Deliveries faced/bowled under pressure)
    * Y-Axis: Conventional Metric (Strike Rate for batters, Economy Rate for bowlers)
    * Bubble Size / Color: Pressure Rating ($[0, 100]$) and $P(\text{outperform})$ confidence
  * Discovered Gem Cards Grid: 11 detailed auction target profile cards arranged in 3-column / 2-column responsive layout.

### 3. Typography Scale
* Page Headline: SF Pro Display 32px (2rem), font-extrabold.
* Gem Player Name: 18px (1.125rem), font-bold (`text-slate-900`).
* Clutch Rating: 26px font-mono, font-extrabold (`text-brand-pink`).
* Outperform Probability: 14px font-mono, font-semibold (`text-emerald-600`).
* Concealment Tag: 11px uppercase font-semibold tracking-wide.
* Reason Narrative: 13px text-slate-600 leading-relaxed.

### 4. Color Palette
* Background: `#F8FAFC`
* Cards: `#FFFFFF`
* High Clutch Rating Accent: `#E6007E` (Royal Pink)
* Outperform Probability Accent: `#10B981` (Emerald)
* Low Exposure Concealment Badge: `#FEF3C7` (Amber 100) with `#D97706` text
* Low Conventional Rate Concealment Badge: `#E0E7FF` (Indigo 100) with `#4F46E5` text
* Border Accents: `#E2E8F0`

### 5. Card Sizes & Spacing
* Gem Discovery Card: Min-height 220px, padding 20px, rounded-xl.
  * Header: Player avatar/initials, Name, Team, Role pill, Tier pill.
  * Main Metric Row: Pressure Rating with CI90 whisker + Outperform Probability ($P \ge 80\%$).
  * Concealment Mechanism: Why the market undervalues this player (e.g. "Low Pressure Volume: 93 balls vs median 155" or "Conventional SR: 132.2 vs median 143.9").
  * Action: "Inspect Player DNA" button routing to `/player/:id`.

### 6. Borders & Shadows
* Card border: 1px solid `#E2E8F0`.
* Gem card hover: Border color changes to `#E6007E`, shadow elevates to `shadow-lg` with subtle pink glow.

### 7. Chart Specifications
* Scatter Plot: Exposure vs Conventional Rate:
  * Batters: Exposure (Balls) vs Strike Rate. Vertical line at 155 balls, horizontal line at 143.93 SR.
  * Gem dots highlighted with glowing rings and player name callouts (e.g. Shashank Singh, Kusal Mendis, Mustafizur Rahman).
  * Tooltip displaying full stats, rating, and concealment reason.

### 8. Interactions & Motion
* Role Filter: All (11) | Batters (10) | Bowlers (1).
* Concealment Type Filter: Low Exposure (Volume Hidden) vs Low Conventional Rate (Efficiency Hidden).
* Hover on card highlights the corresponding dot in the scatter visualizer.

### 9. Responsive Behavior
* Mobile: Cards stack 1-column, scatter chart scrolls or adapts to compact bubble view.

### 10. Deviations from Reference
* Authentic data strictly bound to `hidden_gems.json`. All 11 players present:
  - 10 Batters: Shashank Singh, Kusal Mendis, Shimron Hetmyer, Rahul Tewatia, etc.
  - 1 Bowler: Mustafizur Rahman.

