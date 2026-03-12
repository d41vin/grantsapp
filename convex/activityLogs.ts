import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireAuth } from "./lib/auth";

// ─── Internal helper ─────────────────────────────────────────────────────────

/**
 * Call this from within other mutations to record an activity event.
 * Does NOT throw — a logging failure should never break the main action.
 */
export async function logActivity(
    ctx: MutationCtx,
    args: {
        userId: Id<"users">;
        action: string;
        description: string;
        organizationId?: Id<"organizations">;
        programId?: Id<"programs">;
        applicationId?: Id<"applications">;
        milestoneId?: Id<"milestones">;
        metadata?: Record<string, unknown>;
    }
) {
    try {
        await ctx.db.insert("activityLogs", {
            userId: args.userId,
            organizationId: args.organizationId,
            programId: args.programId,
            applicationId: args.applicationId,
            milestoneId: args.milestoneId,
            action: args.action,
            description: args.description,
            metadata: args.metadata ? JSON.stringify(args.metadata) : undefined,
            createdAt: Date.now(),
        });
    } catch {
        // Swallow — logging must never break the primary operation
    }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Get the authenticated user's personal activity feed.
 */
export const getUserActivity = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        const limit = args.limit ?? 20;

        return await ctx.db
            .query("activityLogs")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(limit);
    },
});

/**
 * Get the activity feed for a specific organization (manager view).
 */
export const getOrgActivity = query({
    args: {
        organizationId: v.id("organizations"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 30;

        return await ctx.db
            .query("activityLogs")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .order("desc")
            .take(limit);
    },
});

/**
 * Get the activity feed for a specific program.
 */
export const getProgramActivity = query({
    args: {
        programId: v.id("programs"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 30;

        return await ctx.db
            .query("activityLogs")
            .withIndex("by_program", (q) => q.eq("programId", args.programId))
            .order("desc")
            .take(limit);
    },
});

// ─── Mutation (manual log — for debugging / admin use) ───────────────────────

export const createLog = mutation({
    args: {
        action: v.string(),
        description: v.string(),
        organizationId: v.optional(v.id("organizations")),
        programId: v.optional(v.id("programs")),
        applicationId: v.optional(v.id("applications")),
        milestoneId: v.optional(v.id("milestones")),
        metadata: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);

        return await ctx.db.insert("activityLogs", {
            userId: user._id,
            ...args,
            createdAt: Date.now(),
        });
    },
});