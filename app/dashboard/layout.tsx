"use client";

import { useEffect } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Home01Icon,
    File02Icon,
    CodeIcon,
    Target01Icon,
    CommandIcon,
    UserGroupIcon,
    Settings01Icon,
    ChartLineData01Icon,
} from "@hugeicons/core-free-icons";

// ─── Nav config ──────────────────────────────────────────────────────────────

const builderNav = [
    { label: "Overview", href: "/dashboard", icon: Home01Icon, exact: true },
    { label: "Applications", href: "/dashboard/applications", icon: File02Icon },
    { label: "Projects", href: "/dashboard/projects", icon: CodeIcon },
    { label: "Milestones", href: "/dashboard/milestones", icon: Target01Icon },
];

const managerNav = [
    { label: "Overview", href: "/dashboard", icon: Home01Icon, exact: true },
    { label: "Programs", href: "/dashboard/programs", icon: CommandIcon },
    { label: "Applications", href: "/dashboard/applications", icon: File02Icon },
    { label: "Analytics", href: "/dashboard/analytics", icon: ChartLineData01Icon },
    { label: "Team", href: "/dashboard/team", icon: UserGroupIcon },
];

// ─── Nav Item ─────────────────────────────────────────────────────────────────

function NavItem({
    href,
    icon,
    label,
    exact = false,
}: {
    href: string;
    icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
    label: string;
    exact?: boolean;
}) {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-100",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <HugeiconsIcon
                icon={icon}
                size={15}
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
            />
            {label}
        </Link>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentUser = useQuery(
        (api as any).users.getCurrentUser,
        !isAuthenticated ? "skip" : undefined
    );

    // Auth + onboarding guard
    useEffect(() => {
        if (isAuthLoading) return;
        if (!isAuthenticated) { router.replace("/"); return; }
        if (currentUser === undefined) return;
        if (currentUser === null || !currentUser.onboardingComplete) {
            router.replace("/onboarding");
        }
    }, [isAuthLoading, isAuthenticated, currentUser, router]);

    const isLoading =
        isAuthLoading || (isAuthenticated && currentUser === undefined);

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100svh-0px)] items-center justify-center">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                    Loading...
                </div>
            </div>
        );
    }

    if (!currentUser?.onboardingComplete) return null;

    const nav = currentUser.role === "builder" ? builderNav : managerNav;
    const roleLabel = currentUser.role === "builder" ? "Builder" : "Program Manager";

    return (
        <div className="flex min-h-screen w-full">
            {/* ── Sidebar ── */}
            <aside className="border-border bg-card flex w-[220px] shrink-0 flex-col border-r">
                {/* Brand */}
                <div className="border-border flex h-14 items-center border-b px-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="bg-primary/10 flex size-6 items-center justify-center rounded-md">
                            <div className="bg-primary size-2.5 rounded-sm" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">GrantsApp</span>
                    </Link>
                </div>

                {/* Role badge */}
                <div className="border-border border-b px-4 py-3">
                    <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[10px] font-medium">
                        {roleLabel}
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-0.5 p-3">
                    {nav.map((item) => (
                        <NavItem key={item.href} {...item} />
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-border border-t p-3">
                    <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
                        <UserButton />
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-[11px] font-medium">
                                {currentUser.name}
                            </div>
                            <div className="text-muted-foreground truncate text-[10px]">
                                @{currentUser.username}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main content ── */}
            <main className="bg-background flex min-w-0 flex-1 flex-col">
                {children}
            </main>
        </div>
    );
}