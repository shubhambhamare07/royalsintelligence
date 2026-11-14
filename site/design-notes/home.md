# Design Notes — Home / Executive Intelligence Dashboard
## ROYALS INTELLIGENCE — Phase 07A

### 1. Reference Image Names
* Primary Master Mockup: `UI IMAGE REFERENCE/HOME SCREEN.png`
* Design Reference Folder: `design-references/00-home/de513a12-8528-4ea3-ac57-365860bca46b.png`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width, sticky full-height ($100\text{vh}$), dark navy background (`#14213D`).
* **Top Header Utility Bar:** 64px height, sticky top ($Z=40$), white canvas with `#E2E8F0` border-b.
* **Content Canvas:** Fluid width ($1200\text{px}$ to $1600\text{px}$ container max), padded $32\text{px}$ ($2\text{rem}$).
* **Grid Hierarchy:**
  * Top Hero Section: Split 2-column ($60\%/40\%$) or banner overlay.
  * Executive KPI Counters: 4-column equal grid ($1\text{fr}\;1\text{fr}\;1\text{fr}\;1\text{fr}$).
  * Top Performers Showcase: 2 major columns (Batting Top 3 vs Bowling Top 3), each containing 3 stacked player cards.
  * Intelligence Insights: 2-column or 3-column auto-fill card grid.

### 3. Typography Scale
* Platform Headline: SF Pro Display / Inter 36px (2.25rem), weight 800, leading tight.
* Section Headings: 22px (1.375rem), weight 700, tracking tight.
* Card Titles: 16px (1.0rem), weight 600.
* Primary Ratings / Big Numbers: 32px (2.0rem), weight 800, JetBrains Mono tabular (`tnum`).
* Micro Labels / Meta: 12px (0.75rem), weight 600, uppercase, tracking wide (0.05em).

### 4. Color Palette
* Background: `#F8FAFC` (Slate 50)
* Card Surfaces: `#FFFFFF` with `#E2E8F0` border
* Sidebar Canvas: `#14213D` (Deep Navy) with `#E6007E` (Royal Pink) active indicator
* Gold Accent: `#C6A15B` for Rank #1 badges and borders
* Secondary Text: `#64748B` (Slate 500)

### 5. Card Sizes & Spacing
* KPI Counter Cards: Min-height $110\text{px}$, padding $20\text{px}$, border-radius $12\text{px}$ (`rounded-xl`).
* Top Performer Cards: Height $100\text{px}$ to $120\text{px}$, flex row layout (Rank badge + Player portrait/avatar + Name/Team + Rating + CI90 + Tier pill).
* Spacing: Uniform 24px gap between grid elements, 32px vertical rhythm.

### 6. Borders & Shadows
* Border: 1px solid `#E2E8F0` on cards; `#1E293B` on dark elements.
* Shadow: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05)` default, elevating to `0 10px 25px -5px rgba(20, 33, 61, 0.08)` on hover.

### 7. Chart Placement & Dimensions
* Mini Pressure DNA Radar: Embedded within Top Performer card preview (diameter $80\text{px}$).
* Win Probability Sparkline: Embedded within match preview card ($160\text{px} \times 40\text{px}$).

### 8. Interactions & Motion
* Smooth numerical count-up on KPI tiles ($0 \to \text{target}$ over $1.2\text{s}$).
* Staggered entrance for Top 3 cards (50ms interval).
* Click on player card routes immediately to `/player/:id`.

### 9. Responsive Behavior
* Desktop ($>1024\text{px}$): 220px fixed sidebar, full 4-column KPI and 2-column Top Performers.
* Tablet ($768\text{px}-1024\text{px}$): Collapsible 64px icon sidebar, 2-column KPI grid.
* Mobile ($<768\text{px}$, tested at $390\text{px}$): Bottom navigation or hamburger drawer, single-column stack, horizontal scroll for KPI chips.

### 10. Deviations from Reference
* Mockup displays static dummy names; implementation binds to authoritative `rankings.json` (Pathum Nissanka #1 Batter, Matheesha Pathirana #1 Bowler) and `summary.json`.

