import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireOrgMember } from "./lib/auth";
import { logActivity } from "./activityLogs";

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * List all active members of an organization.
 * Includes the owner (from organizations.managerId) synthesized at the top.
 */
export const listMembers = query({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.organizationId);
        if (!org) return [];

        // Get the owner user record
        const owner = await ctx.db.get(org.managerId);

        // Get all membership records
        const memberships = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
            .filter((q) => q.neq(q.field("status"), "removed"))
            .collect();

        // Hydrate user details
        const members = await Promise.all(
            memberships.map(async (m) => {
                const user = await ctx.db.get(m.userId);
                return { ...m, user };
            })
        );

        return {
            owner: owner
                ? { user: owner, role: "owner" as const, status: "active" as const }
                : null,
            members,
        };
    },
});

/**
 * Get the current user's membership in a specific organization.
 */
export const getMyMembership = query({
    args: {
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return null;

        const org = await ctx.db.get(args.organizationId);
        if (!org) return null;

        // Owner
        if (org.managerId === user._id) {
            return { role: "owner" as const, status: "active" as const };
        }

        return await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", args.organizationId).eq("userId", user._id)
            )
            .unique();
    },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Add a member to an organization by username.
 * Only admins and owners can invite.
 */
export const addMember = mutation({
    args: {
        organizationId: v.id("organizations"),
        username: v.string(),
        role: v.union(v.literal("admin"), v.literal("reviewer")),
    },
    handler: async (ctx, args) => {
        const { user: inviter } = await requireOrgMember(
            ctx,
            args.organizationId,
            "admin"
        );

        // Resolve the invited user by username
        const invitee = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .unique();

        if (!invitee) throw new Error(`No user found with username @${args.username}`);
        if (invitee._id === inviter._id) throw new Error("You can't invite yourself");

        // Check for existing membership
        const existing = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", args.organizationId).eq("userId", invitee._id)
            )
            .unique();

        if (existing) {
            if (existing.status === "active") {
                throw new Error(`@${args.username} is already a member`);
            }
            // Reactivate a removed member
            await ctx.db.patch(existing._id, {
                role: args.role,
                status: "active",
                invitedBy: inviter._id,
                updatedAt: Date.now(),
            });
            return existing._id;
        }

        const id = await ctx.db.insert("organizationMembers", {
            organizationId: args.organizationId,
            userId: invitee._id,
            role: args.role,
            invitedBy: inviter._id,
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        await logActivity(ctx, {
            userId: inviter._id,
            organizationId: args.organizationId,
            action: "team.member_added",
            description: `Added @${invitee.username} as ${args.role}`,
        });

        return id;
    },
});

/**
 * Update a member's role within the organization.
 * Only owners can promote/demote admins.
 */
export const updateMemberRole = mutation({
    args: {
        organizationId: v.id("organizations"),
        memberId: v.id("organizationMembers"),
        role: v.union(v.literal("admin"), v.literal("reviewer")),
    },
    handler: async (ctx, args) => {
        const { user } = await requireOrgMember(ctx, args.organizationId, "owner");

        const membership = await ctx.db.get(args.memberId);
        if (!membership) throw new Error("Membership not found");
        if (membership.organizationId !== args.organizationId) {
            throw new Error("Membership does not belong to this organization");
        }

        await ctx.db.patch(args.memberId, {
            role: args.role,
            updatedAt: Date.now(),
        });

        await logActivity(ctx, {
            userId: user._id,
            organizationId: args.organizationId,
            action: "team.role_updated",
            description: `Updated member role to ${args.role}`,
        });
    },
});

/**
 * Remove a member from the organization.
 * Admins can remove reviewers; owners can remove anyone.
 */
export const removeMember = mutation({
    args: {
        organizationId: v.id("organizations"),
        memberId: v.id("organizationMembers"),
    },
    handler: async (ctx, args) => {
        const { user } = await requireOrgMember(ctx, args.organizationId, "admin");

        const membership = await ctx.db.get(args.memberId);
        if (!membership) throw new Error("Membership not found");
        if (membership.organizationId !== args.organizationId) {
            throw new Error("Membership does not belong to this organization");
        }

        await ctx.db.patch(args.memberId, {
            status: "removed",
            updatedAt: Date.now(),
        });

        await logActivity(ctx, {
            userId: user._id,
            organizationId: args.organizationId,
            action: "team.member_removed",
            description: `Removed a team member`,
        });
    },
});