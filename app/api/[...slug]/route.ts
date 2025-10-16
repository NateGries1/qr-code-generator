import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const decodedSlug = decodeURIComponent(slug.join("/"));

  const redirectUrl = new URL("/", req.url);
  redirectUrl.searchParams.set("pathUrl", decodedSlug);
  return NextResponse.redirect(redirectUrl);
}
