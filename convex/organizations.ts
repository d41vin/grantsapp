import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get the first organization managed by the authenticated user.
 * Every manager creates exactly one org during onboarding (MVP assumption).
 */
export const getMyOrg = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return null;

        return await ctx.db
            .query("organizations")
            .withIndex("by_manager", (q) => q.eq("managerId", user._id))
            .first();
    },
});

export const getById = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.organizationId);
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .unique();
    },
});