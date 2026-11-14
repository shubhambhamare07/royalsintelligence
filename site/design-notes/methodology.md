# Design Notes — Methodology Explorer (`/methodology`)
## ROYALS INTELLIGENCE — Phase 07B

### 1. Reference Image Names
* Design Reference Folder: `design-references/04-methodology/`
* Source Documentation: `ANALYTICAL_METHODOLOGY.md`, `MATHEMATICAL_VALIDATION.md`, and `reports/phase_03_report.md`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`).
* **In-Page Sticky Navigation / Anchor Tabs:** Sticky sub-header with jump links:
  1. `#foundations` — Theoretical Framework & State Space
  2. `#win-probability` — Plan C Logistic CDI & Platt Calibration
  3. `#leverage-pressure` — Leverage Index & Pressure Bands
  4. `#dar-framework` — Deliveries at Risk (DaR) & Asymmetric Value
  5. `#trace-a-rating` — Interactive Step-by-Step Rating Tracer
  6. `#validation-failures` — Unredacted Gate Audit & Failure Register
* **Content Canvas:** Fluid max-width 1400px, 32px padding (`p-8`).
* **2-Column Layout for Sections:** 65% Narrative & Mathematical Formalism / 35% Live Interactive Inspection Card or Parameter Ledger.

### 3. Typography Scale
* Page Headline: SF Pro Display 32px (2rem), font-extrabold.
* Section Headings: 24px (1.5rem), font-bold, with `#` anchor links.
* Math Formula Blocks: KaTeX / Clean CSS Math representation with monospace variable notations.
* Callout Headers: 14px (0.875rem), uppercase, font-bold tracking-wider.
* Body Prose: 15px (0.9375rem), font-normal, text-slate-700, line-height 1.7.

### 4. Color Palette
* Background: `#F8FAFC`
* Cards: `#FFFFFF` with `#E2E8F0` border
* Code / Math Blocks: `#0F172A` (Navy dark slate) background with `#E2E8F0` text and `#38BDF8` variable highlights
* Failure Callout: `#FEF2F2` (Rose 50) surface with `#DC2626` text (honest audit failure register)
* Verification Passed: `#ECFDF5` (Emerald 50) surface with `#059669` text
* Royal Pink Accent: `#E6007E`

### 5. Card Sizes & Spacing
* Math Cards: Padding 24px, rounded-xl, embedded formula with parameter definitions.
* Parameter Ledgers: Tabular display of knots, intercepts, and shrinkage hyper-parameters ($\mu_{\text{press}}$, $\tau_{\text{press}}$).
* Trace a Rating Widget: Full-width interactive workspace card (min-height 400px).

### 6. Borders & Shadows
* Clean hairline borders (`border border-slate-200`).
* Mathematical formulas enclosed in dark code container with subtle inner shadow.

### 7. Interactive Feature: Trace a Rating (`#trace-a-rating`)
* Player Selector: Searchable dropdown populated from 306 qualified players (155 batters, 151 bowlers).
* 4-Stage Stepper:
  1. **Raw Ball Performance:** Pressure deliveries, aggregate Delta-V ($\Delta V$), raw performance index.
  2. **Empirical Bayes Shrinkage:** Prior $\mu$, prior variance $\tau^2$, individual variance $\sigma_i^2$, shrinkage factor $B_i$, shrunk posterior mean $\theta_i$.
  3. **Role Normalization & Scale:** Transformation to 0–100 scale via logistic/sigmoid mapping.
  4. **Uncertainty Quantification:** Posterior standard error and $90\%$ Credible Interval ($[\text{CI}_{\text{low}}, \text{CI}_{\text{high}}]$).
* Visual diagram displaying the flow of calculation from raw deliveries to the published rating number.

### 8. Mathematical Integrity
* Renders true equations:
  * Win probability: $V(s) = \sigma\left(\beta_0 + \beta_1 \cdot \text{RRR} + \beta_2 \cdot \text{Wickets} + \dots\right)$
  * Leverage: $L(s) = \mathbb{E}[|\Delta V| \mid s]$
  * EB Shrinkage: $\theta_i = (1 - B_i) Y_i + B_i \mu$, where $B_i = \frac{\sigma_i^2}{\sigma_i^2 + \tau^2}$
  * Deliveries at Risk (DaR): Asymmetric tail risk penalization.
* Unredacted Gate Audit: Explicitly displays Gate failures from Phase 03/04 (e.g. uncalibrated ECE 0.0905 prior to Platt scaling, and the 6 bowler PV empirical bayes convergence notes).

### 9. Responsive Behavior
* Mobile: Tables horizontal scroll, math blocks wrap gracefully, stepper collapses vertically.

### 10. Deviations from Reference
* Authentic data from `methodology.json`, `MATHEMATICAL_VALIDATION.md`, and real player parameters.

