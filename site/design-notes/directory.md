# Design Notes — Player Directory
## ROYALS INTELLIGENCE — Phase 07A

### 1. Reference Image Names
* Primary Master Mockup: `UI IMAGE REFERENCE/PLAYERS REF 1.png`, `PLAYERS REF 2.png`, `PLAYERS REF 3.png`
* Design Reference Folder: `design-references/01-squad-directory/README.md`

### 2. Layout Grid & Proportions
* **Top Header & Search Bar:** Sticky search header with full-text search input, role tabs (All, Batters, Bowlers, All-rounders), team dropdown, and eligibility toggle.
* **Player Grid:** Responsive 3-to-4 column grid on desktop (`repeat(auto-fill, minmax(280px, 1fr))`).
* **Table View Toggle:** Segmented control to switch between Card Grid and Compact Table view.

### 3. Card Anatomy & Typography
* **Card Dimensions:** $280\text{px}-320\text{px}$ width, $340\text{px}$ height.
* **Header Area:** Player portrait / cutout ($140\text{px}$ height) with subtle stadium/mesh background and team badge pill overlay.
* **Identity Row:**
  * Player Name: 18px (1.125rem), weight 700, truncate with tooltip.
  * Role / Batting Hand / Bowling Style: 12px (0.75rem), Slate 500.
  * Canonical Player ID: 11px JetBrains Mono chip (`ID: 6931`).
* **Performance Metric Row:**
  * Pressure Rating: 26px, weight 800, JetBrains Mono.
  * Credible Interval: Whisker bar with text `[76.6 - 100.0]`.
  * Tier Badge: Pill with status colors (Proven / Promising / Unproven).
* **Sample Exposure Footnote:** Total deliveries / matches under pressure (`470 balls / 26 matches`).

### 4. Spacing & Borders
* Gap: 20px uniform grid gap.
* Radius: 12px (`rounded-xl`).
* Border: 1px solid `#E2E8F0`, transitioning to 1px solid `#E6007E` on hover.

### 5. Interactions & Filtering
* Instant client-side fuzzy search using Fuse.js (name, team, ID).
* Filter state reflected in URL query parameters (`/players?role=batter&team=RR&q=nissanka`).
* Pagination: 24 cards per page with smooth scroll-to-top on page change.
* Click on card navigates directly to `/player/:id`.

### 6. Responsive Behavior
* Desktop ($>1200\text{px}$): 4 columns.
* Tablet ($768\text{px}-1199\text{px}$): 2-3 columns.
* Mobile ($390\text{px}$): Single column full-width cards.

### 7. Deviations from Reference
* Reference uses mock ratings and approximate photos; implementation binds strictly to `players_index.json` (959 players) and `rankings.json`, using authentic portraits or deterministic monograms.

