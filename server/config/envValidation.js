// List the environment variables without which the server cannot safely start.
export const REQUIRED_ENVIRONMENT_VARIABLES = ["MONGODB_URI", "JWT_SECRET"];

// Validate that every required environment variable has a non-empty value.
export function assertRequiredEnvironment(environment) {
  // Check each required key in turn so the error names the missing setting.
  for (const key of REQUIRED_ENVIRONMENT_VARIABLES) {
    // Fail fast rather than letting database or authentication code fail later.
    if (!environment[key]) throw new Error(`Missing required environment variable: ${key}`);
  }
}
