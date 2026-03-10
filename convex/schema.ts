import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    username: v.string(),
    avatar: v.optional(v.string()),
    role: v.union(v.literal("builder"), v.literal("manager")),
    onboardingComplete: v.boolean(),

    // Builder-specific fields
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    github: v.optional(v.string()),
    twitter: v.optional(v.string()),
    website: v.optional(v.string()),
    walletAddress: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"]),

  organizations: defineTable({
    // The user (manager) who owns this org
    managerId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    website: v.optional(v.string()),
    description: v.string(),
    twitter: v.optional(v.string()),
    github: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_manager", ["managerId"])
    .index("by_slug", ["slug"]),
});