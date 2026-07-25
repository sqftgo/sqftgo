import "server-only";

import type { ProfileRow } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type AdminClient = SupabaseClient<Database>;

export async function loadProfilesByIds(
  admin: AdminClient,
  ids: string[]
): Promise<Map<string, Pick<ProfileRow, "id" | "name" | "email" | "role">>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, Pick<ProfileRow, "id" | "name" | "email" | "role">>();
  if (unique.length === 0) return map;
  const { data } = await admin.from("profiles").select("id, name, email, role").in("id", unique);
  for (const row of data ?? []) {
    map.set(row.id, row);
  }
  return map;
}

export function previewBody(body: string, max = 140): string {
  const trimmed = body.trim().replace(/\s+/g, " ");
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}
