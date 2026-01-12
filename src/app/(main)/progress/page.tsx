"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProgressOverview,
  useWeeklyActivity,
  useWorkoutProgress,
} from "@/hooks/use-progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, Clock, Dumbbell, Flame, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ProgressPage() {
  const { data: overview, isLoading: overviewLoading } = useProgressOverview();
  const { data: workouts, isLoading: workoutsLoading } = useWorkoutProgress();
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyActivity();

  if (overviewLoading || workoutsLoading || weeklyLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const weekChange =
    overview && overview.lastWeekLogs > 0
      ? Math.round(
          ((overview.thisWeekLogs - overview.lastWeekLogs) /
            overview.lastWeekLogs) *
            100
        )
      : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-gray-600 mt-1">Track your fitness journey</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workouts
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.totalWorkouts || 0}
            </div>
            <p className="text-xs text-muted-foreground">Created workouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalLogs || 0}</div>
            <p className="text-xs text-muted-foreground">Total sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.thisWeekLogs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {weekChange > 0 ? "+" : ""}
              {weekChange}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.currentStreak || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview?.currentStreak === 1 ? "day" : "days"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Your workout sessions this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {weekly?.map((day) => {
              const date = new Date(day.date);

              return (
                <div key={day.date} className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-20 text-sm font-medium transition-colors",
                      day.isToday && "text-primary"
                    )}
                  >
                    {day.isToday ? "Today" : format(date, "EEE")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={day.count > 0 ? 100 : 0}
                        className={cn(
                          "h-2 transition-all",
                          day.isToday && "[&>div]:bg-primary"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm w-8 transition-colors",
                          day.isToday
                            ? "text-primary font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {day.count > 0 ? `${day.count}x` : ""}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-xs transition-colors",
                      day.isToday
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {format(date, "MMM d")}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workout Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Completion</CardTitle>
          <CardDescription>
            How consistently you complete each workout
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!workouts || workouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No workouts yet</p>
              <Link
                href="/workouts/new"
                className="text-primary hover:underline text-sm mt-2 inline-block"
              >
                Create your first workout
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {workouts.map((workout) => (
                <div key={workout.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link
                        href={`/workouts/${workout.id}`}
                        className="font-medium hover:underline"
                      >
                        {workout.name}
                      </Link>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {workout.totalLogs}{" "}
                          {workout.totalLogs === 1 ? "session" : "sessions"}
                        </span>
                        {workout.lastCompleted && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last:{" "}
                            {format(new Date(workout.lastCompleted), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {workout.completionRate}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        completion
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Progress value={workout.completionRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Based on last 5 sessions with {workout.exerciseCount}{" "}
                      exercises
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      {overview && (
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>
              Your activity in {format(new Date(), "MMMM yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Workout Sessions</span>
                <span className="text-2xl font-bold">
                  {overview.thisMonthLogs}
                </span>
              </div>

              {overview.totalDuration > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Duration</span>
                  <span className="text-2xl font-bold">
                    {Math.floor(overview.totalDuration / 3600)}h{" "}
                    {Math.floor((overview.totalDuration % 3600) / 60)}m
                  </span>
                </div>
              )}

              {overview.bestStreak > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Best Streak</span>
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="text-2xl font-bold">
                      {overview.bestStreak}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {overview.bestStreak === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    {overview.thisMonthLogs > 0
                      ? `You're on track! Keep up the great work.`
                      : `Start your first workout this month.`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
