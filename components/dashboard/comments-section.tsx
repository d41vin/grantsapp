"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
    IconMessageCircle,
    IconSend,
    IconLock,
    IconTrash,
    IconEdit,
    IconCheck,
    IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60_000);
    const h = Math.floor(diff / 3_600_000);
    const d = Math.floor(diff / 86_400_000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

// ─── Single Comment ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CommentItem({
    comment,
    isAuthor,
    isOrgMember,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    comment: any;
    isAuthor: boolean;
    isOrgMember: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isDeleting, setIsDeleting] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateComment = useMutation((api as any).comments.update);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeComment = useMutation((api as any).comments.remove);

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;
        try {
            await updateComment({ commentId: comment._id, content: editContent.trim() });
            setIsEditing(false);
        } catch {
            /* noop */
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await removeComment({ commentId: comment._id });
        } catch {
            setIsDeleting(false);
        }
    };

    return (
        <div className={cn(
            "flex gap-3 py-3",
            comment.isInternal && "bg-amber-50/50 dark:bg-amber-950/10 -mx-4 px-4 rounded-lg"
        )}>
            {/* Avatar */}
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                {comment.author?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="size-7 rounded-full object-cover"
                    />
                ) : (
                    getInitials(comment.author?.name ?? "?")
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{comment.author?.name ?? "Unknown"}</span>
                    {comment.isInternal && (
                        <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <IconLock size={8} stroke={2.5} />
                            Internal
                        </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{relativeTime(comment.createdAt)}</span>
                    {comment.updatedAt > comment.createdAt + 1000 && (
                        <span className="text-[10px] text-muted-foreground italic">(edited)</span>
                    )}
                </div>

                {isEditing ? (
                    <div className="mt-1.5 space-y-2">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-16 resize-none text-xs"
                        />
                        <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                <IconX size={12} stroke={2} />
                            </Button>
                            <Button size="sm" onClick={handleSaveEdit} disabled={!editContent.trim()}>
                                <IconCheck size={12} stroke={2} />
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </p>
                )}
            </div>

            {/* Actions */}
            {!isEditing && (isAuthor || isOrgMember) && (
                <div className="flex items-start gap-0.5 shrink-0 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                    {isAuthor && (
                        <button
                            onClick={() => { setIsEditing(true); setEditContent(comment.content); }}
                            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <IconEdit size={12} stroke={2} />
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <IconTrash size={12} stroke={2} />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Comments Section (main export) ─────────────────────────────────────────

export function CommentsSection({
    targetType,
    targetId,
    isOrgMember = false,
}: {
    targetType: "application" | "milestone";
    targetId: string;
    isOrgMember?: boolean;
}) {
    const { isAuthenticated } = useConvexAuth();
    const [newContent, setNewContent] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const currentUser = useQuery(
        api.users.getCurrentUser,
        !isAuthenticated ? "skip" : undefined
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comments = useQuery((api as any).comments.listByTarget, {
        targetType,
        targetId,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createComment = useMutation((api as any).comments.create);

    const handlePost = async () => {
        if (!newContent.trim()) return;
        setIsPosting(true);
        try {
            await createComment({
                targetType,
                targetId,
                content: newContent.trim(),
                isInternal,
            });
            setNewContent("");
            setIsInternal(false);
        } catch {
            /* noop */
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="rounded-xl border bg-card">
            {/* Header */}
            <div className="flex items-center gap-2 border-b px-5 py-3">
                <IconMessageCircle size={14} stroke={2} className="text-muted-foreground" />
                <div className="text-xs font-semibold">
                    Discussion
                    {comments && comments.length > 0 && (
                        <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {comments.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Comment list */}
            <div className="divide-y px-5">
                {comments === undefined ? (
                    <div className="space-y-4 py-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="size-7 rounded-full shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-8 text-center">
                        <div className="text-xs text-muted-foreground">
                            No comments yet. Start the discussion below.
                        </div>
                    </div>
                ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    comments.map((comment: any) => (
                        <div key={comment._id} className="group/comment">
                            <CommentItem
                                comment={comment}
                                isAuthor={currentUser?._id === comment.authorId}
                                isOrgMember={isOrgMember}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* New comment form */}
            {isAuthenticated && (
                <div className="border-t px-5 py-4 space-y-3">
                    <Textarea
                        placeholder={isInternal ? "Write an internal note (only visible to your team)..." : "Write a comment..."}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className={cn(
                            "min-h-16 resize-none text-xs",
                            isInternal && "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/10"
                        )}
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isOrgMember && (
                                <button
                                    type="button"
                                    onClick={() => setIsInternal((v) => !v)}
                                    className={cn(
                                        "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-colors",
                                        isInternal
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <IconLock size={10} stroke={2} />
                                    {isInternal ? "Internal note" : "Make internal"}
                                </button>
                            )}
                        </div>
                        <Button
                            size="sm"
                            onClick={handlePost}
                            disabled={!newContent.trim() || isPosting}
                            className="gap-1.5"
                        >
                            {isPosting ? (
                                <span className="flex items-center gap-1.5">
                                    <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
                                    Posting...
                                </span>
                            ) : (
                                <>
                                    <IconSend size={11} stroke={2.5} />
                                    Post
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
