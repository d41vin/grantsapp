"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    IconCode,
    IconSearch,
    IconWorld,
    IconBrandGithub,
    IconFileText,
    IconCoins,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    "All", "DeFi", "NFT", "Infrastructure", "Tooling", "Gaming",
    "Research", "Developer Experience", "Storage", "Identity",
];

// ─── Project Card ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectCard({ project }: { project: any }) {
    const tags = [...(project.categories ?? []).slice(0, 2), ...(project.ecosystems ?? []).slice(0, 1)];

    return (
        <Link href={`/projects/${project.slug}`}>
            <div className="group flex flex-col gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm cursor-pointer h-full">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <IconCode size={16} stroke={2} className="text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        {project.github && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <IconBrandGithub size={11} stroke={2} />
                            </span>
                        )}
                        {project.website && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <IconWorld size={11} stroke={2} />
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="text-sm font-semibold transition-colors group-hover:text-primary">
                        {project.name}
                    </div>
                    <p className="mt-1 line-clamp-3 text-xs text-muted-foreground leading-relaxed">
                        {project.description}
                    </p>
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tags.map((tag: string) => (
                            <span key={tag} className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3 border-t pt-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <IconFileText size={11} stroke={2} />
                        {project.applicationCount} app{project.applicationCount !== 1 ? "s" : ""}
                    </span>
                    {project.grantCount > 0 && (
                        <span className="flex items-center gap-1 text-primary font-medium">
                            <IconCoins size={11} stroke={2} />
                            {project.grantCount} grant{project.grantCount !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

function CardSkeleton() {
    return (
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
            <Skeleton className="size-9 rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-1">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
            </div>
        </div>
    );
}

export default function ProjectsPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string | undefined>(undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects = useQuery((api as any).projects.listPublic, { category });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = (projects ?? []).filter((p: any) =>
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            {/* Hero */}
            <div className="border-b bg-muted/30 px-6 py-12 text-center">
                <div className="mx-auto max-w-xl">
                    <h1 className="text-3xl font-bold tracking-tight">Project Directory</h1>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        Explore open-source and grant-funded projects building across web3 ecosystems.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur-sm px-6 py-3">
                <div className="mx-auto flex max-w-6xl items-center gap-3">
                    <div className="relative max-w-sm flex-1">
                        <IconSearch size={13} stroke={2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {CATEGORIES.map((cat) => {
                            const val = cat === "All" ? undefined : cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(val)}
                                    className={cn(
                                        "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
                                        category === val
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                    )}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="mx-auto max-w-6xl px-6 py-8">
                {projects === undefined ? (
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-20 text-center">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                            <IconCode size={20} stroke={1.5} className="text-muted-foreground" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold">No projects found</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {search ? `No projects matching "${search}".` : "No projects match this filter."}
                            </p>
                        </div>
                        {search && <Button variant="outline" size="sm" onClick={() => setSearch("")}>Clear search</Button>}
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <span className="text-xs text-muted-foreground">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {filtered.map((p: any) => <ProjectCard key={p._id} project={p} />)}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}