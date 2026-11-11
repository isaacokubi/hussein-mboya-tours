/**
 * Purpose: readiness server application module. Main declarations: setStartupPhase, getStartupPhase.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
let phase = "starting";

// Define setStartupPhase; its parameters and body implement this operation.
export function setStartupPhase(nextPhase) {
  // Check the condition (!["starting", "ready", "failed"].includes(nextPhase)) and run the matching branch.
  if (!["starting", "ready", "failed"].includes(nextPhase)) {
    // Stop the current operation by raising a new TypeError instance.
    throw new TypeError(`Invalid startup phase: ${nextPhase}`);
  }
  // Perform the side effect or state update expressed on the following line.
  phase = nextPhase;
}

// Define getStartupPhase; its parameters and body implement this operation.
export function getStartupPhase() {
  // Return the value of phase to the caller.
  return phase;
}
