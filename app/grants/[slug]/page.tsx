"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MechanismBadge, StatusBadge } from "@/components/dashboard/programs/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
    IconChevronLeft,
    IconListSearch,
    IconCalendar,
    IconChartLine,
    IconFileText,
    IconCheck,
    IconExternalLink,
    IconTarget,
    IconCoins,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SignInButton } from "@clerk/nextjs";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBudget(budget?: number, currency = "USD") {
    if (!budget) return "Open budget";
    const prefix = currency === "USD" || currency === "USDC" ? "$" : "";
    return `${prefix}${budget.toLocaleString()}${prefix ? "" : ` ${currency}`}`;
}

function formatDate(ts?: number) {
    if (!ts) return null;
    return new Date(ts).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
    });
}

function daysUntil(ts?: number) {
    if (!ts) return null;
    const days = Math.ceil((ts - Date.now()) / 86_400_000);
    if (days < 0) return "Closed";
    if (days === 0) return "Closes today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
}

// ─── Section ─────────────────────────────────────────────────────────────────

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
            {children}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GrantDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { isAuthenticated } = useConvexAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program = useQuery((api as any).programs.getBySlug, { slug });

    if (program === undefined) {
        return (
            <div className="mx-auto max-w-5xl px-6 py-10 grid grid-cols-[1fr_300px] gap-8">
                <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>
        );
    }

    if (!program) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <EmptyState
                    icon={IconListSearch}
                    title="Program not found"
                    description="This grant program doesn't exist or is no longer available."
                    action={{ label: "Browse Programs", href: "/grants" }}
                />
            </div>
        );
    }

    const isAcceptingApplications = program.status === "active";
    const deadline = daysUntil(program.applicationEndDate);
    const deadlineUrgent = deadline && !["Closed", null].includes(deadline) &&
        parseInt(deadline) <= 7;

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-muted/20 px-6 py-3">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/grants"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground w-fit"
                    >
                        <IconChevronLeft size={13} stroke={2.5} />
                        Browse Grants
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-6 py-8">
                <div className="grid grid-cols-[1fr_300px] gap-8 items-start">
                    {/* Left — main content */}
                    <div className="space-y-5">
                        {/* Header */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <StatusBadge status={program.status} />
                                <MechanismBadge mechanism={program.mechanism} />
                                {program.categories?.slice(0, 3).map((cat: string) => (
                                    <span
                                        key={cat}
                                        className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>

                            {/* Org */}
                            <div className="flex items-center gap-2">
                                <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                                    <div className="size-2.5 rounded-sm bg-primary" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">
                                    {program.organization?.name}
                                </span>
                                {program.organization?.website && (
                                    <a
                                        href={program.organization.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <IconExternalLink size={12} stroke={2} />
                                    </a>
                                )}
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight">{program.name}</h1>

                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {program.description}
                            </p>
                        </div>

                        {/* Eligibility */}
                        {program.eligibilityCriteria && (
                            <DetailSection title="Eligibility Criteria">
                                <div className="prose prose-sm max-w-none text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                                    {program.eligibilityCriteria}
                                </div>
                            </DetailSection>
                        )}

                        {/* Application requirements */}
                        {program.applicationRequirements && (
                            <DetailSection title="Application Requirements">
                                <div className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                                    {program.applicationRequirements}
                                </div>
                            </DetailSection>
                        )}

                        {/* Mechanism explainer */}
                        <DetailSection title="Funding Mechanism">
                            <div className="flex items-start gap-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    {program.mechanism === "direct"
                                        ? <IconCoins size={15} stroke={2} className="text-primary" />
                                        : <IconTarget size={15} stroke={2} className="text-primary" />}
                                </div>
                                <div>
                                    <div className="text-xs font-semibold">
                                        {program.mechanism === "direct" ? "Direct Grant" : "Milestone-Based Grant"}
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                                        {program.mechanism === "direct"
                                            ? "Approved applicants receive the full grant amount upon approval. No milestone tracking required."
                                            : "Funding is disbursed in stages as you complete and submit milestone deliverables for review."}
                                    </div>
                                </div>
                            </div>
                        </DetailSection>

                        {/* Timeline */}
                        {(program.applicationStartDate || program.applicationEndDate || program.reviewStartDate) && (
                            <DetailSection title="Timeline">
                                <div className="space-y-2.5">
                                    {[
                                        { label: "Applications Open", date: program.applicationStartDate },
                                        { label: "Applications Close", date: program.applicationEndDate },
                                        { label: "Review Starts", date: program.reviewStartDate },
                                        { label: "Review Ends", date: program.reviewEndDate },
                                    ]
                                        .filter((item) => item.date)
                                        .map(({ label, date }) => (
                                            <div key={label} className="flex items-center gap-3">
                                                <IconCalendar size={12} stroke={2} className="shrink-0 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground w-36">{label}</span>
                                                <span className="text-xs font-medium">{formatDate(date)}</span>
                                            </div>
                                        ))}
                                </div>
                            </DetailSection>
                        )}
                    </div>

                    {/* Right — apply sidebar */}
                    <div className="sticky top-24 space-y-4">
                        {/* Apply card */}
                        <div className="rounded-xl border bg-card p-5 space-y-4">
                            {/* Budget */}
                            <div className="space-y-1">
                                <div className="text-2xl font-bold tracking-tight">
                                    {formatBudget(program.budget, program.currency)}
                                </div>
                                <div className="text-[11px] text-muted-foreground">Total program budget</div>
                            </div>

                            {program.maxGrantAmount && (
                                <div className="text-xs text-muted-foreground">
                                    Up to {formatBudget(program.maxGrantAmount, program.currency)} per application
                                </div>
                            )}

                            {/* Deadline indicator */}
                            {deadline && (
                                <div className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
                                    deadlineUrgent
                                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <IconCalendar size={12} stroke={2} />
                                    {deadline}
                                </div>
                            )}

                            {/* Apply CTA */}
                            {isAcceptingApplications ? (
                                isAuthenticated ? (
                                    <Link href={`/grants/${slug}/apply`} className="block">
                                        <Button size="sm" className="w-full">
                                            Apply Now
                                        </Button>
                                    </Link>
                                ) : (
                                    <SignInButton forceRedirectUrl={`/grants/${slug}/apply`}>
                                        <Button size="sm" className="w-full cursor-pointer">
                                            Sign in to Apply
                                        </Button>
                                    </SignInButton>
                                )
                            ) : (
                                <Button size="sm" className="w-full" disabled>
                                    {program.status === "draft" ? "Not yet open" :
                                        program.status === "paused" ? "Applications Paused" :
                                            "Applications Closed"}
                                </Button>
                            )}

                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <IconFileText size={11} stroke={2} />
                                {program.applicationCount} application{program.applicationCount !== 1 ? "s" : ""} submitted
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                            {[
                                { icon: IconChartLine, label: "Approved", value: `${program.approvedCount} project${program.approvedCount !== 1 ? "s" : ""}` },
                                { icon: IconCoins, label: "Total Funded", value: formatBudget(program.totalAllocated, program.currency) },
                                ...(program.ecosystems?.length ? [{ icon: IconCheck, label: "Ecosystems", value: program.ecosystems.join(", ") }] : []),
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center justify-between text-[11px]">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Icon size={11} stroke={2} />
                                        {label}
                                    </span>
                                    <span className="font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}