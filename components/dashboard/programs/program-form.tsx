"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
} from "@/components/ui/field";
import {
    IconCoins,
    IconTarget,
    IconCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

export const CATEGORIES = [
    "DeFi",
    "NFT",
    "Infrastructure",
    "Tooling",
    "Gaming",
    "Social",
    "DAO",
    "Research",
    "Content",
    "Developer Experience",
    "Security",
    "Layer 2",
    "Storage",
    "Identity",
    "Oracle",
    "Bridge",
];

export const ECOSYSTEMS = [
    "Filecoin",
    "Ethereum",
    "Solana",
    "Polygon",
    "Arbitrum",
    "Optimism",
    "Base",
    "Cosmos",
    "Polkadot",
    "NEAR",
    "Avalanche",
    "BNB Chain",
];

export const CURRENCIES = ["USD", "USDC", "FIL", "ETH", "MATIC", "SOL", "AVAX"];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProgramFormValues {
    name: string;
    description: string;
    mechanism: "direct" | "milestone";
    budget: string;
    currency: string;
    maxGrantAmount: string;
    eligibilityCriteria: string;
    applicationRequirements: string;
    applicationStartDate: string;
    applicationEndDate: string;
    reviewStartDate: string;
    reviewEndDate: string;
    categories: string[];
    ecosystems: string[];
}

export const DEFAULT_FORM_VALUES: ProgramFormValues = {
    name: "",
    description: "",
    mechanism: "direct",
    budget: "",
    currency: "USD",
    maxGrantAmount: "",
    eligibilityCriteria: "",
    applicationRequirements: "",
    applicationStartDate: "",
    applicationEndDate: "",
    reviewStartDate: "",
    reviewEndDate: "",
    categories: [],
    ecosystems: [],
};

/** Convert a Convex program doc into ProgramFormValues for edit mode. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function programToFormValues(program: any): ProgramFormValues {
    const ts2date = (ts?: number) =>
        ts ? new Date(ts).toISOString().split("T")[0] : "";

    return {
        name: program.name ?? "",
        description: program.description ?? "",
        mechanism: program.mechanism ?? "direct",
        budget: program.budget?.toString() ?? "",
        currency: program.currency ?? "USD",
        maxGrantAmount: program.maxGrantAmount?.toString() ?? "",
        eligibilityCriteria: program.eligibilityCriteria ?? "",
        applicationRequirements: program.applicationRequirements ?? "",
        applicationStartDate: ts2date(program.applicationStartDate),
        applicationEndDate: ts2date(program.applicationEndDate),
        reviewStartDate: ts2date(program.reviewStartDate),
        reviewEndDate: ts2date(program.reviewEndDate),
        categories: program.categories ?? [],
        ecosystems: program.ecosystems ?? [],
    };
}

/** Parse ProgramFormValues into the shape expected by Convex mutations. */
export function parseFormValues(values: ProgramFormValues) {
    const date2ts = (s: string) =>
        s ? new Date(s).getTime() : undefined;

    return {
        name: values.name.trim(),
        description: values.description.trim(),
        mechanism: values.mechanism,
        budget: values.budget ? parseFloat(values.budget) : undefined,
        currency: values.currency || undefined,
        maxGrantAmount: values.maxGrantAmount
            ? parseFloat(values.maxGrantAmount)
            : undefined,
        eligibilityCriteria: values.eligibilityCriteria.trim() || undefined,
        applicationRequirements:
            values.applicationRequirements.trim() || undefined,
        applicationStartDate: date2ts(values.applicationStartDate),
        applicationEndDate: date2ts(values.applicationEndDate),
        reviewStartDate: date2ts(values.reviewStartDate),
        reviewEndDate: date2ts(values.reviewEndDate),
        categories:
            values.categories.length > 0 ? values.categories : undefined,
        ecosystems:
            values.ecosystems.length > 0 ? values.ecosystems : undefined,
    };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-[1fr_2fr] gap-8">
            <div>
                <div className="text-sm font-medium">{title}</div>
                {description && (
                    <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {description}
                    </div>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
}

function MechanismCard({
    selected,
    onSelect,
    title,
    description,
    icon: Icon,
}: {
    selected: boolean;
    onSelect: () => void;
    title: string;
    description: string;
    icon: React.ElementType;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer",
                selected
                    ? "border-primary bg-primary/4 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
            )}
        >
            <div
                className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition-colors",
                    selected
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                )}
            >
                <Icon size={16} stroke={2} />
            </div>
            <div>
                <div className="text-xs font-semibold">{title}</div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {description}
                </div>
            </div>
        </button>
    );
}

function TagToggle({
    label,
    selected,
    onToggle,
}: {
    label: string;
    selected: boolean;
    onToggle: () => void;
}) {
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

// ─── Main Form Component ─────────────────────────────────────────────────────

interface ProgramFormProps {
    initialValues?: Partial<ProgramFormValues>;
    onSubmit: (values: ProgramFormValues) => Promise<void>;
    /** Primary button label */
    submitLabel?: string;
    /** Optional secondary submit action (e.g. "Save & Publish") */
    secondarySubmit?: {
        label: string;
        onSubmit: (values: ProgramFormValues) => Promise<void>;
    };
    isSubmitting: boolean;
    onCancel?: () => void;
    error?: string | null;
}

export function ProgramForm({
    initialValues,
    onSubmit,
    submitLabel = "Save Program",
    secondarySubmit,
    isSubmitting,
    onCancel,
    error,
}: ProgramFormProps) {
    const [values, setValues] = useState<ProgramFormValues>({
        ...DEFAULT_FORM_VALUES,
        ...initialValues,
    });
    const [isSecondarySubmitting, setIsSecondarySubmitting] = useState(false);

    const set = <K extends keyof ProgramFormValues>(
        key: K,
        value: ProgramFormValues[K]
    ) => setValues((prev) => ({ ...prev, [key]: value }));

    const toggleTag = (key: "categories" | "ecosystems", item: string) => {
        const arr = values[key];
        set(
            key,
            arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]
        );
    };

    const canSubmit =
        values.name.trim().length > 0 && values.description.trim().length > 0;
    const busy = isSubmitting || isSecondarySubmitting;

    const handlePrimary = async () => {
        if (!canSubmit || busy) return;
        await onSubmit(values);
    };

    const handleSecondary = async () => {
        if (!canSubmit || busy || !secondarySubmit) return;
        setIsSecondarySubmitting(true);
        try {
            await secondarySubmit.onSubmit(values);
        } finally {
            setIsSecondarySubmitting(false);
        }
    };

    return (
        <div className="space-y-0 divide-y divide-border">
            {/* ── Basic Info ─────────────────────────────────────────────────── */}
            <div className="py-8 first:pt-0">
                <FormSection
                    title="Basic Info"
                    description="Core details that applicants will see when browsing your program."
                >
                    <FieldGroup>
                        <Field>
                            <FieldLabel>
                                Program Name <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                placeholder="Filecoin Grants Wave 12"
                                value={values.name}
                                onChange={(e) => set("name", e.target.value)}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>
                                Description <span className="text-destructive">*</span>
                            </FieldLabel>
                            <FieldDescription>
                                Explain what you&apos;re funding, the program&apos;s goals, and
                                who should apply.
                            </FieldDescription>
                            <Textarea
                                placeholder="We're looking for teams building..."
                                value={values.description}
                                onChange={(e) => set("description", e.target.value)}
                                className="min-h-28 resize-y"
                            />
                        </Field>

                        <Field>
                            <FieldLabel>
                                Funding Mechanism <span className="text-destructive">*</span>
                            </FieldLabel>
                            <FieldDescription>
                                How grants will be disbursed to recipients.
                            </FieldDescription>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                <MechanismCard
                                    selected={values.mechanism === "direct"}
                                    onSelect={() => set("mechanism", "direct")}
                                    title="Direct Grant"
                                    description="Full funding released on approval. Best for smaller, well-scoped projects."
                                    icon={IconCoins}
                                />
                                <MechanismCard
                                    selected={values.mechanism === "milestone"}
                                    onSelect={() => set("mechanism", "milestone")}
                                    title="Milestone-Based"
                                    description="Funding released in stages as deliverables are verified."
                                    icon={IconTarget}
                                />
                            </div>
                        </Field>
                    </FieldGroup>
                </FormSection>
            </div>

            {/* ── Funding ────────────────────────────────────────────────────── */}
            <div className="py-8">
                <FormSection
                    title="Funding"
                    description="Set your total budget and per-application caps. Leave blank for open amounts."
                >
                    <FieldGroup>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <Field>
                                    <FieldLabel>Total Budget</FieldLabel>
                                    <Input
                                        type="number"
                                        placeholder="50000"
                                        value={values.budget}
                                        onChange={(e) => set("budget", e.target.value)}
                                        min="0"
                                    />
                                </Field>
                            </div>
                            <Field>
                                <FieldLabel>Currency</FieldLabel>
                                <select
                                    value={values.currency}
                                    onChange={(e) => set("currency", e.target.value)}
                                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel>Max Grant Per Application</FieldLabel>
                            <FieldDescription>
                                Cap the amount any single applicant can request.
                            </FieldDescription>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                                    {values.currency}
                                </span>
                                <Input
                                    type="number"
                                    className="pl-13"
                                    placeholder="10000"
                                    value={values.maxGrantAmount}
                                    onChange={(e) => set("maxGrantAmount", e.target.value)}
                                    min="0"
                                />
                            </div>
                        </Field>
                    </FieldGroup>
                </FormSection>
            </div>

            {/* ── Requirements ───────────────────────────────────────────────── */}
            <div className="py-8">
                <FormSection
                    title="Requirements"
                    description="Define who can apply and what they need to submit. Markdown is supported."
                >
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Eligibility Criteria</FieldLabel>
                            <FieldDescription>
                                Who qualifies for this program? (teams, individual devs,
                                geography, project stage, etc.)
                            </FieldDescription>
                            <Textarea
                                placeholder="- Must be building on Filecoin mainnet&#10;- Open to individuals and teams&#10;- No prior Filecoin Foundation grants"
                                value={values.eligibilityCriteria}
                                onChange={(e) => set("eligibilityCriteria", e.target.value)}
                                className="min-h-24 resize-y font-mono text-xs"
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Application Requirements</FieldLabel>
                            <FieldDescription>
                                What must applicants provide? (project description, team bios,
                                milestones, budget breakdown, etc.)
                            </FieldDescription>
                            <Textarea
                                placeholder="- Project description (500 words max)&#10;- Team background&#10;- Proposed milestone breakdown&#10;- Budget justification"
                                value={values.applicationRequirements}
                                onChange={(e) =>
                                    set("applicationRequirements", e.target.value)
                                }
                                className="min-h-24 resize-y font-mono text-xs"
                            />
                        </Field>
                    </FieldGroup>
                </FormSection>
            </div>

            {/* ── Timeline ───────────────────────────────────────────────────── */}
            <div className="py-8">
                <FormSection
                    title="Timeline"
                    description="Set application and review windows. All fields are optional."
                >
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-3">
                            <Field>
                                <FieldLabel>Applications Open</FieldLabel>
                                <Input
                                    type="date"
                                    value={values.applicationStartDate}
                                    onChange={(e) =>
                                        set("applicationStartDate", e.target.value)
                                    }
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Applications Close</FieldLabel>
                                <Input
                                    type="date"
                                    value={values.applicationEndDate}
                                    onChange={(e) => set("applicationEndDate", e.target.value)}
                                />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field>
                                <FieldLabel>Review Starts</FieldLabel>
                                <Input
                                    type="date"
                                    value={values.reviewStartDate}
                                    onChange={(e) => set("reviewStartDate", e.target.value)}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Review Ends</FieldLabel>
                                <Input
                                    type="date"
                                    value={values.reviewEndDate}
                                    onChange={(e) => set("reviewEndDate", e.target.value)}
                                />
                            </Field>
                        </div>
                    </FieldGroup>
                </FormSection>
            </div>

            {/* ── Discovery ──────────────────────────────────────────────────── */}
            <div className="py-8">
                <FormSection
                    title="Discovery"
                    description="Help builders find your program in the grants explorer."
                >
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Categories</FieldLabel>
                            <FieldDescription>
                                What types of projects are you looking to fund?
                            </FieldDescription>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {CATEGORIES.map((c) => (
                                    <TagToggle
                                        key={c}
                                        label={c}
                                        selected={values.categories.includes(c)}
                                        onToggle={() => toggleTag("categories", c)}
                                    />
                                ))}
                            </div>
                        </Field>

                        <Field>
                            <FieldLabel>Ecosystems</FieldLabel>
                            <FieldDescription>
                                Which ecosystems or networks is this program for?
                            </FieldDescription>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {ECOSYSTEMS.map((e) => (
                                    <TagToggle
                                        key={e}
                                        label={e}
                                        selected={values.ecosystems.includes(e)}
                                        onToggle={() => toggleTag("ecosystems", e)}
                                    />
                                ))}
                            </div>
                        </Field>
                    </FieldGroup>
                </FormSection>
            </div>

            {/* ── Error + Actions ────────────────────────────────────────────── */}
            <div className="pt-6">
                {error && (
                    <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {onCancel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            disabled={busy}
                        >
                            Cancel
                        </Button>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                        {secondarySubmit && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSecondary}
                                disabled={!canSubmit || busy}
                            >
                                {isSecondarySubmitting ? (
                                    <span className="flex items-center gap-1.5">
                                        <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                                        Publishing...
                                    </span>
                                ) : (
                                    secondarySubmit.label
                                )}
                            </Button>
                        )}

                        <Button
                            size="sm"
                            onClick={handlePrimary}
                            disabled={!canSubmit || busy}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-1.5">
                                    <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                                    Saving...
                                </span>
                            ) : (
                                submitLabel
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}