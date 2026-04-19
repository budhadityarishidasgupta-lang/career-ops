import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname === "/login"

  if (isLoginPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", req.nextUrl))
    }
    return undefined; // Do nothing, let them access login
  }

  if (!isLoggedIn) {
     return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png).*)"],
}
