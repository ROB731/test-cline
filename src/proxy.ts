import { NextResponse, type NextRequest } from "next/server";

/**
 * Protection de premier niveau : redirige vers la connexion si aucun cookie
 * de session n'est présent. La validation réelle (session en base, expiration)
 * est faite côté serveur dans requireMerchant().
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("vitrine_session");
  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  const target = `${url.pathname}${url.search}`;
  url.pathname = "/connexion";
  url.search = "";
  url.searchParams.set("next", target);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/tableau-de-bord/:path*"],
};
