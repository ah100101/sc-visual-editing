import {
  type NextRequest,
  type NextFetchEvent,
  NextResponse,
} from "next/server";
import middleware from "lib/middleware";

// eslint-disable-next-line
export default async function (req: NextRequest, ev: NextFetchEvent) {
  if (new URL(req.url).pathname.startsWith("/api/graphql/v1")) {
    console.log({ req });
    return NextResponse.rewrite(
      new URL("https://edge.sitecorecloud.io/api/graphql/v1")
    );
  }
  return middleware(req, ev);
}

export const config = {
  /*
   * Match all paths except for:
   * 1. /api routes
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. all root files inside /public (e.g. /favicon.ico)
   */
  matcher: ["/", "/((?!api/|_next/|sitecore/api/|-/|[\\w-]+\\.\\w+).*)"],
};
