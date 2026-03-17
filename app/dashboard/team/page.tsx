"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
    IconUsers,
    IconUserPlus,
    IconShield,
    IconCrown,
    IconEye,
    IconTrash,
    IconX,
    IconCheck,
    IconChevronDown,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

// ─── Role config ──────────────────────────────────────────────────────────────

type MemberRole = "owner" | "admin" | "reviewer";

const ROLE_CONFIG: Record<MemberRole, { label: string; description: string; icon: React.ElementType; badgeClass: string }> = {
    owner: {
        label: "Owner",
        description: "Full access to all settings and members",
        icon: IconCrown,
        badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    admin: {
        label: "Admin",
        description: "Can manage programs, review applications, and invite members",
        icon: IconShield,
        badgeClass: "bg-primary/10 text-primary",
    },
    reviewer: {
        label: "Reviewer",
        description: "Can review applications and milestones",
        icon: IconEye,
        badgeClass: "bg-muted text-muted-foreground",
    },
};

function RoleBadge({ role }: { role: MemberRole }) {
    const config = ROLE_CONFIG[role];
    const Icon = config.icon;
    return (
        <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            config.badgeClass
        )}>
            <Icon size={9} stroke={2.5} />
            {config.label}
        </span>
    );
}

// ─── Role selector dropdown ───────────────────────────────────────────────────

function RoleSelector({
    currentRole,
    onSelect,
    disabled,
}: {
    currentRole: MemberRole;
    onSelect: (role: "admin" | "reviewer") => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);

    if (currentRole === "owner") return <RoleBadge role="owner" />;

    return (
        <div className="relative">
            <button
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                style={{ background: "transparent" }}
            >
                <RoleBadge role={currentRole} />
                <IconChevronDown size={10} stroke={2.5} className="text-muted-foreground ml-0.5" />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1.5 w-48 overflow-hidden rounded-xl border bg-card shadow-lg">
                        {(["admin", "reviewer"] as const).map((role) => {
                            const config = ROLE_CONFIG[role];
                            const Icon = config.icon;
                            const isActive = currentRole === role;
                            return (
                                <button
                                    key={role}
                                    onClick={() => { onSelect(role); setOpen(false); }}
                                    className={cn(
                                        "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted",
                                        isActive && "bg-primary/5"
                                    )}
                                >
                                    <Icon size={13} stroke={2} className={cn(
                                        "shrink-0 mt-0.5",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )} />
                                    <div>
                                        <div className={cn("text-xs font-medium", isActive && "text-primary")}>
                                            {config.label}
                                            {isActive && <span className="ml-1.5 text-[10px] opacity-60">current</span>}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                                            {config.description}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Member row ───────────────────────────────────────────────────────────────

function MemberRow({
    member,
    isCurrentUser,
    canManage,
    onRoleChange,
    onRemove,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    member: any;
    isCurrentUser: boolean;
    canManage: boolean;
    onRoleChange: (memberId: Id<"organizationMembers">, role: "admin" | "reviewer") => Promise<void>;
    onRemove: (memberId: Id<"organizationMembers">) => Promise<void>;
}) {
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const user = member.user;
    const role = member.role as MemberRole;
    const isOwner = role === "owner";

    const handleRoleChange = async (newRole: "admin" | "reviewer") => {
        if (newRole === role) return;
        setIsUpdating(true);
        try {
            await onRoleChange(member._id, newRole);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        try {
            await onRemove(member._id);
        } finally {
            setIsRemoving(false);
            setShowRemoveConfirm(false);
        }
    };

    return (
        <div className="flex items-center gap-4 border-b px-5 py-3.5 last:border-b-0">
            {/* Avatar */}
            <div className="shrink-0">
                {user?.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="size-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {user?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                )}
            </div>

            {/* Identity */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{user?.name ?? "Unknown"}</span>
                    {isCurrentUser && (
                        <span className="text-[10px] text-muted-foreground">(you)</span>
                    )}
                </div>
                <span className="text-[11px] text-muted-foreground truncate">
                    @{user?.username ?? "—"}
                    {user?.email && ` · ${user.email}`}
                </span>
            </div>

            {/* Role — editable for non-owners if current user can manage */}
            <div className="shrink-0">
                {canManage && !isOwner && !isCurrentUser ? (
                    <RoleSelector
                        currentRole={role}
                        onSelect={handleRoleChange}
                        disabled={isUpdating}
                    />
                ) : (
                    <RoleBadge role={role} />
                )}
            </div>

            {/* Remove */}
            {canManage && !isOwner && !isCurrentUser && (
                <div className="shrink-0">
                    {showRemoveConfirm ? (
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground">Remove?</span>
                            <button
                                onClick={() => setShowRemoveConfirm(false)}
                                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <IconX size={12} stroke={2.5} />
                            </button>
                            <button
                                onClick={handleRemove}
                                disabled={isRemoving}
                                className="rounded p-1 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                            >
                                {isRemoving
                                    ? <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                                    : <IconCheck size={12} stroke={2.5} />}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowRemoveConfirm(true)}
                            className="rounded p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        >
                            <IconTrash size={13} stroke={2} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Invite form ──────────────────────────────────────────────────────────────

function InviteForm({
    orgId,
    onSuccess,
}: {
    orgId: Id<"organizations">;
    onSuccess: () => void;
}) {
    const [username, setUsername] = useState("");
    const [role, setRole] = useState<"admin" | "reviewer">("reviewer");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addMember = useMutation((api as any).organizationMembers.addMember);

    const handleSubmit = async () => {
        const trimmed = username.trim().replace(/^@/, "");
        if (!trimmed) return;
        setError(null);
        setIsSubmitting(true);
        try {
            await addMember({ organizationId: orgId, username: trimmed, role });
            setUsername("");
            onSuccess();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add member.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-xl border bg-card p-5 space-y-4">
            <div>
                <div className="text-sm font-semibold">Invite a team member</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                    Add a reviewer or admin by their GrantsApp username.
                </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                <Field>
                    <FieldLabel>Username</FieldLabel>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@</span>
                        <Input
                            className="pl-5"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                    </div>
                </Field>

                <Field>
                    <FieldLabel>Role</FieldLabel>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as "admin" | "reviewer")}
                        className="flex h-7 rounded-lg border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        <option value="reviewer">Reviewer</option>
                        <option value="admin">Admin</option>
                    </select>
                </Field>

                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!username.trim() || isSubmitting}
                    className="gap-1.5 mb-0"
                >
                    {isSubmitting ? (
                        <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                    ) : (
                        <IconUserPlus size={12} stroke={2.5} />
                    )}
                    {isSubmitting ? "Adding..." : "Add"}
                </Button>
            </div>

            {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
            )}

            {/* Role descriptions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
                {(["reviewer", "admin"] as const).map((r) => {
                    const config = ROLE_CONFIG[r];
                    const Icon = config.icon;
                    return (
                        <div key={r} className={cn(
                            "rounded-lg border p-3 transition-colors",
                            role === r ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20"
                        )}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <Icon size={12} stroke={2} className={role === r ? "text-primary" : "text-muted-foreground"} />
                                <span className={cn("text-xs font-medium", role === r ? "text-primary" : "text-foreground")}>
                                    {config.label}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug">{config.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamPage() {
    const { isAuthenticated } = useConvexAuth();
    const [inviteSuccess, setInviteSuccess] = useState(false);

    const currentUser = useQuery(
        api.users.getCurrentUser,
        !isAuthenticated ? "skip" : undefined
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myOrg = useQuery(
        (api as any).organizations.getMyOrg,
        !isAuthenticated ? "skip" : undefined
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const membersData = useQuery(
        (api as any).organizationMembers.listMembers,
        myOrg ? { organizationId: myOrg._id } : "skip"
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateRoleMutation = useMutation((api as any).organizationMembers.updateMemberRole);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeMutation = useMutation((api as any).organizationMembers.removeMember);

    const isLoading = myOrg === undefined || membersData === undefined || currentUser === undefined;

    const handleRoleChange = async (memberId: Id<"organizationMembers">, role: "admin" | "reviewer") => {
        if (!myOrg) return;
        await updateRoleMutation({ organizationId: myOrg._id, memberId, role });
    };

    const handleRemove = async (memberId: Id<"organizationMembers">) => {
        if (!myOrg) return;
        await removeMutation({ organizationId: myOrg._id, memberId });
    };

    const isOwner = myOrg && currentUser && myOrg.managerId === currentUser._id;
    const memberCount = (membersData?.members?.length ?? 0) + (membersData?.owner ? 1 : 0);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-8">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-4 w-64" />
                <div className="rounded-xl border">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 border-b px-5 py-3.5 last:border-b-0">
                            <Skeleton className="size-8 rounded-full" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Redirect non-managers
    if (currentUser?.activeRole !== "manager") return null;

    return (
        <div className="flex flex-col gap-6 p-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Team</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage reviewers and collaborators for{" "}
                        <span className="font-medium text-foreground">{myOrg?.name}</span>.
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5">
                    <IconUsers size={13} stroke={2} className="text-muted-foreground" />
                    <span className="text-xs font-medium">{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                </div>
            </div>

            {/* Invite success toast */}
            {inviteSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
                    <IconCheck size={13} stroke={2.5} />
                    Member added successfully.
                </div>
            )}

            <div className="grid grid-cols-[1fr_360px] gap-6 items-start">
                {/* Left — member list */}
                <div className="flex flex-col gap-4">
                    {/* Role legend */}
                    <div className="grid grid-cols-3 gap-3">
                        {(["owner", "admin", "reviewer"] as MemberRole[]).map((role) => {
                            const config = ROLE_CONFIG[role];
                            const Icon = config.icon;
                            const count = role === "owner"
                                ? (membersData?.owner ? 1 : 0)
                                : (membersData?.members?.filter((m: any) => m.role === role).length ?? 0);
                            return (
                                <div key={role} className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
                                    <div className={cn(
                                        "flex size-7 shrink-0 items-center justify-center rounded-lg",
                                        role === "owner" ? "bg-amber-500/10" : role === "admin" ? "bg-primary/10" : "bg-muted"
                                    )}>
                                        <Icon size={14} stroke={2} className={cn(
                                            role === "owner" ? "text-amber-600 dark:text-amber-400" : role === "admin" ? "text-primary" : "text-muted-foreground"
                                        )} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">{count}</div>
                                        <div className="text-[10px] text-muted-foreground">{config.label}{count !== 1 ? "s" : ""}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Member list */}
                    <div className="rounded-xl border">
                        {/* Owner row */}
                        {membersData?.owner && (
                            <div className="group flex items-center gap-4 border-b px-5 py-3.5">
                                <div className="shrink-0">
                                    {membersData.owner.avatar ? (
                                        <img src={membersData.owner.avatar} alt={membersData.owner.name} className="size-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                            {membersData.owner.name?.[0]?.toUpperCase() ?? "?"}
                                        </div>
                                    )}
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">{membersData.owner.name}</span>
                                        {membersData.owner._id === currentUser?._id && (
                                            <span className="text-[10px] text-muted-foreground">(you)</span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">@{membersData.owner.username}</span>
                                </div>
                                <RoleBadge role="owner" />
                            </div>
                        )}

                        {/* Member rows */}
                        {membersData?.members && membersData.members.length > 0 ? (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            membersData.members.map((member: any) => (
                                <MemberRow
                                    key={member._id}
                                    member={member}
                                    isCurrentUser={member.userId === currentUser?._id}
                                    canManage={!!isOwner}
                                    onRoleChange={handleRoleChange}
                                    onRemove={handleRemove}
                                />
                            ))
                        ) : (
                            !membersData?.owner && (
                                <div className="p-10">
                                    <EmptyState
                                        icon={IconUsers}
                                        title="No team members yet"
                                        description="Invite reviewers and admins to collaborate on your grant programs."
                                    />
                                </div>
                            )
                        )}

                        {/* Empty members state when only owner exists */}
                        {membersData?.owner && (!membersData?.members || membersData.members.length === 0) && (
                            <div className="px-5 py-6 text-center">
                                <p className="text-xs text-muted-foreground">
                                    No additional members yet. Use the invite form to add reviewers and admins.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — invite form */}
                <div className="sticky top-8">
                    {isOwner ? (
                        <InviteForm
                            orgId={myOrg!._id}
                            onSuccess={() => {
                                setInviteSuccess(true);
                                setTimeout(() => setInviteSuccess(false), 4000);
                            }}
                        />
                    ) : (
                        <div className="rounded-xl border bg-muted/30 p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <IconShield size={14} stroke={2} className="text-muted-foreground" />
                                <span className="text-sm font-medium">Invite members</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Only the organization owner can invite or remove members.
                            </p>
                        </div>
                    )}

                    {/* Roles reference */}
                    <div className="mt-4 rounded-xl border bg-muted/20 p-4 space-y-3">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Role permissions
                        </div>
                        {(["owner", "admin", "reviewer"] as MemberRole[]).map((role) => {
                            const config = ROLE_CONFIG[role];
                            const Icon = config.icon;
                            return (
                                <div key={role} className="flex items-start gap-2.5">
                                    <Icon size={12} stroke={2} className={cn(
                                        "shrink-0 mt-0.5",
                                        role === "owner" ? "text-amber-600 dark:text-amber-400"
                                            : role === "admin" ? "text-primary"
                                                : "text-muted-foreground"
                                    )} />
                                    <div>
                                        <div className="text-[11px] font-medium">{config.label}</div>
                                        <div className="text-[10px] text-muted-foreground leading-snug">{config.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}