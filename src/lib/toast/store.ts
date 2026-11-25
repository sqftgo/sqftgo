import type { CSSProperties } from "react";
import hotToast from "react-hot-toast";

export type ToastTone = "success" | "danger" | "warning" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  createdAt: number;
  durationMs: number;
};

const DEFAULT_DURATION_MS = 4200;

function formatMessage(title: string, description?: string) {
  const t = title.trim() || "Notice";
  const d = description?.trim();
  return d ? `${t}\n${d}` : t;
}

function toneStyle(tone: ToastTone): CSSProperties {
  switch (tone) {
    case "success":
      return {
        background: "#ecfdf5",
        color: "#065f46",
        border: "1px solid #a7f3d0",
      };
    case "warning":
      return {
        background: "#fffbeb",
        color: "#92400e",
        border: "1px solid #fde68a",
      };
    case "danger":
      return {
        background: "#fff1f2",
        color: "#9f1239",
        border: "1px solid #fecdd3",
      };
    default:
      return {
        background: "#ffffff",
        color: "#1e1b4b",
        border: "1px solid rgba(99, 102, 241, 0.2)",
      };
  }
}

/** Push a toast via react-hot-toast (keeps existing app API). */
export function pushToast(input: {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
}): string {
  const tone = input.tone ?? "info";
  const durationMs = input.durationMs ?? DEFAULT_DURATION_MS;
  const message = formatMessage(input.title, input.description);
  const style = toneStyle(tone);

  const id =
    tone === "success"
      ? hotToast.success(message, { duration: durationMs, style })
      : tone === "danger"
        ? hotToast.error(message, { duration: durationMs, style })
        : hotToast(message, {
            duration: durationMs,
            style,
          });

  return String(id);
}

export function dismissToast(id: string) {
  hotToast.dismiss(id);
}

/** @deprecated Prefer toast.* — kept for any leftover imports */
export function getToasts(): ToastItem[] {
  return [];
}

/** @deprecated No-op — react-hot-toast owns subscription */
export function subscribeToasts(_listener: () => void): () => void {
  return () => {};
}

export const toast = {
  show: pushToast,
  success: (title: string, description?: string) =>
    pushToast({ title, description, tone: "success" }),
  error: (title: string, description?: string) =>
    pushToast({ title, description, tone: "danger" }),
  warning: (title: string, description?: string) =>
    pushToast({ title, description, tone: "warning" }),
  info: (title: string, description?: string) =>
    pushToast({ title, description, tone: "info" }),
  dismiss: dismissToast,
};
