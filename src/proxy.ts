import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Renova a sessão do Supabase e exige login em todas as rotas, exceto /login. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // getClaims valida o JWT localmente (sem rede) e só renova o token quando expira.
  const { data } = await supabase.auth.getClaims();
  const logged = !!data?.claims;
  const isLogin = request.nextUrl.pathname.startsWith("/login");

  if (!logged && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (logged && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
