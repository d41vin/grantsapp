import { AuthConfig } from "convex/server";

export default {
    providers: [
        {
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
            applicationID: "convex",
        },
        {
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN!.endsWith('/')
                ? process.env.CLERK_JWT_ISSUER_DOMAIN!.slice(0, -1)
                : process.env.CLERK_JWT_ISSUER_DOMAIN! + '/',
            applicationID: "convex",
        },
    ],
} satisfies AuthConfig;