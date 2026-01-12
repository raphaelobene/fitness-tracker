"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExerciseProgress } from "@/hooks/use-progress";
import { useWorkout } from "@/hooks/use-workouts";
import { format } from "date-fns";
import { ArrowLeft, Award, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function WeightProgressionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: workout, isLoading: workoutLoading } = useWorkout(id);
  const { data: exerciseProgress, isLoading: progressLoading } =
    useExerciseProgress(id);

  if (workoutLoading || progressLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
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

  if (!exerciseProgress || exerciseProgress.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/workouts/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{workout.name}</h1>
            <p className="text-muted-foreground">Weight Progression</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No workout logs yet</p>
            <Link href={`/workouts/${id}/log`}>
              <Button>Log Your First Workout</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/workouts/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{workout.name}</h1>
          <p className="text-muted-foreground">
            Weight Progression & Analytics
          </p>
        </div>
      </div>

      {/* Exercise Tabs */}
      <Tabs defaultValue={exerciseProgress[0]?.id} className="w-full">
        <TabsList className="w-full overflow-x-auto flex-wrap h-auto">
          {exerciseProgress.map((exercise) => (
            <TabsTrigger
              key={exercise.id}
              value={exercise.id}
              className="shrink-0"
            >
              {exercise.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {exerciseProgress.map((exercise) => {
          const chartData = exercise.recentWeights.map((entry) => ({
            date: format(new Date(entry.date), "MMM d"),
            weight: entry.weight,
            fullDate: format(new Date(entry.date), "PPP"),
          }));

          const hasWeightData = exercise.recentWeights.length > 0;

          return (
            <TabsContent
              key={exercise.id}
              value={exercise.id}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Logs
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {exercise.totalLogs}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {exercise.totalLogs === 1 ? "session" : "sessions"}{" "}
                      completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completion Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {exercise.completionRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of planned exercises
                    </p>
                  </CardContent>
                </Card>

                {hasWeightData && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Personal Record
                      </CardTitle>
                      <Award className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {exercise.maxWeight}kg
                      </div>
                      <p className="text-xs text-muted-foreground">
                        max weight lifted
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Weight Progression Chart */}
              {hasWeightData ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Weight Progression</CardTitle>
                    <CardDescription>
                      Your weight progression over the last{" "}
                      {exercise.recentWeights.length} workouts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis
                          label={{
                            value: "Weight (kg)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => [`${value}kg`, "Weight"]}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              return payload[0].payload.fullDate;
                            }
                            return label;
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Weight (kg)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No weight data tracked yet for this exercise
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {exercise.lastCompleted ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Last Completed
                        </span>
                        <Badge variant="secondary">
                          {format(new Date(exercise.lastCompleted), "PPP")}
                        </Badge>
                      </div>
                      {hasWeightData && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm font-medium">
                            Latest Weight
                          </span>
                          <span className="text-lg font-bold">
                            {
                              exercise.recentWeights[
                                exercise.recentWeights.length - 1
                              ]?.weight
                            }
                            kg
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No completions yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ready for your next session?</h3>
              <p className="text-sm text-muted-foreground">
                Track your progress and beat your personal records
              </p>
            </div>
            <Link href={`/workouts/${id}/log`}>
              <Button>Log Workout</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
