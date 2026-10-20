// Start in a non-ready state so health checks cannot claim success before initialization.
let phase = "starting";

// Update the server startup phase after initialization steps complete or fail.
export function setStartupPhase(nextPhase) {
  // Accept only the lifecycle states that health checks know how to report.
  if (!["starting", "ready", "failed"].includes(nextPhase)) {
    // Throw a programming/configuration error for unexpected phase names.
    throw new TypeError(`Invalid startup phase: ${nextPhase}`);
  }
  // Save the validated phase for health/readiness endpoints to read.
  phase = nextPhase;
}

// Return the current startup phase without exposing mutable state directly.
export function getStartupPhase() {
  return phase; // The caller uses this to determine whether startup is complete.
}
