import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  COMPANIES,
  DASHBOARD_METADATA,
  PROJECTS,
} from "../data/derived/dashboard-data.js";
import { validateCanonicalDataset } from "../scripts/lib/canonical-data.mjs";

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));
}

test("checked-in canonical dataset validates and matches derived dashboard counts", async () => {
  const canonical = {
    metadata: await readJson("../data/canonical/metadata.json"),
    companies: await readJson("../data/canonical/companies.json"),
    projects: await readJson("../data/canonical/projects.json"),
    projectCompanyLinks: await readJson("../data/canonical/project-company-links.json"),
    sources: await readJson("../data/canonical/sources.json"),
    evidence: await readJson("../data/canonical/evidence.json"),
  };

  validateCanonicalDataset(canonical);

  assert.equal(DASHBOARD_METADATA.projectCount, canonical.projects.length);
  assert.equal(DASHBOARD_METADATA.companyCount, canonical.companies.length);
  assert.equal(DASHBOARD_METADATA.evidenceCount, canonical.evidence.length);
  assert.equal(PROJECTS.length, canonical.projects.length);
  assert.equal(Object.keys(COMPANIES).length, canonical.companies.length);
});
