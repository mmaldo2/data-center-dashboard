import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { COMPANIES, PROJECTS } from "../dc-data.js";
import { buildCanonicalDataset, validateCanonicalDataset } from "./lib/canonical-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const canonicalDir = path.join(rootDir, "data", "canonical");

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const canonical = buildCanonicalDataset({
    legacyCompanies: COMPANIES,
    legacyProjects: PROJECTS,
    publishedAt: new Date().toISOString(),
  });

  validateCanonicalDataset(canonical);
  await mkdir(canonicalDir, { recursive: true });

  await Promise.all([
    writeJson(path.join(canonicalDir, "metadata.json"), canonical.metadata),
    writeJson(path.join(canonicalDir, "companies.json"), canonical.companies),
    writeJson(path.join(canonicalDir, "projects.json"), canonical.projects),
    writeJson(
      path.join(canonicalDir, "project-company-links.json"),
      canonical.projectCompanyLinks,
    ),
    writeJson(path.join(canonicalDir, "sources.json"), canonical.sources),
    writeJson(path.join(canonicalDir, "evidence.json"), canonical.evidence),
  ]);

  console.log(
    `Bootstrapped canonical data: ${canonical.projects.length} projects, ${canonical.companies.length} companies.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
