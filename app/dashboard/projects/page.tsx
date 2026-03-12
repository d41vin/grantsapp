"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
    IconPlus,
    IconCode,
    IconWorld,
    IconBrandGithub,
    IconChevronRight,
    IconFileText,
} from "@tabler/icons-react";

// ─── Project Card ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectCard({ project }: { project: any }) {
    const tags = [
        ...(project.categories ?? []).slice(0, 2),
        ...(project.ecosystems ?? []).slice(0, 1),
    ];

    return (
        <div className="group flex flex-col gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <IconCode size={16} stroke={2} className="text-muted-foreground" />
                </div>
                <Link href={`/dashboard/projects/${project._id}`}>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px] opacity-0 group-hover:opacity-100">
                        Edit
                        <IconChevronRight size={11} stroke={2.5} />
                    </Button>
                </Link>
            </div>

            {/* Name + description */}
            <div>
                <Link href={`/dashboard/projects/${project._id}`}>
                    <div className="text-sm font-semibold hover:text-primary transition-colors">
                        {project.name}
                    </div>
                </Link>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {project.description}
                </p>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag: string) => (
                        <span
                            key={tag}
                            className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-3 border-t pt-3">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <IconFileText size={11} stroke={2} />
                    {project.applicationCount} application{project.applicationCount !== 1 ? "s" : ""}
                </div>
                {project.grantCount > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                        {project.grantCount} grant{project.grantCount !== 1 ? "s" : ""} received
                    </div>
                )}
                <div className="ml-auto flex items-center gap-2">
                    {project.github && (
                        <a
                            href={`https://github.com/${project.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <IconBrandGithub size={13} stroke={2} />
                        </a>
                    )}
                    {project.website && (
                        <a
                            href={project.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <IconWorld size={13} stroke={2} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
    const { isAuthenticated } = useConvexAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects = useQuery(
        (api as any).projects.listMine,
        !isAuthenticated ? "skip" : undefined
    );

    const isLoading = projects === undefined;

    return (
        <div className="flex flex-col gap-6 p-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Projects</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your project portfolio. Link projects to grant applications to build your funding reputation.
                    </p>
                </div>
                <Link href="/dashboard/projects/new">
                    <Button size="sm" className="gap-1.5">
                        <IconPlus size={12} stroke={2.5} />
                        New Project
                    </Button>
                </Link>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
                            <Skeleton className="size-9 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-4/5" />
                            </div>
                            <div className="flex gap-1.5">
                                <Skeleton className="h-4 w-14 rounded-full" />
                                <Skeleton className="h-4 w-18 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : !projects || projects.length === 0 ? (
                <div className="rounded-xl border">
                    <div className="p-10">
                        <EmptyState
                            icon={IconCode}
                            title="No projects yet"
                            description="Create a project profile to attach to your grant applications. It becomes your reusable funding identity across ecosystems."
                            action={{ label: "Create Project", href: "/dashboard/projects/new" }}
                        />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {projects.map((project: any) => (
                        <ProjectCard key={project._id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}