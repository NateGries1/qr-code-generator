import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { UrlRecord } from "@/types/UrlRecord";
import { QrRecord } from "@/types/QrRecord";
import { generateQRCode } from "@/lib/qrcode";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { originalUrl, path } = await request.json();
    if (path.length > 26) {
      return NextResponse.json(
        { error: "Shortlink is not short :(" },
        { status: 400 }
      );
    }

    const newUrl = "https://cmla.cc/s/" + path;
    const original = originalUrl.includes("http")
      ? originalUrl
      : "https://" + originalUrl;

    try {
      new URL(original);
      new URL(newUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const data: UrlRecord | null = await redis.get(path);
    if (data) {
      return NextResponse.json(
        { error: "Link Already Exists" },
        { status: 401 }
      );
    }

    const svgWithLogo = await generateQRCode(path);

    const payload: QrRecord = {
      original: original,
      new: newUrl,
      qr_code: svgWithLogo,
      created_at: new Date().toISOString(),
      visits: 0,
      last_visited: null,
    };

    await redis.set(path, payload);

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get("pathUrl");

    if (!path) {
      return NextResponse.json({ error: "Missing pathUrl" }, { status: 400 });
    }

    try {
      new URL("https://cmla.cc/s/" + path);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const data: UrlRecord | null = await redis.get(path);
    if (!data) {
      return NextResponse.json(
        { error: "Link Doesn't Exist" },
        { status: 401 }
      );
    }

    const qr_record: QrRecord = {
      ...data,
      qr_code: await generateQRCode(path),
    };

    return NextResponse.json(qr_record, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
