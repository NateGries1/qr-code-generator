import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { UrlRecord } from "@/types/UrlRecord";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const decodedSlug = decodeURIComponent(slug.join("/"));

  const data: UrlRecord | null = await redis.get(decodedSlug);

  if (data && data.original) {
    return NextResponse.redirect(data.original);
  } else {
    const url = new URL("/", req.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("pathUrl", decodedSlug);
    return NextResponse.redirect(url);
  }
}
