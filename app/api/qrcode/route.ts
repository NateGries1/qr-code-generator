// /app/api/qrcode/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { UrlRecord, QrRecord } from "@/types/UrlRecord";
import { generateQRCode } from "@/lib/qrcode";

export const runtime = "nodejs";

const ALLOWED_ORIGIN = "https://cmla.cc";

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

function withCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return withCorsHeaders(NextResponse.json(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    const { originalUrl, path } = await request.json();

    if (!path || path.length > 26) {
      return withCorsHeaders(
        NextResponse.json(
          { error: "Invalid or too long path" },
          { status: 400 }
        )
      );
    }

    const newUrl = `https://cmla.cc/s/${path}`;
    const original = originalUrl.includes("http")
      ? originalUrl
      : `https://${originalUrl}`;

    try {
      new URL(original);
      new URL(newUrl);
    } catch {
      return withCorsHeaders(
        NextResponse.json({ error: "Invalid URL" }, { status: 400 })
      );
    }

    const existing: UrlRecord | null = await redis.get(path);
    if (existing) {
      return withCorsHeaders(
        NextResponse.json({ error: "Link Already Exists" }, { status: 409 })
      );
    }

    const payload: UrlRecord = {
      original,
      new: newUrl,
      created_at: new Date().toISOString(),
      visits: 0,
      last_visited: null,
    };

    await redis.set(path, payload);

    const svgWithLogo = await generateQRCode(path);

    return withCorsHeaders(
      NextResponse.json({ ...payload, qr_code: svgWithLogo }, { status: 200 })
    );
  } catch (error) {
    return withCorsHeaders(
      NextResponse.json({ error: String(error) }, { status: 500 })
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    const url = new URL(request.url);
    const path = url.searchParams.get("pathUrl");

    if (!path) {
      return withCorsHeaders(
        NextResponse.json({ error: "Missing pathUrl" }, { status: 400 })
      );
    }

    try {
      new URL(`https://cmla.cc/s/${path}`);
    } catch {
      return withCorsHeaders(
        NextResponse.json({ error: "Invalid URL" }, { status: 400 })
      );
    }

    const data: UrlRecord | null = await redis.get(path);
    if (!data) {
      return withCorsHeaders(
        NextResponse.json({ error: "Link Doesn't Exist" }, { status: 404 })
      );
    }

    const qr_record: QrRecord = {
      ...data,
      qr_code: await generateQRCode(path),
    };

    return withCorsHeaders(NextResponse.json(qr_record, { status: 200 }));
  } catch (error) {
    return withCorsHeaders(
      NextResponse.json({ error: String(error) }, { status: 500 })
    );
  }
}
