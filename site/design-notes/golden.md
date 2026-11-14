# Design Notes — Simulator Golden Test Harness (`/simulator/golden`)
## ROYALS INTELLIGENCE — Phase 07C

### 1. Reference Image Names
* Design Reference Folder: `design-references/11-match-simulator/`
* Master Source Data: `outputs/site_data/simulator/golden_cases.json` (5,000 cases) & `outputs/site_data/simulator/spec.md`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`).
* **Header Bar:** 64px height with "KERNEL PARITY VERIFICATION" badge and Run Golden Suite CTA.
* **Canvas Layout:**
  * Top Metric Strip (4 Cards):
    1. Golden Cases Count ($N = 5,000$)
    2. Numerical Parity Tolerance Target ($|p_{\text{TS}} - p_{\text{Py}}| < 10^{-9}$ or $10^{-8}$)
    3. Measured Max Numerical Discrepancy ($\max |\Delta p|$)
    4. Parity Status (VERIFIED PASS or FAIL)
  * Test Runner Control Card:
    - Run All 5,000 Cases button
    - Run Sample 100 Cases button
    - Test Progress Bar and Execution Duration Timer
  * Case Inspector & Filter Bar:
    - Search by Case ID (0..4999)
    - Context filter (e.g. `ahead:middle:spin`, `innings_1:top:pace`)
    - Free hit filter (True/False)
    - Status filter (Pass / Fail)
  * Detailed Golden Parity Table with expandable row drawers showing raw inputs ($p_0, M(C), \rho_{\text{bat}}, \rho_{\text{bowl}}$), Python reference output, TypeScript kernel output, absolute delta, and pass/fail badge.

### 3. Typography Scale
* Page Headline: SF Pro Display 32px (2rem), font-extrabold.
* Metric Counters: 28px font-bold font-mono (`font-mono`).
* Table Output Probs: 11px font-mono tabular numbers (`tnum`).
* Status Badges: 10px uppercase font-mono font-bold.

### 4. Color Palette
* Background: `#F8FAFC`
* Cards: `#FFFFFF`
* Parity Pass Accent: `#10B981` (Emerald)
* Parity Fail Accent: `#EF4444` (Rose)
* Python Reference Label: `#3B82F6` (Electric Blue)
* TypeScript Kernel Label: `#E6007E` (Royal Pink)

### 5. Card Sizes & Spacing
* Top Summary Cards: Min-height 100px, padding 20px, rounded-xl.
* Table Container: Full width, min-height 500px, rounded-2xl.

### 6. Verification Architecture (3 Independent Layers)
* Layer A: TypeScript Kernel evaluation against 5,000 precomputed cases.
* Layer B: Exact comparison with Python output probabilities.
* Layer C: Cricket and probability invariants (sum to 1.0, non-negative, finite).

### 7. Responsive Behavior
* Mobile: Table scrolls horizontally, case detail view collapses into full-screen drawer.

