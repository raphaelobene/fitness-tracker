"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkoutCard } from "@/components/workout/workout-card";
import { useFeedWorkouts, useUserWorkouts } from "@/hooks/use-workouts";
import { Visibility } from "@/lib/constants";
import { Filter, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchWorkoutsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [visibility, setVisibility] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const { data: myWorkouts, isLoading: myLoading } = useUserWorkouts();
  const { data: feedWorkouts, isLoading: feedLoading } = useFeedWorkouts();

  const isLoading = myLoading || feedLoading;

  // Combine workouts
  const allWorkouts = [...(myWorkouts || []), ...(feedWorkouts || [])];

  // Remove duplicates
  const uniqueWorkouts = Array.from(
    new Map(allWorkouts.map((w) => [w.id, w])).values()
  );

  // Filter workouts
  let filtered = uniqueWorkouts;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (workout) =>
        workout.name.toLowerCase().includes(query) ||
        workout.description?.toLowerCase().includes(query) ||
        workout.exercises.some((ex) => ex.name.toLowerCase().includes(query))
    );
  }

  if (visibility !== "all") {
    filtered = filtered.filter((workout) => workout.visibility === visibility);
  }

  // Sort workouts
  if (sortBy === "recent") {
    filtered = filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortBy === "popular") {
    filtered = filtered.sort((a, b) => b._count.likes - a._count.likes);
  } else if (sortBy === "name") {
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/workouts/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setVisibility("all");
    setSortBy("recent");
    router.push("/workouts/search");
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold">Search Workouts</h1>
        <p className="text-muted-foreground mt-1">
          Find workouts by name, description, or exercises
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Visibility
              </label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workouts</SelectItem>
                  <SelectItem value={Visibility.PUBLIC}>Public</SelectItem>
                  <SelectItem value={Visibility.FOLLOWERS}>
                    Followers Only
                  </SelectItem>
                  <SelectItem value={Visibility.PRIVATE}>Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "workout" : "workouts"}{" "}
            found
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No workouts found</p>
                <Button variant="link" onClick={clearFilters}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
