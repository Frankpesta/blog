import { ConvexHttpClient } from "convex/browser";
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (!isAdminRoute(request)) {
      return;
    }
    if (!(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
    const token = await convexAuth.getToken();
    if (!token) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
    const client = new ConvexHttpClient(url);
    client.setAuth(token);
    const isAdmin = await client.query(api.users.checkIsAdmin, {});
    if (!isAdmin) {
      return nextjsMiddlewareRedirect(request, "/");
    }
  },
  {
    cookieConfig: { maxAge: 60 * 60 * 24 * 30 },
  },
);

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
