import NextAuth from "next-auth"
import PostgresAdapter from "@auth/pg-adapter"
import pg from "pg"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || "fallback_secret_for_local_dev_only",
  adapter: PostgresAdapter(pool),
  session: {
    strategy: "jwt", // Use JWT to save DB lookups on edge routes, or "database" to strictly use the 'sessions' table
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "Admin Backdoor (Dev Only)",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@career-ops.local" },
        password: { label: "Password", type: "password", placeholder: "career2026" }
      },
      async authorize(credentials) {
        // This is a temporary backdoor for the active user until GH OAuth is configured
        if (credentials.email === "admin@career-ops.local" && credentials.password === "career2026") {
          // Instead of returning ID 1 hardcoded, let's look them up so we respect the DB migration
          const res = await pool.query("SELECT id, name, email FROM users WHERE email = $1", [credentials.email]);
          if (res.rows.length > 0) {
             return { id: res.rows[0].id.toString(), name: res.rows[0].name, email: res.rows[0].email };
          }
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  }
})
