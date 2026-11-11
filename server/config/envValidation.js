/**
 * Purpose: env Validation configuration module. Main declarations: assertRequiredEnvironment.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export const REQUIRED_ENVIRONMENT_VARIABLES = ["MONGODB_URI", "JWT_SECRET"];

// Define assertRequiredEnvironment; its parameters and body implement this operation.
export function assertRequiredEnvironment(environment) {
  // Repeat the enclosed work for each required iteration.
  for (const key of REQUIRED_ENVIRONMENT_VARIABLES) {
    // Check the condition (!environment[key]) and run the matching branch.
    if (!environment[key]) throw new Error(`Missing required environment variable: ${key}`);
  }
}
