/** Persist notification preference toggles per role in localStorage. */

const PREFIX = "sv_notif_prefs_";

export function readNotificationPrefs(
  role: string,
  defaults: Record<string, boolean>
): Record<string, boolean> {
  if (typeof window === "undefined") return { ...defaults };
  try {
    const raw = localStorage.getItem(`${PREFIX}${role}`);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out = { ...defaults };
    for (const key of Object.keys(defaults)) {
      if (typeof parsed[key] === "boolean") out[key] = parsed[key] as boolean;
    }
    return out;
  } catch {
    return { ...defaults };
  }
}

export function writeNotificationPrefs(role: string, prefs: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${PREFIX}${role}`, JSON.stringify(prefs));
  } catch {
    // ignore quota / private mode
  }
}
