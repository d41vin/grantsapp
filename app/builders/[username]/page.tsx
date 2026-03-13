"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ApplicationStatusBadge } from "@/components/dashboard/applications/application-status-badge";
import {
    IconChevronLeft,
    IconUser,
    IconCode,
    IconFileText,
    IconCoins,
    IconCircleCheck,
    IconBrandGithub,
    IconWorld,
    IconExternalLink,
} from "@tabler/icons-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount?: number) {
    if (!amount) return null;
    return amount >= 1_000_000
        ? `$${(amount / 1_000_000).toFixed(2)}M`
        : amount >= 1_000
            ? `$${(amount / 1_000).toFixed(0)}K`
            : `$${amount.toLocaleString()}`;
}

// ─── Stat Block ───────────────────────────────────────────────────────────────

function Stat({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
    return (
        <div className="text-center">
            <div className={`text-xl font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
            <div className="text-[11px] text-muted-foreground">{label}</div>
        </div>
    );
}

// ─── Project Mini Card ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectMiniCard({ project }: { project: any }) {
    return (
        <Link href={`/projects/${project.slug}`}>
            <div className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/30">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <IconCode size={14} stroke={2} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-semibold transition-colors group-hover:text-primary">{project.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        {project.categories?.slice(0, 2).map((c: string) => <span key={c}>{c}</span>)}
                    </div>
                </div>
                {project.grantCount > 0 && (
                    <div className="shrink-0 flex items-center gap-1 text-[10px] text-primary font-medium">
                        <IconCoins size={10} stroke={2} />
                        {project.grantCount}
                    </div>
                )}
                <IconExternalLink size={11} stroke={2} className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuilderProfilePage() {
    const { username } = useParams<{ username: string }>();

    const builderData = useQuery(api.users.getByUsername, { username });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects = useQuery(
        (api as any).projects.listPublic,
        builderData?.user ? { ownerId: builderData.user._id } : "skip"
    );

    if (builderData === undefined) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-4">
                    <Skeleton className="size-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!builderData?.user) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <EmptyState
                    icon={IconUser}
                    title="Builder not found"
                    description="This profile doesn't exist or isn't public."
                    action={{ label: "Browse Projects", href: "/projects" }}
                />
            </div>
        );
    }

    const { user, stats } = builderData;

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
                {/* Profile header */}
                <div className="flex items-start gap-5">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border text-xl font-bold text-primary uppercase">
                        {(user.name ?? user.username ?? "?")[0]}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">{user.name ?? `@${user.username}`}</h1>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                        {user.bio && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{user.bio}</p>}
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="flex items-center justify-around rounded-xl border bg-card py-5 px-8">
                        <Stat label="Applications" value={stats.applicationCount ?? 0} />
                        <div className="h-8 w-px bg-border" />
                        <Stat label="Active Grants" value={stats.activeGrantCount ?? 0} accent />
                        <div className="h-8 w-px bg-border" />
                        <Stat label="Total Earned" value={formatCurrency(stats.totalEarned) ?? "—"} accent />
                        <div className="h-8 w-px bg-border" />
                        <Stat label="Milestones Done" value={stats.milestonesCompleted ?? 0} />
                    </div>
                )}

                {/* Projects */}
                <div>
                    <div className="mb-3 text-sm font-semibold">Projects</div>
                    {projects === undefined ? (
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="rounded-xl border p-8 text-center">
                            <div className="text-xs text-muted-foreground">No public projects yet.</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {projects.map((p: any) => <ProjectMiniCard key={p._id} project={p} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}