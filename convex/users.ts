import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get the currently authenticated user from the database.
 * Returns null if no user record exists (needs onboarding).
 * Returns undefined while loading (Convex convention).
 */
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});

/**
 * Check if a username is available (not taken by another user).
 */
export const checkUsernameAvailable = query({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        if (!args.username || args.username.length < 3) return false;
        const existing = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .unique();
        return existing === null;
    },
});

/**
 * Create or complete a Builder profile, marking onboarding as done.
 */
export const createBuilderProfile = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        username: v.string(),
        avatar: v.optional(v.string()),
        bio: v.optional(v.string()),
        skills: v.optional(v.array(v.string())),
        github: v.optional(v.string()),
        twitter: v.optional(v.string()),
        website: v.optional(v.string()),
        walletAddress: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args,
                role: "builder",
                onboardingComplete: true,
                updatedAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("users", {
            ...args,
            role: "builder",
            onboardingComplete: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

/**
 * Create a Program Manager profile + their organization, marking onboarding done.
 */
export const createManagerProfile = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        username: v.string(),
        avatar: v.optional(v.string()),
        // Organization fields
        orgName: v.string(),
        orgSlug: v.string(),
        orgDescription: v.string(),
        orgWebsite: v.optional(v.string()),
        orgLogo: v.optional(v.string()),
        orgTwitter: v.optional(v.string()),
        orgGithub: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const {
            orgName,
            orgSlug,
            orgDescription,
            orgWebsite,
            orgLogo,
            orgTwitter,
            orgGithub,
            ...userArgs
        } = args;

        // Upsert user record
        let userId;
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...userArgs,
                role: "manager",
                onboardingComplete: true,
                updatedAt: Date.now(),
            });
            userId = existing._id;
        } else {
            userId = await ctx.db.insert("users", {
                ...userArgs,
                role: "manager",
                onboardingComplete: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }

        // Create organization
        const orgId = await ctx.db.insert("organizations", {
            managerId: userId,
            name: orgName,
            slug: orgSlug,
            description: orgDescription,
            website: orgWebsite,
            logo: orgLogo,
            twitter: orgTwitter,
            github: orgGithub,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return { userId, orgId };
    },
});