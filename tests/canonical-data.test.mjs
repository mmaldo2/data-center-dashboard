import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCanonicalDataset,
  buildDashboardData,
  stampPublishedMetadata,
  validateCanonicalDataset,
} from "../scripts/lib/canonical-data.mjs";

const legacyCompanies = {
  ORCL: {
    tier: "direct",
    ticker: "ORCL",
    name: "Oracle",
    price: 172,
    mcap: 480,
    pe_fwd: 25,
    fy26e_rev: 66,
    fy26e_eps: 6.9,
    fy26e_growth: 15,
    op_margin: 30,
    dc_pct: 35,
    lc_growth: "N/A",
    backlog: "$130B RPO",
    color: "#f43f5e",
    role: "Cloud Infrastructure / DC Developer",
    summary: "Building Stargate campuses.",
  },
  NVDA: {
    tier: "direct",
    ticker: "NVDA",
    name: "NVIDIA",
    price: 131,
    mcap: 3220,
    pe_fwd: 28.5,
    fy26e_rev: 200,
    fy26e_eps: 4.6,
    fy26e_growth: 55,
    op_margin: 62,
    dc_pct: 88,
    lc_growth: "N/A",
    backlog: "$30B+",
    color: "#76b900",
    role: "GPUs / AI Accelerators",
    summary: "GB200 NVL72 platform.",
  },
  FCX: {
    tier: "upstream",
    ticker: "FCX",
    name: "Freeport-McMoRan",
    price: 65,
    mcap: 93.4,
    pe_fwd: 22.4,
    fy26e_rev: 26,
    fy26e_eps: 2.9,
    fy26e_growth: 15,
    op_margin: 30,
    dc_pct: "N/A",
    lc_growth: "N/A",
    backlog: "N/A",
    color: "#ef6c00",
    role: "Copper Producer (DC Supply Chain)",
    summary: "Commodity exposure.",
  },
};

const legacyProjects = [
  {
    id: 1,
    name: "Stargate I — Abilene",
    state: "TX",
    lat: 32.45,
    lng: -99.73,
    capacity: "1.2 GW",
    investment: "$100B+",
    status: "Under Construction",
    year: 2026,
    type: "AI Training",
    operator: "OpenAI",
    elecRate: 7.2,
    companies: [
      {
        ticker: "ORCL",
        role: "DC Developer & Cloud Provider",
        detail: "Building campus, purchasing 400K GB200 chips",
      },
      {
        ticker: "NVDA",
        role: "GPU Supplier",
        detail: "GB200 NVL72 platform for training cluster",
      },
    ],
  },
];

test("buildCanonicalDataset creates canonical entities and evidence-backed links", () => {
  const canonical = buildCanonicalDataset({
    legacyCompanies,
    legacyProjects,
    publishedAt: "2026-03-10T12:00:00.000Z",
  });

  assert.equal(canonical.metadata.version, 1);
  assert.equal(canonical.sources.length, 1);
  assert.equal(canonical.projects[0].capacity_mw, 1200);
  assert.equal(canonical.projects[0].capacity_label, "1.2 GW");
  assert.equal(canonical.projects[0].factual_lat, null);
  assert.equal(canonical.projects[0].factual_lng, null);
  assert.equal(canonical.projects[0].display_lat, 32.45);
  assert.equal(canonical.projects[0].display_lng, -99.73);
  assert.equal(canonical.projects[0].coordinate_review_status, "needs_review");
  assert.equal(canonical.companies[0].exchange, null);
  assert.equal(canonical.projectCompanyLinks.length, 2);
  assert.deepEqual(
    canonical.projectCompanyLinks[0].primary_evidence_ids,
    ["evidence-project-1-company-orcl"],
  );
  assert.equal(canonical.evidence[0].claim_category, "project_company_relationship");
  assert.equal(canonical.evidence[0].review_status, "needs_review");
});

test("validateCanonicalDataset rejects direct links without evidence", () => {
  const canonical = buildCanonicalDataset({
    legacyCompanies,
    legacyProjects,
    publishedAt: "2026-03-10T12:00:00.000Z",
  });

  canonical.projectCompanyLinks[0].primary_evidence_ids = [];

  assert.throws(
    () => validateCanonicalDataset(canonical),
    /must cite at least one evidence record/,
  );
});

test("validateCanonicalDataset rejects mismatched evidence and invalid enums", () => {
  const canonical = buildCanonicalDataset({
    legacyCompanies,
    legacyProjects,
    publishedAt: "2026-03-10T12:00:00.000Z",
  });

  canonical.evidence.push({
    ...canonical.evidence[0],
    id: "evidence-project-1-company-orcl-mismatch",
    company_id: "company-nvda",
  });
  canonical.projectCompanyLinks[0].primary_evidence_ids = [
    "evidence-project-1-company-orcl-mismatch",
  ];
  assert.throws(
    () => validateCanonicalDataset(canonical),
    /must match the linked project and company/,
  );

  canonical.projectCompanyLinks[0].primary_evidence_ids = [
    "evidence-project-1-company-orcl",
  ];
  canonical.projectCompanyLinks[0].confidence = "certain";
  assert.throws(
    () => validateCanonicalDataset(canonical),
    /invalid confidence/,
  );
});

test("validateCanonicalDataset rejects link ticker drift from the referenced company", () => {
  const canonical = buildCanonicalDataset({
    legacyCompanies,
    legacyProjects,
    publishedAt: "2026-03-10T12:00:00.000Z",
  });

  canonical.projectCompanyLinks[0].company_ticker = "WRONG";

  assert.throws(
    () => validateCanonicalDataset(canonical),
    /must match the referenced company ticker/,
  );
});

test("buildDashboardData derives project and company views from canonical entities", () => {
  const canonical = buildCanonicalDataset({
    legacyCompanies,
    legacyProjects,
    publishedAt: "2026-03-10T12:00:00.000Z",
  });

  validateCanonicalDataset(canonical);
  const dashboardData = buildDashboardData(canonical);

  assert.equal(dashboardData.DASHBOARD_METADATA.projectCount, 1);
  assert.equal(dashboardData.DASHBOARD_METADATA.companyCount, 3);
  assert.equal(dashboardData.PROJECTS[0].companies[0].evidenceCount, 1);
  assert.equal(dashboardData.PROJECTS[0].companies[0].confidence, "medium");
  assert.equal(dashboardData.PROJECTS[0].researchCoverage.reviewStatusCounts.needs_review, 2);
  assert.equal(dashboardData.COMPANIES.ORCL.projectCount, 1);
  assert.equal(dashboardData.COMPANIES.FCX.projectCount, 0);
});

test("stampPublishedMetadata refreshes publish freshness without changing schema version", () => {
  const stamped = stampPublishedMetadata(
    { version: 1, published_at: "2026-03-09T00:00:00.000Z", source_workflow: "legacy_dashboard_migration" },
    "2026-03-10T18:00:00.000Z",
  );

  assert.equal(stamped.version, 1);
  assert.equal(stamped.published_at, "2026-03-10T18:00:00.000Z");
  assert.equal(stamped.source_workflow, "legacy_dashboard_migration");
});
