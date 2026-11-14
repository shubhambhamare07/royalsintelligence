# Design Notes — Match Replay (`/match/:id`)
## ROYALS INTELLIGENCE — Phase 07B

### 1. Reference Image Names
* Design Reference Folder: `design-references/03-analytics/`
* Master Source Data: `site/public/data/private/matches/{id}.json` (Private) & `site/public/data/matches_summary/{id}.json` (Public)

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`).
* **Header Bar:** 64px height with back button to `/matches`, match metadata header (Teams, Date, Venue, Result, Target, DLS flag).
* **Dual Experience Architecture:**
  1. **When Private Delivery Data is Available:**
     * **Top Banner:** Match score header & current scrubber state (Innings, Over, Ball, Score, Wickets, Striker, Bowler, Current Win Probability $V_{\text{bat}}$, Current Leverage Index, Pressure Band).
     * **Interactive Win Probability Timeline Chart:** Full width ($100\%$, height 280px). Displays step line of $V_{\text{bat}} \in [0, 1]$ across all deliveries in match. Vertical cursor line synchronizes with the active delivery slider/scrubber. Turning points highlighted with diamond markers.
     * **Pressure Band Strip:** Continuous multi-colored timeline strip underneath win prob chart:
       - Normal: Gray `#94A3B8`
       - Elevated: Blue `#3B82F6`
       - High: Amber `#F59E0B`
       - Extreme: Rose `#EF4444`
     * **Interactive Delivery Scrubber:**
       - Range slider scrub bar from Ball 1 to Ball $N$.
       - Play / Pause simulation auto-play controls ($1\times$, $2\times$, $5\times$).
       - Step forward / step back single delivery buttons.
       - Quick jump buttons to Key Turning Points.
     * **Two-Column Lower Details Area (60% / 40%):**
       - Left: Ball-by-ball delivery log around current ball (striker, bowler, runs, wicket, delta win prob $\Delta V$).
       - Right: Top Turning Points list + Player Net Win Probability Added (WPA) contribution ledger.
  2. **When Private Delivery Data is Absent (Public Build Mode):**
     * Prominent Confidential Data Banner: "Proprietary Data: Ball-by-ball delivery state is restricted to authorized Rajasthan Royals analysts. Public analytical summary and reconstructed totals displayed below."
     * Reconstructed Totals Card: Innings 1 total, Target, Innings 2 total, target noise $\sigma$.
     * Over-by-Over Pressure Band Distribution Breakdown: Bar chart or breakdown of pressure bands across the 20 overs.
     * Match Quality & Turning Point Count Summary.

### 3. Typography Scale
* Match Title: 24px font-bold (`text-slate-900`).
* Score Display: 32px font-extrabold font-mono (`font-mono`).
* Ball Counter (e.g. `Over 14.3`): 18px font-bold font-mono.
* Win Probability: 28px font-extrabold font-mono.
* Metric Labels: 11px uppercase font-mono tracking-wider.

### 4. Color Palette
* Background: `#F8FAFC`
* Cards: `#FFFFFF`
* Team 1 Win Prob: Royal Pink `#E6007E`
* Team 2 Win Prob: Navy `#14213D` / Emerald `#10B981`
* Pressure Bands:
  * Normal: `#94A3B8`
  * Elevated: `#3B82F6`
  * High: `#F59E0B`
  * Extreme: `#EF4444`

### 5. Card Sizes & Spacing
* Live State HUD: Min-height 110px, padding 20px, rounded-xl.
* Win Probability Chart Container: Height 320px, padding 20px.
* Delivery Scrubber Bar: Full width, height 64px, padding 16px, background `#F1F5F9` rounded-lg.
* Turning Points Drawer: Min-height 300px.

### 6. Borders & Shadows
* Clean hairline borders (`border-slate-200`).
* Active delivery highlighted in log with ring and pulse effect.

### 7. Scrubber Synchronization Rules
* Dragging slider to delivery $i$ ($0 \le i < N$):
  - Updates Over & Ball counter (`innings[i]`, `over[i]`, `ball[i]`).
  - Updates Striker and Bowler names (resolved via player registry).
  - Updates Score Before + Team Runs $\to$ current score, and Wickets.
  - Updates Win Probability cursor on chart to delivery $i$.
  - Highlights delivery $i$ on the pressure band strip.
  - Scrolls delivery log to center on delivery $i$.
  - Displays instantaneous $\Delta V$ and Leverage $L_i$.

### 8. Interactions & Motion
* Play / Pause button runs a requestAnimationFrame / setInterval ticker advancing deliveries.
* Speed toggle ($1\times, 2\times, 5\times$).
* Clicking any turning point immediately sets the scrubber to that ball.

### 9. Responsive Behavior
* Mobile: Chart adapts to touch scrub, scrubber controls remain sticky at bottom of viewport.

### 10. Deviations from Reference
* Authentic data from `outputs/site_data_private/matches/{id}.json` and `outputs/site_data/matches_summary/{id}.json`. Handles missing private data gracefully without errors.

