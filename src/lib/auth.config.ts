// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NextAuthConfig = any;
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Simple auth — accept any login in dev
        if (credentials?.email) {
          return {
            id: "1",
            email: credentials.email as string,
            name: "Admin",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
