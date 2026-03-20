"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
    IconBuilding,
    IconCommand,
    IconCircleCheck,
    IconChartLine,
    IconChevronRight,
    IconSearch,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    if (amount > 0) return `$${amount.toLocaleString()}`;
    return null;
}

// ─── Org Card ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OrgCard({ org }: { org: any }) {
    const funded = formatCurrency(org.totalAllocated);

    return (
        <Link href={`/orgs/${org.slug}`}>
            <div className="group flex flex-col gap-4 rounded-xl border bg-card p-5 transition-all duration-150 hover:border-primary/30 hover:shadow-sm cursor-pointer h-full">
                {/* Header */}
                <div className="flex items-start gap-3">
                    {org.logo ? (
                        <img
                            src={org.logo}
                            alt={org.name}
                            className="size-10 rounded-lg object-cover shrink-0"
                        />
                    ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <div className="size-4 rounded-sm bg-primary" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1 pt-0.5">
                        <div className="truncate text-sm font-semibold leading-tight transition-colors group-hover:text-primary">
                            {org.name}
                        </div>
                        {org.activeProgramCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                                <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                                {org.activeProgramCount} active
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="flex-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {org.description}
                </p>

                {/* Footer stats */}
                <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <IconCommand size={11} stroke={2} />
                            {org.programCount} program{org.programCount !== 1 ? "s" : ""}
                        </div>
                        {org.totalApproved > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <IconCircleCheck size={11} stroke={2} />
                                {org.totalApproved} funded
                            </div>
                        )}
                        {funded && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                <IconChartLine size={11} stroke={2} />
                                {funded}
                            </div>
                        )}
                    </div>
                    <IconChevronRight
                        size={13}
                        stroke={2}
                        className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    />
                </div>
            </div>
        </Link>
    );
}

function OrgCardSkeleton() {
    return (
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
            <div className="flex items-start gap-3">
                <Skeleton className="size-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                </div>
            </div>
            <div className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="flex justify-between border-t pt-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-12" />
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrgsPage() {
    const [search, setSearch] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgs = useQuery((api as any).discover.listOrgs, { limit: 60 });
    const isLoading = orgs === undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = orgs?.filter((o: any) =>
        !search ||
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.description.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            {/* Hero */}
            <div className="border-b bg-muted/30 px-6 py-12 text-center">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                        <IconBuilding size={12} stroke={2} />
                        Organizations
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Discover Grant Organizations
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        Foundations, DAOs, and protocols running grant programs across ecosystems.
                        Explore their programs and apply for funding.
                    </p>
                </div>
            </div>

            {/* Search bar */}
            <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur-sm px-6 py-3">
                <div className="mx-auto max-w-6xl">
                    <div className="relative max-w-sm">
                        <IconSearch
                            size={13}
                            stroke={2}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Search organizations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="mx-auto max-w-6xl px-6 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => <OrgCardSkeleton key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-20 text-center">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                            <IconBuilding size={20} stroke={1.5} className="text-muted-foreground" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold">No organizations found</div>
                            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                                {search
                                    ? `No organizations matching "${search}".`
                                    : "No organizations have been created yet."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-xs text-muted-foreground">
                            {filtered.length} organization{filtered.length !== 1 ? "s" : ""}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {filtered.map((org: any) => (
                                <OrgCard key={org._id} org={org} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}