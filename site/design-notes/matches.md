# Design Notes — Match Centre (`/matches`)
## ROYALS INTELLIGENCE — Phase 07B

### 1. Reference Image Names
* Design Reference Folder: `design-references/03-analytics/`
* Master Source Data: `site/public/data/matches_index.json` (883 matches) & `site/public/data/matches_summary/`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`).
* **Header Bar:** 64px height with search input, competition badge filter (All, IPL, T20I), and season filter dropdown.
* **Canvas Layout:**
  * Top Statistics Strip: 4 KPI cards (Total Analyzed Matches: 883, Total IPL Matches: 479, Total T20I Matches: 404, Average Turning Points/Match: 5.2).
  * Filter & Search Bar:
    * Search query (by team name, competition, match ID).
    * Competition Type (All / IPL / T20I).
    * Season / Year selector (2021, 2022, 2023, 2024, etc.).
    * Replay Data Filter (All Matches vs Private Replay Available).
  * Match Grid / Table:
    * Grid View: Responsive cards (3 columns on desktop, 2 on tablet, 1 on mobile).
    * Table View: Sortable columns (Date, Match, Competition, Winner, Margin, Pressure Distribution, Replay Status).
  * Pagination: 24 matches per page with page jump and count info.

### 3. Typography Scale
* Match Title: 16px font-bold (`text-slate-900`).
* Date / Venue: 12px font-medium (`text-slate-500`).
* Score / Result: 14px font-semibold.
* Tag / Badge: 11px uppercase font-mono tracking-wider.

### 4. Color Palette
* Background: `#F8FAFC`
* Cards: `#FFFFFF`
* IPL Badge: Purple `#8B5CF6` / `#F5F3FF`
* T20I Badge: Emerald `#10B981` / `#ECFDF5`
* Replay Available Pill: Electric Blue `#3B82F6` / `#EFF6FF`
* Summary Only Pill: Slate `#64748B` / `#F1F5F9`
* Winner Accent: Royal Pink `#E6007E`

### 5. Card Sizes & Spacing
* Match Card: Min-height 170px, padding 18px, rounded-xl.
  * Header: Competition pill, Season, Date.
  * Teams & Result: Team 1 vs Team 2, Winner highlighted with trophy icon, margin string.
  * Replay Status: "Replay Available (Ball-by-Ball)" vs "Summary Archive".
  * Action: "Open Match Replay" button routing to `/match/:id`.

### 6. Borders & Shadows
* 1px solid border `#E2E8F0`. Hover gives `shadow-md` and border `#CBD5E1`.

### 7. Responsive Behavior
* 3 columns on large desktop ($>1280\text{px}$), 2 columns on tablet/laptop ($768\text{px} - 1280\text{px}$), 1 column on mobile ($<768\text{px}$).

### 8. Interactions & Motion
* Instant filtering using debounced search and memoized state.
* Smooth page transition.
* Direct routing to `/match/:id`.

