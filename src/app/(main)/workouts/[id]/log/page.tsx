"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { RestTimer } from "@/components/workout/rest-timer";
import { useCreateLog } from "@/hooks/use-logs";
import { useWorkout } from "@/hooks/use-workouts";
import { cn } from "@/lib/utils";
import { Check, Repeat, Timer, Weight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

type ExerciseLog = {
  exerciseId: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  completed: boolean;
  notes?: string;
};

export default function LogWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: workout, isLoading } = useWorkout(id);
  const createLog = useCreateLog();

  const [startTime] = useState(new Date());
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog>>(
    {}
  );
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [showRestTimer, setShowRestTimer] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full" />
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

  // Initialize exercise logs if not already done
  if (Object.keys(exerciseLogs).length === 0 && workout.exercises.length > 0) {
    const initialLogs: Record<string, ExerciseLog> = {};
    workout.exercises.forEach((exercise) => {
      initialLogs[exercise.id] = {
        exerciseId: exercise.id,
        sets: exercise.sets || undefined,
        reps: exercise.reps || undefined,
        weight: exercise.weight || undefined,
        duration: exercise.duration || undefined,
        completed: false,
        notes: "",
      };
    });
    setExerciseLogs(initialLogs);
  }

  const toggleExerciseComplete = (exerciseId: string) => {
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        completed: !prev[exerciseId]?.completed,
      },
    }));
  };

  const updateExerciseData = (
    exerciseId: string,
    field: keyof ExerciseLog,
    value: string | number
  ) => {
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value,
      },
    }));
  };

  const completedCount = Object.values(exerciseLogs).filter(
    (log) => log.completed
  ).length;
  const totalCount = workout.exercises.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleFinishWorkout = async () => {
    const endTime = new Date();
    const durationInSeconds = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    const logData = {
      workoutId: workout.id,
      date: new Date(),
      duration: durationInSeconds,
      notes: workoutNotes || undefined,
      entries: Object.values(exerciseLogs),
    };

    await createLog.mutateAsync(logData);
    router.push("/");
  };

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{workout.name}</h1>
            <p className="text-muted-foreground mt-1">
              Log your workout session
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowRestTimer(true)}
            >
              <Timer className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} exercises
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <div className="space-y-4">
          {workout.exercises.map((exercise, index) => {
            const log = exerciseLogs[exercise.id];
            const isCompleted = log?.completed || false;

            return (
              <Card
                key={exercise.id}
                className={cn(
                  "transition-all",
                  isCompleted && "bg-green-500/10 border-green-500/50"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={cn(
                          "shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                          isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {exercise.name}
                        </CardTitle>
                        {exercise.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {exercise.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRestTimer(true)}
                      >
                        <Timer className="h-4 w-4" />
                      </Button>
                      <Button
                        size="lg"
                        variant={isCompleted ? "outline" : "default"}
                        onClick={() => toggleExerciseComplete(exercise.id)}
                        className={cn(
                          "transition-all",
                          isCompleted &&
                            "bg-green-500 hover:bg-green-600 text-white"
                        )}
                      >
                        {isCompleted ? "Done" : "Complete"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {exercise.sets && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Repeat className="h-3 w-3" />
                          Sets
                        </label>
                        <Input
                          type="number"
                          value={log?.sets || exercise.sets}
                          onChange={(e) =>
                            updateExerciseData(
                              exercise.id,
                              "sets",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="h-9"
                        />
                      </div>
                    )}

                    {exercise.reps && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Repeat className="h-3 w-3" />
                          Reps
                        </label>
                        <Input
                          type="number"
                          value={log?.reps || exercise.reps}
                          onChange={(e) =>
                            updateExerciseData(
                              exercise.id,
                              "reps",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="h-9"
                        />
                      </div>
                    )}

                    {exercise.weight !== null && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Weight className="h-3 w-3" />
                          Weight (kg)
                        </label>
                        <Input
                          type="number"
                          step="0.5"
                          value={log?.weight ?? exercise.weight ?? ""}
                          onChange={(e) =>
                            updateExerciseData(
                              exercise.id,
                              "weight",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-9"
                        />
                      </div>
                    )}

                    {exercise.duration && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          Duration (s)
                        </label>
                        <Input
                          type="number"
                          value={log?.duration || exercise.duration}
                          onChange={(e) =>
                            updateExerciseData(
                              exercise.id,
                              "duration",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>

                  {/* Exercise Notes */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Notes (optional)
                    </label>
                    <Textarea
                      value={log?.notes || ""}
                      onChange={(e) =>
                        updateExerciseData(exercise.id, "notes", e.target.value)
                      }
                      placeholder="How did this feel? Any adjustments?"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Workout Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workout Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="How was your overall workout? Any general notes?"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 sticky bottom-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleFinishWorkout}
            disabled={createLog.isPending}
            className="flex-1"
          >
            {createLog.isPending ? "Saving..." : "Finish Workout"}
          </Button>
        </div>
      </div>

      {/* Rest Timer Modal */}
      <RestTimer
        isOpen={showRestTimer}
        onClose={() => setShowRestTimer(false)}
        defaultDuration={90}
      />
    </>
  );
}
