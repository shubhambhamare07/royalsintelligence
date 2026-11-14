# Design Notes — Reliability Certificate
## ROYALS INTELLIGENCE — Phase 07A

### 1. Reference Image Names
* Design Reference Folder: `design-references/09-reliability-certificates/README.md`
* Existing Analytical Template: `outputs/site_data/certificates/{id}/{role}.json`

### 2. Layout & Print Dimensions
* **Print Target:** International A4 standard ($210\text{mm} \times 297\text{mm}$), portrait orientation.
* **Margins:** $20\text{mm}$ outer border with double hairline metallic gold (`#C6A15B`) certificate frame.
* **Header Block:**
  * Official Rajasthan Royals Crest (`UI/LOGO/rr.svg`).
  * Institutional Heading: "ROYALS INTELLIGENCE — CERTIFICATE OF PRESSURE PERFORMANCE".
  * Sub-heading: "Official Quantitative Rating Certification for IPL 2027 Auction Intelligence".
* **Certificate ID & Security Verification:**
  * Certificate Unique ID: `CERT-RR-{role.upper()}-{id}`
  * Hash Seal: SHA256 verification hash of model parameters and player posterior.

### 3. Typography & Styling
* Primary Heading: 22pt Serif / SF Pro Display, Deep Navy (`#14213D`), centered.
* Recipient Player Name: 26pt Bold, Deep Navy with Royal Pink underline accent.
* Rating Score Display: Massive 42pt JetBrains Mono numeral (`95.57 / 100`).
* Credible Interval Block: Bracketed 90% credible interval `[76.64, 100.00]` with sample size $n_{\text{eff}}$.
* Body Text: 10pt High-legibility serif or clean sans-serif with formal institutional language.

### 4. Required Certificate Sections
1. **Identification Block:** Canonical Name, Player ID, Primary Discipline, Registered Franchises.
2. **Certified Metric Ledger:**
   * Posterior Rating & Percentile.
   * Pressure Value (PV) per 100 balls.
   * Clutch Delta (CD) per 100 balls.
   * Pressure Consistency (PC) hit rate.
   * Sample Exposure ($n$ balls, $m$ matches, $n_{\text{eff}}$ effective sample).
3. **Formal Methodology Disclaimer:**
   * Model version (`pressure-v1.1`), Empirical Bayes shrinkage specifications.
   * Statement of statistical uncertainty (Credible interval coverage: 90%).
4. **Sign-off & Authority:**
   * Signature block: "Head of Analytics & Cricket Decision Support, Rajasthan Royals".
   * Timestamp of model build: UTC ISO date.

### 5. Print & Screen Controls
* Screen View: Centered A4 canvas on Slate-100 background with drop shadow.
* Top Action Bar: "Print Certificate" button (triggers `window.print()`), "Export PDF", "Back to Profile".
* Print Stylesheet (`@media print`):
  * Hides sidebar, top nav, action bar, and footer.
  * Forces page break inside: avoid.
  * Preserves background colors and gold border.

### 6. Responsive Behavior
* Mobile: Displays responsive preview with notice "Best viewed on desktop or printed on A4".

### 7. Deviations from Reference
* Incorporates exact cryptographic hash seals and strict LaTeX-style statistical notation ($\mu_{\text{press}}, \tau, \theta$).

