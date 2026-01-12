"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutCard } from "@/components/workout/workout-card";
import { useFeedWorkouts } from "@/hooks/use-workouts";

export default function FeedPage() {
  const { data: workouts, isLoading } = useFeedWorkouts();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="text-center py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">No workouts yet</h2>
        <p className="text-gray-600 mb-6">
          Follow users or create public workouts to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Feed</h1>
      {workouts.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
