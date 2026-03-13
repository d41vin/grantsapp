"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ProjectForm,
    parseProjectValues,
    projectToFormValues,
    type ProjectFormValues,
} from "@/components/dashboard/projects/project-form";
import {
    IconChevronLeft,
    IconCode,
    IconAlertTriangle,
    IconWorld,
    IconBrandGithub,
    IconExternalLink,
} from "@tabler/icons-react";
import { Id } from "@/convex/_generated/dataModel";

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = useQuery((api as any).projects.getById, {
        projectId: id as Id<"projects">,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateProject = useMutation((api as any).projects.update);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const archiveProject = useMutation((api as any).projects.archive);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    if (project === undefined) {
        return (
            <div className="flex flex-col gap-6 p-8">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-56" />
                <div className="rounded-xl border bg-card p-8 max-w-2xl space-y-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <EmptyState
                    icon={IconCode}
                    title="Project not found"
                    description="This project doesn't exist or you don't have access to it."
                    action={{ label: "Back to Projects", href: "/dashboard/projects" }}
                />
            </div>
        );
    }

    const handleSave = async (values: ProjectFormValues) => {
        setError(null);
        setSaveSuccess(false);
        setIsSubmitting(true);
        try {
            await updateProject({
                projectId: id as Id<"projects">,
                ...parseProjectValues(values),
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleArchive = async () => {
        setIsArchiving(true);
        try {
            await archiveProject({ projectId: id as Id<"projects"> });
            router.replace("/dashboard/projects");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to archive project.");
            setIsArchiving(false);
            setShowArchiveConfirm(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-8">
            <Link
                href="/dashboard/projects"
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground w-fit"
            >
                <IconChevronLeft size={13} stroke={2.5} />
                Projects
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <IconCode size={16} stroke={2} className="text-muted-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">{project.name}</h1>
                        <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                {project.applicationCount} application{project.applicationCount !== 1 ? "s" : ""}
                                {project.grantCount > 0 && ` · ${project.grantCount} grant${project.grantCount !== 1 ? "s" : ""} received`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* External links */}
                <div className="flex items-center gap-2 shrink-0">
                    {project.github && (
                        <a
                            href={`https://github.com/${project.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <IconBrandGithub size={13} stroke={2} />
                                GitHub
                                <IconExternalLink size={11} stroke={2} className="text-muted-foreground" />
                            </Button>
                        </a>
                    )}
                    {project.website && (
                        <a href={project.website} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <IconWorld size={13} stroke={2} />
                                Website
                                <IconExternalLink size={11} stroke={2} className="text-muted-foreground" />
                            </Button>
                        </a>
                    )}
                    <Link href={`/projects/${project.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-1.5">
                            Public Profile
                            <IconExternalLink size={11} stroke={2} className="text-muted-foreground" />
                        </Button>
                    </Link>
                </div>
            </div>

            {saveSuccess && (
                <div className="max-w-2xl rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
                    Changes saved successfully.
                </div>
            )}

            {/* Edit form */}
            <div className="rounded-xl border bg-card p-8 max-w-2xl">
                <div className="mb-6">
                    <div className="text-sm font-medium">Project Settings</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                        Updates are reflected immediately on your public project profile.
                    </div>
                </div>
                <ProjectForm
                    key={project._id}
                    initialValues={projectToFormValues(project)}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSave}
                    submitLabel="Save Changes"
                    error={error}
                />
            </div>

            {/* Danger Zone */}
            <div className="max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5">
                <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                                <IconAlertTriangle size={14} stroke={2} />
                                Archive Project
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                Archived projects are hidden from your public profile and can no longer be linked to new applications.
                            </div>
                        </div>
                        {showArchiveConfirm ? (
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-muted-foreground">Are you sure?</span>
                                <Button variant="outline" size="sm" onClick={() => setShowArchiveConfirm(false)} disabled={isArchiving}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleArchive} disabled={isArchiving}>
                                    {isArchiving ? "Archiving..." : "Archive"}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                                onClick={() => setShowArchiveConfirm(true)}
                            >
                                Archive Project
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}