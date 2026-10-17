import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/openapi/spec";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(openApiSpec);
}
