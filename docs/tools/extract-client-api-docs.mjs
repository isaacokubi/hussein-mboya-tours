// Emits dedicated explanations for the thin client API modules.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(".."); // Run from the repository's client directory.
const parserPath = path.join(root, "client/node_modules/@babel/parser/lib/index.js");
const { parse } = await import(pathToFileURL(parserPath));
const apiRoot = path.join(root, "client/src/api");
const outRoot = path.join(root, "docs/code-explanations/frontend/api-modules");
await mkdir(outRoot, { recursive: true });
const sourceFiles = [];
async function walk(dir) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(file);
    else if (ent.name.endsWith(".js")) sourceFiles.push(file);
  }
}
await walk(apiRoot);
const clientFiles = [];
async function walkClient(dir) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) { if (ent.name !== "node_modules") await walkClient(file); }
    else if (/\.(js|jsx)$/.test(ent.name)) clientFiles.push(file);
  }
}
await walkClient(path.join(root, "client/src"));
const exportsFor = (ast) => {
  const items = [];
  for (const node of ast.program.body) {
    if (node.type !== "ExportNamedDeclaration") continue;
    const decl = node.declaration;
    if (decl?.type === "VariableDeclaration") for (const d of decl.declarations) if (d.id.type === "Identifier") items.push({ name: d.id.name, node: d.init || d });
    if (decl?.type === "FunctionDeclaration") items.push({ name: decl.id?.name || "default function", node: decl });
  }
  return items;
};
const callsWithin = (node, code) => {
  const calls = [];
  function visit(item) {
    if (!item || typeof item !== "object") return;
    if (item.type === "CallExpression" && item.callee?.type === "MemberExpression" && item.callee.object?.type === "Identifier" && item.callee.object.name === "api") {
      const method = item.callee.property?.name || item.callee.property?.value || "request";
      const arg = item.arguments?.[0];
      let target = "dynamic URL";
      if (arg?.type === "StringLiteral") target = arg.value;
      if (arg?.type === "TemplateLiteral") target = arg.quasis.map((q, i) => q.value.raw + (arg.expressions[i] ? "${…}" : "")).join("");
      calls.push(`${String(method).toUpperCase()} ${target}`);
    }
    for (const [key, value] of Object.entries(item)) {
      if (["loc", "start", "end", "leadingComments", "trailingComments", "innerComments"].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(visit); else if (value && typeof value === "object") visit(value);
    }
  }
  visit(node);
  return [...new Set(calls)];
};
let written = 0;
for (const file of sourceFiles.sort()) {
  const code = await readFile(file, "utf8");
  let ast;
  try { ast = parse(code, { sourceType: "module", plugins: ["jsx"] }); }
  catch (error) { console.warn(`Skipped unparsable API module ${file}: ${error.message}`); continue; }
  const relative = path.relative(root, file);
  const exports = exportsFor(ast);
  const imports = [...code.matchAll(/^import\s+(.+?)\s+from\s+["']([^"']+)["'];?/gm)].map((m) => `- ${m[1].trim()} from ${m[2]}`);
  const functionSections = [];
  for (const entry of exports) {
    const codePart = code.slice(entry.node.start, entry.node.end);
    const calls = callsWithin(entry.node, code);
    const line = entry.node.loc?.start.line || 1;
    const behaviors = [];
    if (calls.length) behaviors.push(`Calls: ${calls.map((v) => `\`${v}\``).join(", ")}.`);
    if (/\.data\?\.data\s*\?\?/.test(codePart)) behaviors.push("Unwraps nested response data with fallback behavior.");
    else if (/\.data\b/.test(codePart)) behaviors.push("Returns/destructures Axios response data rather than exposing the full transport response.");
    if (/try\s*\{/.test(codePart)) behaviors.push("Contains local try/catch behavior; read the catch branch below to see fallback/error policy.");
    else behaviors.push("No local catch is present, so Axios rejection propagates to the calling hook/component.");
    if (/params\s*:/.test(codePart) || /params\s*=/.test(codePart)) behaviors.push("Passes query parameters from the caller into Axios config.");
    if (/FormData|multipart\/form-data/.test(codePart)) behaviors.push("Supports multipart form payload handling for uploads.");
    functionSections.push([`### \`${entry.name}\` (source line ${line})`, "", `\`${codePart.split("\n")[0].trim()}\``, "", behaviors.join(" ") || "This export is a local helper/alias; its implementation is shown in the source excerpt below."].join("\n"));
  }
  const symbolNames = exports.map((e) => e.name);
  const callers = [];
  for (const candidate of clientFiles) {
    if (candidate === file) continue;
    const text = await readFile(candidate, "utf8");
    if (symbolNames.some((name) => new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text))) callers.push(path.relative(root, candidate));
    if (callers.length >= 12) break;
  }
  const title = path.basename(file, ".js");
  const doc = [
    `# Client API module: \`${relative}\``, "",
    `**Source:** [${relative}](../../../../${relative})`, "",
    "## Responsibility", "",
    `This module is the client-side transport boundary for the ${title.replace(/Api$/i, "").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()} feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.`, "",
    "## Imports", "", ...(imports.length ? imports : ["- No imports detected."]), "",
    "The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.", "",
    "## Exported operations", "", ...(functionSections.length ? functionSections : ["No named function export was extracted; inspect source for default/object exports."]), "",
    "## Callers", "", ...(callers.length ? callers.map((caller) => `- [\`${caller}\`](../../../../${caller})`) : ["No static caller was detected by symbol search; it may be used dynamically or currently unused."]), "",
    "## Runtime and failure behavior", "",
    "An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.", "",
    "## Source excerpt", "", "```js", code.trimEnd(), "```", "",
    "## Security and maintenance notes", "",
    "Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.", "",
  ].join("\n");
  await writeFile(path.join(outRoot, `${path.relative(apiRoot, file).replaceAll(path.sep, "_").replace(/\.js$/, "")}.md`), doc);
  written++;
}
console.log(`Generated ${written} client API module explanations.`);
