#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const docsRoot = path.join(root, 'docs');
const clientRoot = path.join(root, 'client', 'src');
const serverRoot = path.join(root, 'server');
const sourceIndexPath = path.join(root, 'docs', 'SOURCE_FILE_INDEX.md');
const apiInventoryPath = path.join(root, 'docs', 'API_ROUTE_INVENTORY.md');
const apiGuideDir = path.join(root, 'docs', 'API_ENDPOINT_GUIDE');
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const excludedDirs = new Set(['node_modules', 'dist', 'build', 'coverage', '.next', 'vendor']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return excludedDirs.has(entry.name) ? [] : walk(path.join(dir, entry.name));
    return extensions.has(path.extname(entry.name)) ? [path.join(dir, entry.name)] : [];
  });
}

const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const sourceFiles = [...walk(clientRoot), ...walk(serverRoot)].map(relative).sort();
const sourceIndex = fs.readFileSync(sourceIndexPath, 'utf8');
const sourceRows = [...sourceIndex.matchAll(/^\| \[`([^`]+)`\]\(([^)]+)\) \| `[^`]+` \| (.+) \|$/gm)]
  .map((match) => ({ source: match[1], links: match[3] }));
const sourceMap = new Map(sourceRows.map((row) => [row.source, row]));
const missingIndexEntries = sourceFiles.filter((file) => !sourceMap.has(file));
const staleIndexEntries = sourceRows.filter((row) => !sourceFiles.includes(row.source)).map((row) => row.source);
const missingSources = [];
const missingExplanationFiles = [];
const deepSourceFiles = [];
const structuralSourceFiles = [];

for (const row of sourceRows) {
  const sourceTarget = path.resolve(root, 'docs', '..', row.source);
  if (!fs.existsSync(sourceTarget)) missingSources.push(row.source);
  const links = [...row.links.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
  const explanationTargets = links.filter((target) => target.startsWith('code-explanations/'));
  if (!explanationTargets.length) missingExplanationFiles.push(row.source);
  for (const target of explanationTargets) {
    if (!fs.existsSync(path.resolve(path.dirname(sourceIndexPath), target))) missingExplanationFiles.push(`${row.source} -> ${target}`);
  }
  if (/\[(?:Deep flow explanation|Detailed explanation|Booking implementation)\]/.test(row.links)) deepSourceFiles.push(row.source);
  if (/\[Structural walkthrough\]/.test(row.links)) structuralSourceFiles.push(row.source);
}

const modelFiles = fs.readdirSync(path.join(serverRoot, 'models')).filter((name) => name.endsWith('.js'));
const modelGuideDir = path.join(root, 'docs/code-explanations/database/models');
const modelGuides = fs.existsSync(modelGuideDir) ? fs.readdirSync(modelGuideDir).filter((name) => name.endsWith('.md') && name !== 'INDEX.md') : [];
const modelGuideIndexPath = path.join(modelGuideDir, 'INDEX.md');
const modelGuideIndex = fs.existsSync(modelGuideIndexPath) ? fs.readFileSync(modelGuideIndexPath, 'utf8') : '';
const documentedModelPaths = [...modelGuideIndex.matchAll(/^\| `[^`]+` \| (\d+) \| (\d+) \| \[[^\]]+\]\(([^)]+)\) \|$/gm)];
const documentedModelPathCount = documentedModelPaths.reduce((sum, match) => sum + Number(match[1]), 0);
const documentedModelIndexCount = documentedModelPaths.length;
const documentedModelIndexIndexes = documentedModelPaths.reduce((sum, match) => sum + Number(match[2]), 0);
const sourceReviewPath = path.join(docsRoot, 'SOURCE_REVIEW_REGISTRY.md');
const sourceReviewText = fs.existsSync(sourceReviewPath) ? fs.readFileSync(sourceReviewPath, 'utf8') : '';
const sourceVerifiedRows = [...sourceReviewText.matchAll(/^\| `([^`]+)` \| SOURCE-VERIFIED \| \[[^\]]+\]\(([^)]+)\) \|/gm)];
const sourceVerifiedFiles = new Set(sourceVerifiedRows.map((match) => match[1]).filter((file) => sourceFiles.includes(file)));
const sourceVerifiedMissing = sourceVerifiedRows
  .filter((match) => !fs.existsSync(path.join(root, match[1])) || !fs.existsSync(path.resolve(path.dirname(sourceReviewPath), match[2])))
  .map((match) => match[1]);

// Assign one honest status per source file. Registry scope takes priority;
// a structural walkthrough never counts as SOURCE-VERIFIED.
const sourceClassification = { SOURCE_VERIFIED: 0, PARTIAL: 0, STRUCTURAL: 0, UNREVIEWED: 0 };
for (const file of sourceFiles) {
  const row = sourceMap.get(file);
  if (sourceVerifiedFiles.has(file)) sourceClassification.SOURCE_VERIFIED += 1;
  else if (!row || missingExplanationFiles.includes(file)) sourceClassification.UNREVIEWED += 1;
  else if (/\[Structural walkthrough\]/.test(row.links)) sourceClassification.STRUCTURAL += 1;
  else sourceClassification.PARTIAL += 1;
}

const apiInventory = fs.readFileSync(apiInventoryPath, 'utf8');
const apiRows = [...apiInventory.matchAll(/^\| `(GET|POST|PUT|PATCH|DELETE|ALL)` \| `([^`]+)` \| \[`([^`]+)`\]/gm)];
const apiGuideFiles = fs.existsSync(apiGuideDir) ? fs.readdirSync(apiGuideDir).filter((name) => name.endsWith('.md') && name !== 'INDEX.md') : [];
const apiGuideText = apiGuideFiles.map((name) => fs.readFileSync(path.join(apiGuideDir, name), 'utf8')).join('\n');
const apiGuideEntries = [...apiGuideText.matchAll(/^## endpoint-\d+ — (GET|POST|PUT|PATCH|DELETE|ALL) (.+)$/gm)];
const fullApiEntries = [...apiGuideText.matchAll(/^\*\*Contract status:\*\* SOURCE-TRACED/gm)].length;
const partialApiEntries = [...apiGuideText.matchAll(/^\*\*Contract status:\*\* PARTIALLY VERIFIED/gm)].length;
const unreviewedApiEntries = Math.max(0, apiRows.length - fullApiEntries - partialApiEntries);
const routeGuideDir = path.join(root, 'docs/code-explanations/backend/routes');
const routeGuideFiles = fs.existsSync(routeGuideDir) ? fs.readdirSync(routeGuideDir).filter((name) => name.endsWith('.md') && !['INDEX.md', 'router-index.md'].includes(name)) : [];
const routeSourceEntries = [];
let unmountedRouteDeclarations = 0;
for (const name of routeGuideFiles) {
  const text = fs.readFileSync(path.join(routeGuideDir, name), 'utf8');
  for (const heading of text.matchAll(/^### (GET|POST|PUT|PATCH|DELETE|ALL) .*$/gm)) {
    const line = heading[0];
    if (line.includes('(unmounted declaration)')) { unmountedRouteDeclarations += 1; continue; }
    const mounted = line.match(/→ (.*)$/)?.[1] || '';
    for (const match of mounted.matchAll(/`([^`]+)`/g)) routeSourceEntries.push(`${heading[1]} ${match[1]} ${name}`);
  }
}
const inventoryRouteEntries = [...apiInventory.matchAll(/^\| `(GET|POST|PUT|PATCH|DELETE|ALL)` \| `([^`]+)` \| \[`([^`]+)`\]/gm)].map((match) => `${match[1]} ${match[2]} ${path.basename(match[3], '.js')}.md`);
const countKeys = (items) => items.reduce((map, item) => map.set(item, (map.get(item) || 0) + 1), new Map());
const inventoryUnique = new Set(inventoryRouteEntries);
const routeSourceUnique = new Set(routeSourceEntries);
const sourceMissingFromInventory = [...routeSourceUnique].filter((key) => !inventoryUnique.has(key)).length;
const inventoryMissingFromSource = [...inventoryUnique].filter((key) => !routeSourceUnique.has(key)).length;

const brokenLinks = [];
const secretFindings = [];
const markdownFiles = [path.join(root, 'README.md'), ...walkMarkdown(docsRoot)];
const secretPatterns = [
  ['private key PEM', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['live Stripe secret', /\bsk_live_[A-Za-z0-9]{16,}\b/],
  ['bearer JWT literal', /\bBearer\s+eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['npm access token', /\bnpm_[A-Za-z0-9]{30,}\b/],
];

function walkMarkdown(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdown(target);
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
  });
}

for (const file of markdownFiles) {
  let text = fs.readFileSync(file, 'utf8');
  for (const [label, pattern] of secretPatterns) if (pattern.test(text)) secretFindings.push(`${relative(file)}: possible ${label}`);
  text = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].trim().split('#')[0];
    if (!target || /^(?:https?:|mailto:)/i.test(target)) continue;
    if (!fs.existsSync(path.resolve(path.dirname(file), target))) brokenLinks.push(`${relative(file)} -> ${target}`);
  }
}

const report = {
  sourceFiles: sourceFiles.length,
  sourceClassification,
  sourceClassificationTotal: Object.values(sourceClassification).reduce((sum, count) => sum + count, 0),
  sourceFilesWithExplanations: sourceRows.length - missingExplanationFiles.length,
  sourceFilesWithExplanationLinks: sourceRows.length - missingExplanationFiles.length,
  indexedSourceFiles: sourceRows.length,
  indexMissing: missingIndexEntries.length,
  staleIndexEntries: staleIndexEntries.length,
  missingSourceTargets: missingSources.length,
  missingExplanationTargets: missingExplanationFiles.length,
  structuralSourceFiles: structuralSourceFiles.length,
  deepLinkedSourceFiles: new Set(deepSourceFiles).size,
  specializedIndexedButNotDeep: Math.max(0, sourceFiles.length - missingIndexEntries.length - structuralSourceFiles.length - new Set(deepSourceFiles).size),
  registeredSourceReviewScopeRows: sourceVerifiedRows.length,
  sourceFilesWithRegisteredScopedReview: sourceVerifiedFiles.size,
  sourceVerifiedCriticalModules: sourceVerifiedFiles.size,
  sourceVerifiedRegistryMissingTargets: sourceVerifiedMissing.length,
  staleSourceReferences: missingSources.length + sourceVerifiedMissing.length,
  sourceFilesWithoutRegisteredDeepReview: Math.max(0, sourceFiles.length - sourceVerifiedFiles.size),
  fullyReviewedSourceFiles: 0,
  models: modelFiles.length,
  modelGuides: modelGuides.length,
  modelGuidesIndexed: documentedModelIndexCount,
  modelFieldPathsInGuides: documentedModelPathCount,
  modelSchemaIndexCoverage: `${documentedModelIndexCount}/${modelFiles.length}`,
  modelSchemaFieldPathsDescribed: documentedModelPathCount,
  modelSchemaIndexesDescribed: documentedModelIndexIndexes,
  modelGuidesMissingFromIndex: Math.max(0, modelFiles.length - documentedModelPaths.length),
  mountedApiInventoryEntries: apiRows.length,
  uniqueMountedRouteDeclarationsReadFromRouteGuides: routeSourceUnique.size,
  additionalInventoryRowsForRepeatedMounts: Math.max(0, inventoryRouteEntries.length - inventoryUnique.size),
  unmountedRouteDeclarationsInRouteGuides: unmountedRouteDeclarations,
  mountedSourceEntriesMissingFromInventory: sourceMissingFromInventory,
  inventoryEntriesMissingFromMountedRouteGuides: inventoryMissingFromSource,
  endpointGuideEntries: apiGuideEntries.length,
  sourceTracedApiEntries: fullApiEntries,
  partiallyVerifiedApiEntries: partialApiEntries,
  unreviewedApiEntries,
  apiEntriesWithoutGuideRecord: Math.max(0, apiRows.length - apiGuideEntries.length),
  apiEntriesBeyondInventory: Math.max(0, apiGuideEntries.length - apiRows.length),
  endpointDomainGuides: apiGuideFiles.length,
  backendTestFiles: walk(path.join(root, 'server', 'tests')).length,
  contractDocumentsWithTestEvidenceNotes: fs.readdirSync(path.join(docsRoot, 'API_DOMAIN_CONTRACTS')).filter((name) => name.endsWith('.md') && name !== 'INDEX.md').map((name) => fs.readFileSync(path.join(docsRoot, 'API_DOMAIN_CONTRACTS', name), 'utf8')).filter((text) => /test/i.test(text)).length,
  contractDocumentsExplicitlyReportingNoFocusedTests: fs.readdirSync(path.join(docsRoot, 'API_DOMAIN_CONTRACTS')).filter((name) => name.endsWith('.md') && name !== 'INDEX.md').map((name) => fs.readFileSync(path.join(docsRoot, 'API_DOMAIN_CONTRACTS', name), 'utf8')).filter((text) => /no (?:focused|dedicated|specific) .*test/i.test(text)).length,
  endpointLevelTestCoverage: 'not automatically inferred; source tests are documented in reviewed contracts where inspected',
  interviewQuestions: [...fs.readFileSync(path.join(root, 'docs/interview/TECHNICAL_INTERVIEW_QUESTIONS.md'), 'utf8').matchAll(/^\d+\. \*\*/gm)].length,
  interviewPreparationDocuments: ['PROJECT_PRESENTATION.md', 'PROJECT_DEEP_DIVE.md', 'CODE_WALKTHROUGH.md', 'ADMIN_BOOKING_PAYMENT_DEEP_DIVE.md', 'CHALLENGES_AND_SOLUTIONS.md', 'LEARNING_GUIDE.md', 'TECHNICAL_INTERVIEW_QUESTIONS.md']
    .filter((name) => fs.existsSync(path.join(root, 'docs/interview', name))).length,
  documentedBusinessWorkflowSections: [...fs.readFileSync(path.join(root, 'docs/BUSINESS_LOGIC.md'), 'utf8').matchAll(/^## \d+\. /gm)].length,
  brokenLinks: brokenLinks.length,
  possibleSecretMatches: secretFindings.length,
  allEndpointContractsComplete: fullApiEntries === apiRows.length && partialApiEntries === 0,
  remainingWork: [
    reportSourceGap(sourceFiles.length, sourceVerifiedFiles.size),
    `${unreviewedApiEntries} mounted API entries have no contract classification`,
    `${partialApiEntries} mounted API entries remain partially verified`,
    `${Math.max(0, modelFiles.length - documentedModelPaths.length)} model guides are not represented in the model index`,
  ].filter((item) => !item.startsWith('0 ')),
};

console.log(JSON.stringify(report, null, 2));
const errors = [
  ...missingIndexEntries.map((x) => `Not indexed: ${x}`),
  ...staleIndexEntries.map((x) => `Stale source index row: ${x}`),
  ...missingSources.map((x) => `Missing source: ${x}`),
  ...missingExplanationFiles.map((x) => `Missing explanation: ${x}`),
  ...sourceVerifiedMissing.map((x) => `Source review registry has a missing source/explanation target: ${x}`),
  ...brokenLinks.map((x) => `Broken link: ${x}`),
  ...secretFindings,
  ...(report.apiEntriesWithoutGuideRecord ? [`${report.apiEntriesWithoutGuideRecord} mounted API entries have no endpoint guide record`] : []),
  ...(report.apiEntriesBeyondInventory ? [`${report.apiEntriesBeyondInventory} endpoint guide records do not match inventory`] : []),
  ...(sourceMissingFromInventory ? [`${sourceMissingFromInventory} unique route module/method/path entries are absent from API_ROUTE_INVENTORY.md`] : []),
  ...(inventoryMissingFromSource ? [`${inventoryMissingFromSource} unique inventory route/module entries do not match a route module guide`] : []),
  ...(report.models !== report.modelGuides ? [`Model count mismatch: ${report.models} sources vs ${report.modelGuides} guides`] : []),
];
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}

function reportSourceGap(total, verified) {
  const remaining = Math.max(0, total - verified);
  return `${remaining} source files lack a registered source-verified critical-scope review (this is not the exhaustive line-review count)`;
}
