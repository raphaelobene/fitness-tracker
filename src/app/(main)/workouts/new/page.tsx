"use client";

import { WorkoutForm } from "@/components/forms/workout-form";
import HeaderActions from "@/components/header-actions";
import {
  SectionHeader,
  SectionHeaderHeading,
} from "@/components/section-header";
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
    <>
      <HeaderActions title="Create new workout" />
      <div className="space-y-6">
        <SectionHeader className="flex-col">
          <div className="flex flex-col w-full gap-1">
            <SectionHeaderHeading className="text-3xl">
              Create New Workout
            </SectionHeaderHeading>
          </div>
        </SectionHeader>

        <WorkoutForm
          onSubmit={handleSubmit}
          _isLoading={createWorkout.isPending}
        />
      </div>
    </>
  );
}
