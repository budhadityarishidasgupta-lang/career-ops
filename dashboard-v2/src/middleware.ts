import { auth } from "@/auth"

// NextAuth middleware protects all routes under matcher
export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/api/auth/signin") {
    // Optionally redirect, but Auth.js built-in pages handle some of this automatically
    // The middleware itself makes `req.auth` available. It will 401 API routes and redirect page routes.
  }
})

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png).*)"],
}
