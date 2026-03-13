"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge, MechanismBadge } from "@/components/dashboard/programs/status-badge";
import {
    IconChevronLeft,
    IconBuilding,
    IconWorld,
    IconBrandGithub,
    IconBrandTwitter,
    IconExternalLink,
    IconChartLine,
    IconCoins,
    IconFileText,
    IconCircleCheck,
    IconCalendar,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount?: number, currency = "USD") {
    if (!amount) return "—";
    const prefix = currency === "USD" || currency === "USDC" ? "$" : "";
    return amount >= 1_000_000
        ? `${prefix}${(amount / 1_000_000).toFixed(2)}M`
        : amount >= 1_000
            ? `${prefix}${(amount / 1_000).toFixed(0)}K`
            : `${prefix}${amount.toLocaleString()}`;
}

function formatDate(ts?: number) {
    if (!ts) return null;
    const d = new Date(ts);
    const now = new Date();
    const days = Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
    if (days < 0) return "Closed";
    if (days === 0) return "Closes today";
    if (days <= 14) return `${days}d left`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Active Program Card ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProgramCard({ program }: { program: any }) {
    const deadline = formatDate(program.applicationEndDate);
    const deadlineUrgent = deadline && !["Closed", null].includes(deadline) && parseInt(deadline) <= 7;

    return (
        <Link href={`/grants/${program.slug}`}>
            <div className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <StatusBadge status={program.status} />
                        <MechanismBadge mechanism={program.mechanism} />
                    </div>
                    <IconExternalLink size={12} stroke={2} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <div>
                    <div className="text-sm font-semibold transition-colors group-hover:text-primary">{program.name}</div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">{program.description}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <IconChartLine size={10} stroke={2} />
                            {formatCurrency(program.budget, program.currency)}
                        </span>
                        <span className="flex items-center gap-1">
                            <IconFileText size={10} stroke={2} />
                            {program.applicationCount}
                        </span>
                    </div>
                    {deadline && (
                        <span className={cn("flex items-center gap-1 font-medium", deadlineUrgent ? "text-amber-600 dark:text-amber-400" : "")}>
                            <IconCalendar size={10} stroke={2} />
                            {deadline}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrgProfilePage() {
    const { slug } = useParams<{ slug: string }>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const org = useQuery((api as any).organizations.getBySlug, { slug });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programs = useQuery(
        (api as any).programs.listByOrg,
        org ? { organizationId: org._id, status: "active" } : "skip"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats = useQuery(
        (api as any).programs.getOrgStats,
        org ? { organizationId: org._id } : "skip"
    );

    if (org === undefined) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-4">
                    <Skeleton className="size-16 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!org) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <EmptyState
                    icon={IconBuilding}
                    title="Organization not found"
                    description="This organization doesn't exist or isn't public."
                    action={{ label: "Browse Grants", href: "/grants" }}
                />
            </div>
        );
    }

    const totalAllocated = stats?.totalAllocated ?? 0;
    const totalPrograms = stats?.totalProgramCount ?? 0;

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            <div className="border-b bg-muted/20 px-6 py-3">
                <div className="mx-auto max-w-3xl">
                    <Link href="/grants" className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground w-fit">
                        <IconChevronLeft size={13} stroke={2.5} />
                        Grants
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-5">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border bg-card">
                        {org.logo ? (
                            <img src={org.logo} alt={org.name} className="size-12 rounded-lg object-cover" />
                        ) : (
                            <IconBuilding size={24} stroke={1.5} className="text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">{org.name}</h1>
                        {org.description && (
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{org.description}</p>
                        )}
                        {/* External links */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                            {org.website && (
                                <a href={org.website} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
                                    <IconWorld size={12} stroke={2} />
                                    Website
                                </a>
                            )}
                            {org.github && (
                                <a href={`https://github.com/${org.github}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
                                    <IconBrandGithub size={12} stroke={2} />
                                    GitHub
                                </a>
                            )}
                            {org.twitter && (
                                <a href={`https://twitter.com/${org.twitter}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
                                    <IconBrandTwitter size={12} stroke={2} />
                                    Twitter
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border bg-card py-4">
                            <IconChartLine size={16} stroke={2} className="text-muted-foreground" />
                            <div className="text-lg font-bold">{totalPrograms}</div>
                            <div className="text-[11px] text-muted-foreground">Programs</div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border bg-primary/5 border-primary/20 py-4">
                            <IconCoins size={16} stroke={2} className="text-primary" />
                            <div className="text-lg font-bold text-primary">{formatCurrency(totalAllocated)}</div>
                            <div className="text-[11px] text-muted-foreground">Total Funded</div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border bg-card py-4">
                            <IconCircleCheck size={16} stroke={2} className="text-emerald-600 dark:text-emerald-400" />
                            <div className="text-lg font-bold">{stats.totalApproved ?? 0}</div>
                            <div className="text-[11px] text-muted-foreground">Grants Approved</div>
                        </div>
                    </div>
                )}

                {/* Active programs */}
                <div>
                    <div className="mb-3 text-sm font-semibold">
                        Active Programs
                        {programs && programs.length > 0 && (
                            <span className="ml-2 text-[11px] font-normal text-muted-foreground">({programs.length})</span>
                        )}
                    </div>

                    {programs === undefined ? (
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                        </div>
                    ) : programs.length === 0 ? (
                        <div className="rounded-xl border p-8 text-center">
                            <div className="text-xs text-muted-foreground">No active programs at the moment. Check back soon.</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {programs.map((p: any) => <ProgramCard key={p._id} program={p} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}