import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * List all organizations publicly (for /orgs explorer page).
 */
export const listOrgs = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 50;

        const orgs = await ctx.db
            .query("organizations")
            .collect();

        // For each org, get program stats
        const hydrated = await Promise.all(
            orgs.map(async (org) => {
                const programs = await ctx.db
                    .query("programs")
                    .withIndex("by_org", (q) => q.eq("organizationId", org._id))
                    .collect();

                const activePrograms = programs.filter((p) => p.status === "active");
                const totalAllocated = programs.reduce((sum, p) => sum + p.totalAllocated, 0);
                const totalApproved = programs.reduce((sum, p) => sum + p.approvedCount, 0);

                return {
                    ...org,
                    programCount: programs.length,
                    activeProgramCount: activePrograms.length,
                    totalAllocated,
                    totalApproved,
                };
            })
        );

        // Sort: orgs with active programs first, then by total allocated, then by newest
        const sorted = hydrated.sort((a, b) => {
            if (a.activeProgramCount !== b.activeProgramCount) {
                return b.activeProgramCount - a.activeProgramCount;
            }
            if (a.totalAllocated !== b.totalAllocated) {
                return b.totalAllocated - a.totalAllocated;
            }
            return b.createdAt - a.createdAt;
        });

        return sorted.slice(0, limit);
    },
});

/**
 * List all builders publicly (for /builders explorer page).
 */
export const listBuilders = query({
    args: {
        limit: v.optional(v.number()),
        skill: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 60;

        // Get all users with builder role
        const allUsers = await ctx.db.query("users").collect();
        const builders = allUsers.filter((u) => u.roles.includes("builder"));

        // Hydrate with grant stats
        const hydrated = await Promise.all(
            builders.map(async (user) => {
                const applications = await ctx.db
                    .query("applications")
                    .withIndex("by_applicant", (q) => q.eq("applicantId", user._id))
                    .collect();

                const approvedApplications = applications.filter(
                    (a) => a.status === "approved"
                );
                const totalEarned = approvedApplications.reduce(
                    (sum, a) => sum + (a.approvedAmount ?? 0),
                    0
                );

                const projects = await ctx.db
                    .query("projects")
                    .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
                    .filter((q) => q.neq(q.field("status"), "archived"))
                    .collect();

                return {
                    _id: user._id,
                    name: user.name,
                    username: user.username,
                    avatar: user.avatar,
                    bio: user.bio,
                    skills: user.skills ?? [],
                    github: user.github,
                    twitter: user.twitter,
                    website: user.website,
                    createdAt: user.createdAt,
                    grantCount: approvedApplications.length,
                    totalEarned,
                    projectCount: projects.length,
                    applicationCount: applications.length,
                };
            })
        );

        // Filter by skill if provided
        let filtered = hydrated;
        if (args.skill) {
            filtered = hydrated.filter((b) =>
                b.skills.some((s: string) =>
                    s.toLowerCase() === args.skill!.toLowerCase()
                )
            );
        }

        // Sort: builders with grants first, then by total earned
        const sorted = filtered.sort((a, b) => {
            if (a.grantCount !== b.grantCount) return b.grantCount - a.grantCount;
            return b.totalEarned - a.totalEarned;
        });

        return sorted.slice(0, limit);
    },
});