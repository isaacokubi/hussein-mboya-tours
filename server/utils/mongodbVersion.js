// Mongoose 8's supported server compatibility includes MongoDB 4.2, which
// also supports the replica-set transactions used by tenant provisioning.
// CI deliberately targets MongoDB 8, but that is not an application minimum.
export const MINIMUM_MONGODB_VERSION = "4.2.0";

export function assertSupportedMongoVersion(version) {
  const match = String(version || "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw Object.assign(new Error(`MongoDB ${MINIMUM_MONGODB_VERSION} or later is required; server version could not be identified.`), {
      code: "UNSUPPORTED_MONGODB_VERSION",
    });
  }
  const [major, minor, patch] = match.slice(1).map(Number);
  if (major < 4 || (major === 4 && minor < 2)) {
    throw Object.assign(new Error(`MongoDB ${MINIMUM_MONGODB_VERSION} or later is required; connected server reports ${major}.${minor}.${patch}.`), {
      code: "UNSUPPORTED_MONGODB_VERSION",
    });
  }
  return true;
}
