"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
    IconChevronLeft,
    IconBrandGithub,
    IconWorld,
    IconExternalLink,
    IconCode,
    IconCircleCheck,
    IconFileText,
    IconCalendar,
    IconTarget,
    IconChevronRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts?: number) {
    if (!ts) return null;
    return new Date(ts).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateShort(ts?: number) {
    if (!ts) return null;
    return new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(amount?: number) {
    if (!amount) return null;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({
    icon: Icon,
    label,
    value,
    accent,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    accent?: boolean;
}) {
    return (
        <div className="flex flex-col items-center gap-1 rounded-xl border bg-card px-5 py-4">
            <div className={cn(
                "flex size-7 items-center justify-center rounded-lg",
                accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
                <Icon size={14} stroke={2} />
            </div>
            <div className={cn("text-xl font-semibold tracking-tight", accent && "text-primary")}>
                {value}
            </div>
            <div className="text-[11px] text-muted-foreground">{label}</div>
        </div>
    );
}

// ─── Project card ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectCard({ project }: { project: any }) {
    const tags = [
        ...(project.categories ?? []).slice(0, 2),
        ...(project.ecosystems ?? []).slice(0, 1),
    ].slice(0, 3);

    return (
        <Link href={`/projects/${project.slug}`}>
            <div className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <IconCode size={14} stroke={2} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                            {project.name}
                        </div>
                        {project.grantCount > 0 && (
                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                <IconCircleCheck size={9} stroke={2.5} />
                                {project.grantCount}
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                        {project.description}
                    </p>
                    {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="rounded-full border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <IconChevronRight
                    size={13}
                    stroke={2}
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 mt-0.5"
                />
            </div>
        </Link>
    );
}

// ─── Grant row ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GrantRow({ grant }: { grant: any }) {
    return (
        <div className="flex items-center gap-4 border-b px-5 py-3.5 last:border-b-0">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <IconCircleCheck size={12} stroke={2} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="truncate text-xs font-medium">{grant.title}</div>
                <div className="text-[11px] text-muted-foreground">
                    {grant.program?.slug ? (
                        <Link href={`/grants/${grant.program.slug}`} className="hover:text-foreground transition-colors">
                            {grant.program.name}
                        </Link>
                    ) : (grant.program?.name ?? "Unknown program")}
                    {grant.project?.slug ? (
                        <Link href={`/projects/${grant.project.slug}`} className="hover:text-foreground transition-colors">
                            {` · ${grant.project.name}`}
                        </Link>
                    ) : grant.project ? ` · ${grant.project.name}` : null}
                </div>
            </div>
            <div className="shrink-0 text-right">
                {grant.approvedAmount && (
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(grant.approvedAmount)}
                    </div>
                )}
                {grant.approvedAt && (
                    <div className="text-[11px] text-muted-foreground">
                        {formatDateShort(grant.approvedAt)}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuilderProfilePage() {
    const { username } = useParams<{ username: string }>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder = useQuery((api as any).profiles.getBuilderByUsername, { username });

    if (builder === undefined) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] bg-background">
                <div className="border-b bg-muted/20 px-6 py-3">
                    <div className="mx-auto max-w-4xl">
                        <Skeleton className="h-4 w-28" />
                    </div>
                </div>
                <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
                    <div className="flex items-start gap-5">
                        <Skeleton className="size-20 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-full max-w-md" />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                    </div>
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!builder) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <EmptyState
                    icon={IconCode}
                    title="Builder not found"
                    description="This profile doesn't exist or belongs to a program manager account."
                    action={{ label: "Browse Builders", href: "/builders" }}
                />
            </div>
        );
    }

    const funded = formatCurrency(builder.totalEarned);

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            {/* Breadcrumb — back to /builders */}
            <div className="border-b bg-muted/20 px-6 py-3">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/builders"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground w-fit"
                    >
                        <IconChevronLeft size={13} stroke={2.5} />
                        Browse Builders
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
                {/* Profile header */}
                <div className="flex items-start gap-5">
                    {builder.avatar ? (
                        <img
                            src={builder.avatar}
                            alt={builder.name}
                            className="size-20 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
                            {builder.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                    )}

                    <div className="flex-1 min-w-0 pt-1">
                        <h1 className="text-2xl font-bold tracking-tight">{builder.name}</h1>
                        <div className="mt-0.5 text-sm text-muted-foreground">@{builder.username}</div>

                        {builder.bio && (
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xl">
                                {builder.bio}
                            </p>
                        )}

                        <div className="mt-3 flex items-center gap-4 flex-wrap">
                            {builder.github && (
                                <a
                                    href={`https://github.com/${builder.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <IconBrandGithub size={13} stroke={2} />
                                    {builder.github}
                                </a>
                            )}
                            {builder.twitter && (
                                <a
                                    href={`https://twitter.com/${builder.twitter}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <span className="text-[11px] font-bold">𝕏</span>
                                    @{builder.twitter}
                                </a>
                            )}
                            {builder.website && (
                                <a
                                    href={builder.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <IconWorld size={13} stroke={2} />
                                    {builder.website.replace(/^https?:\/\//, "")}
                                </a>
                            )}
                            {builder.createdAt && (
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <IconCalendar size={13} stroke={2} />
                                    Joined {formatDate(builder.createdAt)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skills */}
                {builder.skills && builder.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {builder.skills.map((skill: string) => (
                            <span
                                key={skill}
                                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-medium text-muted-foreground"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3">
                    <StatPill
                        icon={IconCircleCheck}
                        label="Grants received"
                        value={builder.grantCount}
                        accent={builder.grantCount > 0}
                    />
                    <StatPill
                        icon={IconTarget}
                        label="Total earned"
                        value={funded ?? "$0"}
                        accent={builder.totalEarned > 0}
                    />
                    <StatPill
                        icon={IconCode}
                        label="Projects"
                        value={builder.projectCount}
                    />
                    <StatPill
                        icon={IconFileText}
                        label="Applications"
                        value={builder.applicationCount}
                    />
                </div>

                <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
                    {/* Left — projects + grants */}
                    <div className="space-y-6">
                        {/* Projects */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-sm font-semibold">
                                    Projects
                                    {builder.projectCount > 0 && (
                                        <span className="ml-1.5 text-muted-foreground font-normal">
                                            ({builder.projectCount})
                                        </span>
                                    )}
                                </h2>
                                {builder.projectCount > 0 && (
                                    <Link
                                        href="/projects"
                                        className="text-[11px] text-primary hover:underline"
                                    >
                                        Browse all →
                                    </Link>
                                )}
                            </div>

                            {builder.projects.length > 0 ? (
                                <div className="space-y-2">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {builder.projects.map((project: any) => (
                                        <ProjectCard key={project._id} project={project} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed p-8 text-center">
                                    <p className="text-xs text-muted-foreground">No public projects yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Grants received */}
                        {builder.grantsReceived.length > 0 && (
                            <div>
                                <div className="mb-3">
                                    <h2 className="text-sm font-semibold">
                                        Funding history
                                        <span className="ml-1.5 text-muted-foreground font-normal">
                                            ({builder.grantCount})
                                        </span>
                                    </h2>
                                </div>
                                <div className="rounded-xl border">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {builder.grantsReceived.map((grant: any) => (
                                        <GrantRow key={grant._id} grant={grant} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right — sidebar */}
                    <div className="sticky top-24 space-y-4">
                        {/* Funding summary */}
                        {builder.totalEarned > 0 && (
                            <div className="rounded-xl border bg-card p-5 space-y-3">
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Funding summary
                                </div>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-muted-foreground">Total received</span>
                                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                            {funded}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-muted-foreground">Grants</span>
                                        <span className="font-medium">{builder.grantCount}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-muted-foreground">Applications</span>
                                        <span className="font-medium">{builder.applicationCount}</span>
                                    </div>
                                    {builder.applicationCount > 0 && (
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-muted-foreground">Success rate</span>
                                            <span className="font-medium">
                                                {Math.round((builder.grantCount / builder.applicationCount) * 100)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Browse grants CTA */}
                        <div className="rounded-xl border bg-muted/20 p-5 space-y-2">
                            <div className="text-xs font-medium">Want to fund builders like this?</div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Browse active grant programs and apply for funding.
                            </p>
                            <Link
                                href="/grants"
                                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                                Browse grant programs
                                <IconExternalLink size={11} stroke={2} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}