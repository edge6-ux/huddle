import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  trustedOrigins: [process.env.CLIENT_URL ?? "http://localhost:5173"],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    cookies: {
      session_token: {
        attributes: {
          sameSite: "none" as const,
          secure: true,
        },
      },
    },
  },
});
