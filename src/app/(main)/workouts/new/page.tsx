"use client";

import { WorkoutForm } from "@/components/forms/workout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateWorkout } from "@/hooks/use-workouts";
import { WorkoutInput } from "@/lib/validations/workout.schema";
import { useRouter } from "next/navigation";

export default function NewWorkoutPage() {
  const router = useRouter();
  const createWorkout = useCreateWorkout();

  const handleSubmit = async (data: WorkoutInput) => {
    const result = await createWorkout.mutateAsync(data);
    if (result) {
      router.push(`/workouts/${result.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutForm
            onSubmit={handleSubmit}
            isLoading={createWorkout.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
