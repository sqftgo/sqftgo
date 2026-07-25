import "server-only";

import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey } from "@/lib/supabase/env";
import { mapPlatformSettings } from "@/lib/mappers/platform-settings";
import type { PlatformSettings } from "@/types/platform";
import type { PlatformSettingsRow } from "@/types/database";

export async function fetchPlatformSettings(): Promise<PlatformSettings | null> {
  const supabase = hasServiceRoleKey()
    ? createServiceClient()
    : await createClient();

  const { data, error } = await supabase
    .from("platform_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return null;
  return mapPlatformSettings(data as PlatformSettingsRow);
}
