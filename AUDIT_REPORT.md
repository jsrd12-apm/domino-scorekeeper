# Domino Scorekeeper v0.0.17 — Audit Report

## Executive Summary
The app is usable for a beta family/friends group, and the core score-entry loop is simple, fast, and Spanish-first. The biggest risk is the best-of-N series state model: sets are counted from both live state and saved history, while the series banner uses only one of those sources, so users can see a 2-0 set counter without a clinch banner. The second risk is bonus data integrity: +10 bonuses are saved but not migrated, edited, exported, or rendered consistently. The third risk is mobile accessibility: many primary touch targets are below 44px and several icon-only buttons have no accessible name. Recommended priority order: fix series state first, then bonus persistence/editing, then modal/accessibility polish.

Notes from the audit run:
- Live deployed app reports `v0.0.17 · 4/27/26` and live `service-worker.js` has `CACHE_VERSION = 'domino-v17'`.
- Local checked-out source is already `APP_VERSION = '0.0.18'` and `public/service-worker.js` has `domino-v18`, so line references below are from the local working tree, not necessarily the exact deployed bundle.
- Playwright artifacts are in `test-results/audit-live/`. Desktop Chromium completed the walkthrough. Pixel 7 Chromium captured first-load metrics. WebKit/iPhone simulation could not launch because the container is missing WebKit host libraries.

## Critical Issues (ship-blockers)

### 1. Series sets are double-sourced, causing wrong counters and missing clinch banner
Where: `src/App.jsx:502`, `src/App.jsx:528`, `src/App.jsx:532`, `src/App.jsx:1005`

Reproduction steps:
1. Start a best-of-3 game.
2. Let Nosotros win one game, then save/start new.
3. Let Nosotros win another game.
4. Observe the set counter and series banner.

Observed:
- Playwright desktop run logged `after save-and-new setsText=SETS1-0a 2`.
- After two same-team wins, it logged `series banner count=0`.
- The UI can display history-derived sets in `TeamRow`, while `GameView` decides `GANARON LA SERIE` from `state.setsA/state.setsB` only.

Why it matters:
Real users playing a best-of-3 will depend on the app to declare the series winner. A visible `2-0` counter with no clinch banner is a trust-breaking scoring bug.

Suggested fix:
Use one source of truth. The pragmatic fix is to keep the current series in `state.series` with a stable `seriesId`, and stop deriving current series wins from all history by team name. If history-derived display is desired, scope it by `seriesId`, not mutable team names.

Pseudo-diff:
```diff
 const DEFAULT_STATE = {
   bestOf: 1,
-  setsA: 0,
-  setsB: 0,
-  setHandledForRounds: -1,
+  seriesId: crypto.randomUUID?.() || String(Date.now()),
+  currentGameCounted: false,
+  setsA: 0,
+  setsB: 0,
 };

- const histSetsA = history.filter(...team-name matching...).length;
- const histSetsB = history.filter(...team-name matching...).length;
- const liveSetsA = state.setsA + histSetsA;
- const liveSetsB = state.setsB + histSetsB;
+ const liveSetsA = state.setsA;
+ const liveSetsB = state.setsB;

 const setsToWin = Math.ceil(state.bestOf / 2);
- const seriesWinnerName = state.setsA >= setsToWin ? state.teamA.name
-                        : state.setsB >= setsToWin ? state.teamB.name : null;
+ const seriesWinnerName = liveSetsA >= setsToWin ? state.teamA.name
+                        : liveSetsB >= setsToWin ? state.teamB.name : null;

 const entry = {
   id: Date.now(),
+  seriesId: state.seriesId,
+  setsAAfterGame: state.setsA,
+  setsBAfterGame: state.setsB,
 };
```

### 2. Changing team names retroactively changes the series counter
Where: `src/App.jsx:525`, `src/App.jsx:528`, `src/App.jsx:539`, `src/App.jsx:1342`

Reproduction steps:
1. Save one or more games between Nosotros and Ellos.
2. Start a best-of-3 with the same names and observe set history.
3. Rename Nosotros to anything else.
4. Observe the set counter.

Why it matters:
The counter is derived from exact team-name pairings in all saved history. Team names are editable inline, so one typo or mid-series rename can erase or resurrect sets. It also means an old game from weeks ago between "Nosotros" and "Ellos" counts toward today's series.

Suggested fix:
Introduce immutable team/session identifiers. Names should be labels, not keys.

Pseudo-diff:
```diff
 const DEFAULT_STATE = {
+  seriesId: createId(),
-  teamA: { name: 'Nosotros', p1: 'Jugador Uno', p2: 'Jugador Dos' },
-  teamB: { name: 'Ellos', p1: 'Jugador Tres', p2: 'Jugador Cuatro' },
+  teamA: { id: createId(), name: 'Nosotros', p1: 'Jugador Uno', p2: 'Jugador Dos' },
+  teamB: { id: createId(), name: 'Ellos', p1: 'Jugador Tres', p2: 'Jugador Cuatro' },
 };

- g.teamA?.name === state.teamA.name
+ g.seriesId === state.seriesId && g.teamA?.id === state.teamA.id
```

### 3. New Game modal changes best-of mode asynchronously before save/reset
Where: `src/App.jsx:633`, `src/App.jsx:875`, `src/App.jsx:1506`

Reproduction steps:
1. Finish a single game.
2. Tap `Nuevo`.
3. Pick `Mejor de 3`.
4. Tap `Guardar y empezar nuevo`.

Why it matters:
`NewGameModal.apply()` calls `setBestOf(selectedMode)` and immediately calls `saveCurrentToHistory()` and `resetGame()`. React state updates are asynchronous, so save/reset can run against the old `state.bestOf`, `setsA`, and `setsB`. This is a likely contributor to inconsistent set counting.

Suggested fix:
Pass the selected mode through the action and update/reset atomically in one state transition.

Pseudo-diff:
```diff
- const handleSaveAndNew = () => {
-   saveCurrentToHistory();
-   resetGame();
+ const handleSaveAndNew = (nextBestOf) => {
+   saveCurrentToHistory({ bestOf: nextBestOf });
+   resetGame({ bestOf: nextBestOf, newSeries: state.bestOf !== nextBestOf });
    setConfirmingNew(false);
  };

- const apply = (action) => {
-   setBestOf(selectedMode);
-   action();
- };
+ const apply = (action) => action(selectedMode);

- onClick={() => apply(onSaveAndNew)}
+ onClick={() => apply(onSaveAndNew)}
```

## Major Issues (should-fix-before-1.0)

### 1. +10 bonuses are not editable and can be lost when editing a round
Where: `src/App.jsx:555`, `src/App.jsx:557`, `src/App.jsx:1595`, `src/App.jsx:1606`

Reproduction steps:
1. Stage a `+10` bonus for a team.
2. Add a round.
3. Tap that round to edit.
4. Save the edit.

Why it matters:
The round stores `tenCountA/tenCountB`, but `EditRoundModal` only initializes and saves `bonusCountA/bonusCountB` and recomputes `bonusA/bonusB` using `pasoValue`. Any `+10` component is collapsed into an opaque total and then dropped or converted incorrectly when edited.

Suggested fix:
Store bonus components separately and compute display totals from components.

Pseudo-diff:
```diff
 const round = {
   a: winnerA ? a : 0,
   b: winnerA ? 0 : b,
-  bonusA,
-  bonusB,
   bonusCountA: pendingPasoA,
   bonusCountB: pendingPasoB,
   tenCountA: pendingTenA,
   tenCountB: pendingTenB,
 };

+ const roundBonus = (r, state) =>
+   (r.bonusCountA ?? 0) * state.pasoValue + (r.tenCountA ?? 0) * state.bonus10Value;

 // Edit modal state
 const [pasoCountA, setPasoCountA] = useState(round.bonusCountA || 0);
+const [tenCountA, setTenCountA] = useState(round.tenCountA || 0);

 onSave({
   a: aNum,
   b: bNum,
   bonusCountA: Math.max(0, pasoCountA),
+  tenCountA: Math.max(0, tenCountA),
-  bonusA: Math.max(0, countA) * state.pasoValue,
+  bonusA: Math.max(0, pasoCountA) * state.pasoValue + Math.max(0, tenCountA) * state.bonus10Value,
 });
```

### 2. `migrateRound()` does not migrate `tenCountA/tenCountB` or bonus value metadata
Where: `src/App.jsx:421`

Reproduction steps:
1. Save games in a version that had only `bonusA/bonusB`.
2. Upgrade to a version with +10 and editable bonus values.
3. Open old history or edit old rounds.

Why it matters:
`migrateRound()` infers only Paso Corrido counts. It cannot distinguish a `+10`, a custom `pasoValue`, or mixed bonuses. Old saved games can render totals, but editing/export semantics are wrong.

Suggested fix:
Version the storage shape and preserve raw bonus totals separately from component counts.

Pseudo-diff:
```diff
 function migrateRound(r) {
   const bonusA = Number(r.bonusA || 0);
   const bonusB = Number(r.bonusB || 0);
   return {
     a: Number(r.a || 0),
     b: Number(r.b || 0),
     bonusA,
     bonusB,
     bonusCountA: r.bonusCountA ?? 0,
     bonusCountB: r.bonusCountB ?? 0,
+    tenCountA: r.tenCountA ?? 0,
+    tenCountB: r.tenCountB ?? 0,
+    legacyBonusA: r.tenCountA == null && r.bonusCountA == null ? bonusA : undefined,
+    legacyBonusB: r.tenCountB == null && r.bonusCountB == null ? bonusB : undefined,
   };
 }
```

### 3. Manual save can duplicate the same game in history
Where: `src/App.jsx:644`, `src/App.jsx:694`

Reproduction steps:
1. Add a few rounds.
2. Tap `Guardar`.
3. Tap `Guardar` again after the green saved flash clears.
4. Open history.

Why it matters:
Duplicate saved games inflate history, export output, and any history-derived set logic.

Suggested fix:
Track the last saved fingerprint and update/replace instead of always prepending.

Pseudo-diff:
```diff
 const gameFingerprint = (s) => JSON.stringify({
   teamA: s.teamA, teamB: s.teamB, rounds: s.rounds, target: s.target, bestOf: s.bestOf
 });

 const saveCurrentToHistory = () => {
   if (state.rounds.length === 0) return;
+  const fingerprint = gameFingerprint(state);
   const entry = { id: Date.now(), ... };
+  entry.fingerprint = fingerprint;
-  setHistory((h) => [entry, ...h]);
+  setHistory((h) => h[0]?.fingerprint === fingerprint ? h : [entry, ...h]);
 };
```

### 4. Export selection silently drops hidden games when filters change
Where: `src/App.jsx:1988`

Reproduction steps:
1. Open History > Exportar juegos.
2. Select all games.
3. Apply a team/date filter.
4. Clear the filter.

Why it matters:
The effect intersects `selectedIds` with visible games and permanently removes hidden games. This may be intentional for "select all visible", but it is surprising because simply inspecting filters mutates the export selection.

Suggested fix:
Keep selection independent from filtering. Make `Select all` and `Clear` operate only on visible games without removing hidden selections automatically.

Pseudo-diff:
```diff
- useEffect(() => {
-   setSelectedIds(prev => {
-     const visibleIdSet = new Set(visibleGames.map(g => g.id));
-     const next = new Set();
-     prev.forEach(id => { if (visibleIdSet.has(id)) next.add(id); });
-     return next;
-   });
- }, [fromDate, toDate, filterTeams.join(',')]);
-
- const selectAll = () => setSelectedIds(new Set(visibleGames.map(g => g.id)));
- const clearAll = () => setSelectedIds(new Set());
+ const selectAll = () => setSelectedIds(prev => new Set([...prev, ...visibleGames.map(g => g.id)]));
+ const clearAll = () => setSelectedIds(prev => {
+   const visible = new Set(visibleGames.map(g => g.id));
+   return new Set([...prev].filter(id => !visible.has(id)));
+ });
```

### 5. Icon-only buttons lack accessible names
Where: `src/App.jsx:768`, `src/App.jsx:979`, `src/App.jsx:1618`, `src/App.jsx:1644`, `src/App.jsx:2309`

Reproduction steps:
1. Use a screen reader or inspect the accessibility tree.
2. Navigate the top-right header icons, edit modal close/delete buttons, and history delete buttons.

Why it matters:
The share/info/settings buttons render as unnamed buttons. Screen reader users hear "button" with no purpose. This also makes Playwright tests less reliable because controls cannot be selected by role/name.

Suggested fix:
Require `aria-label` in `IconBtn` and label every icon-only button.

Pseudo-diff:
```diff
- function IconBtn({ children, onClick, disabled }) {
+ function IconBtn({ children, onClick, disabled, label }) {
   return (
     <button
       onClick={onClick}
       disabled={disabled}
+      aria-label={label}
     >
       {children}
     </button>
   );
 }

- <IconBtn onClick={shareGame} disabled={state.rounds.length === 0}>
+ <IconBtn label={t.share} onClick={shareGame} disabled={state.rounds.length === 0}>
```

### 6. Primary mobile touch targets are below 44px
Where: `src/App.jsx:970`, `src/App.jsx:979`, `src/App.jsx:1217`, `src/App.jsx:1447`, `src/App.jsx:2085`, `src/styles.css:10`

Reproduction steps:
1. Open the app in Pixel 7 viewport.
2. Measure buttons and inline editable names.

Observed in Playwright:
- Install-banner close: `24x27`.
- Header icon buttons: about `38x41`.
- Team/player editable buttons: as small as `45x19` and `81x14`.
- Footer `Actualizar`: `96x27`; `Sugerencias`: `131x29`.
- Export modal close: `34x37`; filter/select buttons: `16px` high.

Why it matters:
These are common controls used during live scoring. Small targets increase mis-taps, especially around the iOS notch/status area and for older family members.

Suggested fix:
Create shared target-size utilities and use them consistently.

Pseudo-diff:
```diff
/* src/styles.css */
+button, input { touch-action: manipulation; }
+.tap-target { min-height: 44px; min-width: 44px; }
+.tap-target-inline { min-height: 44px; padding: 8px 6px; }

- className="p-2 rounded-md ..."
+ className="tap-target p-2 rounded-md ..."

- className="flex items-center gap-0.5 justify-center ..."
+ className="tap-target-inline flex items-center gap-0.5 justify-center ..."
```

## Minor Issues (polish)

### 1. Hardcoded strings bypass `STRINGS`
Where: `src/App.jsx:1191`, `src/App.jsx:2089`, `src/App.jsx:2264`, `src/App.jsx:2468`

Details:
Some user-visible or assistive strings are hardcoded: `quitar todos`, `cerrar`, CSV headers, and text export title `DOMINO - ...`. The app is Spanish-first today, but it already has English strings, so this creates inconsistent language switching.

Suggested fix:
Add keys such as `close`, `clear_all_bonus`, `csv_date`, and `text_export_title` to `STRINGS`.

### 2. Text export says `DOMINO` without accent
Where: `src/App.jsx:2468`

Details:
The UI consistently uses `DOMINÓ`, but text export uses `DOMINO`.

Suggested fix:
```diff
- lines.push('       DOMINO - ' + (t.game_export_subject || 'Game'));
+ lines.push('       DOMINÓ - ' + (t.game_export_subject || 'Game'));
```

### 3. Unused/dead components increase maintenance cost
Where: `src/App.jsx:1372`, `src/App.jsx:1454`

Details:
`TeamColumn` and `PendingBonus` appear unused after the compact team-row and live pending-row redesign. They duplicate display logic and can drift from active components.

Suggested fix:
Remove dead components or reintroduce them intentionally through one shared rendering path.

### 4. Version mismatch can confuse release validation
Where: `src/App.jsx:5`, `public/service-worker.js:3`, live URL

Details:
Local source says `0.0.18/domino-v18`; live says `0.0.17/domino-v17`. That is expected if local work is ahead, but it should be explicit in release notes and tags.

Suggested fix:
Add a `version:check` script that asserts `APP_VERSION`, `CACHE_VERSION`, `manifest.version` if added, and dist output match before deploy.

### 5. External Google Fonts can fail offline before SW cache is warm
Where: `public/index.html:150`, `src/App.jsx:748`

Details:
Playwright logged aborted `fonts.gstatic.com` requests. The app has fallbacks, but a PWA that sells offline-first should not depend on remote font availability for its final visual identity.

Suggested fix:
Self-host the WOFF2 files in `public/fonts/` and cache them in `ASSETS`.

## Accessibility Findings

- Missing names: header share/info/settings buttons, edit-round close/delete, history-card delete. Add `aria-label`.
- Touch target failures: install close, top icons, inline team/player name buttons, footer buttons, export close/filter/select controls are under 44px.
- Modal semantics: New Game, Edit Round, and Export are visually modal but have no `role="dialog"`, `aria-modal="true"`, labelled heading, escape-key close, or focus trap.
- Focus management: opening a modal does not move focus to the modal title/first action, and closing does not restore focus to the opener.
- Color contrast risk: amber text `#d97706` on amber-light `#fef3c7`, green `#16a34a` in small footer/status text, and `C.textLight` `#64748b` at 9-10px should be manually checked against WCAG 2.1 AA. The small text sizes make contrast more sensitive.
- Inputs lack explicit labels. Score fields are visually associated by layout only. Add `aria-label={`${state.teamA.name} puntos`}` and equivalent for team B.

Modal patch pattern:
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="new-game-title"
  onKeyDown={(e) => e.key === 'Escape' && onCancel()}
>
  <h3 id="new-game-title">{t.confirm_new_title}</h3>
</div>
```

## Performance Observations

- `DominoScorekeeper` is a single large component tree. Every score keystroke re-renders the team row, history view conditionals, game table, footer, and modal conditionals. It is fine at beta scale, but it will get harder to profile.
- `histSetsA/histSetsB` filter the full history four times on every render. This is small today, but unnecessary and part of the incorrect series model.
- Export JPG generation loops sequentially and renders a canvas for every selected game on the main thread. Exporting many history entries may freeze lower-end phones.
- Bundle size is acceptable for beta: `dist/app.js` is about `224K` raw and `67,351` bytes gzipped; `dist/app.css` is about `1,674` bytes gzipped.

Suggested performance patch:
```diff
+ const seriesState = useMemo(() => getCurrentSeriesState(state, history), [
+   state.seriesId,
+   state.setsA,
+   state.setsB,
+   history,
+ ]);
```
Use this only after fixing the source-of-truth issue; memoization should not hide incorrect state.

## Architectural / Design Suggestions

- Split `src/App.jsx` into state, domain logic, and view components. Minimum useful modules: `domain/scoring.js`, `domain/series.js`, `storage.js`, `components/modals/*`, `components/history/*`.
- Add domain-level tests before more UI work. The series bugs are not visual; they need pure tests for "win game", "save game", "start next game", "rename team", and "best-of clinch".
- Define a round schema and storage version. Right now `bonusA` is both a derived total and persisted field, while component counts are partial. Use a schema like `{ scoreA, scoreB, pasoA, pasoB, tenA, tenB }` and compute totals everywhere.
- Treat history as append-only records and current game/series as separate state. History should not decide the live series unless the user explicitly resumes a saved series.
- Replace `window.alert/confirm` with app-owned dialogs for consistent mobile behavior, Spanish copy, focus management, and testability.

## Feature Ideas

- Resume series: a history card could offer "Continuar esta serie" if `seriesId` exists and the series is not clinched.
- Undo last round: faster and safer than entering edit mode during live play.
- Configurable shoe rule explanation: show a short tooltip or About entry explaining why the shoe appears.
- Duplicate-save guard with "Último guardado hace X segundos" feedback.
- Optional players-per-team mode: some Dominican games use 1v1 practice; the app already allows 1-2 players implicitly.
- Export preview count by filter before selecting, e.g. "2 juegos visibles, 1 seleccionado".

## Test Coverage Gaps

- WebKit/iOS-Safari simulation did not run in this container because Playwright WebKit dependencies are missing (`libgtk-4`, `libgstreamer`, `libsecret`, etc.). Run `npx playwright install-deps webkit` on a CI image that allows system packages, or run on macOS Safari manually.
- Native share sheets cannot be fully asserted in Playwright. Validate CSV/JPG sharing manually on iOS Safari, Android Chrome, and desktop fallback download.
- PWA install behavior is browser/OS-specific. Pixel emulation showed the install banner, but actual `beforeinstallprompt`, Add to Home Screen, and standalone safe-area behavior need manual device tests.
- Offline behavior was not fully exercised. Add a test that loads once, goes offline, reloads, and confirms `index.html`, `app.js`, `app.css`, icons, and saved localStorage state remain available.
- Inline editing was fragile under automation when clicking editable text; this should be revisited after adding proper labels and stable test IDs.

## Suggested Roadmap

### NEXT (this week)
- Replace history-derived set counting with a single current-series source of truth.
- Fix series banner to use the same set values as the visible counter.
- Fix New Game modal so selected best-of mode is applied atomically with save/reset.
- Add `aria-label`s to all icon-only buttons and raise common tap targets to at least 44px.
- Add pure unit tests for score totals, bonuses, series wins, save/new, and team rename.

### SOON (next 2 weeks)
- Redesign round bonus schema to preserve Paso Corrido and +10 separately.
- Update `migrateRound()` for storage-versioned compatibility.
- Add +10 controls to the Edit Round modal.
- Make export selection independent of filter visibility, or explicitly label it as "visible games only".
- Add modal `role="dialog"`, focus trap, Escape close, and focus restoration.

### LATER (post-1.0)
- Split `App.jsx` into domain modules and component folders.
- Self-host fonts for fully offline visual consistency.
- Replace browser alerts/confirms with accessible in-app dialogs.
- Add resume-series and undo-last-round features.
- Add CI Playwright coverage for desktop Chromium, mobile Chromium, and WebKit when dependencies are available.
