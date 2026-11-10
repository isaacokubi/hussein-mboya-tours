// Documentation helper: compile model schemas without opening a DB connection,
// then emit field/index/reference inventories next to the hand-written guides.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(".."); // Run from the server directory.
const { default: mongoose } = await import(pathToFileURL(path.join(root, "server/node_modules/mongoose/index.js")));

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/documentation_only";
process.env.JWT_SECRET = "documentation-only-secret";

const modelDir = path.join(root, "server/models");
const files = (await readdir(modelDir)).filter((name) => name.endsWith(".js")).sort();
for (const file of files) await import(pathToFileURL(path.join(modelDir, file)));

const scanRoots = ["server", "client/src"].map((p) => path.join(root, p));
const sources = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", "dist"].includes(entry.name)) await walk(target);
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) sources.push(target);
  }
}
for (const dir of scanRoots) await walk(dir);

const show = (value) => {
  if (value === undefined) return "not specified";
  if (typeof value === "function") return `[function: ${value.name || "anonymous"}]`;
  try { return JSON.stringify(value); } catch { return String(value); }
};
const readable = (value) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();
const fieldPurpose = (field) => {
  const leaf = field.split(".").at(-1).replace(/\[\]$/, "");
  const exact = {
    _id: "MongoDB document identity.", tenantId: "Organization scope; tenant-owned reads and writes must match this value.",
    user: "Associated user account.", customer: "Associated customer record or account, as indicated by the schema reference.",
    booking: "Associated tour booking.", tour: "Associated tour catalogue record.", hotel: "Associated hotel record.", roomType: "Associated hotel room type.",
    status: "Current lifecycle state; allowed transitions are enforced by the owning service/controller.", paymentStatus: "Payment lifecycle state; final settlement should follow verified payment evidence.",
    amount: "Monetary amount for this record; currency and accounting meaning depend on the parent workflow.", totalAmount: "Gross amount associated with the record.", amountPaid: "Amount recorded as paid to date.", balance: "Outstanding amount after payments/adjustments.",
    currency: "Currency code for monetary values, usually normalized to uppercase by schema options.", createdAt: "Timestamp automatically recorded when the document is created.", updatedAt: "Timestamp automatically refreshed when the document is updated.",
    createdBy: "User recorded as creating the record.", updatedBy: "User recorded as last updating the record.", email: "Email address/contact identifier; normalization depends on schema options.", phone: "Phone contact value; provider-specific normalization occurs in service code.",
    password: "Authentication secret material; inspect schema selection and hashing hooks. Never expose or log it.", token: "Credential or opaque token; inspect hashing/encryption and expiry behavior. Never expose it.",
    deletedAt: "Soft-delete timestamp when present; query conventions determine visibility.", isDeleted: "Soft-delete visibility flag; callers should exclude deleted records when appropriate.",
    expiresAt: "Expiry time used by the owning workflow; enforcement may be via TTL or application checks.", reference: "Human/provider/business reference used to correlate records; uniqueness depends on declared indexes.",
    transactionId: "Provider or accounting transaction identifier used for reconciliation.", transactionReference: "Reference used to correlate a payment attempt or external transaction.",
  };
  if (exact[leaf]) return exact[leaf];
  if (/At$/.test(leaf) || /Date$/.test(leaf)) return "Date/time for the event named by this path; confirm timezone and transition semantics in callers.";
  if (/^(is|has|can)[A-Z]/.test(leaf)) return "Boolean state/capability flag; its mutation rules are defined by callers.";
  if (/amount|price|cost|fee|tax|rate|balance|total|subtotal|commission|refund/i.test(leaf)) return "Numeric commercial/financial value; confirm currency, rounding, sign and lifecycle in the using service.";
  if (/status|state|stage/i.test(leaf)) return "Lifecycle or processing state; allowed transitions belong to the feature service/controller.";
  if (/email|phone|contact|address/i.test(leaf)) return "Contact or location information; restrict access and avoid exposing it in logs.";
  if (/name|title|description|notes|message|reason|label/i.test(leaf)) return "Human-readable descriptive data for the associated business record.";
  if (/user|customer|booking|tour|hotel|supplier|agent|staff|vehicle|organization|tenant|invoice|payment|account/i.test(leaf)) return "Association/ownership field; inspect the compiled reference metadata and enforce tenant/resource authorization.";
  return `Business field “${readable(leaf)}”; this plain-language role is inferred from its name. Confirm exact semantics in the linked caller and source schema.`;
};
const outDir = path.join(root, "docs/code-explanations/database/models");
await mkdir(outDir, { recursive: true });
const summaries = [];

for (const file of files) {
  const name = file.slice(0, -3);
  const model = mongoose.models[name];
  if (!model) continue;
  const schema = model.schema;
  const fields = Object.entries(schema.paths).map(([field, type]) => {
    const options = type.options || {};
    const details = [`type: ${type.instance || "unknown"}`, `required: ${type.isRequired ? "yes" : "no"}`];
    if (Object.hasOwn(options, "default")) details.push(`default: ${show(type.defaultValue)}`);
    if (type.enumValues?.length) details.push(`allowed values: ${show(type.enumValues)}`);
    if (options.min !== undefined || options.max !== undefined) details.push(`range: ${options.min ?? "−∞"} to ${options.max ?? "∞"}`);
    if (options.minlength !== undefined || options.maxlength !== undefined) details.push(`length: ${options.minlength ?? 0} to ${options.maxlength ?? "unbounded"}`);
    if (options.ref) details.push(`ref: ${options.ref}`);
    if (options.refPath) details.push(`dynamic ref: ${options.refPath}`);
    for (const key of ["index", "unique", "sparse", "immutable"]) if (options[key]) details.push(key);
    if (options.select === false) details.push("excluded from default queries");
    const validators = (type.validators || []).filter((v) => v.type !== "required").map((v) => `${v.type || "custom"}${typeof v.message === "string" ? `: ${v.message}` : ""}`);
    if (validators.length) details.push(`validators: ${validators.join("; ")}`);
    return { field, details: details.join("; "), purpose: fieldPurpose(field) };
  });
  const indexes = schema.indexes().map(([keys, options]) => {
    const keyText = Object.entries(keys).map(([key, value]) => `${key}: ${value}`).join(", ");
    const optionText = Object.entries(options || {}).filter(([key]) => key !== "background").map(([key, value]) => `${key}: ${show(value)}`).join(", ");
    return `{ ${keyText} }${optionText ? ` — ${optionText}` : ""}`;
  });
  const modelSource = path.join(modelDir, file);
  const sourceText = await readFile(modelSource, "utf8");
  const hookNames = [...sourceText.matchAll(/(?:Schema|schema)\.(pre|post)\(\s*["']([^"']+)/g)].map((m) => `${m[1]} ${m[2]}`);
  const methods = [...new Set([...Object.keys(schema.methods || {}), ...Object.keys(schema.statics || {}).map((item) => `static ${item}`), ...Object.keys(schema.virtuals || {}).map((item) => `virtual ${item}`)])];
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const callerPattern = new RegExp(`\\b${escaped}\\.(?:find|findOne|findById|create|updateOne|updateMany|deleteOne|deleteMany|aggregate|countDocuments|insertMany|bulkWrite)\\s*\\(|from\\s+["'][^"']*${escaped}\\.js["']`);
  const callers = [];
  for (const source of sources) {
    if (source === modelSource) continue;
    const text = await readFile(source, "utf8");
    if (callerPattern.test(text)) callers.push(path.relative(root, source));
    if (callers.length >= 15) break;
  }

  const lines = [
    `# ${name} model`, "",
    `**Source:** [server/models/${file}](../../../../server/models/${file})`, "",
    "## Purpose", "",
    `This Mongoose model persists the ${readable(name)} domain record. This domain label is inferred from the model name and schema; the exact business lifecycle should be read with the callers below. MongoDB references are application-managed associations, not relational foreign keys.`, "",
    "## Fields", "",
    "The table is derived from the compiled Mongoose schema. Required/default/validator metadata is therefore what the runtime model exposes. Optional schema fields can still be mandatory in a controller workflow. Mixed values may contain dynamic keys that cannot be enumerated. Persistence validation does not replace authorization or business validation.", "",
    "| Path | Purpose | Compiled type and constraints |", "|---|---|---|",
    ...fields.map(({ field, details, purpose }) => `| \`${field}\` | ${purpose.replaceAll("|", "\\|")} | ${details.replaceAll("|", "\\|")} |`), "",
    "## Indexes", "",
    ...(indexes.length ? indexes.map((index) => `- \`${index.replaceAll("`", "\\`")}\``) : ["No schema-declared indexes were exposed by the compiled schema. The deployed database may still have indexes created separately; verify before relying on them."]), "",
    "## Relationships and tenant boundary", "",
  ];
  const refs = fields.filter(({ details }) => details.includes("ref:"));
  if (refs.length) lines.push(...refs.map(({ field, details }) => `- \`${field}\`: ${details.split(";").find((item) => item.includes("ref:"))}. Callers must scope and authorize referenced records.`));
  else lines.push("No explicit Mongoose `ref` or `refPath` was exposed by the compiled paths.");
  const tenant = fields.find(({ field }) => field === "tenantId" || field.startsWith("tenantId."));
  lines.push(tenant ? `The schema includes tenant ownership metadata at \`${tenant.field}\`. Preserve tenant scope in reads, writes, raw queries, aggregates, and background work.` : "No top-level tenantId path was found. This does not prove global accessibility; inspect ownership and embedding rules in callers.");
  lines.push("", "## Lifecycle and derived behavior", "", `Schema timestamps: ${schema.options.timestamps ? "enabled" : "not enabled"}; version key: \`${schema.options.versionKey}\`.`);
  lines.push(hookNames.length ? `Source declarations include hooks: ${hookNames.map((item) => `\`${item}\``).join(", ")}.` : "No pre/post hook declaration was detected by the source scan.");
  lines.push(methods.length ? `Compiled methods, statics, and virtuals: ${methods.map((item) => `\`${item}\``).join(", ")}.` : "No schema methods, statics, or virtuals were exposed.");
  lines.push("The model source is authoritative for hook bodies and side effects. Bulk operations may bypass document middleware.", "", "## Application use", "");
  if (callers.length) lines.push("Static scanning found these direct imports or model operations:", ...callers.map((caller) => `- [\`${caller}\`](../../../../${caller})`));
  else lines.push("No direct import/query caller was found by the static scan. The model may be dynamically referenced, populated, or unused; confirm with repository search before claiming active use.");
  lines.push("", "## Validation and security", "", "Before changing this schema, inspect route/controller/service validation, tenant plugins, migrations, query patterns, indexes in the target database, and external payload consumers. Apply least-privilege access and safe logging/retention when fields contain customer, payment, authentication, or operational data.");
  await writeFile(path.join(outDir, `${name}.md`), lines.join("\n") + "\n");
  summaries.push({ name, fields: fields.length, indexes: indexes.length });
}

const index = ["# Database model explanation index", "", "These pages are generated by compiling all first-party Mongoose model files in a documentation-only process; the helper sets placeholder environment values and does not open a database connection. Field metadata comes from runtime schemas. Purpose/security prose and caller scan are aids; verify lifecycle behavior in the linked source.", "", "| Model | Paths | Indexes | Explanation |", "|---|---:|---:|---|"];
for (const model of summaries) index.push(`| \`${model.name}\` | ${model.fields} | ${model.indexes} | [${model.name}](${model.name}.md) |`);
await writeFile(path.join(outDir, "INDEX.md"), index.join("\n") + "\n");
console.log(`Generated ${summaries.length} model explanations.`);
