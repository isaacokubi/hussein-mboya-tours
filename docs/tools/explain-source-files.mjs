// Build source-specific structural walkthroughs from the checked-in JS/JSX AST.
// Run at repository root after updating dependencies. This is documentation-only.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = process.cwd();
const { parse } = await import(pathToFileURL(path.join(root, "client/node_modules/@babel/parser/lib/index.js")));
const includedRoots = ["client/src", "server"];
const knownCovered = new Set([
  "client/src/App.jsx", "client/src/main.jsx", "client/src/routes/AppRoutes.jsx", "client/src/api/axios.js", "client/src/api/bookingApi.js", "client/src/pages/PaymentStatus.jsx",
  "client/src/admin/rolesApi.js", "server/server.js", "server/app.js", "server/middleware/authMiddleware.js", "server/services/bookingCreationService.js", "server/models/Booking.js", "server/routes/mpesaRoutes.js", "server/services/mpesaService.js",
]);
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!["node_modules", "dist", "build", "coverage"].includes(entry.name)) await walk(full); }
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) files.push(full);
  }
}
for (const entry of includedRoots) await walk(path.join(root, entry));
const records = [];
const relevant = (file) => {
  const rel = path.relative(root, file).split(path.sep).join("/");
  if (knownCovered.has(rel) || rel.startsWith("server/models/") || rel.startsWith("server/routes/") || rel.startsWith("client/src/api/")) return false;
  return true;
};
const nameFor = (node) => {
  if (node.id?.name) return node.id.name;
  if (node.key?.name) return node.key.name;
  return null;
};
function collectFunctions(ast) {
  const found = new Map();
  function visit(node, parent = null) {
    if (!node || typeof node !== "object") return;
    if (node.type === "FunctionDeclaration" || node.type === "ClassMethod" || node.type === "ObjectMethod") {
      const name = nameFor(node);
      if (name) found.set(`${node.start}:${name}`, { name, node });
    } else if (node.type === "VariableDeclarator" && node.id?.type === "Identifier" && ["ArrowFunctionExpression", "FunctionExpression"].includes(node.init?.type)) {
      found.set(`${node.start}:${node.id.name}`, { name: node.id.name, node: node.init, declarator: node });
    }
    for (const [key, value] of Object.entries(node)) {
      if (["loc", "start", "end", "leadingComments", "trailingComments", "innerComments", "extra"].includes(key)) continue;
      if (Array.isArray(value)) value.forEach((item) => visit(item, node)); else if (value && typeof value === "object") visit(value, node);
    }
  }
  visit(ast.program);
  return [...found.values()].sort((a, b) => a.node.start - b.node.start);
}
for (const file of files.sort()) {
  if (!relevant(file)) continue;
  const code = await readFile(file, "utf8");
  let ast;
  try { ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] }); }
  catch (error) { records.push({ file, code, parseError: error.message, imports: [], functions: [] }); continue; }
  const imports = ast.program.body.filter((node) => node.type === "ImportDeclaration").map((node) => ({ source: node.source.value, names: node.specifiers.map((s) => s.imported?.name || s.local.name), target: node.source.value.startsWith(".") ? path.resolve(path.dirname(file), node.source.value) : null }));
  records.push({ file, code, ast, imports, functions: collectFunctions(ast) });
}
const outRoot = path.join(root, "docs/code-explanations/source");
await mkdir(outRoot, { recursive: true });
const outPath = (file) => `${path.relative(root, file).split(path.sep).join("__")}.md`;
const shortPath = (file) => path.relative(root, file).split(path.sep).join("/");
const moduleDescription = (rel) => {
  if (rel.startsWith("client/src/pages/")) return "A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.";
  if (rel.startsWith("client/src/components/")) return "A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.";
  if (rel.startsWith("client/src/hooks/")) return "A reusable React hook that packages state, query, or interaction behavior for components.";
  if (rel.startsWith("client/src/context/")) return "A React context/provider module for state shared across component branches.";
  if (rel.startsWith("client/src/utils/") || rel.startsWith("client/src/lib/")) return "A client utility/helper used by pages, hooks, or components; inspect its exported functions for exact transformation rules.";
  if (rel.startsWith("client/src/config/")) return "Client-side configuration/constants consumed by routes, layouts, or permission-aware UI.";
  if (rel.startsWith("server/controllers/")) return "An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.";
  if (rel.startsWith("server/services/")) return "A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.";
  if (rel.startsWith("server/middleware/")) return "Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().";
  if (rel.startsWith("server/tenancy/")) return "A tenant context/query isolation primitive used by request middleware, model plugins and domain services.";
  if (rel.startsWith("server/utils/")) return "A backend utility shared by controllers, services, or models.";
  if (rel.startsWith("server/config/")) return "Server configuration or provider initialization. Values and validation affect runtime startup or request behavior.";
  if (rel.startsWith("server/tests/")) return "A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.";
  if (rel.startsWith("server/seeds/")) return "A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.";
  if (rel.startsWith("server/scripts/")) return "An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.";
  if (rel.startsWith("server/bootstrap/")) return "A startup/bootstrap hook loaded to register model behavior or prepare runtime state.";
  return "A first-party runtime module; use its import/export and caller map below to determine the specific role.";
};
const sensitiveLine = /password|secret|token|credential|private.?key|api.?key/i;
const describeLine = (text) => {
  const s = text.trim();
  if (/^if\s*\(/.test(s)) return "This branch gates the following work on a condition; test both true and false paths when changing it.";
  if (/^switch\s*\(/.test(s)) return "This branch selects behavior by the current value; verify every case and the default path.";
  if (/^for\b|^while\b/.test(s)) return "This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.";
  if (/^try\b/.test(s)) return "Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.";
  if (/^catch\b/.test(s)) return "Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.";
  if (/^throw\b/.test(s)) return "Stops the current operation with an error; callers or Express error handling determine the response.";
  if (/^return\b/.test(s)) return "Exits this function and supplies its result (or response short-circuit) to the caller.";
  if (/\bawait\b/.test(s)) return "Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.";
  if (/\.status\(/.test(s) && /\.json\(/.test(s)) return "Builds an HTTP response with an explicit status and JSON payload.";
  if (/\.json\(/.test(s)) return "Sends a JSON response; inspect its caller for status and error semantics.";
  if (/\.(find|findOne|findById|create|updateOne|updateMany|deleteOne|aggregate|countDocuments|save)\s*\(/.test(s)) return "Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.";
  if (/api\.(get|post|put|patch|delete)\s*\(/.test(s)) return "Makes an HTTP request through the shared client; the server route defines validation and authorization.";
  if (/use(State|Effect|Memo|Callback|Query|Mutation|Context)\s*\(/.test(s)) return "Uses a React hook to manage component state, side effects, memoization, or server state.";
  if (/process\.env|import\.meta\.env/.test(s)) return "Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.";
  return "Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.";
};
for (const record of records) {
  const rel = shortPath(record.file);
  const outFile = path.join(outRoot, outPath(record.file));
  const lines = [`# Source explanation: ${rel}`, "", `**Source:** [${rel}](../../../${rel})`, "", "## Purpose", "", moduleDescription(rel), "", "## Imports and dependencies", ""];
  if (record.imports.length) {
    for (const item of record.imports) {
      const target = item.target && item.target.startsWith(root) ? ` [${shortPath(item.target)}](../../../${shortPath(item.target)})` : "";
      lines.push(`- ${item.names.map((name) => `\`${name}\``).join(", ")} from \`${item.source}\`. This dependency supplies the imported behavior; inspect the linked local module for its contract.${target}`);
    }
  } else lines.push("No ES module imports were found.");
  lines.push("", "## Runtime declarations and data flow", "");
  if (record.parseError) lines.push(`The parser could not produce a symbol map: ${record.parseError}. Read the linked source directly; this file is not counted as structurally explained.`);
  else if (record.functions.length) {
    for (const fn of record.functions) {
      const start = fn.node.loc?.start.line || 1, end = fn.node.loc?.end.line || start;
      const snippet = record.code.slice(fn.node.start, fn.node.end);
      const parameters = (fn.node.params || []).map((param, index) => {
        if (param.type === "Identifier") return param.name;
        if (param.type === "ObjectPattern") return `{${param.properties.map((item) => item.key?.name || "...").join(", ")}}`;
        if (param.type === "ArrayPattern") return `[${param.elements.map((item) => item?.name || "…").join(", ")}]`;
        if (param.type === "AssignmentPattern") return `${param.left?.name || `arg${index + 1}`} (defaulted)`;
        if (param.type === "RestElement") return `...${param.argument?.name || "args"}`;
        return `arg${index + 1}`;
      });
      const simple = snippet.split("\n").map((text, index) => ({ text: text.trim(), line: start + index })).filter((item) => item.text);
      const cues = [];
      const sources = [...snippet.matchAll(/\b(req\.(?:body|params|query|user|tenantId|tenant)|props\.[\w$]+|arguments\[\d+\])/g)].map((m) => m[0]);
      if (sources.length) cues.push(`Reads request/component inputs: ${[...new Set(sources)].join(", ")}.`);
      const dbCalls = [...snippet.matchAll(/\b([A-Z][A-Za-z0-9_$]*)\.(find|findOne|findById|create|updateOne|updateMany|deleteOne|aggregate|countDocuments|save)\s*\(/g)].map((m) => `${m[1]}.${m[2]}`);
      if (dbCalls.length) cues.push(`Persistent operations detected: ${[...new Set(dbCalls)].join(", ")}; verify tenant/ownership filters in the exact query.`);
      const httpCalls = [...snippet.matchAll(/\b(api|axios)\.(get|post|put|patch|delete)\s*\(/g)].map((m) => `${m[1]}.${m[2]}`);
      if (httpCalls.length) cues.push(`HTTP operations detected: ${[...new Set(httpCalls)].join(", ")}; response/error handling occurs in this function and its caller.`);
      const hooks = [...snippet.matchAll(/\b(useState|useEffect|useMemo|useCallback|useQuery|useMutation|useContext)\s*\(/g)].map((m) => m[1]);
      if (hooks.length) cues.push(`React hooks used: ${[...new Set(hooks)].join(", ")}.`);
      const asyncCalls = [...snippet.matchAll(/\bawait\b/g)].length;
      if (asyncCalls) cues.push(`${asyncCalls} awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.`);
      const hasTry = /\btry\s*\{/.test(snippet), hasCatch = /\bcatch\s*\(/.test(snippet), hasFinally = /\bfinally\s*\{/.test(snippet);
      if (hasTry || hasCatch || hasFinally) cues.push(`Error control: try=${hasTry}, catch=${hasCatch}, finally=${hasFinally}.`);
      const branches = [...snippet.matchAll(/\b(if|else|switch|case|for|while)\b/g)].length;
      if (branches) cues.push(`${branches} branch/loop keywords are present; their source lines are listed below for path-by-path reading.`);
      lines.push(`### \`${fn.name}\` — lines ${start}–${end}`, "", `Parameters: ${parameters.length ? parameters.map((item) => `\`${item}\``).join(", ") : "none"}.`, cues.join(" ") || "This named function is a local transformation/callback; its input parameters and return statements define its contract.", "", "Key statements:");
      let emitted = 0;
      for (let i = 0; i < simple.length; i++) {
        const s = simple[i].text;
        if (!/^(if\s*\(|else\b|switch\s*\(|case\b|for\b|while\b|try\b|catch\b|finally\b|throw\b|return\b|const\b|let\b|await\b|.*\.status\(|.*\.json\(|.*\.(find|findOne|findById|create|updateOne|updateMany|deleteOne|aggregate|countDocuments|save)\s*\(|.*api\.(get|post|put|patch|delete)\s*\(|.*use(State|Effect|Memo|Callback|Query|Mutation|Context)\s*\()/s.test(s)) continue;
        const ln = simple[i].line;
        lines.push(`- **Line ${ln}:** ${sensitiveLine.test(s) ? "Sensitive-configuration/data operation; inspect source without copying secret values." : `\`${s.replaceAll("`", "\\`").slice(0, 220)}\``} — ${describeLine(s)}`);
        if (++emitted >= 18) { lines.push("- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries."); break; }
      }
      lines.push("");
    }
  } else lines.push("No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.", "");
  const controls = record.code.split("\n").map((text, index) => ({ text: text.trim(), line: index + 1 })).filter(({ text }) => /^(export\s+)?(const|let|var|class|function)\s/.test(text));
  lines.push("## Module-level declarations", "", ...(controls.length ? controls.slice(0, 80).map(({ text, line }) => `- Line ${line}: \`${sensitiveLine.test(text) ? "<sensitive declaration redacted>" : text.replaceAll("`", "\\`").slice(0, 180)}\`.`) : ["No top-level named declarations detected."]), "");
  const signals = [];
  if (/tenantId|mergeTenantFilter|requireTenantId|runWithTenant/.test(record.code)) signals.push("Tenant-scoping code is present; trace context and filters at every read/write boundary.");
  if (/protect|requireRoles|checkPermission|password|jsonwebtoken|csrf/i.test(record.code)) signals.push("Authentication/authorization-related code is present; review server-side enforcement and secret handling.");
  if (/Payment|MPESA|Stripe|Paypal|callback|webhook/i.test(record.code)) signals.push("Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.");
  if (/multer|upload|file/i.test(record.code)) signals.push("File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.");
  if (/process\.env|import\.meta\.env/.test(record.code)) signals.push("Environment access is present; client build variables are public and server secrets must remain server-side.");
  lines.push("## Security, errors and performance checkpoints", "", ...(signals.length ? signals.map((s) => `- ${s}`) : ["No common security marker was detected statically; this does not prove the module has no security impact."]), "- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.", "", "## How to read this file", "", "The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.");
  await writeFile(outFile, lines.join("\n") + "\n");
}
console.log(`Generated source-specific structural walkthroughs for ${records.length} remaining files; parser failures remain explicitly marked.`);
