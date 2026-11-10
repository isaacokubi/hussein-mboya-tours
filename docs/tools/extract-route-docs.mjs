// Extract exact Express route call expressions and observed mount points.
// Run from repository root; this never starts Express or connects to a DB.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = process.cwd();
const { parse } = await import(pathToFileURL(path.join(root, "client/node_modules/@babel/parser/lib/index.js")));
const routesDir = path.join(root, "server/routes");
const routeFiles = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file); else if (entry.name.endsWith(".js")) routeFiles.push(file);
  }
}
await walk(routesDir);
const imports = new Map();
const indexPath = path.join(routesDir, "index.js");
const indexSource = await readFile(indexPath, "utf8");
for (const match of indexSource.matchAll(/import\s+(\w+)\s+from\s+["']\.\/([^"']+)["']/g)) imports.set(match[1], path.join(routesDir, match[2]));
const mounts = new Map();
const addMount = (target, prefix) => { if (!mounts.has(target)) mounts.set(target, []); mounts.get(target).push(prefix); };
for (const match of indexSource.matchAll(/router\.use\(\s*(["'])(.*?)\1\s*,\s*(\w+)/g)) {
  const prefix = match[2], symbol = match[3], target = imports.get(symbol);
  if (target) addMount(path.resolve(target), `/api${prefix === "/" ? "" : prefix}` || "/api");
}
const appSource = await readFile(path.join(root, "server/app.js"), "utf8");
for (const match of appSource.matchAll(/import\s+(\w+)\s+from\s+["']\.\/(routes\/[^"']+)["']/g)) {
  const symbol = match[1], target = path.resolve(root, "server", match[2]);
  const mountMatch = new RegExp(`app\\.use\\(\\s*(["'])(.*?)\\1\\s*,\\s*${symbol}\\b`).exec(appSource);
  if (mountMatch) addMount(target, mountMatch[2]);
}
const routeMethodNames = new Set(["get", "post", "put", "patch", "delete", "all"]);
const handlerCache = new Map();
async function getHandlerDetails(file, symbol) {
  const key = `${file}:${symbol}`;
  if (handlerCache.has(key)) return handlerCache.get(key);
  if (!file || !file.startsWith(path.join(root, "server/controllers"))) return null;
  try {
    const source = await readFile(file, "utf8");
    const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
    let fn = null;
    for (const item of ast.program.body) {
      const d = item.type === "ExportNamedDeclaration" ? item.declaration : null;
      if (d?.type === "FunctionDeclaration" && d.id?.name === symbol) fn = d;
      if (d?.type === "VariableDeclaration") for (const decl of d.declarations) if (decl.id?.name === symbol && ["ArrowFunctionExpression", "FunctionExpression"].includes(decl.init?.type)) fn = decl.init;
    }
    if (!fn) { handlerCache.set(key, null); return null; }
    const code = source.slice(fn.start, fn.end);
    const bodyKeys = new Set([...code.matchAll(/req\.body\??\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
    const params = new Set([...code.matchAll(/req\.params\??\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
    const query = new Set([...code.matchAll(/req\.query\??\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
    const requestAliases = new Map();
    const matchesRequest = (node, prop) => node?.type === "MemberExpression" && node.object?.type === "Identifier" && node.object.name === "req" && (node.property?.name || node.property?.value) === prop;
    function inspectInputs(node) {
      if (!node || typeof node !== "object") return;
      if (node.type === "VariableDeclarator") {
        if (matchesRequest(node.init, "body") && node.id?.type === "Identifier") requestAliases.set(node.id.name, "body");
        const init = node.init?.type === "LogicalExpression" ? node.init.left : node.init;
        if (matchesRequest(init, "body") && node.id?.type === "ObjectPattern") for (const item of node.id.properties) if (item.key?.name) bodyKeys.add(item.key.name);
        if (matchesRequest(init, "params") && node.id?.type === "ObjectPattern") for (const item of node.id.properties) if (item.key?.name) params.add(item.key.name);
        if (matchesRequest(init, "query") && node.id?.type === "ObjectPattern") for (const item of node.id.properties) if (item.key?.name) query.add(item.key.name);
      }
      for (const [childKey, child] of Object.entries(node)) {
        if (["loc", "start", "end", "leadingComments", "trailingComments", "innerComments"].includes(childKey)) continue;
        if (Array.isArray(child)) child.forEach(inspectInputs); else if (child && typeof child === "object") inspectInputs(child);
      }
    }
    inspectInputs(fn);
    for (const alias of requestAliases.keys()) for (const match of code.matchAll(new RegExp(`\\b${alias}\\??\\.([A-Za-z_$][\\w$]*)`, "g"))) bodyKeys.add(match[1]);
    const statusCodes = [...new Set([...code.matchAll(/res\.status\(\s*(\d{3})\s*\)/g)].map((m) => m[1]))];
    const responseKeys = new Set([...code.matchAll(/\.json\(\s*\{([^{}]*)\}/gs)].flatMap((m) => [...m[1].matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*:/g)].map((x) => x[1])));
    const messages = [...new Set([...code.matchAll(/message\s*:\s*["']([^"']{1,180})["']/g)].map((m) => m[1]))].slice(0, 12);
    const dbOps = [...new Set([...code.matchAll(/\b([A-Z][A-Za-z0-9_$]*)\.(find|findOne|findById|findByIdAndUpdate|findOneAndUpdate|create|updateOne|updateMany|deleteOne|deleteMany|aggregate|countDocuments|save|bulkWrite)\s*\(/g)].map((m) => `${m[1]}.${m[2]}`))];
    const services = [...new Set([...code.matchAll(/\b(await\s+)?([a-z][A-Za-z0-9_$]*)\s*\(/g)].map((m) => m[2]).filter((name) => !["if", "for", "while", "switch", "catch", "return", "next", "res", "requireTenantId"].includes(name)))].slice(0, 24);
    const validationLines = code.split('\n').map((line, index) => ({ line: (fn.loc?.start.line || 1) + index, text: line.trim() })).filter((x) => /req\.(body|params|query)|res\.status\((400|401|403|404|409|422)\)|throw new/.test(x.text)).slice(0, 12);
    const details = { source, line: fn.loc?.start.line || 1, bodyKeys: [...bodyKeys], params: [...params], query: [...query], statusCodes, responseKeys: [...responseKeys], messages, dbOps, services, validationLines };
    handlerCache.set(key, details);
    return details;
  } catch { handlerCache.set(key, null); return null; }
}
const identifierNames = (node) => {
  const found = [];
  function visit(value, parent = null, key = "") {
    if (!value || typeof value !== "object") return;
    if (value.type === "Identifier" && !(parent?.type === "ArrowFunctionExpression" && parent.params.includes(value)) && key !== "key") found.push(value.name);
    for (const [childKey, child] of Object.entries(value)) {
      if (["loc", "start", "end", "leadingComments", "trailingComments", "innerComments"].includes(childKey)) continue;
      if (Array.isArray(child)) child.forEach((item) => visit(item, value, childKey)); else if (child && typeof child === "object") visit(child, value, childKey);
    }
  }
  visit(node);
  return [...new Set(found)];
};
const declarations = [];
for (const file of routeFiles.filter((item) => !item.endsWith("/index.js")).sort()) {
  const source = await readFile(file, "utf8");
  let ast;
  try { ast = parse(source, { sourceType: "module" }); } catch (error) { console.warn(`Cannot parse ${file}: ${error.message}`); continue; }
  const localImports = new Map();
  for (const node of ast.program.body) if (node.type === "ImportDeclaration") {
    for (const spec of node.specifiers) localImports.set(spec.local.name, node.source.value.startsWith(".") ? path.resolve(path.dirname(file), node.source.value) : `npm:${node.source.value}`);
  }
  const routes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "CallExpression" && node.callee?.type === "MemberExpression" && node.callee.object?.name === "router" && routeMethodNames.has(node.callee.property?.name)) {
      const arg = node.arguments[0];
      const routePath = arg?.type === "StringLiteral" || arg?.type === "TemplateLiteral" && arg.expressions.length === 0 ? (arg.value ?? arg.quasis[0].value.raw) : null;
      if (routePath !== null) {
        const handlers = node.arguments.slice(1).flatMap((part) => part.type === "Identifier" ? [part.name] : part.type === "CallExpression" && part.callee.type === "Identifier" ? [part.callee.name] : []);
        const prefixes = [...new Set(mounts.get(path.resolve(file)) || [])];
        const urls = prefixes.map((prefix) => routePath === "/" ? (prefix || "/") : `${prefix.replace(/\/$/, "")}/${routePath.replace(/^\//, "")}`);
        routes.push({ method: node.callee.property.name.toUpperCase(), routePath, line: node.loc.start.line, code: source.slice(node.start, node.end), handlers, imports: localImports, urls });
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (["loc", "start", "end", "leadingComments", "trailingComments", "innerComments"].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(visit); else if (value && typeof value === "object") visit(value);
    }
  }
  visit(ast.program);
  if (!routes.length) continue;
  const routerWide = [];
  for (const node of ast.program.body) if (node.type === "ExpressionStatement" && node.expression?.type === "CallExpression" && node.expression.callee?.object?.name === "router" && node.expression.callee.property?.name === "use") routerWide.push(source.slice(node.start, node.end));
  declarations.push({ file, routes, routerWide });
}
const outputDir = path.join(root, "docs/code-explanations/backend/routes");
await mkdir(outputDir, { recursive: true });
for (const module of declarations) {
  const sourceRel = path.relative(root, module.file);
  const prefixes = [...new Set(module.routes.flatMap((route) => route.urls.map((url) => url.split(route.routePath === "/" ? "" : route.routePath)[0])))];
  const lines = [`# Route module: ${path.basename(module.file)}`, "", `**Source:** [${sourceRel}](../../../../${sourceRel})`, "", module.routes.some((route) => route.urls.length) ? `Observed mount prefixes include ${[...new Set(module.routes.flatMap((route) => route.urls))].map((url) => `\`${url}\``).join(", ")}.` : "No observed mount was found in the main API or app setup; the declarations are not assumed reachable.", "", "## Router-wide middleware", "", ...(module.routerWide.length ? module.routerWide.map((code) => `- \`${code.replaceAll("`", "\\`")}\``) : ["No router.use declaration was found at module scope."]), "", "Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.", "", "## Route contracts", ""];
  for (const route of module.routes) {
    const handlers = route.handlers.filter((name) => !["req", "res", "next"].includes(name));
    const links = handlers.filter((name) => route.imports.has(name)).map((name) => ({ name, target: route.imports.get(name) }));
    lines.push(`### ${route.method} ${route.routePath}${route.urls.length ? ` → ${route.urls.map((url) => `\`${url}\``).join(", ")}` : " (unmounted declaration)"}`, "", `Declared at source line ${route.line}. Route handler pipeline names: ${handlers.length ? handlers.map((name) => `\`${name}\``).join(", ") : "inline callback"}.`, "", "```js", route.code, "```", "");
    for (const link of links) {
      const rel = typeof link.target === "string" && link.target.startsWith("npm:") ? link.target : path.relative(root, link.target);
      const externalName = rel.startsWith("npm:") ? rel.slice(4) : path.basename(link.target);
      lines.push(`- Imported handler/middleware \`${link.name}\`: ${rel.startsWith("server/") ? `[${path.basename(link.target)}](../../../../${rel})` : `external dependency \`${externalName}\``}`);
    }
    if (links.length) lines.push("");
    const hasAuth = handlers.some((name) => /protect|adminOnly|customerOnly|managerOnly|agentOnly|guideOnly|driverOnly|requireRoles|checkPermission|permission/i.test(name)) || module.routerWide.some((code) => /protect|auth/i.test(code));
    lines.push(`**Authentication/authorization:** ${hasAuth ? "the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation." : "no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public."}`, "");
    for (const link of links.filter((item) => path.basename(path.dirname(item.target)) === "controllers")) {
      const details = await getHandlerDetails(link.target, link.name);
      if (!details) continue;
      lines.push(`#### Extracted contract cues for \`${link.name}\``, "", `Handler starts at [controller line ${details.line}](../../../../${path.relative(root, link.target)}#L${details.line}). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.` , "");
      lines.push(`- Request body properties read: ${details.bodyKeys.length ? details.bodyKeys.map((v) => `\`${v}\``).join(", ") : "none detected by direct property/destructuring scan"}.`);
      lines.push(`- Path parameters read: ${details.params.length ? details.params.map((v) => `\`${v}\``).join(", ") : "none detected"}; query parameters read: ${details.query.length ? details.query.map((v) => `\`${v}\``).join(", ") : "none detected"}.`);
      lines.push(`- Literal HTTP statuses in handler: ${details.statusCodes.length ? details.statusCodes.map((v) => `\`${v}\``).join(", ") : "no literal status code detected; Express default or delegated error handler may apply"}.`);
      lines.push(`- JSON envelope keys observed: ${details.responseKeys.length ? details.responseKeys.map((v) => `\`${v}\``).join(", ") : "response shape is dynamic or not a literal object"}.`);
      if (details.messages.length) lines.push(`- Literal messages include: ${details.messages.map((v) => `“${v}”`).join("; ")}.`);
      lines.push(`- Database operations detected: ${details.dbOps.length ? details.dbOps.map((v) => `\`${v}\``).join(", ") : "none directly detected (may be delegated to service/helper)"}.`);
      if (details.validationLines.length) lines.push("- Input/validation source lines to inspect:", ...details.validationLines.map((v) => `  - [Line ${v.line}](../../../../${path.relative(root, link.target)}#L${v.line}): \`${v.text.replaceAll("`", "\\`").slice(0, 170)}\``));
      lines.push("", "Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.", "");
    }
    lines.push("**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.", "", "**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.", "", "```bash");
    const curlPath = (route.urls[0] || route.routePath).replace(/:([A-Za-z0-9_]+)/g, "<$1>");
    lines.push(`curl -i -X ${route.method} 'http://localhost:5000${curlPath}'`, "```", "");
  }
  await writeFile(path.join(outputDir, `${path.basename(module.file, ".js")}.md`), lines.join("\n") + "\n");
}
console.log(`Generated exact route declaration notes for ${declarations.length} route modules.`);
