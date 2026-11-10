import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inventoryFile = path.join(root, 'docs/API_ROUTE_INVENTORY.md');
const routeGuideDir = path.join(root, 'docs/code-explanations/backend/routes');
const outputDir = path.join(root, 'docs/API_ENDPOINT_GUIDE');
const inventory = fs.readFileSync(inventoryFile, 'utf8');
const rows = [...inventory.matchAll(/^\| `(GET|POST|PUT|PATCH|DELETE|ALL)` \| `([^`]+)` \| \[`([^`]+)`\]\(([^)]+)\)/gm)]
  .map((match) => ({
    method: match[1],
    url: match[2],
    source: match[3],
    sourcePath: path.posix.normalize(path.posix.join('docs', match[4])),
  }));

const fullyTraced = new Set([
  'POST /api/auth/login',
  'POST /api/bookings',
  'POST /api/mpesa/stkpush', 'POST /api/payments/stkpush',
  'POST /api/mpesa/mpesa', 'POST /api/payments/mpesa',
  'GET /api/mpesa/status/:checkoutRequestId', 'GET /api/payments/status/:checkoutRequestId',
  'POST /api/mpesa/callback', 'POST /api/payments/callback',
  'GET /api/admin/bookings', 'GET /api/admin/bookings/:id',
  'PUT /api/admin/bookings/:id/status', 'PUT /api/admin/bookings/:id/assign',
  'PUT /api/admin/bookings/:id/payment', 'GET /api/admin/bookings/:id/timeline',
  'GET /api/admin/bookings/:id/invoice', 'POST /api/admin/bookings/:id/notify',
  'GET /api/admin/payments', 'GET /api/admin/payments/reconciliation',
  'GET /api/admin/payments/stats', 'GET /api/admin/payments/analytics',
  'GET /api/admin/payments/export/csv', 'GET /api/admin/payments/export/pdf',
  'GET /api/admin/payments/:id', 'PATCH /api/admin/payments/:id/status',
  'PATCH /api/admin/payments/:id', 'PATCH /api/admin/payments/:id/refund',
  'PUT /api/admin/payments/:id/refund', 'POST /api/admin/payments/:id/refund',
  'PUT /api/admin/bookings/:id/refund', 'POST /api/admin/bookings/:id/refund',
  'PUT /api/admin/refunds/:id/process',
]);

const slug = (url) => {
  const segments = url.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  const first = (segments.find((segment) => !segment.startsWith(':')) || 'root').toLowerCase();
  return first.replace(/[^a-z0-9_-]/g, '-') || 'root';
};
const escapeCell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');

function extractRouteSection(routeGuide, method, url) {
  const sections = routeGuide.split(/(?=^### )/m);
  const escapedUrl = `\`${url}\``;
  return sections.find((section) => section.startsWith(`### ${method} `) && section.split('\n')[0].includes(escapedUrl));
}

function extractPipeline(section) {
  return section?.match(/Route handler pipeline names: ([^.]+)\./)?.[1]?.trim() || 'not resolved in route guide';
}

function extractDeclaration(section) {
  const match = section?.match(/```(?:js|javascript)\n([\s\S]*?)\n```/);
  return match?.[1] || '';
}

function extractCueLines(section) {
  if (!section) return [];
  const cues = [];
  const patterns = [
    /^- Request body properties read:.*$/gm,
    /^- Path parameters read:.*$/gm,
    /^- Literal HTTP statuses in handler:.*$/gm,
    /^- JSON envelope keys observed:.*$/gm,
    /^- Direct model operations observed:.*$/gm,
    /^- Validation-related source lines:.*$/gm,
  ];
  for (const pattern of patterns) cues.push(...(section.match(pattern) || []));
  return [...new Set(cues)];
}

const groups = new Map();
const missingMatches = [];
for (const [index, row] of rows.entries()) {
  const routeGuideName = `${path.basename(row.source, '.js')}.md`;
  const routeGuidePath = path.join(routeGuideDir, routeGuideName);
  const routeGuide = fs.existsSync(routeGuidePath) ? fs.readFileSync(routeGuidePath, 'utf8') : '';
  const section = extractRouteSection(routeGuide, row.method, row.url);
  if (!section) missingMatches.push(`${row.method} ${row.url} (${row.source})`);

  const pipeline = extractPipeline(section);
  const declaration = extractDeclaration(section);
  const cues = extractCueLines(section);
  const moduleMiddleware = [...routeGuide.matchAll(/^- `router\.use\((.*?)\);`$/gm)].map((match) => match[1]);
  const declaredGuards = [...moduleMiddleware, pipeline].join(', ');
  const hasProtect = /\bprotect\b|\bauthenticate\b|\brequireAuth\b|\bverifyToken\b/i.test(declaredGuards);
  const hasOptional = /optionalProtect/i.test(declaredGuards);
  const roleOrPermissionGuards = [...declaredGuards.matchAll(/(?:requireRoles|roleMiddleware|authorize|checkPermission|adminOnly|superAdminOnly|managerOnly|agentOnly|customerOnly|guideOnly|driverOnly)\b[^,;)]*/g)].map((match) => match[0]);
  const contractKey = `${row.method} ${row.url}`;
  const isFull = fullyTraced.has(contractKey);
  const domain = slug(row.url);
  const list = groups.get(domain) || [];
  list.push({ ...row, index: index + 1, section, routeGuideName, pipeline, declaration, cues, moduleMiddleware, hasProtect, hasOptional, roleOrPermissionGuards, isFull });
  groups.set(domain, list);
}

fs.mkdirSync(outputDir, { recursive: true });
for (const [domain, endpoints] of groups) {
  const lines = [
    `# API endpoints: ${domain}`,
    '',
    `This guide contains ${endpoints.length} mounted method/path inventory entries in the **${domain}** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.`,
    '',
  ];

  for (const endpoint of endpoints) {
    const endpointId = `endpoint-${endpoint.index}`;
    const sourceLink = `../../${endpoint.sourcePath}`;
    const routeGuideLink = `../code-explanations/backend/routes/${endpoint.routeGuideName}`;
    const status = endpoint.isFull ? 'SOURCE-TRACED' : 'PARTIALLY VERIFIED';
    lines.push(`## ${endpointId} — ${endpoint.method} ${endpoint.url}`, '');
    lines.push(`**Contract status:** ${status}<br>`);
    lines.push(`**Router:** [${endpoint.source}](${sourceLink}) · [route module explanation](${routeGuideLink})<br>`);
    lines.push(`**Mounted inventory entry:** ${endpoint.index} of ${rows.length}<br>`);
    lines.push(`**Route declaration pipeline:** ${escapeCell(endpoint.pipeline)}`);
    if (endpoint.moduleMiddleware.length) lines.push(`**Router-wide middleware:** ${endpoint.moduleMiddleware.map(escapeCell).join('; ')}`);
    lines.push(`**Authentication evidence:** ${endpoint.hasProtect ? 'A JWT/authentication guard is visible in route/router middleware.' : endpoint.hasOptional ? 'Optional authentication is visible; anonymous and authenticated branches must be checked in the handler.' : 'No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.'}`);
    if (endpoint.roleOrPermissionGuards.length) lines.push(`**Role/permission middleware evidence:** ${endpoint.roleOrPermissionGuards.map(escapeCell).join('; ')}`);
    if (endpoint.declaration) lines.push('', '**Source declaration:**', '', '```js', endpoint.declaration, '```');
    if (endpoint.cues.length) lines.push('', '**Statically observed handler cues (navigation aid):**', '', ...endpoint.cues.map((cue) => `- ${cue.replace(/^- /, '')}`));

    if (endpoint.isFull) {
      lines.push('', '**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.');
    } else {
      lines.push('', '**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.');
    }
    lines.push('', '**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.', '');
  }

  fs.writeFileSync(path.join(outputDir, `${domain}.md`), `${lines.join('\n')}\n`);
}

const index = [
  '# API endpoint guide',
  '',
  `Generated from the mounted route inventory: **${rows.length} entries**, **${fullyTraced.size} path contracts currently source-traced**, **${rows.length - fullyTraced.size} marked PARTIALLY VERIFIED**. The status is intentionally conservative. Review [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md) for full critical-flow contracts and [API_ROUTE_INVENTORY.md](../API_ROUTE_INVENTORY.md) for the raw route list.`,
  '',
  '| Domain | Mounted entries | Guide |',
  '|---|---:|---|',
  ...[...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([domain, endpoints]) => `| ${domain} | ${endpoints.length} | [${domain}.md](${domain}.md) |`),
  '',
  'Each endpoint section identifies evidence available at the route boundary and explicitly lists the missing source trace for partial contracts. A structurally observed key or literal status is not a complete API schema.',
  '',
].join('\n');
fs.writeFileSync(path.join(outputDir, 'INDEX.md'), index);

console.log(JSON.stringify({ inventoryEntries: rows.length, fullyTracedEntries: fullyTraced.size, partialEntries: rows.length - fullyTraced.size, domainGuides: groups.size, missingRouteSections: missingMatches.length }, null, 2));
if (missingMatches.length) {
  console.error(missingMatches.slice(0, 30).join('\n'));
  process.exitCode = 1;
}
