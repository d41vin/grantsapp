"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
    IconChevronLeft,
    IconTarget,
    IconCheck,
    IconX,
    IconRefresh,
    IconCalendar,
    IconAlertCircle,
    IconCircleCheck,
    IconExternalLink,
    IconPlayerPlay,
} from "@tabler/icons-react";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(ts?: number) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
    });
}

function daysUntil(ts?: number) {
    if (!ts) return null;
    const days = Math.ceil((ts - Date.now()) / 86_400_000);
    if (days < 0) return { text: "Overdue", urgent: true };
    if (days === 0) return { text: "Due today", urgent: true };
    if (days <= 3) return { text: `${days} day${days !== 1 ? "s" : ""} left`, urgent: true };
    return { text: `${days} days left`, urgent: false };
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "text-muted-foreground", bg: "bg-muted" },
    in_progress: { label: "In Progress", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10" },
    submitted: { label: "Submitted", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-500/10" },
    approved: { label: "Approved", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    rejected: { label: "Rejected", color: "text-destructive", bg: "bg-destructive/10" },
    revision_requested: { label: "Revision Requested", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-500/10" },
};

// ─── Section ─────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
            {children}
        </div>
    );
}

// ─── Builder Submit Panel ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BuilderPanel({ milestone }: { milestone: any }) {
    const [submissionNotes, setSubmissionNotes] = useState(milestone.submissionNotes ?? "");
    const [isStarting, setIsStarting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startProgress = useMutation((api as any).milestones.startProgress);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submitMilestone = useMutation((api as any).milestones.submit);

    const handleStart = async () => {
        setError(null);
        setIsStarting(true);
        try {
            await startProgress({ milestoneId: milestone._id });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to start milestone.");
        } finally {
            setIsStarting(false);
        }
    };

    const handleSubmit = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            await submitMilestone({
                milestoneId: milestone._id,
                submissionNotes: submissionNotes.trim() || undefined,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to submit milestone.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Approved
    if (milestone.status === "approved") {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-2 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    <IconCircleCheck size={15} stroke={2} />
                    Milestone Approved
                </div>
                {milestone.amount && (
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        ${milestone.amount.toLocaleString()} released
                    </div>
                )}
                {milestone.reviewNotes && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{milestone.reviewNotes}</p>
                )}
                <div className="text-[11px] text-muted-foreground">
                    {formatDate(milestone.reviewedAt)}
                </div>
            </div>
        );
    }

    // Rejected
    if (milestone.status === "rejected") {
        return (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                    <IconX size={15} stroke={2} />
                    Milestone Rejected
                </div>
                {milestone.reviewNotes && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{milestone.reviewNotes}</p>
                )}
            </div>
        );
    }

    // Revision requested
    if (milestone.status === "revision_requested") {
        return (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 space-y-3 dark:border-orange-900/50 dark:bg-orange-950/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-400">
                    <IconAlertCircle size={15} stroke={2} />
                    Revision Requested
                </div>
                {milestone.reviewNotes && (
                    <p className="text-xs leading-relaxed text-orange-800 dark:text-orange-300">
                        {milestone.reviewNotes}
                    </p>
                )}
                <Field>
                    <FieldLabel>Updated Submission Notes</FieldLabel>
                    <FieldDescription>Address the feedback above and resubmit.</FieldDescription>
                    <Textarea
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        placeholder="GitHub PR, demo link, deployed contract address..."
                        className="min-h-20 resize-none"
                    />
                </Field>
                {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}
                <Button size="sm" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Resubmitting..." : "Resubmit Milestone"}
                </Button>
            </div>
        );
    }

    // Submitted — waiting
    if (milestone.status === "submitted") {
        return (
            <div className="rounded-xl border bg-blue-50 border-blue-200 p-5 space-y-2 dark:border-blue-900/50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                    <IconCheck size={15} stroke={2} />
                    Submitted for Review
                </div>
                <p className="text-xs text-muted-foreground">
                    Your submission is pending review. You&apos;ll be notified when a decision is made.
                </p>
                {milestone.submissionNotes && (
                    <div className="pt-1 text-[11px] text-muted-foreground">
                        Submitted: {milestone.submissionNotes}
                    </div>
                )}
            </div>
        );
    }

    // In progress — submit form
    if (milestone.status === "in_progress") {
        return (
            <div className="rounded-xl border bg-card p-5 space-y-4">
                <div className="text-sm font-semibold">Submit Milestone</div>
                <Field>
                    <FieldLabel>Submission Notes</FieldLabel>
                    <FieldDescription>
                        Link to your deliverables — GitHub PR, deployed contract, demo video, etc.
                    </FieldDescription>
                    <Textarea
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        placeholder="https://github.com/myorg/myrepo/pull/42&#10;https://goerli.etherscan.io/address/0x..."
                        className="min-h-24 resize-none font-mono text-xs"
                    />
                </Field>
                {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}
                <Button size="sm" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <span className="flex items-center gap-1.5">
                            <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                            Submitting...
                        </span>
                    ) : "Submit for Review"}
                </Button>
            </div>
        );
    }

    // Pending — start CTA
    return (
        <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="text-sm font-semibold">Start Working</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Mark this milestone as in progress when you&apos;re ready to begin. This signals to the reviewer that work has started.
            </p>
            {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}
            <Button size="sm" className="w-full gap-1.5" onClick={handleStart} disabled={isStarting}>
                <IconPlayerPlay size={12} stroke={2} />
                {isStarting ? "Starting..." : "Start Milestone"}
            </Button>
        </div>
    );
}

// ─── Manager Review Panel ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ManagerPanel({ milestone }: { milestone: any }) {
    const [decision, setDecision] = useState<"approved" | "rejected" | "revision_requested" | null>(null);
    const [reviewNotes, setReviewNotes] = useState(milestone.reviewNotes ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewMilestone = useMutation((api as any).milestones.review);

    const alreadyReviewed = ["approved", "rejected"].includes(milestone.status);

    const handleSubmit = async () => {
        if (!decision) return;
        setError(null);
        setIsSubmitting(true);
        try {
            await reviewMilestone({
                milestoneId: milestone._id,
                decision,
                reviewNotes: reviewNotes.trim() || undefined,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to submit review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (alreadyReviewed) {
        const approved = milestone.status === "approved";
        return (
            <div className={cn(
                "rounded-xl border p-5 space-y-2",
                approved
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-destructive/20 bg-destructive/5"
            )}>
                <div className={cn("flex items-center gap-2 text-sm font-semibold", approved ? "text-emerald-700 dark:text-emerald-300" : "text-destructive")}>
                    {approved ? <IconCircleCheck size={15} stroke={2} /> : <IconX size={15} stroke={2} />}
                    {approved ? "Approved" : "Rejected"}
                </div>
                {milestone.reviewNotes && <p className="text-xs text-muted-foreground leading-relaxed">{milestone.reviewNotes}</p>}
                <div className="text-[11px] text-muted-foreground">{formatDate(milestone.reviewedAt)}</div>
            </div>
        );
    }

    if (milestone.status !== "submitted") {
        return (
            <div className="rounded-xl border bg-muted/30 p-5">
                <p className="text-xs text-muted-foreground">
                    This milestone is <strong>{milestone.status.replace("_", " ")}</strong> and hasn&apos;t been submitted for review yet.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="text-sm font-semibold">Review Milestone</div>

            {/* Decision buttons */}
            <div className="grid grid-cols-3 gap-2">
                {(["approved", "revision_requested", "rejected"] as const).map((d) => {
                    const labels: Record<string, string> = { approved: "Approve", revision_requested: "Request Revision", rejected: "Reject" };
                    const icons: Record<string, React.ReactNode> = {
                        approved: <IconCheck size={12} stroke={2.5} />,
                        revision_requested: <IconRefresh size={12} stroke={2.5} />,
                        rejected: <IconX size={12} stroke={2.5} />,
                    };
                    const activeStyles: Record<string, string> = {
                        approved: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
                        revision_requested: "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
                        rejected: "border-destructive/50 bg-destructive/5 text-destructive",
                    };
                    return (
                        <button
                            key={d}
                            onClick={() => setDecision(d)}
                            className={cn(
                                "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-[10px] font-medium transition-all cursor-pointer",
                                decision === d ? activeStyles[d] : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                            )}
                        >
                            {icons[d]}
                            {labels[d]}
                        </button>
                    );
                })}
            </div>

            <Field>
                <FieldLabel>Review Notes</FieldLabel>
                <FieldDescription>
                    {decision === "revision_requested"
                        ? "Explain what changes are needed."
                        : decision === "rejected"
                            ? "Explain why this milestone is being rejected."
                            : "Optional feedback for the builder."}
                </FieldDescription>
                <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder={
                        decision === "revision_requested"
                            ? "Please update the smart contract to include..."
                            : decision === "rejected"
                                ? "This milestone was rejected because..."
                                : "Great work! The deliverables meet the requirements..."
                    }
                    className="min-h-20 resize-none"
                />
            </Field>

            {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}

            <Button
                size="sm"
                className="w-full"
                onClick={handleSubmit}
                disabled={!decision || isSubmitting}
                variant={decision === "rejected" ? "destructive" : "default"}
            >
                {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                        <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                        Submitting...
                    </span>
                ) : decision === "approved" ? "Approve Milestone"
                    : decision === "rejected" ? "Reject Milestone"
                        : decision === "revision_requested" ? "Request Revision"
                            : "Select a Decision"}
            </Button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MilestoneDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useConvexAuth();

    const currentUser = useQuery(api.users.getCurrentUser, !isAuthenticated ? "skip" : undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const milestone = useQuery((api as any).milestones.getById, {
        milestoneId: id as Id<"milestones">,
    });

    if (milestone === undefined || currentUser === undefined) {
        return (
            <div className="grid grid-cols-[1fr_300px] gap-8 p-8">
                <div className="space-y-5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
                <Skeleton className="h-56 w-full rounded-xl" />
            </div>
        );
    }

    if (!milestone) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <EmptyState
                    icon={IconTarget}
                    title="Milestone not found"
                    description="This milestone doesn't exist or you don't have access to it."
                    action={{ label: "Back to Milestones", href: "/dashboard/milestones" }}
                />
            </div>
        );
    }

    const isManager = currentUser?.activeRole === "manager";
    const meta = STATUS_META[milestone.status] ?? STATUS_META.pending;
    const due = daysUntil(milestone.dueDate);

    return (
        <div className="flex flex-col gap-6 p-8">
            {/* Breadcrumb */}
            <Link
                href="/dashboard/milestones"
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground w-fit"
            >
                <IconChevronLeft size={13} stroke={2.5} />
                Milestones
            </Link>

            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <IconTarget size={16} stroke={2} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", meta.bg, meta.color)}>
                            {meta.label}
                        </span>
                        {milestone.order && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Milestone #{milestone.order}
                            </span>
                        )}
                    </div>
                    <h1 className="mt-1 text-xl font-semibold leading-tight">{milestone.title}</h1>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {milestone.program && (
                            <Link href={`/grants/${milestone.program.slug}`} className="flex items-center gap-1 transition-colors hover:text-foreground">
                                {milestone.program.name}
                                <IconExternalLink size={11} stroke={2} />
                            </Link>
                        )}
                        {milestone.application && (
                            <Link href={`/dashboard/applications/${milestone.applicationId}`} className="flex items-center gap-1 transition-colors hover:text-foreground">
                                {milestone.application.title}
                                <IconExternalLink size={11} stroke={2} />
                            </Link>
                        )}
                        {due && (
                            <span className={cn("flex items-center gap-1 font-medium", due.urgent ? "text-amber-600 dark:text-amber-400" : "")}>
                                <IconCalendar size={11} stroke={2} />
                                {due.text}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left */}
                <div className="space-y-5">
                    {/* Description */}
                    <div className="rounded-xl border bg-card p-5 space-y-4">
                        <Section title="Description">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{milestone.description}</p>
                        </Section>

                        {milestone.deliverables && (
                            <Section title="Expected Deliverables">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                                    {milestone.deliverables}
                                </p>
                            </Section>
                        )}
                    </div>

                    {/* Submission notes (if submitted) */}
                    {milestone.submissionNotes && (
                        <div className="rounded-xl border bg-card p-5">
                            <Section title="Submission Notes">
                                <div className="rounded-lg bg-muted/50 px-3 py-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                                    {milestone.submissionNotes}
                                </div>
                            </Section>
                        </div>
                    )}
                </div>

                {/* Right */}
                <div className="space-y-4">
                    {isManager ? <ManagerPanel milestone={milestone} /> : <BuilderPanel milestone={milestone} />}

                    {/* Meta */}
                    <div className="rounded-xl border bg-muted/30 p-4 space-y-2.5">
                        {milestone.amount && (
                            <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-semibold text-primary">${milestone.amount.toLocaleString()}</span>
                            </div>
                        )}
                        {milestone.dueDate && (
                            <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">Due Date</span>
                                <span className="font-medium">{formatDate(milestone.dueDate)}</span>
                            </div>
                        )}
                        {milestone.submittedAt && (
                            <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">Submitted</span>
                                <span className="font-medium">{formatDate(milestone.submittedAt)}</span>
                            </div>
                        )}
                        {isManager && milestone.applicant && (
                            <div className="flex justify-between text-[11px]">
                                <span className="text-muted-foreground">Builder</span>
                                <Link
                                    href={`/builders/${milestone.applicant.username}`}
                                    className="font-medium hover:text-primary transition-colors"
                                >
                                    @{milestone.applicant.username}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}