import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const MODEL_DIR = path.resolve(process.cwd(), "models");

const isModel = (value) => Boolean(value?.modelName && value?.schema && value?.collection);

async function loadModels() {
  const entries = await fs.readdir(MODEL_DIR, { withFileTypes: true });
  const models = [];
  for (const entry of entries.filter((item) => item.isFile() && item.name.endsWith(".js"))) {
    try {
      const module = await import(pathToFileURL(path.join(MODEL_DIR, entry.name)).href);
      if (isModel(module.default)) models.push(module.default);
      for (const value of Object.values(module)) if (isModel(value) && !models.includes(value)) models.push(value);
    } catch (error) {
      console.warn(`SCHEMA_IMPORT_SKIPPED ${entry.name}: ${error.message}`);
    }
  }
  return models;
}

function keySignature(key) {
  return JSON.stringify(Object.entries(key || {}).sort(([a], [b]) => a.localeCompare(b)));
}

async function main() {
  const models = await loadModels();
  const issues = [];
  for (const model of models) {
    const seen = new Map();
    for (const [key, options] of model.schema.indexes()) {
      const signature = keySignature(key);
      const prior = seen.get(signature);
      if (prior) {
        issues.push({
          model: model.modelName,
          index: signature,
          firstOptions: prior,
          duplicateOptions: options || {},
        });
      } else {
        seen.set(signature, options || {});
      }
    }
  }

  console.log(JSON.stringify({ success: issues.length === 0, modelsChecked: models.length, duplicateIndexDefinitions: issues }, null, 2));
  if (issues.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Schema integrity check failed: ${error.message}`);
  process.exitCode = 1;
});
