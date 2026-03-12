"use client";

import { useState } from "react";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";
import {
    ProjectForm,
    parseProjectValues,
    type ProjectFormValues,
} from "@/components/dashboard/projects/project-form";

export default function NewProjectPage() {
    const router = useRouter();
    const { isAuthenticated } = useConvexAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createProject = useMutation((api as any).projects.create);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: ProjectFormValues) => {
        if (!isAuthenticated) return;
        setError(null);
        setIsSubmitting(true);
        try {
            const projectId = await createProject(parseProjectValues(values));
            router.push(`/dashboard/projects/${projectId}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-0 p-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard/projects"
                    className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground w-fit"
                >
                    <IconChevronLeft size={13} stroke={2.5} />
                    Projects
                </Link>
                <h1 className="text-xl font-semibold">New Project</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create a project profile to attach to your grant applications.
                </p>
            </div>

            <div className="rounded-xl border bg-card p-8 max-w-2xl">
                <ProjectForm
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                    submitLabel="Create Project"
                    onCancel={() => router.push("/dashboard/projects")}
                    error={error}
                />
            </div>
        </div>
    );
}