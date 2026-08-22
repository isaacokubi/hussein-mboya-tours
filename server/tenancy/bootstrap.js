// Tenant bootstrap marker. Tenant-aware schemas import and register the plugin
// explicitly so global registries such as Organization and Permission remain
// outside tenant isolation.
import "./tenantPlugin.js";
