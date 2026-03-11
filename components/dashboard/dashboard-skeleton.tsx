import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8 p-8 animate-pulse">
            <div className="flex items-start justify-between">
                <div>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="mt-2 h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 rounded-xl border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="size-8 rounded-lg" />
                        </div>
                        <Skeleton className="mt-3 h-7 w-12" />
                        <Skeleton className="mt-2 h-3 w-32" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 rounded-xl border">
                    <div className="border-b px-5 py-4">
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="p-10 flex flex-col items-center gap-3">
                        <Skeleton className="size-10 rounded-xl" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-60" />
                        <Skeleton className="h-9 w-32 mt-2" />
                    </div>
                </div>

                <div className="rounded-xl border">
                    <div className="border-b px-5 py-4">
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="p-5 space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="size-8 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
