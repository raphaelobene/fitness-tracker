"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutCard } from "@/components/workout/workout-card";
import { useUserWorkouts } from "@/hooks/use-workouts";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function WorkoutsPage() {
  const { data: workouts, isLoading } = useUserWorkouts();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Workouts</h1>
        <div className="flex items-center gap-3">
          <Link href="/workouts/search">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </Link>
          <Link href="/workouts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Workout
            </Button>
          </Link>
        </div>
      </div>

      {!workouts || workouts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No workouts yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first workout to get started
          </p>
          <Link href="/workouts/new">
            <Button>Create Workout</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}
    </div>
  );
}
