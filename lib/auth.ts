import { User } from "@/types/user";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "./api-client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const { data } = await apiClient.post<{
            item: { user: User; token: string };
          }>("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          const { user, token } = data.item;
          if (user && token) {
            return {
              ...user,
              accessToken: token,
            };
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error: any) {
          // console.error("Auth error:", error);
          throw new Error(error?.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        Object.assign(token, { user, accessToken: (user as any).accessToken });
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        Object.assign(session, {
          user: token.user,
          accessToken: (token as any).accessToken,
        });
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign in for all users - role checking will be done in components
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
