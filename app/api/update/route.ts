import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { UrlRecord } from "@/types/UrlRecord";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    try {
      new URL("cmla.cc/s/" + path);
    } catch {
      return NextResponse.json({ error: "Invalid Path" }, { status: 402 });
    }

    if (!redis) {
      return NextResponse.json(
        { error: "Redis not configured" },
        { status: 401 }
      );
    }

    const data: UrlRecord | null = await redis.get(path);

    data!.visits += 1;
    data!.last_visited = new Date().toISOString();

    await redis.set(path, data);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
