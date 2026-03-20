"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
    IconCode,
    IconBuilding,
    IconFileText,
    IconTarget,
    IconChartLine,
    IconCircleCheck,
    IconArrowRight,
    IconUsers,
    IconCommand,
    IconListSearch,
    IconStar,
    IconZap,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ─── Static feature content ───────────────────────────────────────────────────

const BUILDER_FEATURES = [
    {
        icon: IconListSearch,
        title: "Discover grants",
        description: "Browse active programs across ecosystems. Filter by category, mechanism, and ecosystem.",
    },
    {
        icon: IconFileText,
        title: "Apply in minutes",
        description: "Submit structured applications with milestone breakdowns. Track status in real time.",
    },
    {
        icon: IconTarget,
        title: "Track milestones",
        description: "Submit deliverables, get reviewer feedback, and unlock funding as you ship.",
    },
    {
        icon: IconChartLine,
        title: "Build reputation",
        description: "Every grant you receive adds to your verifiable funding history and builder profile.",
    },
];

const MANAGER_FEATURES = [
    {
        icon: IconCommand,
        title: "Launch programs",
        description: "Configure eligibility, budgets, timelines, and funding mechanisms. Publish in minutes.",
    },
    {
        icon: IconCircleCheck,
        title: "Review applications",
        description: "Structured review workflow with approval, rejection, and milestone-based disbursement.",
    },
    {
        icon: IconUsers,
        title: "Manage your team",
        description: "Invite reviewers and admins. Roles and permissions built in from day one.",
    },
    {
        icon: IconChartLine,
        title: "Analytics dashboard",
        description: "Funnel metrics, approval rates, and per-program breakdowns — always up to date.",
    },
];

const MECHANISMS = [
    {
        icon: IconZap,
        label: "Direct Grants",
        description: "Full funding on approval. Best for well-scoped, lower-risk projects.",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: IconTarget,
        label: "Milestone-Based",
        description: "Staged disbursement as builders submit and verify deliverables.",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
    },
    {
        icon: IconStar,
        label: "More coming",
        description: "Quadratic funding, retroactive grants, and streaming payments on the roadmap.",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({
    icon: Icon,
    title,
    description,
    accent,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    accent?: boolean;
}) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
            <div className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
                <Icon size={16} stroke={2} />
            </div>
            <div>
                <div className="text-sm font-semibold">{title}</div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function StatChip({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
            <div className="text-[11px] text-muted-foreground">{label}</div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
    // Pull live stats from public queries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programs = useQuery((api as any).programs.listPublic, { limit: 100 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects = useQuery((api as any).projects.listPublic, { limit: 100 });

    const programCount = programs?.length ?? 0;
    const projectCount = projects?.filter((p: any) => p.grantCount > 0).length ?? 0;
    const totalFunded = projects?.reduce((sum: number, p: any) => sum + (p.totalFunded ?? 0), 0) ?? 0;
    const formattedFunded = totalFunded >= 1_000_000
        ? `$${(totalFunded / 1_000_000).toFixed(1)}M`
        : totalFunded >= 1_000
            ? `$${(totalFunded / 1_000).toFixed(0)}K`
            : totalFunded > 0 ? `$${totalFunded}` : "$0";

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden border-b bg-muted/20 px-6 py-20 text-center">
                {/* Subtle dot grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-50"
                    style={{
                        backgroundImage: "radial-gradient(circle, oklch(0.85 0.004 286.32) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                <div className="relative mx-auto max-w-3xl">
                    {/* Eyebrow */}
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                        <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                        Grants infrastructure for ecosystems
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        The platform for{" "}
                        <span className="text-primary">grant programs</span>{" "}
                        that actually work
                    </h1>

                    {/* Subheading */}
                    <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
                        Launch and manage grant programs. Apply for ecosystem funding.
                        Track milestones and build a verifiable reputation — all in one place.
                    </p>

                    {/* CTAs */}
                    <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
                        <SignUpButton forceRedirectUrl="/onboarding">
                            <Button size="default" className="gap-2 cursor-pointer px-6">
                                Get started free
                                <IconArrowRight size={14} stroke={2.5} />
                            </Button>
                        </SignUpButton>
                        <Link href="/grants">
                            <Button variant="outline" size="default" className="gap-2 px-6">
                                <IconListSearch size={14} stroke={2} />
                                Browse grants
                            </Button>
                        </Link>
                    </div>

                    {/* Social proof hint */}
                    <p className="mt-5 text-xs text-muted-foreground">
                        No credit card required · Free for builders
                    </p>
                </div>
            </section>

            {/* ── Live stats ───────────────────────────────────────────────── */}
            <section className="border-b px-6 py-8">
                <div className="mx-auto flex max-w-3xl items-center justify-center gap-12 flex-wrap">
                    <StatChip
                        value={programCount > 0 ? `${programCount}` : "—"}
                        label="Active programs"
                    />
                    <div className="hidden h-8 w-px bg-border sm:block" />
                    <StatChip
                        value={projectCount > 0 ? `${projectCount}` : "—"}
                        label="Projects funded"
                    />
                    <div className="hidden h-8 w-px bg-border sm:block" />
                    <StatChip
                        value={totalFunded > 0 ? formattedFunded : "—"}
                        label="Total distributed"
                    />
                    <div className="hidden h-8 w-px bg-border sm:block" />
                    <StatChip value="2" label="Funding mechanisms" />
                </div>
            </section>

            {/* ── For builders ─────────────────────────────────────────────── */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-10 grid grid-cols-[1fr_2fr] gap-8 items-start">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                <IconCode size={11} stroke={2.5} />
                                For builders
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Find funding. Ship faster.
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                Apply to grant programs, track your deliverables, and build a
                                verifiable funding history across every ecosystem you contribute to.
                            </p>
                            <div className="mt-6 flex flex-col gap-2">
                                <Link href="/grants">
                                    <Button variant="outline" size="sm" className="gap-1.5 w-full justify-between">
                                        Browse open grants
                                        <IconArrowRight size={12} stroke={2.5} />
                                    </Button>
                                </Link>
                                <Link href="/projects">
                                    <Button variant="ghost" size="sm" className="gap-1.5 w-full justify-between text-muted-foreground">
                                        Explore funded projects
                                        <IconArrowRight size={12} stroke={2.5} />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {BUILDER_FEATURES.map((f) => (
                                <FeatureCard key={f.title} {...f} accent />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Divider ───────────────────────────────────────────────────── */}
            <div className="border-t mx-6" />

            {/* ── For managers ─────────────────────────────────────────────── */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-10 grid grid-cols-[1fr_2fr] gap-8 items-start">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                <IconBuilding size={11} stroke={2.5} />
                                For program managers
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Launch programs. Fund builders.
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                Operate your ecosystem's grant program without building custom
                                infrastructure. Configure, publish, review, and track — all in one dashboard.
                            </p>
                            <div className="mt-6 flex flex-col gap-2">
                                <SignUpButton forceRedirectUrl="/onboarding">
                                    <Button variant="outline" size="sm" className="gap-1.5 w-full justify-between cursor-pointer">
                                        Start a program
                                        <IconArrowRight size={12} stroke={2.5} />
                                    </Button>
                                </SignUpButton>
                                <Link href="/orgs">
                                    <Button variant="ghost" size="sm" className="gap-1.5 w-full justify-between text-muted-foreground">
                                        Browse organizations
                                        <IconArrowRight size={12} stroke={2.5} />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {MANAGER_FEATURES.map((f) => (
                                <FeatureCard key={f.title} {...f} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Funding mechanisms ────────────────────────────────────────── */}
            <section className="border-t bg-muted/20 px-6 py-16">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-xl font-bold tracking-tight">Multiple funding mechanisms</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Different projects need different funding models. GrantsApp supports them all.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {MECHANISMS.map((m) => {
                            const Icon = m.icon;
                            return (
                                <div key={m.label} className="rounded-xl border bg-card p-5 space-y-3">
                                    <div className={cn(
                                        "flex size-8 items-center justify-center rounded-lg",
                                        m.bg, m.color
                                    )}>
                                        <Icon size={16} stroke={2} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">{m.label}</div>
                                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{m.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── How it works ──────────────────────────────────────────────── */}
            <section className="border-t px-6 py-16">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-10 text-center">
                        <h2 className="text-xl font-bold tracking-tight">How it works</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Builder flow */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                                    <IconCode size={13} stroke={2} className="text-primary" />
                                </div>
                                <span className="text-sm font-semibold">Builder flow</span>
                            </div>
                            {[
                                { step: "1", text: "Create your project profile" },
                                { step: "2", text: "Browse and apply to grant programs" },
                                { step: "3", text: "Get reviewed and approved" },
                                { step: "4", text: "Submit milestones and receive funding" },
                            ].map(({ step, text }) => (
                                <div key={step} className="flex items-center gap-3">
                                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                        {step}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Manager flow */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex size-6 items-center justify-center rounded-md bg-muted">
                                    <IconShield size={13} stroke={2} className="text-muted-foreground" />
                                </div>
                                <span className="text-sm font-semibold">Manager flow</span>
                            </div>
                            {[
                                { step: "1", text: "Create your organization" },
                                { step: "2", text: "Configure and publish a grant program" },
                                { step: "3", text: "Review incoming applications" },
                                { step: "4", text: "Approve, fund, and track milestones" },
                            ].map(({ step, text }) => (
                                <div key={step} className="flex items-center gap-3">
                                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                        {step}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA banner ────────────────────────────────────────────────── */}
            <section className="border-t bg-primary/5 px-6 py-16">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Ready to get started?
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        Join builders and ecosystems already using GrantsApp.
                        Sign up free — no credit card required.
                    </p>
                    <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
                        <SignUpButton forceRedirectUrl="/onboarding">
                            <Button size="default" className="gap-2 cursor-pointer px-8">
                                Create your account
                                <IconArrowRight size={14} stroke={2.5} />
                            </Button>
                        </SignUpButton>
                        <SignInButton forceRedirectUrl="/dashboard">
                            <Button variant="outline" size="default" className="cursor-pointer px-8">
                                Sign in
                            </Button>
                        </SignInButton>
                    </div>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────────────────── */}
            <footer className="border-t px-6 py-8">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="flex size-5 items-center justify-center rounded-md bg-primary/10">
                            <div className="size-2 rounded-sm bg-primary" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">GrantsApp</span>
                    </div>

                    <div className="flex items-center gap-5">
                        <Link href="/grants" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Browse Grants
                        </Link>
                        <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Projects
                        </Link>
                        <Link href="/orgs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Organizations
                        </Link>
                        <Link href="/builders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Builders
                        </Link>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                        Built for the ecosystem.
                    </p>
                </div>
            </footer>
        </div>
    );
}