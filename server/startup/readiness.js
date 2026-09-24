let phase = "starting";

export function setStartupPhase(nextPhase) {
  if (!["starting", "ready", "failed"].includes(nextPhase)) {
    throw new TypeError(`Invalid startup phase: ${nextPhase}`);
  }
  phase = nextPhase;
}

export function getStartupPhase() {
  return phase;
}
