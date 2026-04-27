# Dominó Scorekeeper Game Rules

## What This Is

This document is the canonical scoring and rules specification for agents modifying the Dominó Scorekeeper app. The pure scoring helpers in `src/scoring.js` must match this document, and `src/App.jsx` should call those helpers rather than reimplement scoring rules inline.

## Configurable Values

| Setting | Default | Supported values | Notes |
| --- | ---: | --- | --- |
| `target` | `200` | `50-500` | Per-game score needed to win. Regular winner points may overshoot it. |
| `pasoValue` | `25` | `5-100` | Value of each Paso Corrido bonus. |
| `bonus10Value` | `10` | `1-50` | Value of each +10 bonus. |
| `bestOf` | `1` | `1 \| 3 \| 5` | `1` is a single game; `3` and `5` are series modes. |
| `strictBonus` | `true` | `true \| false` | When on, new staged bonuses cannot push a team past `target`. |

## Round Model

Each committed round stores the scoring data needed to display, edit, migrate, and export the game:

- `a`: regular round points credited to team A.
- `b`: regular round points credited to team B.
- `bonusA`: total bonus points credited to team A for this round.
- `bonusB`: total bonus points credited to team B for this round.
- `bonusCountA`: Paso Corrido count credited to team A.
- `bonusCountB`: Paso Corrido count credited to team B.
- `tenCountA`: +10 bonus count credited to team A.
- `tenCountB`: +10 bonus count credited to team B.
- `legacyBonusA`: migrated raw bonus total for older team A rounds whose bonus breakdown is unknown.
- `legacyBonusB`: migrated raw bonus total for older team B rounds whose bonus breakdown is unknown.

Bonuses are staged before a round is committed. While staged, they appear as a live next-round row at the bottom of the table with `?` placeholders for the regular scores. Pressing AÑADIR folds the staged bonuses into the new committed round; it never modifies a closed round.

## Rules The App Enforces

### Game Victory

Victory is based on cumulative totals from committed rounds:

- `totalA >= target && totalA > totalB` means team A wins.
- `totalB >= target && totalB > totalA` means team B wins.
- If both teams are `>= target` and tied, there is no winner. The user must edit a round or continue correcting the game state.

See `winnerSide()` in `src/scoring.js` for the implementation.

### Series Rules

`bestOf` controls whether the game is standalone or part of a series:

- `bestOf = 1`: single-game mode. Set counters are irrelevant and should remain `0-0`.
- `bestOf = 3`: first team to 2 saved-game wins clinches the series.
- `bestOf = 5`: first team to 3 saved-game wins clinches the series.

Set counters increment exactly `+1` when a game is saved, a winner exists, and the series is not already clinched. Saving again after a series is clinched does not increase either counter.

The "GANARON LA SERIE" banner appears when `state.bestOf > 1` and either team has reached `Math.ceil(bestOf / 2)` sets.

Mode changes use `applyModeChange()`:

- Choosing the same `bestOf` keeps `setsA` and `setsB`.
- Choosing a different `bestOf` resets both set counters to `0`.
- Choosing `bestOf = 1` resets both set counters to `0`.
- Changing mode regenerates stable team IDs because it starts a new series identity.

See `shouldIncrementSet()`, `incrementSets()`, and `applyModeChange()` in `src/scoring.js`.

### Strict Bonus Mode

`strictBonus` defaults to `true`. When it is on, a staged bonus cannot push a team's projected running total past the game target.

The check is:

```txt
current saved total + already staged bonuses + new bonus <= target
```

Only bonuses are blocked. Regular round-winner points can still overshoot the target and win the game.

Edge cases:

- Editing a closed round does not enforce strict bonus mode. Round editing is treated as a history correction, so the user has final control.
- Turning strict mode off mid-game does not change existing scores or staged bonuses. Future bonus taps follow the new setting.
- Turning strict mode on mid-game does not remove already staged bonuses, even if they would violate the rule. Only new staging attempts are checked.
- Single-game and best-of-N series use the same rule. The target is always the per-game target; series sets do not affect the check.
- If a team's current saved total is already over the target, strict mode rejects any new bonus for that team.

See `canAcceptBonus()` and `bonusTotal()` in `src/scoring.js`.

### Shoe Indicator

The shoe indicator (`👞`) is shown for a team when that team's cumulative total through that round is `0` and the opponent's cumulative total through that same round is greater than `0`.

This is a visual cue only. It has no rule meaning and does not affect totals, victory detection, bonuses, history, export, or series state.

## Rules The App Does Not Enforce

The app is a scorekeeper, not a domino hand validator. It does not enforce:

- Capicúa.
- Blanco-doble.
- Tile legality.
- Turn order.
- Valid domino layout.
- Hand-counting validation.
- Whether a team was actually entitled to a Paso Corrido or +10 bonus.

Future agents should not add these rules implicitly while touching scoring code. Any new domino-rule enforcement should be treated as a separate product decision with tests and user-facing settings.
