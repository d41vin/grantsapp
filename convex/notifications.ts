import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireAuth } from "./lib/auth";

// ─── Internal helper ─────────────────────────────────────────────────────────

/**
 * Create a notification for a user from within another mutation.
 */
export async function createNotification(
    ctx: MutationCtx,
    args: {
        userId: Id<"users">;
        type: string;
        title: string;
        message: string;
        linkUrl?: string;
        programId?: Id<"programs">;
        applicationId?: Id<"applications">;
        milestoneId?: Id<"milestones">;
    }
) {
    try {
        await ctx.db.insert("notifications", {
            ...args,
            read: false,
            emailSent: false,
            createdAt: Date.now(),
        });
    } catch {
        // Swallow — notifications must never break the primary operation
    }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Get all notifications for the authenticated user.
 */
export const getMyNotifications = query({
    args: {
        unreadOnly: v.optional(v.boolean()),
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

        const limit = args.limit ?? 30;

        if (args.unreadOnly) {
            return await ctx.db
                .query("notifications")
                .withIndex("by_user_unread", (q) =>
                    q.eq("userId", user._id).eq("read", false)
                )
                .order("desc")
                .take(limit);
        }

        return await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(limit);
    },
});

/**
 * Count unread notifications for the authenticated user.
 */
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return 0;

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) =>
                q.eq("userId", user._id).eq("read", false)
            )
            .collect();

        return unread.length;
    },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Mark a single notification as read.
 */
export const markRead = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);
        const notification = await ctx.db.get(args.notificationId);

        if (!notification) throw new Error("Notification not found");
        if (notification.userId !== user._id) throw new Error("Not your notification");

        await ctx.db.patch(args.notificationId, { read: true });
    },
});

/**
 * Mark all notifications as read for the authenticated user.
 */
export const markAllRead = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await requireAuth(ctx);

        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) =>
                q.eq("userId", user._id).eq("read", false)
            )
            .collect();

        await Promise.all(
            unread.map((n) => ctx.db.patch(n._id, { read: true }))
        );

        return unread.length;
    },
});

/**
 * Delete a notification.
 */
export const deleteNotification = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);
        const notification = await ctx.db.get(args.notificationId);

        if (!notification) throw new Error("Notification not found");
        if (notification.userId !== user._id) throw new Error("Not your notification");

        await ctx.db.delete(args.notificationId);
    },
});