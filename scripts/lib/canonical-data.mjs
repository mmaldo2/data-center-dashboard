const CANONICAL_VERSION = 1;
const CANONICAL_STATUSES = new Set([
  "Operational",
  "Under Construction",
  "Announced",
  "Planned",
]);
const CONFIDENCE_VALUES = new Set(["low", "medium", "high"]);
const REVIEW_STATUS_VALUES = new Set(["needs_review", "in_review", "verified", "disputed"]);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCapacityMw(label) {
  const match = String(label).match(/([\d.]+)\s*(GW|MW)/i);
  if (!match) {
    throw new Error(`Unable to parse capacity label "${label}"`);
  }

  const value = Number.parseFloat(match[1]);
  return match[2].toUpperCase() === "GW" ? value * 1000 : value;
}

function parseInvestmentUsdBillions(label) {
  const match = String(label).match(/\$([\d.]+)\s*([BM])/i);
  if (!match) {
    return null;
  }

  const value = Number.parseFloat(match[1]);
  return match[2].toUpperCase() === "M" ? value / 1000 : value;
}

function buildCompanyId(ticker) {
  return `company-${String(ticker).toLowerCase()}`;
}

function buildProjectId(legacyId) {
  return `project-${legacyId}`;
}

function buildLinkId(projectId, companyId) {
  return `link-${projectId}-${companyId}`;
}

function buildEvidenceId(projectId, companyId) {
  return `evidence-${projectId}-${companyId}`;
}

function inferExchange(ticker) {
  const knownExchanges = {
    SBGSY: "OTC",
    LGRDY: "OTC",
  };

  return knownExchanges[ticker] ?? null;
}

function toCompanyRecord(company) {
  return {
    id: buildCompanyId(company.ticker),
    ticker: company.ticker,
    exchange: inferExchange(company.ticker),
    name: company.name,
    tier: company.tier,
    color: company.color,
    role_label: company.role,
    summary: company.summary,
    investable: true,
    metrics: {
      price: company.price,
      mcap: company.mcap,
      pe_fwd: company.pe_fwd,
      fy26e_rev: company.fy26e_rev,
      fy26e_eps: company.fy26e_eps,
      fy26e_growth: company.fy26e_growth,
      op_margin: company.op_margin,
      dc_pct: company.dc_pct,
      lc_growth: company.lc_growth,
      backlog: company.backlog,
    },
  };
}

function toProjectRecord(project) {
  return {
    id: buildProjectId(project.id),
    legacy_project_id: project.id,
    slug: slugify(project.name),
    name: project.name,
    state: project.state,
    factual_lat: null,
    factual_lng: null,
    display_lat: project.lat,
    display_lng: project.lng,
    coordinate_review_status: "needs_review",
    status: project.status,
    target_year: project.year,
    project_type: project.type,
    operator_name: project.operator,
    capacity_mw: parseCapacityMw(project.capacity),
    capacity_label: project.capacity,
    investment_usd_billions: parseInvestmentUsdBillions(project.investment),
    investment_label: project.investment,
    electricity_rate_cents_kwh: project.elecRate,
  };
}

function toLinkRecord(projectRecord, companyRecord, companyLink) {
  const evidenceId = buildEvidenceId(projectRecord.id, companyRecord.id);

  return {
    id: buildLinkId(projectRecord.id, companyRecord.id),
    project_id: projectRecord.id,
    company_id: companyRecord.id,
    company_ticker: companyRecord.ticker,
    relationship_type: "project_company_relationship",
    display_role: companyLink.role,
    detail: companyLink.detail,
    confidence: "medium",
    review_status: "needs_review",
    primary_evidence_ids: [evidenceId],
  };
}

function toEvidenceRecord(projectRecord, companyRecord, companyLink, sourceId) {
  return {
    id: buildEvidenceId(projectRecord.id, companyRecord.id),
    source_id: sourceId,
    project_id: projectRecord.id,
    company_id: companyRecord.id,
    claim_text: companyLink.detail,
    claim_category: "project_company_relationship",
    confidence: "medium",
    review_status: "needs_review",
    notes: `Migrated from legacy dashboard detail for ${projectRecord.name}.`,
  };
}

export function buildCanonicalDataset({
  legacyCompanies,
  legacyProjects,
  publishedAt = new Date().toISOString(),
}) {
  const sourceId = "source-legacy-dashboard";
  const companies = Object.values(legacyCompanies).map(toCompanyRecord);
  const companyByTicker = new Map(companies.map((company) => [company.ticker, company]));
  const projects = legacyProjects.map(toProjectRecord);
  const projectCompanyLinks = [];
  const evidence = [];

  for (const legacyProject of legacyProjects) {
    const projectRecord = projects.find(
      (project) => project.legacy_project_id === legacyProject.id,
    );

    for (const companyLink of legacyProject.companies) {
      const companyRecord = companyByTicker.get(companyLink.ticker);
      if (!companyRecord) {
        throw new Error(
          `Legacy project "${legacyProject.name}" references unknown ticker "${companyLink.ticker}"`,
        );
      }

      const linkRecord = toLinkRecord(projectRecord, companyRecord, companyLink);
      projectCompanyLinks.push(linkRecord);
      evidence.push(
        toEvidenceRecord(projectRecord, companyRecord, companyLink, sourceId),
      );
    }
  }

  return {
    metadata: {
      version: CANONICAL_VERSION,
      published_at: publishedAt,
      source_workflow: "legacy_dashboard_migration",
    },
    sources: [
      {
        id: sourceId,
        source_type: "internal_legacy_dataset",
        publisher: "AI Data Center Investment Map",
        published_at: publishedAt,
        url: null,
        title: "Legacy dashboard dataset migration",
      },
    ],
    companies,
    projects,
    projectCompanyLinks,
    evidence,
  };
}

export function stampPublishedMetadata(metadata, publishedAt = new Date().toISOString()) {
  return {
    ...metadata,
    published_at: publishedAt,
  };
}

export function validateCanonicalDataset(canonical) {
  const companiesById = new Map(canonical.companies.map((company) => [company.id, company]));
  const companyIds = new Set(canonical.companies.map((company) => company.id));
  const projectIds = new Set(canonical.projects.map((project) => project.id));
  const sourceIds = new Set(canonical.sources.map((source) => source.id));
  const evidenceById = new Map(canonical.evidence.map((record) => [record.id, record]));
  const referencedCompanies = new Set();

  for (const project of canonical.projects) {
    if (!CANONICAL_STATUSES.has(project.status)) {
      throw new Error(`Project "${project.name}" has invalid status "${project.status}"`);
    }

    if (typeof project.capacity_mw !== "number" || Number.isNaN(project.capacity_mw)) {
      throw new Error(`Project "${project.name}" is missing numeric capacity_mw`);
    }

    if (typeof project.display_lat !== "number" || typeof project.display_lng !== "number") {
      throw new Error(`Project "${project.name}" is missing display coordinates`);
    }

    const factualCoordsPresent =
      typeof project.factual_lat === "number" && typeof project.factual_lng === "number";
    const factualCoordsMissing =
      project.factual_lat === null && project.factual_lng === null;

    if (!factualCoordsPresent && !factualCoordsMissing) {
      throw new Error(`Project "${project.name}" must use numeric factual coords or null placeholders`);
    }

    if (!REVIEW_STATUS_VALUES.has(project.coordinate_review_status)) {
      throw new Error(`Project "${project.name}" has invalid coordinate review status "${project.coordinate_review_status}"`);
    }

    if (!factualCoordsPresent && project.coordinate_review_status === "verified") {
      throw new Error(`Project "${project.name}" cannot mark coordinates verified without factual coords`);
    }
  }

  for (const evidenceRecord of canonical.evidence) {
    if (!sourceIds.has(evidenceRecord.source_id)) {
      throw new Error(
        `Evidence "${evidenceRecord.id}" references unknown source "${evidenceRecord.source_id}"`,
      );
    }

    if (!projectIds.has(evidenceRecord.project_id) || !companyIds.has(evidenceRecord.company_id)) {
      throw new Error(`Evidence "${evidenceRecord.id}" must reference known project and company records`);
    }

    if (!CONFIDENCE_VALUES.has(evidenceRecord.confidence)) {
      throw new Error(`Evidence "${evidenceRecord.id}" has invalid confidence "${evidenceRecord.confidence}"`);
    }

    if (!REVIEW_STATUS_VALUES.has(evidenceRecord.review_status)) {
      throw new Error(`Evidence "${evidenceRecord.id}" has invalid review status "${evidenceRecord.review_status}"`);
    }
  }

  for (const link of canonical.projectCompanyLinks) {
    if (!projectIds.has(link.project_id)) {
      throw new Error(`Link "${link.id}" references unknown project "${link.project_id}"`);
    }

    if (!companyIds.has(link.company_id)) {
      throw new Error(`Link "${link.id}" references unknown company "${link.company_id}"`);
    }

    if (link.company_ticker !== companiesById.get(link.company_id)?.ticker) {
      throw new Error(`Link "${link.id}" company_ticker must match the referenced company ticker`);
    }

    if (!Array.isArray(link.primary_evidence_ids) || link.primary_evidence_ids.length === 0) {
      throw new Error(`Link "${link.id}" must cite at least one evidence record`);
    }

    if (!CONFIDENCE_VALUES.has(link.confidence)) {
      throw new Error(`Link "${link.id}" has invalid confidence "${link.confidence}"`);
    }

    if (!REVIEW_STATUS_VALUES.has(link.review_status)) {
      throw new Error(`Link "${link.id}" has invalid review status "${link.review_status}"`);
    }

    for (const evidenceId of link.primary_evidence_ids) {
      const evidenceRecord = evidenceById.get(evidenceId);
      if (!evidenceRecord) {
        throw new Error(`Link "${link.id}" references unknown evidence "${evidenceId}"`);
      }

      if (
        evidenceRecord.project_id !== link.project_id ||
        evidenceRecord.company_id !== link.company_id
      ) {
        throw new Error(`Link "${link.id}" evidence "${evidenceId}" must match the linked project and company`);
      }
    }

    referencedCompanies.add(link.company_id);
  }

  for (const company of canonical.companies) {
    if (company.tier === "direct" && !referencedCompanies.has(company.id)) {
      throw new Error(`Direct company "${company.ticker}" must be linked to a project`);
    }

    if (company.tier === "upstream" && referencedCompanies.has(company.id)) {
      throw new Error(`Upstream company "${company.ticker}" cannot have direct project links`);
    }
  }
}

export function buildDashboardData(canonical) {
  const evidenceById = new Map(canonical.evidence.map((record) => [record.id, record]));
  const companyById = new Map(canonical.companies.map((company) => [company.id, company]));
  const linksByProjectId = new Map();
  const projectCounts = new Map();

  for (const link of canonical.projectCompanyLinks) {
    const currentLinks = linksByProjectId.get(link.project_id) ?? [];
    currentLinks.push(link);
    linksByProjectId.set(link.project_id, currentLinks);
    projectCounts.set(
      link.company_id,
      (projectCounts.get(link.company_id) ?? 0) + 1,
    );
  }

  const COMPANIES = Object.fromEntries(
    canonical.companies.map((company) => [
      company.ticker,
      {
        ...company.metrics,
        tier: company.tier,
        ticker: company.ticker,
        exchange: company.exchange,
        name: company.name,
        color: company.color,
        role: company.role_label,
        summary: company.summary,
        projectCount: projectCounts.get(company.id) ?? 0,
      },
    ]),
  );

  const PROJECTS = canonical.projects.map((project) => {
    const projectLinks = linksByProjectId.get(project.id) ?? [];
    const reviewStatusCounts = {};
    let evidenceCount = 0;

    const companies = projectLinks.map((link) => {
      const companyRecord = companyById.get(link.company_id);
      const evidenceRecords = link.primary_evidence_ids.map((id) => evidenceById.get(id));
      evidenceCount += evidenceRecords.length;
      reviewStatusCounts[link.review_status] = (reviewStatusCounts[link.review_status] ?? 0) + 1;

      return {
        ticker: companyRecord.ticker,
        role: link.display_role,
        detail: link.detail,
        confidence: link.confidence,
        reviewStatus: link.review_status,
        evidenceIds: link.primary_evidence_ids,
        evidenceCount: evidenceRecords.length,
      };
    });

    return {
      id: project.legacy_project_id,
      name: project.name,
      state: project.state,
      lat: project.factual_lat ?? project.display_lat,
      lng: project.factual_lng ?? project.display_lng,
      factualLat: project.factual_lat,
      factualLng: project.factual_lng,
      displayLat: project.display_lat,
      displayLng: project.display_lng,
      coordinateReviewStatus: project.coordinate_review_status,
      capacity: project.capacity_label,
      capacityMw: project.capacity_mw,
      investment: project.investment_label,
      investmentUsdBillions: project.investment_usd_billions,
      status: project.status,
      year: project.target_year,
      type: project.project_type,
      operator: project.operator_name,
      elecRate: project.electricity_rate_cents_kwh,
      companies,
      researchCoverage: {
        linkedCompanyCount: companies.length,
        evidenceCount,
        reviewStatusCounts,
      },
    };
  });

  return {
    DASHBOARD_METADATA: {
      version: canonical.metadata.version,
      publishedAt: canonical.metadata.published_at,
      projectCount: canonical.projects.length,
      companyCount: canonical.companies.length,
      sourceCount: canonical.sources.length,
      evidenceCount: canonical.evidence.length,
    },
    COMPANIES,
    PROJECTS,
    SOURCES: canonical.sources,
    EVIDENCE: canonical.evidence,
    PROJECT_COMPANY_LINKS: canonical.projectCompanyLinks,
  };
}
