# Canonical Data Workflow

This directory now holds the first file-based SSOT layer for the dashboard.

## Storage Layout

- `canonical/companies.json` — public company master records
- `canonical/projects.json` — project master records with factual and display geography
- `canonical/project-company-links.json` — explicit relationship claims between projects and public companies
- `canonical/sources.json` — source registry
- `canonical/evidence.json` — evidence records backing relationship claims
- `canonical/metadata.json` — schema version and publish metadata
- `derived/dashboard-data.js` — generated runtime module consumed by the React app

## Update Workflow

1. Bootstrap once from the legacy dataset when needed:
   `npm run data:bootstrap`
2. Edit the canonical JSON files in `data/canonical/`.
3. Regenerate the runtime module:
   `npm run data:publish`
4. Run verification:
   `npm test`
   `npm run build`

`data:bootstrap` seeds display coordinates from the legacy map dataset and marks factual coordinates as needing analyst review. `data:publish` stamps fresh publish metadata into the generated runtime module without mutating the canonical source files.

## Editing Rules

- Treat `canonical/*.json` as the editable source of truth.
- Treat `derived/dashboard-data.js` as generated output only.
- Every direct project-company link must keep at least one evidence record.
- Use factual coordinates for truth and display coordinates for map deconfliction.
- If factual coordinates are still unknown, leave them `null` and keep `coordinate_review_status` non-verified.
- Leave exchange metadata `null` unless you have a sourced, verified venue value.
