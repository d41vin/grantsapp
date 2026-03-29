import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/auth";
import { Id } from "./_generated/dataModel";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolve the organizationId from a comment's target (application or milestone).
 */
async function resolveOrgId(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx: any,
    targetType: "application" | "milestone",
    targetId: string,
): Promise<Id<"organizations"> | null> {
    if (targetType === "application") {
        const application = await ctx.db.get(targetId as Id<"applications">);
        if (!application) return null;
        const program = await ctx.db.get(application.programId);
        return program?.organizationId ?? null;
    } else {
        const milestone = await ctx.db.get(targetId as Id<"milestones">);
        if (!milestone) return null;
        const program = await ctx.db.get(milestone.programId);
        return program?.organizationId ?? null;
    }
}

/**
 * Check if a user is an org member (owner, admin, or reviewer).
 */
async function isUserOrgMember(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx: any,
    organizationId: Id<"organizations">,
    userId: Id<"users">,
): Promise<boolean> {
    const org = await ctx.db.get(organizationId);
    if (org && org.managerId === userId) return true;

    const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_org_user", (q: any) =>
            q.eq("organizationId", organizationId).eq("userId", userId)
        )
        .unique();

    return membership?.status === "active";
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * List comments for an application or milestone.
 * Internal comments are only visible to org members.
 */
export const listByTarget = query({
    args: {
        targetType: v.union(v.literal("application"), v.literal("milestone")),
        targetId: v.string(),
    },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_target", (q) =>
                q.eq("targetType", args.targetType).eq("targetId", args.targetId)
            )
            .collect();

        // Check if current user is an org member to decide visibility of internal comments
        const identity = await ctx.auth.getUserIdentity();
        let isOrgMember = false;

        if (identity) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
                .unique();

            if (user) {
                const organizationId = await resolveOrgId(ctx, args.targetType, args.targetId);
                if (organizationId) {
                    isOrgMember = await isUserOrgMember(ctx, organizationId, user._id);
                }
            }
        }

        // Filter internal comments for non-org-members
        const visibleComments = isOrgMember
            ? comments
            : comments.filter((c) => !c.isInternal);

        // Hydrate author info
        return await Promise.all(
            visibleComments
                .sort((a, b) => a.createdAt - b.createdAt)
                .map(async (c) => {
                    const author = await ctx.db.get(c.authorId);
                    return {
                        ...c,
                        author: author
                            ? { _id: author._id, name: author.name, username: author.username, avatar: author.avatar }
                            : null,
                    };
                })
        );
    },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Post a comment on an application or milestone.
 */
export const create = mutation({
    args: {
        targetType: v.union(v.literal("application"), v.literal("milestone")),
        targetId: v.string(),
        content: v.string(),
        isInternal: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);

        if (!args.content.trim()) {
            throw new Error("Comment cannot be empty");
        }

        const commentId = await ctx.db.insert("comments", {
            targetType: args.targetType,
            targetId: args.targetId,
            authorId: user._id,
            content: args.content.trim(),
            isInternal: args.isInternal ?? false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return commentId;
    },
});

/**
 * Update own comment.
 */
export const update = mutation({
    args: {
        commentId: v.id("comments"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);
        const comment = await ctx.db.get(args.commentId);

        if (!comment) throw new Error("Comment not found");
        if (comment.authorId !== user._id) {
            throw new Error("You can only edit your own comments");
        }

        if (!args.content.trim()) {
            throw new Error("Comment cannot be empty");
        }

        await ctx.db.patch(args.commentId, {
            content: args.content.trim(),
            updatedAt: Date.now(),
        });
    },
});

/**
 * Delete a comment.
 * Authors can delete their own comments. Org members can delete any comment.
 */
export const remove = mutation({
    args: {
        commentId: v.id("comments"),
    },
    handler: async (ctx, args) => {
        const user = await requireAuth(ctx);
        const comment = await ctx.db.get(args.commentId);

        if (!comment) throw new Error("Comment not found");

        const isAuthor = comment.authorId === user._id;

        if (!isAuthor) {
            const organizationId = await resolveOrgId(ctx, comment.targetType, comment.targetId);
            if (!organizationId) throw new Error("Cannot determine organization");

            const memberOfOrg = await isUserOrgMember(ctx, organizationId, user._id);
            if (!memberOfOrg) {
                throw new Error("You can only delete your own comments");
            }
        }

        await ctx.db.delete(args.commentId);
    },
});
