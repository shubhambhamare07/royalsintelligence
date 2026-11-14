# Design Notes — Anomaly and Residual Detection (`/anomalies`)
## ROYALS INTELLIGENCE — Phase 07C

### 1. Reference Image Names
* Design Reference Folder: `design-references/03-analytics/`
* Master Source Data: `site/public/data/anomalies.json` & `models/anomalies.py`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`).
* **Header Bar:** 64px height with "MODEL DIAGNOSTICS & RESIDUALS" badge.
* **Canvas Layout:**
  * Top Summary Metric Strip:
    * Total Evaluated Match Observations ($1,782$ flagged anomalies across historical matches).
    * Flagging Threshold: $|Z| \ge 2.5$ standard deviations from career expected value.
    * Batter Anomalies ($860$ records).
    * Bowler Anomalies ($922$ records).
  * Interactive Residual Distribution & Outlier Magnitude Scatter Chart:
    - X-Axis: Career Expected Pressure Value ($E[V]$).
    - Y-Axis: Match Observed Pressure Value ($V_{\text{obs}}$).
    - Dot color: Green for positive outlier (clutch over-performance), Red for negative outlier (clutch collapse).
  * Filterable Anomaly Table:
    - Search by player name or match ID.
    - Role filter (All, Batters, Bowlers).
    - Direction filter (Positive Outliers vs Negative Outliers).
    - Columns: Player, Role, Match ID, Balls, Conceded/Scored, Match PV, Career PV, Z-score, Link to Match Replay and Player Profile.

### 3. Typography Scale
* Page Headline: SF Pro Display 32px (2rem), font-extrabold.
* Z-Score Value: 14px font-extrabold font-mono.
* Neutral Scientific Language: "Unusual Observation", "Large Residual", "Diagnostic Flag".

