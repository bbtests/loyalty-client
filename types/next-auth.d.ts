import type { DefaultSession } from "next-auth";
import { User } from "./user";

declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"];
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    first_name: string;
    last_name: string;
    accessToken: string;
  }
}
