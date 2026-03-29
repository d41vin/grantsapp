"use client";

import {
    IconClock,
    IconSearch,
    IconCircleCheck,
    IconAlertCircle,
    IconX,
    IconRefresh,
    IconExternalLink,
    IconCurrencyDollar,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StatusBannerProps {
    status: string;
    paymentStatus?: string | null;
    paymentTxHash?: string | null;
    paymentAmount?: number | null;
    paymentCurrency?: string | null;
    paidAt?: number | null;
    isManager?: boolean;
    type?: "application" | "milestone";
}

// ─── Config ──────────────────────────────────────────────────────────────────

const APPLICATION_BANNERS: Record<string, {
    icon: React.ElementType;
    label: string;
    description: string;
    className: string;
    iconClassName: string;
}> = {
    draft: {
        icon: IconClock,
        label: "Draft",
        description: "This application is still in draft. Submit it when you're ready.",
        className: "border-muted bg-muted/30",
        iconClassName: "text-muted-foreground",
    },
    submitted: {
        icon: IconClock,
        label: "Awaiting Review",
        description: "Your application has been submitted and is awaiting review by the program team.",
        className: "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20",
        iconClassName: "text-blue-600 dark:text-blue-400",
    },
    under_review: {
        icon: IconSearch,
        label: "Under Review",
        description: "A reviewer is currently evaluating your application.",
        className: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20",
        iconClassName: "text-amber-600 dark:text-amber-400",
    },
    rejected: {
        icon: IconX,
        label: "Not Approved",
        description: "This application was not approved. See reviewer feedback below.",
        className: "border-destructive/20 bg-destructive/5",
        iconClassName: "text-destructive",
    },
    withdrawn: {
        icon: IconAlertCircle,
        label: "Withdrawn",
        description: "This application was withdrawn by the applicant.",
        className: "border-muted bg-muted/30",
        iconClassName: "text-muted-foreground",
    },
};

const MILESTONE_BANNERS: Record<string, {
    icon: React.ElementType;
    label: string;
    description: string;
    className: string;
    iconClassName: string;
}> = {
    pending: {
        icon: IconClock,
        label: "Not Started",
        description: "This milestone hasn't been started yet.",
        className: "border-muted bg-muted/30",
        iconClassName: "text-muted-foreground",
    },
    in_progress: {
        icon: IconRefresh,
        label: "In Progress",
        description: "Work on this milestone is underway.",
        className: "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20",
        iconClassName: "text-blue-600 dark:text-blue-400",
    },
    submitted: {
        icon: IconClock,
        label: "Submitted for Review",
        description: "This milestone has been submitted and is awaiting review.",
        className: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20",
        iconClassName: "text-amber-600 dark:text-amber-400",
    },
    rejected: {
        icon: IconX,
        label: "Not Approved",
        description: "This milestone was not approved. See reviewer feedback below.",
        className: "border-destructive/20 bg-destructive/5",
        iconClassName: "text-destructive",
    },
    revision_requested: {
        icon: IconRefresh,
        label: "Revision Requested",
        description: "The reviewer has requested changes before approval.",
        className: "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20",
        iconClassName: "text-orange-600 dark:text-orange-400",
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(ts?: number | null) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
    });
}

function formatCurrency(amount?: number | null, currency = "USD") {
    if (amount === undefined || amount === null) return "—";
    const prefix = currency === "USD" || currency === "USDC" ? "$" : "";
    return `${prefix}${amount.toLocaleString()}${prefix ? "" : ` ${currency}`}`;
}

function getTxExplorerUrl(txHash: string): string {
    // Filecoin Calibration testnet block explorer
    return `https://calibration.filfox.info/en/message/${txHash}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StatusBanner({
    status,
    paymentStatus,
    paymentTxHash,
    paymentAmount,
    paymentCurrency,
    paidAt,
    isManager = false,
    type = "application",
}: StatusBannerProps) {
    const banners = type === "application" ? APPLICATION_BANNERS : MILESTONE_BANNERS;

    // Approved state — determine payment sub-status
    if (status === "approved") {
        if (paymentStatus === "paid") {
            return (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-2">
                        <IconCircleCheck size={15} stroke={2} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            Approved & Paid
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        {paymentAmount && (
                            <span className="flex items-center gap-1">
                                <IconCurrencyDollar size={11} stroke={2} />
                                {formatCurrency(paymentAmount, paymentCurrency ?? "USD")}
                            </span>
                        )}
                        {paidAt && (
                            <span className="flex items-center gap-1">
                                <IconClock size={11} stroke={2} />
                                Paid {formatDate(paidAt)}
                            </span>
                        )}
                        {paymentTxHash && (
                            <a
                                href={getTxExplorerUrl(paymentTxHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                            >
                                <IconExternalLink size={11} stroke={2} />
                                View Transaction
                            </a>
                        )}
                    </div>
                </div>
            );
        }

        // Approved but unpaid
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-1 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2">
                    <IconCircleCheck size={15} stroke={2} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Approved
                    </span>
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Payment Pending
                    </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                    {isManager
                        ? "This application has been approved. Use the Complete Payment button to record the payment."
                        : "Your application has been approved! Payment will be processed by the program team."}
                </p>
            </div>
        );
    }

    // Non-approved statuses
    const config = banners[status];
    if (!config) return null;

    const Icon = config.icon;

    return (
        <div className={cn("rounded-xl border p-4 space-y-1", config.className)}>
            <div className="flex items-center gap-2">
                <Icon size={15} stroke={2} className={config.iconClassName} />
                <span className="text-xs font-semibold">{config.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{config.description}</p>
        </div>
    );
}
