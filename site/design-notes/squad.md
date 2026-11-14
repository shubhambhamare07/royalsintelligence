# Design Notes — Auction Squad Builder (`/squad-builder`)
## ROYALS INTELLIGENCE — Phase 07C

### 1. Reference Image Names
* Design Reference Folder: `design-references/00-home/` & squad management UI patterns
* Authoritative Data Sources: `rankings.json`, `players_index.json`, `dna.json`, `certificates/`

### 2. Layout Grid & Proportions
* **Fixed Left Sidebar:** 220px width (`#14213D`).
* **Header Bar:** 64px height with "IPL 2027 AUCTION SQUAD BUILDER" title, Reset Squad CTA, and Export Scenario button.
* **Canvas Layout (Split 2-Column on Desktop):**
  * Left Column ($55\%$): Interactive Squad Roster & Auction Budget Tracker:
    - User-defined purse budget tracker (default ₹120.0 Cr or user input).
    - Spent amount and Remaining purse.
    - Squad slots visualizer: Max 25 players, min 18 players; Overseas cap indicator (max 8 overseas).
    - Role distribution meter: Batters, Bowlers, All-rounders, WKs.
    - Active Squad Table with user-entered hypothetical auction prices, ratings, tiers, and remove buttons.
  * Right Column ($45\%$): Player Pool Discovery Drawer & Squad Balance Analytics:
    - Searchable qualified player pool with filters (Role, Tier, Nationality, Rating range).
    - Instant Add to Squad button.
    - Real-time squad composition analytics: Average Pressure Rating, Top 5 Clutch Batsmen, Death Overs Bowling coverage.
    - Scenario comparison mode (Scenario A vs Scenario B).

### 3. Typography Scale
* Page Headline: SF Pro Display 32px (2rem), font-extrabold.
* Purse Remaining Display: 32px font-extrabold font-mono (`font-mono`).
* Player Name: 14px font-bold (`text-slate-900`).
* Price Tag: 13px font-bold font-mono.

### 4. Color Palette
* Background: `#F8FAFC`
* Cards: `#FFFFFF`
* Purse Positive: `#10B981` (Emerald)
* Purse Warning / Deficit: `#EF4444` (Rose)
* Primary Brand Pink: `#E6007E`
* Navy Surface: `#14213D`

### 5. Strict Governance Rules
* Does NOT invent official auction pool or official contract values.
* All auction prices are clearly labeled as "User-Entered Hypothetical Bid".
* Reuses authoritative player IDs, roles, ratings, and DNA profiles.

