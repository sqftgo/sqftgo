import { jsonError } from "@/lib/api/auth";

/** Dream inspiration uploads removed with Plan Your Dream. */
export async function POST() {
  return jsonError("Dream inspiration uploads are no longer available.", 410);
}
