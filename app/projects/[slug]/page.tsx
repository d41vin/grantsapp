"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
    IconChevronLeft,
    IconCode,
    IconWorld,
    IconBrandGithub,
    IconBrandTwitter,
    IconExternalLink,
    IconFileText,
    IconCoins,
    IconUsers,
} from "@tabler/icons-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount?: number) {
    if (!amount) return null;
    const prefix = "$";
    return amount >= 1_000_000
        ? `${prefix}${(amount / 1_000_000).toFixed(2)}M`
        : amount >= 1_000
            ? `${prefix}${(amount / 1_000).toFixed(0)}K`
            : `${prefix}${amount.toLocaleString()}`;
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
    return (
        <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
            {label}
        </span>
    );
}

// ─── Link Button ─────────────────────────────────────────────────────────────

function LinkButton({
    href, icon: Icon, label,
}: { href: string; icon: React.ElementType; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
            <Icon size={13} stroke={2} />
            {label}
            <IconExternalLink size={10} stroke={2} className="ml-auto text-muted-foreground/50" />
        </a>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectProfilePage() {
    const { slug } = useParams<{ slug: string }>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = useQuery((api as any).projects.getBySlug, { slug });

    if (project === undefined) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-4">
                    <Skeleton className="size-14 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-48 rounded-xl" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <EmptyState
                    icon={IconCode}
                    title="Project not found"
                    description="This project doesn't exist or is no longer public."
                    action={{ label: "Browse Projects", href: "/projects" }}
                />
            </div>
        );
    }

    const tags = [...(project.categories ?? []), ...(project.ecosystems ?? [])];

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            <div className="border-b bg-muted/20 px-6 py-3">
                <div className="mx-auto max-w-3xl">
                    <Link href="/projects" className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground w-fit">
                        <IconChevronLeft size={13} stroke={2.5} />
                        Projects
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border bg-card">
                        <IconCode size={24} stroke={1.5} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {project.owner && (
                                <Link href={`/builders/${project.owner.username}`} className="flex items-center gap-1 transition-colors hover:text-primary">
                                    <IconUsers size={11} stroke={2} />
                                    @{project.owner.username}
                                </Link>
                            )}
                        </div>
                    </div>
                    {/* Stats */}
                    <div className="flex shrink-0 items-center gap-4 text-center">
                        <div>
                            <div className="text-lg font-bold">{project.applicationCount}</div>
                            <div className="text-[10px] text-muted-foreground">Applications</div>
                        </div>
                        {project.grantCount > 0 && (
                            <div>
                                <div className="text-lg font-bold text-primary">{project.grantCount}</div>
                                <div className="text-[10px] text-muted-foreground">Grants</div>
                            </div>
                        )}
                        {project.totalFunded > 0 && (
                            <div>
                                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                                    {formatCurrency(project.totalFunded)}
                                </div>
                                <div className="text-[10px] text-muted-foreground">Funded</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="rounded-xl border bg-card p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">About</div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="rounded-xl border bg-card p-5">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Categories & Ecosystems</div>
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag: string) => <Tag key={tag} label={tag} />)}
                        </div>
                    </div>
                )}

                {/* Team */}
                {project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="rounded-xl border bg-card p-5">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Team</div>
                        <div className="flex flex-wrap gap-2">
                            {project.teamMembers.map((member: string) => (
                                <div key={member} className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5">
                                    <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary uppercase">
                                        {member[0]}
                                    </div>
                                    <span className="text-xs">{member}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Links */}
                {(project.website || project.github || project.twitter || project.demoUrl) && (
                    <div className="rounded-xl border bg-card p-5">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Links</div>
                        <div className="grid grid-cols-2 gap-2">
                            {project.website && <LinkButton href={project.website} icon={IconWorld} label="Website" />}
                            {project.github && <LinkButton href={`https://github.com/${project.github}`} icon={IconBrandGithub} label="GitHub" />}
                            {project.twitter && <LinkButton href={`https://twitter.com/${project.twitter}`} icon={IconBrandTwitter} label="Twitter / X" />}
                            {project.demoUrl && <LinkButton href={project.demoUrl} icon={IconExternalLink} label="Demo" />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}