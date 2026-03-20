"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
    IconChartLine,
    IconFileText,
    IconCircleCheck,
    IconX,
    IconClock,
    IconCommand,
    IconTarget,
    IconTrendingUp,
    IconUsers,
    IconRefresh,
    IconChevronDown,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
}

function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function pct(num: number, denom: number) {
    if (!denom) return 0;
    return Math.round((num / denom) * 100);
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    accent,
    href,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    accent?: boolean;
    href?: string;
}) {
    const inner = (
        <div className={cn(
            "flex flex-col gap-3 rounded-xl border p-5 transition-all duration-150",
            href && "hover:border-primary/30 hover:shadow-sm cursor-pointer",
            accent ? "border-primary/20 bg-primary/3" : "border-border bg-card"
        )}>
            <div className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
                <Icon size={16} stroke={2} />
            </div>
            <div>
                <div className={cn(
                    "text-2xl font-semibold tracking-tight",
                    accent ? "text-primary" : "text-foreground"
                )}>
                    {value}
                </div>
                <div className="mt-0.5 text-xs font-medium">{label}</div>
                {sub && (
                    <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
                )}
            </div>
        </div>
    );
    if (href) return <Link href={href}>{inner}</Link>;
    return inner;
}

// ─── Mini bar ────────────────────────────────────────────────────────────────

function MiniBar({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
    const p = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${p}%` }} />
        </div>
    );
}

// ─── Funnel row ───────────────────────────────────────────────────────────────

function FunnelRow({
    label, count, total, color, icon: Icon,
}: {
    label: string; count: number; total: number; color: string; icon: React.ElementType;
}) {
    const percentage = pct(count, total);
    return (
        <div className="flex items-center gap-3">
            <div className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md",
                color.replace("bg-", "bg-").replace("/70", "/10")
            )}>
                <Icon size={12} stroke={2} className={color.replace("bg-", "text-").replace("/70", "")} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{label}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{count}</span>
                        <span className="text-[11px] text-muted-foreground w-8 text-right">{percentage}%</span>
                    </div>
                </div>
                <MiniBar value={count} max={total} color={color} />
            </div>
        </div>
    );
}

// ─── Program row ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProgramRow({ program, maxApps }: { program: any; maxApps: number }) {
    const approvalRate = pct(program.approvedCount, program.applicationCount);
    return (
        <Link href={`/dashboard/programs/${program._id}`}>
            <div className="group flex items-center gap-4 border-b px-5 py-3.5 last:border-b-0 transition-colors hover:bg-muted/30">
                <div className={cn(
                    "size-2 shrink-0 rounded-full",
                    program.status === "active" ? "bg-emerald-500"
                        : program.status === "paused" ? "bg-amber-500"
                            : "bg-muted-foreground/40"
                )} />
                <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-medium">{program.name}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">
                        {program.status} · {program.mechanism === "direct" ? "Direct grant" : "Milestone-based"}
                    </div>
                </div>
                <div className="w-24 space-y-1">
                    <MiniBar value={program.applicationCount} max={maxApps || 1} color="bg-primary/70" />
                    <div className="text-[10px] text-muted-foreground text-right">
                        {program.applicationCount} app{program.applicationCount !== 1 ? "s" : ""}
                    </div>
                </div>
                <div className="w-16 text-right">
                    <div className={cn(
                        "text-xs font-semibold",
                        approvalRate >= 50 ? "text-emerald-700 dark:text-emerald-400"
                            : approvalRate > 0 ? "text-amber-700 dark:text-amber-400"
                                : "text-muted-foreground"
                    )}>
                        {program.applicationCount > 0 ? `${approvalRate}%` : "—"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">approval</div>
                </div>
                <div className="w-20 text-right">
                    <div className="text-xs font-semibold">
                        {program.totalAllocated > 0 ? formatCurrency(program.totalAllocated) : "—"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">funded</div>
                </div>
            </div>
        </Link>
    );
}

// ─── Activity item ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RecentActivityItem({ log }: { log: any }) {
    const isPositive = log.action.includes("approved") || log.action.includes("published") || log.action.includes("completed");
    const isNegative = log.action.includes("rejected") || log.action.includes("deleted");
    return (
        <div className="flex items-start gap-3 py-2.5">
            <div className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                isPositive ? "bg-emerald-500/10" : isNegative ? "bg-destructive/10" : "bg-muted"
            )}>
                <div className={cn(
                    "size-1.5 rounded-full",
                    isPositive ? "bg-emerald-500" : isNegative ? "bg-destructive" : "bg-muted-foreground/50"
                )} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs leading-relaxed">{log.description}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{formatDate(log.createdAt)}</div>
            </div>
        </div>
    );
}

// ─── Program selector ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProgramSelector({ programs, selectedId, onSelect }: { programs: any[]; selectedId: string | null; onSelect: (id: string | null) => void }) {
    return (
        <div className="relative inline-flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconCommand size={12} stroke={2} />
                Viewing:
            </div>
            <div className="relative">
                <select
                    value={selectedId ?? ""}
                    onChange={(e) => onSelect(e.target.value || null)}
                    className="h-8 rounded-lg border border-input bg-background pl-3 pr-8 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                >
                    <option value="">All programs</option>
                    {programs.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
                <IconChevronDown
                    size={12}
                    stroke={2}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
    const { isAuthenticated } = useConvexAuth();
    const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

    const currentUser = useQuery(api.users.getCurrentUser, !isAuthenticated ? "skip" : undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myOrg = useQuery((api as any).organizations.getMyOrg, !isAuthenticated ? "skip" : undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgStats = useQuery((api as any).programs.getOrgStats, myOrg ? { organizationId: myOrg._id } : "skip");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programs = useQuery((api as any).programs.listByOrg, myOrg ? { organizationId: myOrg._id } : "skip");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allApplications = useQuery((api as any).applications.listByOrg, myOrg ? { organizationId: myOrg._id } : "skip");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgMembers = useQuery((api as any).organizationMembers.listMembers, myOrg ? { organizationId: myOrg._id } : "skip");

    // Per-program activity when a program is selected
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programActivity = useQuery(
        (api as any).activityLogs.getProgramActivity,
        selectedProgramId ? { programId: selectedProgramId as Id<"programs">, limit: 20 } : "skip"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgActivity = useQuery(
        (api as any).activityLogs.getOrgActivity,
        myOrg && !selectedProgramId ? { organizationId: myOrg._id, limit: 20 } : "skip"
    );

    const activity = selectedProgramId ? programActivity : orgActivity;

    const isLoading =
        myOrg === undefined || orgStats === undefined || programs === undefined ||
        allApplications === undefined || currentUser === undefined;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8 p-8">
                <div><Skeleton className="h-7 w-32" /><Skeleton className="mt-2 h-4 w-56" /></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                            <Skeleton className="size-8 rounded-lg" />
                            <Skeleton className="h-7 w-12" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (currentUser?.activeRole !== "manager") return null;

    if (!myOrg || orgStats?.totalProgramCount === 0) {
        return (
            <div className="flex flex-col gap-6 p-8">
                <div>
                    <h1 className="text-xl font-semibold">Analytics</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Performance insights for your grant programs.</p>
                </div>
                <div className="rounded-xl border p-10">
                    <EmptyState
                        icon={IconChartLine}
                        title="No data yet"
                        description="Analytics will appear once you've created and published grant programs."
                        action={{ label: "Create a Program", href: "/dashboard/programs/new" }}
                    />
                </div>
            </div>
        );
    }

    // ── Filter applications by selected program (or all) ────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredApps = selectedProgramId
        ? (allApplications ?? []).filter((a: any) => a.programId === selectedProgramId)
        : (allApplications ?? []);

    const totalApps = filteredApps.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const approvedApps = filteredApps.filter((a: any) => a.status === "approved").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rejectedApps = filteredApps.filter((a: any) => a.status === "rejected").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pendingApps = filteredApps.filter((a: any) => ["submitted", "under_review"].includes(a.status)).length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const draftApps = filteredApps.filter((a: any) => a.status === "draft").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withdrawnApps = filteredApps.filter((a: any) => a.status === "withdrawn").length;
    const overallApprovalRate = pct(approvedApps, totalApps - draftApps - withdrawnApps);

    // Org-level stats always use the full set
    const memberCount = (orgMembers?.members?.length ?? 0) + (orgMembers?.owner ? 1 : 0);
    const sortedPrograms = [...(programs ?? [])].sort((a: any, b: any) => b.applicationCount - a.applicationCount);
    const maxApps = sortedPrograms[0]?.applicationCount ?? 1;
    const activePrograms = programs?.filter((p: any) => p.status === "active").length ?? 0;
    const totalPrograms = programs?.length ?? 0;

    // Selected program for display
    const selectedProgram = selectedProgramId
        ? programs?.find((p: any) => p._id === selectedProgramId)
        : null;

    return (
        <div className="flex flex-col gap-8 p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">Analytics</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Performance overview for <span className="font-medium text-foreground">{myOrg.name}</span>.
                    </p>
                </div>
                {/* Program selector */}
                {programs && programs.length > 1 && (
                    <ProgramSelector
                        programs={programs}
                        selectedId={selectedProgramId}
                        onSelect={setSelectedProgramId}
                    />
                )}
            </div>

            {/* Selected program banner */}
            {selectedProgram && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <div className={cn(
                        "size-2 rounded-full shrink-0",
                        selectedProgram.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40"
                    )} />
                    <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-primary">{selectedProgram.name}</span>
                        <span className="text-xs text-muted-foreground ml-2 capitalize">
                            · {selectedProgram.status} · {selectedProgram.mechanism === "direct" ? "Direct grant" : "Milestone-based"}
                        </span>
                    </div>
                    <button
                        onClick={() => setSelectedProgramId(null)}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Clear ×
                    </button>
                </div>
            )}

            {/* Top stat cards — always org-level */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    label="Total Funded"
                    value={orgStats.totalAllocated > 0 ? formatCurrency(orgStats.totalAllocated) : "$0"}
                    sub={`Across ${orgStats.totalApproved} approved application${orgStats.totalApproved !== 1 ? "s" : ""}`}
                    icon={IconTrendingUp}
                    accent
                />
                <StatCard
                    label={selectedProgramId ? "Program Applications" : "Applications"}
                    value={totalApps}
                    sub={`${pendingApps} pending review`}
                    icon={IconFileText}
                    href={selectedProgramId ? undefined : "/dashboard/applications"}
                />
                <StatCard
                    label="Approval Rate"
                    value={totalApps > draftApps + withdrawnApps ? `${overallApprovalRate}%` : "—"}
                    sub={`${approvedApps} approved · ${rejectedApps} rejected`}
                    icon={IconCircleCheck}
                />
                <StatCard
                    label="Programs"
                    value={totalPrograms}
                    sub={`${activePrograms} active · ${memberCount} team member${memberCount !== 1 ? "s" : ""}`}
                    icon={IconCommand}
                    href="/dashboard/programs"
                />
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-3 gap-6">
                {/* Application funnel */}
                <div className="col-span-2 rounded-xl border bg-card">
                    <div className="border-b px-5 py-4">
                        <div className="text-sm font-medium">Application funnel</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {selectedProgram
                                ? `Applications for "${selectedProgram.name}"`
                                : "Where applications stand across all programs"}
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        {totalApps === 0 ? (
                            <p className="py-4 text-center text-xs text-muted-foreground">
                                No applications yet{selectedProgram ? " for this program" : " across your programs"}.
                            </p>
                        ) : (
                            <>
                                <FunnelRow label="Total received" count={totalApps} total={totalApps} color="bg-primary/70" icon={IconFileText} />
                                <FunnelRow label="Pending review" count={pendingApps} total={totalApps} color="bg-amber-500/70" icon={IconClock} />
                                <FunnelRow label="Approved" count={approvedApps} total={totalApps} color="bg-emerald-500/70" icon={IconCircleCheck} />
                                <FunnelRow label="Rejected" count={rejectedApps} total={totalApps} color="bg-destructive/60" icon={IconX} />
                                {withdrawnApps > 0 && (
                                    <FunnelRow label="Withdrawn" count={withdrawnApps} total={totalApps} color="bg-muted-foreground/40" icon={IconRefresh} />
                                )}
                            </>
                        )}
                    </div>
                    {totalApps > 0 && (
                        <div className="border-t px-5 py-3 flex items-center gap-6">
                            {[
                                { label: "Review rate", value: pct(totalApps - draftApps, totalApps), color: "text-primary" },
                                { label: "Approval rate", value: overallApprovalRate, color: approvedApps > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground" },
                                { label: "Rejection rate", value: pct(rejectedApps, totalApps - draftApps), color: rejectedApps > 0 ? "text-destructive" : "text-muted-foreground" },
                            ].map(({ label, value, color }) => (
                                <div key={label}>
                                    <div className={cn("text-lg font-semibold tracking-tight", color)}>{value}%</div>
                                    <div className="text-[10px] text-muted-foreground">{label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent activity */}
                <div className="rounded-xl border bg-card">
                    <div className="border-b px-5 py-4">
                        <div className="text-sm font-medium">
                            {selectedProgram ? "Program activity" : "Recent activity"}
                        </div>
                    </div>
                    <div className="divide-y px-5 max-h-80 overflow-y-auto">
                        {activity && activity.length > 0 ? (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            activity.map((log: any) => <RecentActivityItem key={log._id} log={log} />)
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-xs text-muted-foreground">No activity yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Programs breakdown table — hide when a single program is selected */}
            {!selectedProgramId && (
                <div className="rounded-xl border bg-card">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <div>
                            <div className="text-sm font-medium">Programs breakdown</div>
                            <div className="mt-0.5 text-[11px] text-muted-foreground">
                                Application volume, approval rates, and funding per program
                            </div>
                        </div>
                        <Link href="/dashboard/programs">
                            <span className="text-xs text-primary hover:underline">Manage programs →</span>
                        </Link>
                    </div>
                    {sortedPrograms.length === 0 ? (
                        <div className="p-10">
                            <EmptyState
                                icon={IconCommand}
                                title="No programs yet"
                                description="Create your first program to see per-program analytics here."
                                action={{ label: "Create Program", href: "/dashboard/programs/new" }}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 border-b px-5 py-2 bg-muted/20">
                                <div className="w-2 shrink-0" />
                                <div className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Program</div>
                                <div className="w-24 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Applications</div>
                                <div className="w-16 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Approval</div>
                                <div className="w-20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Funded</div>
                            </div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {sortedPrograms.map((program: any) => (
                                <ProgramRow key={program._id} program={program} maxApps={maxApps} />
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* Bottom quick stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border bg-card p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <IconTarget size={12} stroke={2} />
                        Avg. per program
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-xl font-semibold">
                                {totalPrograms > 0 ? Math.round((allApplications?.length ?? 0) / totalPrograms) : 0}
                            </div>
                            <div className="text-[11px] text-muted-foreground">applications</div>
                        </div>
                        <div>
                            <div className="text-xl font-semibold">
                                {totalPrograms > 0 && orgStats.totalAllocated > 0
                                    ? formatCurrency(orgStats.totalAllocated / totalPrograms)
                                    : "$0"}
                            </div>
                            <div className="text-[11px] text-muted-foreground">funded</div>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <IconUsers size={12} stroke={2} />
                        Team
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-xl font-semibold">{memberCount}</div>
                            <div className="text-[11px] text-muted-foreground">total members</div>
                        </div>
                        <div>
                            <div className="text-xl font-semibold">
                                {orgMembers?.members?.filter((m: any) => m.role === "reviewer").length ?? 0}
                            </div>
                            <div className="text-[11px] text-muted-foreground">reviewers</div>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <IconChartLine size={12} stroke={2} />
                        Pipeline
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className={cn("text-xl font-semibold", pendingApps > 0 ? "text-amber-700 dark:text-amber-400" : "")}>
                                {pendingApps}
                            </div>
                            <div className="text-[11px] text-muted-foreground">awaiting review</div>
                        </div>
                        <div>
                            <div className="text-xl font-semibold">{activePrograms}</div>
                            <div className="text-[11px] text-muted-foreground">active programs</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}