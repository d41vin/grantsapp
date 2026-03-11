"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    File02Icon,
    CodeIcon,
    Target01Icon,
    CommandIcon,
    UserGroupIcon,
    ChartLineData01Icon,
    ArrowRight01Icon,
    PlusSignIcon,
    CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon,
    description,
    href,
    accent = false,
}: {
    label: string;
    value: string | number;
    icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
    description: string;
    href?: string;
    accent?: boolean;
}) {
    const inner = (
        <div
            className={cn(
                "group flex flex-col gap-3 rounded-xl border p-5 transition-all duration-150",
                href ? "hover:border-primary/30 hover:bg-primary/[0.02] cursor-pointer" : "",
                accent ? "border-primary/20 bg-primary/[0.03]" : "border-border bg-card"
            )}
        >
            <div className="flex items-start justify-between">
                <div className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                    <HugeiconsIcon icon={icon} size={16} strokeWidth={2} />
                </div>
                {href && (
                    <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={14}
                        strokeWidth={2}
                        className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    />
                )}
            </div>
            <div>
                <div className={cn(
                    "text-2xl font-semibold tracking-tight",
                    accent ? "text-primary" : "text-foreground"
                )}>
                    {value}
                </div>
                <div className="mt-0.5 text-xs font-medium">{label}</div>
                <div className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                    {description}
                </div>
            </div>
        </div>
    );

    if (href) return <Link href={href}>{inner}</Link>;
    return inner;
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({
    icon,
    title,
    description,
    action,
}: {
    icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
    title: string;
    description: string;
    action?: { label: string; href: string };
}) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
            <div className="bg-muted flex size-10 items-center justify-center rounded-xl">
                <HugeiconsIcon icon={icon} size={18} strokeWidth={1.5} className="text-muted-foreground" />
            </div>
            <div>
                <div className="text-sm font-medium">{title}</div>
                <div className="text-muted-foreground mt-1 max-w-xs text-xs leading-relaxed">
                    {description}
                </div>
            </div>
            {action && (
                <Link href={action.href}>
                    <Button size="sm" variant="outline" className="mt-1 gap-1.5">
                        <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={2.5} />
                        {action.label}
                    </Button>
                </Link>
            )}
        </div>
    );
}

// ─── Activity item ────────────────────────────────────────────────────────────

function ActivityItem({
    icon,
    text,
    time,
    iconColor = "text-muted-foreground",
}: {
    icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
    text: string;
    time: string;
    iconColor?: string;
}) {
    return (
        <div className="flex items-start gap-3 py-2.5">
            <div className="bg-muted mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md">
                <HugeiconsIcon icon={icon} size={12} strokeWidth={2} className={iconColor} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-xs leading-relaxed">{text}</div>
                <div className="text-muted-foreground mt-0.5 text-[10px]">{time}</div>
            </div>
        </div>
    );
}

// ─── Builder Overview ─────────────────────────────────────────────────────────

function BuilderOverview({ name }: { name: string }) {
    return (
        <div className="flex flex-col gap-8 p-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold">
                        Good to have you, {name.split(" ")[0]} 👋
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Here&apos;s a snapshot of your grants activity.
                    </p>
                </div>
                <Link href="/grants">
                    <Button size="sm" className="gap-1.5">
                        <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={2.5} />
                        Browse Grants
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    label="Applications"
                    value={0}
                    icon={File02Icon}
                    description="Grant applications submitted"
                    href="/dashboard/applications"
                />
                <StatCard
                    label="Active Grants"
                    value={0}
                    icon={CheckmarkCircle01Icon}
                    description="Currently funded and in progress"
                    accent
                />
                <StatCard
                    label="Milestones Due"
                    value={0}
                    icon={Target01Icon}
                    description="Upcoming deliverables this month"
                    href="/dashboard/milestones"
                />
                <StatCard
                    label="Total Earned"
                    value="$0"
                    icon={ChartLineData01Icon}
                    description="Across all completed grants"
                />
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 rounded-xl border">
                    <div className="border-b px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Recent Applications</div>
                            <Link href="/dashboard/applications">
                                <span className="text-primary text-xs hover:underline">View all</span>
                            </Link>
                        </div>
                    </div>
                    <div className="p-5">
                        <EmptyState
                            icon={File02Icon}
                            title="No applications yet"
                            description="Browse open grant programs and submit your first application to get started."
                            action={{ label: "Browse Programs", href: "/grants" }}
                        />
                    </div>
                </div>

                <div className="rounded-xl border">
                    <div className="border-b px-5 py-4">
                        <div className="text-sm font-medium">Activity</div>
                    </div>
                    <div className="divide-y px-5">
                        <ActivityItem
                            icon={CheckmarkCircle01Icon}
                            text="Builder profile created successfully"
                            time="Just now"
                            iconColor="text-primary"
                        />
                        <div className="py-4 text-center">
                            <span className="text-muted-foreground text-[11px]">
                                Your activity will appear here
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Manager Overview ─────────────────────────────────────────────────────────

function ManagerOverview({ name }: { name: string }) {
    return (
        <div className="flex flex-col gap-8 p-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold">
                        Good to have you, {name.split(" ")[0]} 👋
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your grant programs and review incoming applications.
                    </p>
                </div>
                <Link href="/dashboard/programs/new">
                    <Button size="sm" className="gap-1.5">
                        <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={2.5} />
                        New Program
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    label="Active Programs"
                    value={0}
                    icon={CommandIcon}
                    description="Currently accepting applications"
                    href="/dashboard/programs"
                    accent
                />
                <StatCard
                    label="Pending Review"
                    value={0}
                    icon={File02Icon}
                    description="Applications awaiting your review"
                    href="/dashboard/applications"
                />
                <StatCard
                    label="Total Funded"
                    value="$0"
                    icon={ChartLineData01Icon}
                    description="Distributed across all programs"
                />
                <StatCard
                    label="Team Members"
                    value={1}
                    icon={UserGroupIcon}
                    description="Reviewers and collaborators"
                    href="/dashboard/team"
                />
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 rounded-xl border">
                    <div className="border-b px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Your Programs</div>
                            <Link href="/dashboard/programs">
                                <span className="text-primary text-xs hover:underline">View all</span>
                            </Link>
                        </div>
                    </div>
                    <div className="p-5">
                        <EmptyState
                            icon={CommandIcon}
                            title="No programs yet"
                            description="Create your first grant program to start receiving applications from builders in the ecosystem."
                            action={{ label: "Create Program", href: "/dashboard/programs/new" }}
                        />
                    </div>
                </div>

                <div className="rounded-xl border">
                    <div className="border-b px-5 py-4">
                        <div className="text-sm font-medium">Activity</div>
                    </div>
                    <div className="divide-y px-5">
                        <ActivityItem
                            icon={CheckmarkCircle01Icon}
                            text="Organization profile created successfully"
                            time="Just now"
                            iconColor="text-primary"
                        />
                        <div className="py-4 text-center">
                            <span className="text-muted-foreground text-[11px]">
                                Program activity will appear here
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { isAuthenticated } = useConvexAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentUser = useQuery(
        (api as any).users.getCurrentUser,
        !isAuthenticated ? "skip" : undefined
    );

    if (!currentUser) return null;

    if (currentUser.role === "builder") {
        return <BuilderOverview name={currentUser.name} />;
    }

    return <ManagerOverview name={currentUser.name} />;
}