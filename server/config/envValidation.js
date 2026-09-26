export const REQUIRED_ENVIRONMENT_VARIABLES = ["MONGODB_URI", "JWT_SECRET"];

export function assertRequiredEnvironment(environment) {
  for (const key of REQUIRED_ENVIRONMENT_VARIABLES) {
    if (!environment[key]) throw new Error(`Missing required environment variable: ${key}`);
  }
}
