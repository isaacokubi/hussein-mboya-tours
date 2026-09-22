import { getTenantContext, requireTenantId } from "./context.js";
export function tenantPlugin(schema){
  schema.__tenantPlugin=true;
  return schema;
}
export function getTenantFilter(){const c=getTenantContext();return c.bypass?{}:{tenantId:requireTenantId()};}
export default tenantPlugin;
