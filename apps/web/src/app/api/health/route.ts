import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "nucleus-web",
    timestamp: new Date().toISOString(),
    version: process.env["npm_package_version"] ?? "0.0.1",
  });
}
