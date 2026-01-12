"use client";

import { WorkoutForm } from "@/components/forms/workout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateWorkout, useWorkout } from "@/hooks/use-workouts";
import { WorkoutInput } from "@/lib/validations/workout.schema";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: workout, isLoading } = useWorkout(id);
  const updateWorkout = useUpdateWorkout();

  const handleSubmit = async (data: WorkoutInput) => {
    await updateWorkout.mutateAsync({ ...data, id });
    router.push(`/workouts/${id}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Workout not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutForm
            defaultValues={{
              name: workout.name,
              description: workout.description || undefined,
              visibility: workout.visibility,
              exercises: workout.exercises.map((ex) => ({
                id: ex.id,
                name: ex.name,
                sets: ex.sets || undefined,
                reps: ex.reps || undefined,
                duration: ex.duration || undefined,
                weight: ex.weight || undefined,
                notes: ex.notes || undefined,
                order: ex.order,
              })),
            }}
            onSubmit={handleSubmit}
            isLoading={updateWorkout.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
