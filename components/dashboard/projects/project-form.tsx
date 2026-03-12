"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

export const PROJECT_CATEGORIES = [
    "DeFi", "NFT", "Infrastructure", "Tooling", "Gaming", "Social",
    "DAO", "Research", "Content", "Developer Experience", "Security",
    "Layer 2", "Storage", "Identity", "Oracle", "Bridge",
];

export const PROJECT_ECOSYSTEMS = [
    "Filecoin", "Ethereum", "Solana", "Polygon", "Arbitrum",
    "Optimism", "Base", "Cosmos", "Polkadot", "NEAR", "Avalanche", "BNB Chain",
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectFormValues {
    name: string;
    description: string;
    website: string;
    github: string;
    twitter: string;
    demoUrl: string;
    categories: string[];
    ecosystems: string[];
    teamMembers: string;
}

export const DEFAULT_PROJECT_VALUES: ProjectFormValues = {
    name: "",
    description: "",
    website: "",
    github: "",
    twitter: "",
    demoUrl: "",
    categories: [],
    ecosystems: [],
    teamMembers: "",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function projectToFormValues(project: any): ProjectFormValues {
    return {
        name: project.name ?? "",
        description: project.description ?? "",
        website: project.website ?? "",
        github: project.github ?? "",
        twitter: project.twitter ?? "",
        demoUrl: project.demoUrl ?? "",
        categories: project.categories ?? [],
        ecosystems: project.ecosystems ?? [],
        teamMembers: (project.teamMembers ?? []).join(", "),
    };
}

export function parseProjectValues(values: ProjectFormValues) {
    return {
        name: values.name.trim(),
        description: values.description.trim(),
        website: values.website.trim() || undefined,
        github: values.github.trim() || undefined,
        twitter: values.twitter.trim() || undefined,
        demoUrl: values.demoUrl.trim() || undefined,
        categories: values.categories.length ? values.categories : undefined,
        ecosystems: values.ecosystems.length ? values.ecosystems : undefined,
        teamMembers: values.teamMembers.trim()
            ? values.teamMembers.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined,
    };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TagToggle({
    label, selected, onToggle,
}: { label: string; selected: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-100 cursor-pointer",
                selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
        >
            {selected && <IconCheck size={9} stroke={3} />}
            {label}
        </button>
    );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

interface ProjectFormProps {
    initialValues?: Partial<ProjectFormValues>;
    onSubmit: (values: ProjectFormValues) => Promise<void>;
    submitLabel?: string;
    isSubmitting: boolean;
    onCancel?: () => void;
    error?: string | null;
}

export function ProjectForm({
    initialValues,
    onSubmit,
    submitLabel = "Save Project",
    isSubmitting,
    onCancel,
    error,
}: ProjectFormProps) {
    const [values, setValues] = useState<ProjectFormValues>({
        ...DEFAULT_PROJECT_VALUES,
        ...initialValues,
    });

    const set = <K extends keyof ProjectFormValues>(k: K, v: ProjectFormValues[K]) =>
        setValues((p) => ({ ...p, [k]: v }));

    const toggleTag = (key: "categories" | "ecosystems", item: string) => {
        const arr = values[key];
        set(key, arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
    };

    const canSubmit = values.name.trim().length > 0 && values.description.trim().length > 0;

    return (
        <div className="space-y-6">
            <FieldGroup>
                {/* Name */}
                <Field>
                    <FieldLabel>Project Name <span className="text-destructive">*</span></FieldLabel>
                    <Input
                        placeholder="My Awesome DApp"
                        value={values.name}
                        onChange={(e) => set("name", e.target.value)}
                    />
                </Field>

                {/* Description */}
                <Field>
                    <FieldLabel>Description <span className="text-destructive">*</span></FieldLabel>
                    <FieldDescription>What are you building? Who is it for?</FieldDescription>
                    <Textarea
                        placeholder="A decentralized storage marketplace that..."
                        value={values.description}
                        onChange={(e) => set("description", e.target.value)}
                        className="min-h-24 resize-y"
                    />
                </Field>

                {/* Links */}
                <div className="grid grid-cols-2 gap-3">
                    <Field>
                        <FieldLabel>Website</FieldLabel>
                        <Input
                            placeholder="https://myproject.xyz"
                            value={values.website}
                            onChange={(e) => set("website", e.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel>Demo URL</FieldLabel>
                        <Input
                            placeholder="https://demo.myproject.xyz"
                            value={values.demoUrl}
                            onChange={(e) => set("demoUrl", e.target.value)}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field>
                        <FieldLabel>GitHub</FieldLabel>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                                github.com/
                            </span>
                            <Input
                                className="pl-20"
                                placeholder="org-or-user/repo"
                                value={values.github}
                                onChange={(e) => set("github", e.target.value)}
                            />
                        </div>
                    </Field>
                    <Field>
                        <FieldLabel>Twitter / X</FieldLabel>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@</span>
                            <Input
                                className="pl-6"
                                placeholder="handle"
                                value={values.twitter}
                                onChange={(e) => set("twitter", e.target.value)}
                            />
                        </div>
                    </Field>
                </div>

                {/* Team */}
                <Field>
                    <FieldLabel>Team Members</FieldLabel>
                    <FieldDescription>Comma-separated names or roles, e.g. &quot;Alice (dev), Bob (design)&quot;</FieldDescription>
                    <Input
                        placeholder="Alice (Full-stack), Bob (Smart contracts)"
                        value={values.teamMembers}
                        onChange={(e) => set("teamMembers", e.target.value)}
                    />
                </Field>

                {/* Categories */}
                <Field>
                    <FieldLabel>Categories</FieldLabel>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {PROJECT_CATEGORIES.map((c) => (
                            <TagToggle
                                key={c} label={c}
                                selected={values.categories.includes(c)}
                                onToggle={() => toggleTag("categories", c)}
                            />
                        ))}
                    </div>
                </Field>

                {/* Ecosystems */}
                <Field>
                    <FieldLabel>Ecosystems</FieldLabel>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {PROJECT_ECOSYSTEMS.map((e) => (
                            <TagToggle
                                key={e} label={e}
                                selected={values.ecosystems.includes(e)}
                                onToggle={() => toggleTag("ecosystems", e)}
                            />
                        ))}
                    </div>
                </Field>
            </FieldGroup>

            {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
            )}

            <div className="flex items-center gap-2">
                {onCancel && (
                    <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                )}
                <div className="ml-auto">
                    <Button size="sm" onClick={() => onSubmit(values)} disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ? (
                            <span className="flex items-center gap-1.5">
                                <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                                Saving...
                            </span>
                        ) : submitLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}