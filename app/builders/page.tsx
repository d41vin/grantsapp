"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    IconCode,
    IconSearch,
    IconCircleCheck,
    IconChevronRight,
    IconBrandGithub,
    IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const SKILLS = [
    "Frontend", "Backend", "Smart Contracts", "DeFi", "NFT", "DAO",
    "Research", "Design", "Content", "DevRel", "Protocol Dev",
    "Infrastructure", "Security", "Mobile",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    if (amount > 0) return `$${amount.toLocaleString()}`;
    return null;
}

// ─── Builder Card ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BuilderCard({ builder }: { builder: any }) {
    const earned = formatCurrency(builder.totalEarned);

    return (
        <Link href={`/builders/${builder.username}`}>
            <div className="group flex flex-col gap-3.5 rounded-xl border bg-card p-5 transition-all duration-150 hover:border-primary/30 hover:shadow-sm cursor-pointer h-full">
                {/* Header */}
                <div className="flex items-start gap-3">
                    {builder.avatar ? (
                        <img
                            src={builder.avatar}
                            alt={builder.name}
                            className="size-10 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                            {builder.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                    )}
                    <div className="min-w-0 flex-1 pt-0.5">
                        <div className="truncate text-sm font-semibold leading-tight transition-colors group-hover:text-primary">
                            {builder.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            @{builder.username}
                        </div>
                    </div>
                    {builder.grantCount > 0 && (
                        <div className="shrink-0 flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <IconCircleCheck size={9} stroke={2.5} />
                            {builder.grantCount}
                        </div>
                    )}
                </div>

                {/* Bio */}
                {builder.bio && (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed flex-1">
                        {builder.bio}
                    </p>
                )}

                {/* Skills */}
                {builder.skills && builder.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {builder.skills.slice(0, 4).map((skill: string) => (
                            <span
                                key={skill}
                                className="rounded-full border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                                {skill}
                            </span>
                        ))}
                        {builder.skills.length > 4 && (
                            <span className="text-[10px] text-muted-foreground py-0.5">
                                +{builder.skills.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <IconCode size={11} stroke={2} />
                            {builder.projectCount} project{builder.projectCount !== 1 ? "s" : ""}
                        </div>
                        {earned && (
                            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                {earned} earned
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {builder.github && (
                            <span className="text-muted-foreground">
                                <IconBrandGithub size={12} stroke={2} />
                            </span>
                        )}
                        <IconChevronRight
                            size={12}
                            stroke={2}
                            className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function BuilderCardSkeleton() {
    return (
        <div className="flex flex-col gap-3.5 rounded-xl border bg-card p-5">
            <div className="flex items-start gap-3">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <div className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-1">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <div className="flex justify-between border-t pt-3">
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuildersPage() {
    const [search, setSearch] = useState("");
    const [activeSkill, setActiveSkill] = useState<string | undefined>(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builders = useQuery((api as any).discover.listBuilders, {
        limit: 60,
        skill: activeSkill,
    });

    const isLoading = builders === undefined;

    // Client-side search filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = builders?.filter((b: any) =>
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.username.toLowerCase().includes(search.toLowerCase()) ||
        (b.bio?.toLowerCase().includes(search.toLowerCase()) ?? false)
    ) ?? [];

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            {/* Hero */}
            <div className="border-b bg-muted/30 px-6 py-12 text-center">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                        <IconUsers size={12} stroke={2} />
                        Builders
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Discover Builders
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        Explore developers, researchers, and creators building across ecosystems.
                        Browse their projects, funding history, and contributions.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur-sm px-6 py-3">
                <div className="mx-auto flex max-w-6xl items-center gap-3">
                    {/* Search */}
                    <div className="relative max-w-sm flex-1">
                        <IconSearch
                            size={13}
                            stroke={2}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Search builders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    {/* Skill pills */}
                    <div className="flex items-center gap-1 overflow-x-auto">
                        <button
                            onClick={() => setActiveSkill(undefined)}
                            className={cn(
                                "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
                                activeSkill === undefined
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            )}
                        >
                            All
                        </button>
                        {SKILLS.map((skill) => (
                            <button
                                key={skill}
                                onClick={() => setActiveSkill(activeSkill === skill ? undefined : skill)}
                                className={cn(
                                    "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
                                    activeSkill === skill
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                )}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="mx-auto max-w-6xl px-6 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => <BuilderCardSkeleton key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-20 text-center">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                            <IconUsers size={20} stroke={1.5} className="text-muted-foreground" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold">No builders found</div>
                            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                                {search
                                    ? `No builders matching "${search}".`
                                    : activeSkill
                                        ? `No builders with the ${activeSkill} skill yet.`
                                        : "No builders have signed up yet."}
                            </p>
                        </div>
                        {(search || activeSkill) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSearch(""); setActiveSkill(undefined); }}
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-xs text-muted-foreground">
                            {filtered.length} builder{filtered.length !== 1 ? "s" : ""}
                            {activeSkill && ` with ${activeSkill} skill`}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {filtered.map((builder: any) => (
                                <BuilderCard key={builder._id} builder={builder} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}