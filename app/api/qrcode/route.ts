import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import QRCode from "qrcode";
import { UrlRecord } from "@/types/UrlRecord";

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

    const svgString = await QRCode.toString(newUrl, {
      version: 5,
      type: "svg",
      width: 375,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    });

    const viewBoxMatch = svgString.match(/viewBox="0 0 (\d+) (\d+)"/);
    const widthMatch = svgString.match(/width="(\d+)"/);
    const heightMatch = svgString.match(/height="(\d+)"/);

    const boxWidth = viewBoxMatch
      ? parseFloat(viewBoxMatch[1])
      : widthMatch
      ? parseFloat(widthMatch[1])
      : 256;
    const boxHeight = viewBoxMatch
      ? parseFloat(viewBoxMatch[2])
      : heightMatch
      ? parseFloat(heightMatch[1])
      : 256;

    const logoSize = boxWidth * 0.27;
    const logoX = (boxWidth - logoSize) / 2;
    const logoY = (boxHeight - logoSize) / 2;

    const svg = svgString.replace(
      /<svg([^>]+)>/,
      `<svg$1 preserveAspectRatio="xMidYMid meet">
   <rect width="100%" height="100%" fill="white"/>`
    );

    const logo = `
  <rect x="${logoX - 1}" y="${logoY - 1}" width="${logoSize + 2}" height="${
      logoSize + 2
    }" fill="white" />
  <image
    href="/newlogo.png"
    x="${logoX}"
    y="${logoY}"
    width="${logoSize}"
    height="${logoSize}"
    preserveAspectRatio="xMidYMid meet"
  />
`;

    const svgWithLogo = svg.replace("</svg>", `${logo}</svg>`);

    const payload = {
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
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
