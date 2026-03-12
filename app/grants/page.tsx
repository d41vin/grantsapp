"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MechanismBadge } from "@/components/dashboard/programs/status-badge";
import {
    IconSearch,
    IconListSearch,
    IconCalendar,
    IconChartLine,
    IconFileText,
    IconChevronRight,
    IconFilter,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
    "All", "DeFi", "NFT", "Infrastructure", "Tooling", "Gaming",
    "Research", "Developer Experience", "Storage", "Identity",
];

const MECHANISMS = [
    { label: "All Types", value: undefined },
    { label: "Direct Grant", value: "direct" },
    { label: "Milestone-Based", value: "milestone" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBudget(budget?: number, currency = "USD") {
    if (!budget) return "Open budget";
    const prefix = currency === "USD" || currency === "USDC" ? "$" : "";
    const formatted = budget >= 1_000_000
        ? `${(budget / 1_000_000).toFixed(1)}M`
        : budget >= 1_000
            ? `${(budget / 1_000).toFixed(0)}K`
            : budget.toString();
    return `${prefix}${formatted}${prefix ? "" : ` ${currency}`}`;
}

function formatDate(ts?: number) {
    if (!ts) return null;
    const d = new Date(ts);
    const now = new Date();
    const days = Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
    if (days < 0) return "Closed";
    if (days === 0) return "Closes today";
    if (days === 1) return "Closes tomorrow";
    if (days <= 14) return `Closes in ${days}d`;
    return `Closes ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

// ─── Program Card ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProgramCard({ program }: { program: any }) {
    const deadline = formatDate(program.applicationEndDate);

    return (
        <Link href={`/grants/${program.slug}`}>
            <div className="group flex flex-col gap-4 rounded-xl border bg-card p-5 transition-all duration-150 hover:border-primary/40 hover:shadow-sm cursor-pointer h-full">
                {/* Org + mechanism */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {program.organization?.logo ? (
                            <img
                                src={program.organization.logo}
                                alt={program.organization.name}
                                className="size-6 rounded-md object-cover"
                            />
                        ) : (
                            <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                                <div className="size-2.5 rounded-sm bg-primary" />
                            </div>
                        )}
                        <span className="text-[11px] font-medium text-muted-foreground">
                            {program.organization?.name ?? "Unknown Org"}
                        </span>
                    </div>
                    <MechanismBadge mechanism={program.mechanism} />
                </div>

                {/* Name + description */}
                <div className="flex-1">
                    <div className="text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                        {program.name}
                    </div>
                    <p className="mt-1.5 line-clamp-3 text-xs text-muted-foreground leading-relaxed">
                        {program.description}
                    </p>
                </div>

                {/* Tags */}
                {program.categories && program.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {program.categories.slice(0, 3).map((cat: string) => (
                            <span
                                key={cat}
                                className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats footer */}
                <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <IconChartLine size={11} stroke={2} />
                            {formatBudget(program.budget, program.currency)}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <IconFileText size={11} stroke={2} />
                            {program.applicationCount}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {deadline && (
                            <span className={cn(
                                "flex items-center gap-1 text-[10px] font-medium",
                                deadline === "Closes today" || deadline === "Closes tomorrow"
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground"
                            )}>
                                <IconCalendar size={10} stroke={2} />
                                {deadline}
                            </span>
                        )}
                        <IconChevronRight
                            size={13} stroke={2}
                            className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProgramCardSkeleton() {
    return (
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-md" />
                <Skeleton className="h-3 w-24" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-1">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <div className="flex justify-between border-t pt-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GrantsPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [mechanism, setMechanism] = useState<"direct" | "milestone" | undefined>(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programs = useQuery((api as any).programs.listPublic, {
        category,
        mechanism,
    });

    const isLoading = programs === undefined;

    // Client-side search filter
    const filtered = programs?.filter((p: any) =>
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.organization?.name?.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            {/* Hero */}
            <div className="border-b bg-muted/30 px-6 py-12 text-center">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                        <IconListSearch size={12} stroke={2} />
                        Grants Explorer
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Find Your Next Grant
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        Browse active grant programs from leading ecosystems and protocols.
                        Apply directly, track your status, and build your funding reputation.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur-sm px-6 py-3">
                <div className="mx-auto flex max-w-6xl items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <IconSearch
                            size={13} stroke={2}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Search programs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    {/* Category pills */}
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {CATEGORIES.map((cat) => {
                            const val = cat === "All" ? undefined : cat;
                            const active = category === val;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(val)}
                                    className={cn(
                                        "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
                                        active
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                    )}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Mechanism filter */}
                    <div className="flex items-center gap-1 shrink-0">
                        <IconFilter size={12} stroke={2} className="text-muted-foreground" />
                        <select
                            value={mechanism ?? ""}
                            onChange={(e) => setMechanism((e.target.value as any) || undefined)}
                            className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            {MECHANISMS.map((m) => (
                                <option key={m.label} value={m.value ?? ""}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="mx-auto max-w-6xl px-6 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => <ProgramCardSkeleton key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-20 text-center">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                            <IconListSearch size={20} stroke={1.5} className="text-muted-foreground" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold">No programs found</div>
                            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                                {search
                                    ? `No programs matching "${search}". Try a different search.`
                                    : "No active programs match your filters right now. Check back soon."}
                            </p>
                        </div>
                        {search && (
                            <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                                Clear search
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                {filtered.length} program{filtered.length !== 1 ? "s" : ""} found
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {filtered.map((program: any) => (
                                <ProgramCard key={program._id} program={program} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}