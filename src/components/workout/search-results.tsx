import { Button } from "@/components/ui/button";
import { WorkoutCard } from "@/components/workout/workout-card";
import { WorkoutWithDetails } from "@/lib/types";
import { pluralize } from "@/lib/utils";
import { memo, useMemo } from "react";
import ErrorCard from "../error-card";

interface SearchResultsProps {
  workouts: WorkoutWithDetails[];
  hasFilters: boolean | "" | 0 | null;
  onClearFilters: () => void;
  searchQuery: string;
  visibility: string;
  sortBy: string;
}

export const SearchResults = memo(function SearchResults({
  workouts,
  hasFilters,
  onClearFilters,
  searchQuery,
  visibility,
  sortBy,
}: SearchResultsProps) {
  const filteredWorkouts = useMemo(() => {
    let result = [...workouts];

    const q = searchQuery.toLowerCase();

    if (q) {
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.description?.toLowerCase().includes(q) ||
          w.exercises.some((ex) => ex.name.toLowerCase().includes(q))
      );
    }

    if (visibility !== "all") {
      result = result.filter((w) => w.visibility === visibility);
    }

    if (sortBy === "recent") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "popular") {
      result.sort((a, b) => b._count.likes - a._count.likes);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [workouts, searchQuery, visibility, sortBy]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {pluralize(filteredWorkouts.length, "workout")} found
        </div>
        {hasFilters && filteredWorkouts.length > 0 && (
          <Button
            size="xs"
            variant="link"
            onClick={onClearFilters}
            className="p-0 h-auto rounded-none"
          >
            Clear filters
          </Button>
        )}
      </div>
      {filteredWorkouts.length > 0 ? (
        <div className="space-y-4">
          {filteredWorkouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      ) : (
        <ErrorCard
          title="No workouts found"
          className="gap-3"
          actionButton={
            hasFilters &&
            filteredWorkouts.length === 0 && (
              <Button
                size="xs"
                variant="link"
                onClick={onClearFilters}
                className="p-0 h-auto rounded-none"
              >
                Clear filters
              </Button>
            )
          }
        />
      )}
    </>
  );
});
