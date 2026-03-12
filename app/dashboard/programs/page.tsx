"use client";

import { useState } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge, MechanismBadge } from "@/components/dashboard/programs/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
    IconPlus,
    IconCommand,
    IconFileText,
    IconChartLine,
    IconCalendar,
    IconChevronRight,
    IconDots,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ProgramStatus } from "@/components/dashboard/programs/status-badge";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBudget(budget?: number, currency = "USD"): string {
    if (!budget) return "Open budget";
    if (currency === "USD" || currency === "USDC")
        return `$${budget.toLocaleString()}`;
    return `${budget.toLocaleString()} ${currency}`;
}

function formatDate(ts?: number): string {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// ─── Status Filter Tabs ───────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: ProgramStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Active", value: "active" },
    { label: "Paused", value: "paused" },
    { label: "Closed", value: "closed" },
    { label: "Completed", value: "completed" },
];

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({
    program,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    program: any;
}) {
    return (
        <div className="group flex flex-col rounded-xl border bg-card transition-all duration-150 hover:border-primary/30 hover:shadow-sm">
            {/* Card header */}
            <div className="flex items-start justify-between gap-3 p-5 pb-4">
                <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={program.status} />
                    <MechanismBadge mechanism={program.mechanism} />
                </div>
                <Link href={`/dashboard/programs/${program._id}`}>
                    <button className="rounded-md p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
                        <IconDots size={14} stroke={2} className="text-muted-foreground" />
                    </button>
                </Link>
            </div>

            {/* Name + description */}
            <div className="px-5 pb-4">
                <Link href={`/dashboard/programs/${program._id}`}>
                    <div className="text-sm font-semibold leading-tight transition-colors hover:text-primary">
                        {program.name}
                    </div>
                </Link>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {program.description}
                </p>
            </div>

            {/* Stats row */}
            <div className="mt-auto border-t px-5 py-3">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <IconFileText
                            size={12}
                            stroke={2}
                            className="text-muted-foreground"
                        />
                        <span className="text-[11px] text-muted-foreground">
                            {program.applicationCount}{" "}
                            {program.applicationCount === 1 ? "application" : "applications"}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <IconChartLine
                            size={12}
                            stroke={2}
                            className="text-muted-foreground"
                        />
                        <span className="text-[11px] text-muted-foreground">
                            {formatBudget(program.budget, program.currency)}
                        </span>
                    </div>

                    {program.applicationEndDate && (
                        <div className="flex items-center gap-1.5">
                            <IconCalendar
                                size={12}
                                stroke={2}
                                className="text-muted-foreground"
                            />
                            <span className="text-[11px] text-muted-foreground">
                                Closes {formatDate(program.applicationEndDate)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between border-t px-5 py-3">
                <Link href={`/dashboard/programs/${program._id}`}>
                    <span className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Edit settings
                    </span>
                </Link>
                <Link href={`/dashboard/programs/${program._id}`}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-[11px]"
                    >
                        Manage
                        <IconChevronRight size={11} stroke={2.5} />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProgramCardSkeleton() {
    return (
        <div className="flex flex-col rounded-xl border bg-card p-5 gap-4">
            <div className="flex gap-2">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="mt-auto flex gap-4 border-t pt-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

// ─── Mini stat card ───────────────────────────────────────────────────────────

function MiniStat({
    label,
    value,
    accent,
}: {
    label: string;
    value: string | number;
    accent?: boolean;
}) {
    return (
        <div className="flex flex-col gap-0.5 rounded-xl border bg-card px-4 py-3">
            <div
                className={cn(
                    "text-xl font-semibold tracking-tight",
                    accent ? "text-primary" : "text-foreground"
                )}
            >
                {value}
            </div>
            <div className="text-[11px] text-muted-foreground">{label}</div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgramsPage() {
    const [activeFilter, setActiveFilter] = useState<ProgramStatus | "all">(
        "all"
    );

    const { isAuthenticated } = useConvexAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myOrg = useQuery(
        (api as any).organizations.getMyOrg,
        !isAuthenticated ? "skip" : undefined
    );

    const programs = useQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (api as any).programs.listByOrg,
        myOrg
            ? {
                organizationId: myOrg._id,
                status: activeFilter !== "all" ? activeFilter : undefined,
            }
            : "skip"
    );

    const orgStats = useQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (api as any).programs.getOrgStats,
        myOrg ? { organizationId: myOrg._id } : "skip"
    );

    const isLoading = myOrg === undefined || programs === undefined;

    return (
        <div className="flex flex-col gap-6 p-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Programs</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Create and manage your grant programs.
                    </p>
                </div>
                <Link href="/dashboard/programs/new">
                    <Button size="sm" className="gap-1.5">
                        <IconPlus size={12} stroke={2.5} />
                        New Program
                    </Button>
                </Link>
            </div>

            {/* Stats row */}
            {isLoading ? (
                <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl border bg-card px-4 py-3">
                            <Skeleton className="h-6 w-8 mb-1" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-3">
                    <MiniStat
                        label="Total Programs"
                        value={orgStats?.totalProgramCount ?? 0}
                    />
                    <MiniStat
                        label="Active Programs"
                        value={orgStats?.activeProgramCount ?? 0}
                        accent
                    />
                    <MiniStat
                        label="Pending Review"
                        value={orgStats?.pendingReviewCount ?? 0}
                    />
                    <MiniStat
                        label="Total Funded"
                        value={`$${(orgStats?.totalAllocated ?? 0).toLocaleString()}`}
                    />
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5 w-fit">
                {STATUS_FILTERS.map(({ label, value }) => (
                    <button
                        key={value}
                        onClick={() => setActiveFilter(value)}
                        className={cn(
                            "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-100 cursor-pointer",
                            activeFilter === value
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Program grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <ProgramCardSkeleton key={i} />
                    ))}
                </div>
            ) : !programs || programs.length === 0 ? (
                <div className="rounded-xl border">
                    <div className="p-10">
                        <EmptyState
                            icon={IconCommand}
                            title={
                                activeFilter === "all"
                                    ? "No programs yet"
                                    : `No ${activeFilter} programs`
                            }
                            description={
                                activeFilter === "all"
                                    ? "Create your first grant program to start receiving applications from builders in the ecosystem."
                                    : `You don't have any ${activeFilter} programs right now.`
                            }
                            action={
                                activeFilter === "all"
                                    ? { label: "Create Program", href: "/dashboard/programs/new" }
                                    : undefined
                            }
                        />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {programs.map(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (program: any) => (
                            <ProgramCard key={program._id} program={program} />
                        )
                    )}
                </div>
            )}
        </div>
    );
}