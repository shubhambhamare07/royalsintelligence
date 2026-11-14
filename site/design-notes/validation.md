# Design Notes — Model Validation Centre (`/validation`)
## ROYALS INTELLIGENCE — Phase 07C

### 1. Reference Image Names
* Design Reference Folder: `design-references/04-methodology/`
* Authoritative Reports: `site/public/data/validation_wp.json`, `site/public/data/validation_simulator.json`, `site/public/data/validation_expected.json`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`).
* **Header Bar:** 64px height with "MODEL GOVERNANCE & FORMAL VALIDATION" badge and Overall Gate Status banner.
* **Canvas Layout:**
  * Master Governance Status Banner: Unredacted disclosure that Phase 03 Gate G2 is **FAIL** (ECE 0.0905 > 0.04) and Simulator Gate G-G7 is **FAIL** (Mean Bias +10.12 runs > &plusmn;5.0 runs), communicating honest statistical integrity.
  * Validation Metric Matrix (Tabbed or Sectional):
    1. **Gate G_T1:** Transition Smoothness & Spline Knot Continuity (**PASS**).
    2. **Gate G_G1:** Chase Win Probability Calibration & Brier (**FAIL** on raw ECE 0.0905; Slope 1.1353; Brier 0.1353 vs 0.2490 baseline).
    3. **Gate G_A1:** First-Innings Central 80% Coverage (**PASS**, 78%–82%).
    4. **Gate G_A2:** Ball 0 First-Innings Brier vs Baseline (**FAIL** on Ball 0: 0.24586 vs 0.24562 baseline).
    5. **Gate G_A3:** Defense Calibration Slope W(T) (**FAIL** on calibrated slope 0.6805 not in [0.8, 1.2]).
    6. **Gate G_B:** DaR Martingale & Mathematical Symmetry (**PASS** with symmetry gap < 1e-15).
    7. **Gate G_C2:** Target Reconstruction Uncertainty Monte Carlo (**PASS**, 6.98% < 15% threshold).
    8. **Gate G-G7 (Simulator):** Monte Carlo Bias & Coverage (**FAIL** on mean bias +10.12 runs; CRPS 22.75 beats baseline 24.18).
  * 10-Bin Calibration Curves & Reliability Visualizers.
  * Detailed Validation Audit Drawer with formulas, actual vs threshold, sample size, and limitations.

### 3. Typography Scale
* Page Headline: SF Pro Display 32px (2rem), font-extrabold.
* Gate Badges: 12px uppercase font-mono font-bold.
* Status Indicators: Explicit labels (PASS in Emerald, FAIL in Rose, WARNING in Amber).

