# Rajasthan Royals Pressure Platform — Match Simulator Specification

## 1. Scope & Objective
This document specifies the exact delivery-level mathematical kernel and match engine for the interactive Monte Carlo match simulator in TypeScript (Phase 07).
The TypeScript kernel must replicate the Python reference kernel with parity $|p_{\text{TS}} - p_{\text{Py}}| < 10^{-9}$ across all 5,000 cases in `golden_cases.json`.

---

## 2. Outcome Classes
Outcomes are partitioned into five mutually exclusive classes $k \in \{0, 1, 2, 3, 4\}$:
1. **`dot` (0)**: 0 bat runs, 0 team runs, legal ball, no wicket.
2. **`non_boundary` (1)**: 1, 2, or 3 runs, legal ball, no wicket.
   - Proportions: 1 run ($84.64\%$), 2 runs ($14.60\%$), 3 runs ($0.76\%$).
3. **`boundary` (2)**: 4 or 6 runs, legal ball, no wicket.
   - Proportions: 4 runs ($64.55\%$), 6 runs ($35.45\%$).
4. **`wicket` (3)**: dismissal event.
   - Bowler credited with probability $94.35\%$ (striker is out, bowler gets wicket credit).
   - Run-out with probability $5.65\%$ (bowler gets 0 credit; striker out with $54.85\%$, non-striker out with $45.15\%$).
5. **`extra` (4)**: illegal delivery (wide / overstep / other).
   - Does NOT consume a legal ball.
   - Awards 1 run to the batting team.
   - Proportions: Wide ($90.20\%$), No-ball / Overstep ($9.80\%$).
   - If No-ball: activates `free_hit = true` for the subsequent delivery.

---

## 3. Probability Kernel Formulation
For any delivery state:
$$\tilde{p}(k) = p_0(k \mid \text{balls\_left}, \text{wickets}, \text{free\_hit}) \times M(C, k) \times \rho_{\text{bat}}(k) \times \rho_{\text{bowl}}(k)$$

Normalize across the 5 classes:
$$p(k) = \frac{\tilde{p}(k)}{\sum_{j=0}^4 \tilde{p}(j)}$$

### Variables:
- $p_0$: Base probability array lookup from `base_table[balls_left][wickets][free_hit]`.
- $M(C, k)$: Context multiplier lookup from `context_multipliers[need_bucket:order_bucket:bowler_type]`.
  - `need_bucket`: `innings_1` (innings 1); in chase: `ahead` ($RRR - CRR < -2$), `even` ($-2 \le RRR - CRR \le 2$), `behind` ($RRR - CRR > 2$).
  - `order_bucket`: `top` (batting order $\le 3$), `middle` ($4 \le \text{order} \le 7$), `tail` ($\text{order} \ge 8$).
  - `bowler_type`: `pace` or `spin`.
- $\rho_{\text{bat}}(k), \rho_{\text{bowl}}(k)$: Sampled player tilt multipliers drawn once per simulation from $\text{Gamma}(\alpha_{i,k}, 1 / \beta_{i,k})$.

---

## 4. Match Engine Rules
1. **Innings Length**: At most 120 legal balls or until all available wickets fall (10 wickets for 11 players, 9 wickets for 10 players), or target reached in a chase.
2. **Bowler Allocation**:
   - At most 4 overs (24 legal balls) per bowler.
   - No bowler may bowl consecutive overs.
   - Overs allocated by phase (Powerplay: overs 1-6, Middle: 7-15, Death: 16-20) weighted by empirical bowler phase shares.
3. **Strike Rotation**:
   - Striker and non-striker swap ends on odd runs (1 or 3).
   - Striker and non-striker swap ends at the completion of each 6-ball over.
   - When a wicket falls: incoming batter takes the position of the dismissed batter.
4. **Free Hit**:
   - Triggered by a No-ball.
   - On a Free Hit: dismissals can only be run-outs ($5.65\%$ chance). Bowler-credited wickets are nullified.
   - Free hit expires on the next legal delivery.
