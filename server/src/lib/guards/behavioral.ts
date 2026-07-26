/**
 * L10: Behavioral Guard
 * 
 * Tracks threat incidents in-memory per Workspace ID.
 * Triggers artificial latency (shadow ban) and HTTP 403 (hard ban) upon abuse.
 */

interface ThreatState {
  count: number;
  lastIncidentAt: number;
}

// In-memory state (resets on server restart)
const threatMap = new Map<string, ThreatState>();

const SHADOW_BAN_THRESHOLD = 3;
const HARD_BAN_THRESHOLD = 10;
const BAN_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

// Cleans up old state periodically
setInterval(() => {
  const now = Date.now();
  for (const [workspaceId, state] of threatMap.entries()) {
    if (now - state.lastIncidentAt > BAN_WINDOW_MS) {
      threatMap.delete(workspaceId);
    }
  }
}, 5 * 60 * 1000).unref(); // Runs every 5 mins

export function recordThreat(workspaceId: string): void {
  if (!workspaceId) return;

  const now = Date.now();
  const state = threatMap.get(workspaceId);

  if (!state) {
    threatMap.set(workspaceId, { count: 1, lastIncidentAt: now });
  } else {
    // Reset count if outside the ban window
    if (now - state.lastIncidentAt > BAN_WINDOW_MS) {
      state.count = 1;
    } else {
      state.count += 1;
    }
    state.lastIncidentAt = now;
  }
}

export async function checkBehavioralBan(workspaceId: string): Promise<{ blocked: boolean; reason?: string }> {
  if (!workspaceId) return { blocked: false };

  const state = threatMap.get(workspaceId);
  if (!state) return { blocked: false };

  // If outside ban window, let them pass
  if (Date.now() - state.lastIncidentAt > BAN_WINDOW_MS) {
    return { blocked: false };
  }

  // Hard Ban
  if (state.count >= HARD_BAN_THRESHOLD) {
    return { 
      blocked: true, 
      reason: '[AdminZero L10 Guard] HARD BAN ACTIVE: Excessive malicious queries detected from this workspace. Access revoked for 1 hour.' 
    };
  }

  // Shadow Ban (Artificial Delay to frustrate brute-force scanners)
  if (state.count >= SHADOW_BAN_THRESHOLD) {
    // Add artificial delay (e.g. 2000ms)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return { blocked: false };
}
