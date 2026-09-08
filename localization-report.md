# Hindi (हिन्दी) localization — final report

Wholesale localization of the citizen-facing SAHAYAK experience, English fully preserved as
fallback. Engine, scheme catalogue, wizard data and admin console unchanged.

## What was translated

- **Chrome keys**: 275 `en` ↔ 275 `hi` (parity verified by test) in `client/src/lib/i18n.ts`.
  Covers nav, footer, common actions, role labels, language/theme controls, not-found, markdown
  step progress, wizard, results, saved list, compare, profile, scheme detail, landing.
- **Value dictionary**: 719 entry pairs (`D('exact English', 'हिन्दी')`) + case-insensitive index,
  used via `tv` (values) and `td` (generated sentences) at display time.

## Files localized (all citizen-facing)

- `client/src/lib/i18n.ts` — keys + value dict + `translateValue`/`translateDetail`/`format`;
  `LanguageContext`/`useLanguage` now expose `t`, `tv`, `td`.
- `client/src/App.tsx` — LanguageProvider supplies `tv`/`td`.
- `client/src/components/Citizen.tsx` — header sr-only, footer, step progress, `Field` label/hint/options.
- `client/src/components/CitizenCards.tsx` — card text, aria-labels, match reasons, benefit, docs, next step.
- `client/src/pages/CitizenLandingPage.tsx`, `CitizenWizardPage.tsx`, `CitizenResultsPage.tsx`,
  `CitizenSchemeDetailPage.tsx`, `CitizenSavedPage.tsx`, `CitizenComparePage.tsx`,
  `CitizenProfilePage.tsx`, `NotFoundPage.tsx` — all copy, section headers, status/relevance pills,
  profile row labels, generated-sentence translations.
- `client/src/pages/LandingPage.tsx` — root marketing: nav + role CTAs localized only.

## Dynamic (generated) text handled client-side

`td` covers exact sentences from the value dict plus four interpolated templates verified against
`server/recommendations.ts`:
- occupation matched / blocked / missing-from-profile (`We could not confirm … yet — you can complete
  this in “About you”`)
- age matched / blocked (`…meant for ages…`) / no-match (`…aimed at ages…`)

Fixes made during final audit:
- Regex for the "could not confirm" sentence now allows the space the engine emits before the em
  dash (`yet — you`), so those sentences actually translate. (It previously never matched.)
- Added missing dictionary entries `Women entrepreneurs` and `the intended group`; confirmed all 40
  target groups (incl. lower-cased/plural engine forms) and all 15 occupation values translate.
- Fixed a stray full-width character `。` in the 18-60 age-block entry; removed a duplicate
  "60-60+" block entry.

## Verification

- `pnpm check` (tsc --noEmit): **pass**.
- `pnpm build` (vite build + esbuild): **pass** — only pre-existing warnings (unset
  `%VITE_ANALYTICS_*%` in `index.html`; chunk >500 kB).
- `pnpm vitest run` (`client/src/lib/i18n.test.ts`, new `vitest.config.ts`): **17/17 pass** —
  en/hi key parity, English passthrough regression, known-value translation, unknown-value
  fallback, exact-sentence translation, all four interpolated templates (occupation matched/blocked/
  missing, age matched/blocked/aimed).
- Grep audit of `client/src` finds **no user-facing English text nodes in citizen pages/components**
  (only data keys like tone-map strings that are themselves passed through `tv`).

## Intentional English

- Root marketing `LandingPage` body and admin console pages (Overview, Gap Radar, Maps, Opportunity,
  Simulator, Welfare Graph, Rule Consistency, Verification, Audit, Admin Login) — out of scope.
- Official scheme names (PM-KISAN, …), state/district/locality names, official source names —
  kept in their official form (verified intentionally absent from the dictionary).
- `ErrorBoundary` fallback text (`components/ErrorBoundary.tsx`) — generic boundary copy.
- Any value not present in the dictionary falls back to English, so output is never degraded.

## Manual check list

- Toggle हिन्दी/English from the citizen header — wizard, results, saved, compare, profile, scheme
  detail and landing all switch instantly; no reload needed (language in `localStorage`).
- Run the wizard as **farmer**, **business owner**, **student**, **retired/pensioner** — occupation
  and age-generated sentences appear in Hindi; verify message-appropriate (e.g. non-farmer on
  farmer schemes shows “यह अवसर … के लिए है, जो …”), plus Hindi labels on steps/sections.
- Profile page row labels and their segmented values (occupation, age group, education, ...) display
  in Hindi; state/district and scheme names remain in English.
- Results page pills (Covered / Potential opportunity / Potential gap / High relevance) render in
  Hindi; fully-English output still correct after switching back.
- Check both light and dark themes.