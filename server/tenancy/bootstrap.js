import { tenantPlugin } from "./tenantPlugin.js";
const excluded=new Set(["Organization","Permission","Currency"]);
export function applyTenantBootstrap(schema, options={}){const modelName=options?.collection||schema.options?.collection;if(modelName&&!excluded.has(modelName))schema.plugin(tenantPlugin);return schema;}
export default applyTenantBootstrap;
