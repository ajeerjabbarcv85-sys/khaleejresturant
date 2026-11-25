import { NextRequest, NextResponse } from "next/server";

const SCRIPT_URL = process.env.APPS_SCRIPT_URL;

export const dynamic = "force-dynamic";

function upstreamUrl(request: NextRequest): string {
  if (!SCRIPT_URL) {
    throw new Error("APPS_SCRIPT_URL is not configured");
  }

  const url = new URL(SCRIPT_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

async function send(
  request: NextRequest,
  init?: RequestInit
): Promise<NextResponse> {
  try {
    const response = await fetch(upstreamUrl(request), {
      ...init,
      redirect: "follow",
      cache: "no-store",
    });

    const text = await response.text();

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "The Apps Script did not return JSON. Check the deployment settings."
      );
    }

    return NextResponse.json(data, {
      status: response.ok ? 200 : 502,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upstream request failed",
      },
      { status: 502 }
    );
  }
}

export function GET(request: NextRequest) {
  return send(request, { method: "GET" });
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  return send(request, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
