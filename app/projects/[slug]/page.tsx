"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
    IconChevronLeft,
    IconGridDots,
    IconBrandGithub,
    IconWorld,
    IconExternalLink,
    IconCode,
    IconCircleCheck,
    IconFileText,
    IconTarget,
    IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SignInButton } from "@clerk/nextjs";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(ts?: number) {
    if (!ts) return null;
    return new Date(ts).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatCurrency(amount?: number) {
    if (!amount) return null;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
}

// ─── Detail section ───────────────────────────────────────────────────────────

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </div>
            {children}
        </div>
    );
}

// ─── Stat item ────────────────────────────────────────────────────────────────

function StatItem({
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
        <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
                <Icon size={11} stroke={2} />
                {label}
            </span>
            <span className={cn("font-medium", accent && "text-emerald-700 dark:text-emerald-400")}>
                {value}
            </span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { isAuthenticated } = useConvexAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = useQuery((api as any).projects.getBySlug, { slug });

    if (project === undefined) {
        return (
            <div className="mx-auto max-w-5xl px-6 py-10 grid grid-cols-[1fr_280px] gap-8">
                <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <EmptyState
                    icon={IconGridDots}
                    title="Project not found"
                    description="This project doesn't exist or is no longer available."
                    action={{ label: "Browse Projects", href: "/projects" }}
                />
            </div>
        );
    }

    const funded = formatCurrency(project.totalFunded);
    const tags = [
        ...(project.categories ?? []),
        ...(project.ecosystems ?? []),
    ];

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-muted/20 px-6 py-3">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/projects"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground w-fit"
                    >
                        <IconChevronLeft size={13} stroke={2.5} />
                        Browse Projects
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-6 py-8">
                <div className="grid grid-cols-[1fr_280px] gap-8 items-start">
                    {/* Left — main content */}
                    <div className="space-y-5">
                        {/* Header */}
                        <div className="space-y-3">
                            {/* Tags */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {tags.slice(0, 5).map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Project identity */}
                            <div className="flex items-center gap-3">
                                {project.logo ? (
                                    <img
                                        src={project.logo}
                                        alt={project.name}
                                        className="size-10 rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                                        <IconCode size={18} stroke={2} className="text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                                    {project.owner && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            by @{project.owner.username}
                                            {project.owner.name && ` · ${project.owner.name}`}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Funding badge */}
                            {project.grantCount > 0 && (
                                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                                    <IconCircleCheck size={13} stroke={2} className="text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                        {project.grantCount} grant{project.grantCount !== 1 ? "s" : ""} received
                                        {funded && ` · ${funded} total`}
                                    </span>
                                </div>
                            )}

                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {project.description}
                            </p>
                        </div>

                        {/* Links */}
                        {(project.github || project.website || project.demoUrl) && (
                            <DetailSection title="Links">
                                <div className="flex flex-wrap gap-2">
                                    {project.github && (
                                        <a
                                            href={`https://github.com/${project.github}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                                        >
                                            <IconBrandGithub size={13} stroke={2} />
                                            {project.github}
                                            <IconExternalLink size={10} stroke={2} className="text-muted-foreground" />
                                        </a>
                                    )}
                                    {project.website && (
                                        <a
                                            href={project.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                                        >
                                            <IconWorld size={13} stroke={2} />
                                            Website
                                            <IconExternalLink size={10} stroke={2} className="text-muted-foreground" />
                                        </a>
                                    )}
                                    {project.demoUrl && (
                                        <a
                                            href={project.demoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                                        >
                                            <IconExternalLink size={13} stroke={2} />
                                            Live Demo
                                        </a>
                                    )}
                                </div>
                            </DetailSection>
                        )}

                        {/* Team */}
                        {project.teamMembers && project.teamMembers.length > 0 && (
                            <DetailSection title="Team">
                                <div className="flex flex-wrap gap-2">
                                    {project.teamMembers.map((member: string, i: number) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-1.5 rounded-full border bg-muted/30 px-3 py-1 text-xs"
                                        >
                                            <div className="size-4 rounded-full bg-muted flex items-center justify-center">
                                                <IconUsers size={9} stroke={2} className="text-muted-foreground" />
                                            </div>
                                            {member}
                                        </div>
                                    ))}
                                </div>
                            </DetailSection>
                        )}

                        {/* Builder info */}
                        {project.owner && (
                            <DetailSection title="Builder">
                                <div className="flex items-center gap-3">
                                    {project.owner.avatar ? (
                                        <img
                                            src={project.owner.avatar}
                                            alt={project.owner.name}
                                            className="size-9 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                            {project.owner.name?.[0]?.toUpperCase() ?? "?"}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-medium">{project.owner.name}</div>
                                        <div className="text-[11px] text-muted-foreground">
                                            @{project.owner.username}
                                        </div>
                                        {project.owner.bio && (
                                            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                                {project.owner.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {project.owner.skills && project.owner.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {project.owner.skills.slice(0, 6).map((skill: string) => (
                                            <span
                                                key={skill}
                                                className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </DetailSection>
                        )}
                    </div>

                    {/* Right sidebar */}
                    <div className="sticky top-24 space-y-4">
                        {/* Stats card */}
                        <div className="rounded-xl border bg-card p-5 space-y-4">
                            {/* Funding headline */}
                            <div className="space-y-1">
                                <div className="text-2xl font-bold tracking-tight">
                                    {funded ?? "—"}
                                </div>
                                <div className="text-[11px] text-muted-foreground">Total funding received</div>
                            </div>

                            <div className="space-y-2.5">
                                <StatItem
                                    icon={IconCircleCheck}
                                    label="Grants"
                                    value={project.grantCount}
                                    accent={project.grantCount > 0}
                                />
                                <StatItem
                                    icon={IconFileText}
                                    label="Applications"
                                    value={project.applicationCount}
                                />
                                {project.createdAt && (
                                    <StatItem
                                        icon={IconTarget}
                                        label="Active since"
                                        value={formatDate(project.createdAt) ?? "—"}
                                    />
                                )}
                            </div>

                            {/* Apply CTA */}
                            <div className="pt-1 border-t">
                                {isAuthenticated ? (
                                    <Link href="/grants" className="block">
                                        <Button size="sm" variant="outline" className="w-full">
                                            Browse Grant Programs
                                        </Button>
                                    </Link>
                                ) : (
                                    <SignInButton forceRedirectUrl="/grants">
                                        <Button size="sm" variant="outline" className="w-full cursor-pointer">
                                            Sign in to Apply for Grants
                                        </Button>
                                    </SignInButton>
                                )}
                            </div>
                        </div>

                        {/* Social links */}
                        {(project.owner?.github || project.owner?.twitter || project.owner?.website) && (
                            <div className="rounded-xl border bg-muted/30 p-4 space-y-2.5">
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Builder links
                                </div>
                                {project.owner.github && (
                                    <a
                                        href={`https://github.com/${project.owner.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <IconBrandGithub size={12} stroke={2} />
                                        github.com/{project.owner.github}
                                    </a>
                                )}
                                {project.owner.twitter && (
                                    <a
                                        href={`https://twitter.com/${project.owner.twitter}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <span className="text-[11px] font-medium">𝕏</span>
                                        @{project.owner.twitter}
                                    </a>
                                )}
                                {project.owner.website && (
                                    <a
                                        href={project.owner.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <IconWorld size={12} stroke={2} />
                                        {project.owner.website.replace(/^https?:\/\//, "")}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}