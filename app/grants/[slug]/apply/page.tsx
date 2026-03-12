"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
    IconChevronLeft,
    IconPlus,
    IconTrash,
    IconTarget,
    IconListSearch,
    IconChevronDown,
    IconChevronUp,
} from "@tabler/icons-react";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MilestoneInput {
    id: string;
    title: string;
    description: string;
    deliverables: string;
    amount: string;
    dueDate: string;
}

function newMilestone(order: number): MilestoneInput {
    return {
        id: `m-${Date.now()}-${order}`,
        title: "",
        description: "",
        deliverables: "",
        amount: "",
        dueDate: "",
    };
}

// ─── Milestone Row ────────────────────────────────────────────────────────────

function MilestoneEditor({
    milestone,
    index,
    onChange,
    onRemove,
    currency,
}: {
    milestone: MilestoneInput;
    index: number;
    onChange: (updated: MilestoneInput) => void;
    onRemove: () => void;
    currency?: string;
}) {
    const [expanded, setExpanded] = useState(true);
    const set = (k: keyof MilestoneInput, v: string) => onChange({ ...milestone, [k]: v });

    return (
        <div className="rounded-xl border bg-muted/20">
            {/* Header */}
            <div
                className="flex cursor-pointer items-center gap-3 px-4 py-3"
                onClick={() => setExpanded((v) => !v)}
            >
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {index + 1}
                </div>
                <span className="flex-1 truncate text-xs font-medium">
                    {milestone.title || `Milestone ${index + 1}`}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                    >
                        <IconTrash size={12} stroke={2} />
                    </button>
                    {expanded
                        ? <IconChevronUp size={13} stroke={2} className="text-muted-foreground" />
                        : <IconChevronDown size={13} stroke={2} className="text-muted-foreground" />}
                </div>
            </div>

            {/* Body */}
            {expanded && (
                <div className="border-t px-4 pb-4 pt-3">
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Title <span className="text-destructive">*</span></FieldLabel>
                            <Input
                                placeholder="e.g. Smart contract deployment"
                                value={milestone.title}
                                onChange={(e) => set("title", e.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Description <span className="text-destructive">*</span></FieldLabel>
                            <Textarea
                                placeholder="What will you build or deliver in this milestone?"
                                value={milestone.description}
                                onChange={(e) => set("description", e.target.value)}
                                className="min-h-16 resize-none"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Deliverables</FieldLabel>
                            <Textarea
                                placeholder="Specific outputs: GitHub repo, deployed contract, demo video..."
                                value={milestone.deliverables}
                                onChange={(e) => set("deliverables", e.target.value)}
                                className="min-h-14 resize-none"
                            />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field>
                                <FieldLabel>Amount ({currency ?? "USD"})</FieldLabel>
                                <Input
                                    type="number"
                                    placeholder="5000"
                                    value={milestone.amount}
                                    onChange={(e) => set("amount", e.target.value)}
                                    min="0"
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Target Due Date</FieldLabel>
                                <Input
                                    type="date"
                                    value={milestone.dueDate}
                                    onChange={(e) => set("dueDate", e.target.value)}
                                />
                            </Field>
                        </div>
                    </FieldGroup>
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplyPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const { isAuthenticated } = useConvexAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program = useQuery((api as any).programs.getBySlug, { slug });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myProjects = useQuery((api as any).projects.listMine, !isAuthenticated ? "skip" : undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createApplication = useMutation((api as any).applications.create);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submitApplication = useMutation((api as any).applications.submit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createMilestone = useMutation((api as any).milestones.create);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [requestedAmount, setRequestedAmount] = useState("");
    const [proposedTimeline, setProposedTimeline] = useState("");
    const [teamDescription, setTeamDescription] = useState("");
    const [relevantLinks, setRelevantLinks] = useState("");
    const [milestones, setMilestones] = useState<MilestoneInput[]>([newMilestone(0)]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDrafting, setIsDrafting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isMilestoneBased = program?.mechanism === "milestone";
    const canSubmit = title.trim().length > 0 && description.trim().length > 0;

    const milestonesValid =
        !isMilestoneBased ||
        milestones.every((m) => m.title.trim().length > 0 && m.description.trim().length > 0);

    // ── Loading ──────────────────────────────────────────────────────────────

    if (program === undefined || myProjects === undefined) {
        return (
            <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-64 w-full rounded-xl" />
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

    if (program.status !== "active") {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <EmptyState
                    icon={IconListSearch}
                    title="Applications closed"
                    description="This program is no longer accepting applications."
                    action={{ label: "Browse Other Programs", href: "/grants" }}
                />
            </div>
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    const buildApplicationArgs = () => ({
        programId: program._id as Id<"programs">,
        title: title.trim(),
        description: description.trim(),
        projectId: selectedProjectId ? selectedProjectId as Id<"projects"> : undefined,
        requestedAmount: requestedAmount ? parseFloat(requestedAmount) : undefined,
        proposedTimeline: proposedTimeline.trim() || undefined,
        teamDescription: teamDescription.trim() || undefined,
        relevantLinks: relevantLinks.trim()
            ? relevantLinks.split("\n").map((l) => l.trim()).filter(Boolean)
            : undefined,
    });

    const createMilestonesForApplication = async (applicationId: Id<"applications">) => {
        for (let i = 0; i < milestones.length; i++) {
            const m = milestones[i];
            if (!m.title.trim()) continue;
            await createMilestone({
                applicationId,
                title: m.title.trim(),
                description: m.description.trim(),
                order: i + 1,
                deliverables: m.deliverables.trim() || undefined,
                amount: m.amount ? parseFloat(m.amount) : undefined,
                dueDate: m.dueDate ? new Date(m.dueDate).getTime() : undefined,
            });
        }
    };

    // ── Save as draft ────────────────────────────────────────────────────────

    const handleSaveDraft = async () => {
        if (!canSubmit) return;
        setError(null);
        setIsDrafting(true);
        try {
            const applicationId = await createApplication(buildApplicationArgs());
            if (isMilestoneBased) {
                await createMilestonesForApplication(applicationId);
            }
            router.push(`/dashboard/applications/${applicationId}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
            setIsDrafting(false);
        }
    };

    // ── Submit ───────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!canSubmit || !milestonesValid) return;
        setError(null);
        setIsSubmitting(true);
        try {
            const applicationId = await createApplication(buildApplicationArgs());
            if (isMilestoneBased) {
                await createMilestonesForApplication(applicationId);
            }
            await submitApplication({ applicationId });
            router.push(`/dashboard/applications/${applicationId}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
            setIsSubmitting(false);
        }
    };

    const busy = isSubmitting || isDrafting;

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-muted/20 px-6 py-3">
                <div className="mx-auto max-w-2xl">
                    <Link
                        href={`/grants/${slug}`}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground w-fit"
                    >
                        <IconChevronLeft size={13} stroke={2.5} />
                        {program.name}
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-2xl px-6 py-8">
                {/* Header */}
                <div className="mb-8 space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">{program.organization?.name}</div>
                    <h1 className="text-2xl font-bold tracking-tight">{program.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        Fill out the form below to submit your application.
                        {program.applicationEndDate && (
                            <> Applications close on {new Date(program.applicationEndDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</>
                        )}
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Core info */}
                    <div className="rounded-xl border bg-card p-6">
                        <div className="mb-5 text-sm font-semibold">Application Details</div>
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Application Title <span className="text-destructive">*</span></FieldLabel>
                                <FieldDescription>A clear, descriptive title for your grant proposal.</FieldDescription>
                                <Input
                                    placeholder="Building a decentralized storage marketplace on Filecoin"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Field>

                            <Field>
                                <FieldLabel>Project Description <span className="text-destructive">*</span></FieldLabel>
                                <FieldDescription>
                                    What are you building? What problem does it solve? Why is this ecosystem the right fit?
                                </FieldDescription>
                                <Textarea
                                    placeholder="Our project builds a peer-to-peer marketplace that..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-32 resize-y"
                                />
                            </Field>

                            {/* Project selector */}
                            {myProjects && myProjects.length > 0 && (
                                <Field>
                                    <FieldLabel>Link to a Project (optional)</FieldLabel>
                                    <FieldDescription>Connect this application to an existing project in your portfolio.</FieldDescription>
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">No project selected</option>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {myProjects.map((p: any) => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </Field>
                            )}

                            {/* Requested amount */}
                            <Field>
                                <FieldLabel>Requested Amount</FieldLabel>
                                {program.maxGrantAmount && (
                                    <FieldDescription>
                                        Maximum grant: {program.currency === "USD" || program.currency === "USDC" ? "$" : ""}{program.maxGrantAmount.toLocaleString()} {program.currency ?? "USD"}
                                    </FieldDescription>
                                )}
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                                        {program.currency ?? "USD"}
                                    </span>
                                    <Input
                                        type="number"
                                        className="pl-14"
                                        placeholder="10000"
                                        value={requestedAmount}
                                        onChange={(e) => setRequestedAmount(e.target.value)}
                                        min="0"
                                        max={program.maxGrantAmount}
                                    />
                                </div>
                            </Field>
                        </FieldGroup>
                    </div>

                    {/* Team & timeline */}
                    <div className="rounded-xl border bg-card p-6">
                        <div className="mb-5 text-sm font-semibold">Team & Timeline</div>
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Proposed Timeline</FieldLabel>
                                <FieldDescription>How long will this project take? Describe key phases.</FieldDescription>
                                <Textarea
                                    placeholder="Month 1: Research & design&#10;Month 2-3: Core development&#10;Month 4: Testing & launch"
                                    value={proposedTimeline}
                                    onChange={(e) => setProposedTimeline(e.target.value)}
                                    className="min-h-20 resize-y"
                                />
                            </Field>

                            <Field>
                                <FieldLabel>Team Description</FieldLabel>
                                <FieldDescription>Who is working on this? Include relevant backgrounds.</FieldDescription>
                                <Textarea
                                    placeholder="Our team consists of two senior engineers with 5+ years experience in..."
                                    value={teamDescription}
                                    onChange={(e) => setTeamDescription(e.target.value)}
                                    className="min-h-20 resize-y"
                                />
                            </Field>

                            <Field>
                                <FieldLabel>Relevant Links</FieldLabel>
                                <FieldDescription>GitHub repos, demos, previous work — one URL per line.</FieldDescription>
                                <Textarea
                                    placeholder="https://github.com/myorg/myrepo&#10;https://demo.myproject.xyz"
                                    value={relevantLinks}
                                    onChange={(e) => setRelevantLinks(e.target.value)}
                                    className="min-h-16 resize-y font-mono text-xs"
                                />
                            </Field>
                        </FieldGroup>
                    </div>

                    {/* Milestones — only for milestone-based programs */}
                    {isMilestoneBased && (
                        <div className="rounded-xl border bg-card p-6">
                            <div className="mb-2 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold flex items-center gap-2">
                                        <IconTarget size={14} stroke={2} className="text-primary" />
                                        Milestones
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                                        Break your project into verifiable deliverables. Funding is released per milestone.
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 shrink-0"
                                    onClick={() => setMilestones([...milestones, newMilestone(milestones.length)])}
                                    disabled={busy}
                                >
                                    <IconPlus size={11} stroke={2.5} />
                                    Add
                                </Button>
                            </div>

                            <div className="mt-4 space-y-3">
                                {milestones.map((m, i) => (
                                    <MilestoneEditor
                                        key={m.id}
                                        milestone={m}
                                        index={i}
                                        currency={program.currency}
                                        onChange={(updated) => {
                                            const next = [...milestones];
                                            next[i] = updated;
                                            setMilestones(next);
                                        }}
                                        onRemove={() => {
                                            if (milestones.length > 1) {
                                                setMilestones(milestones.filter((_, idx) => idx !== i));
                                            }
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Total */}
                            {milestones.some((m) => m.amount) && (
                                <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                                    <span className="text-xs text-muted-foreground">Total milestone budget</span>
                                    <span className="text-xs font-semibold">
                                        {program.currency === "USD" || program.currency === "USDC" ? "$" : ""}
                                        {milestones
                                            .reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0)
                                            .toLocaleString()}
                                        {" "}{program.currency ?? "USD"}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/grants/${slug}`)}
                            disabled={busy}
                        >
                            Cancel
                        </Button>
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSaveDraft}
                                disabled={!canSubmit || busy}
                            >
                                {isDrafting ? (
                                    <span className="flex items-center gap-1.5">
                                        <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                                        Saving...
                                    </span>
                                ) : "Save Draft"}
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={!canSubmit || !milestonesValid || busy}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-1.5">
                                        <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                                        Submitting...
                                    </span>
                                ) : "Submit Application"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}