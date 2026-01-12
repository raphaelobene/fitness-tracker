import {
  getExerciseProgress,
  getMonthlyProgress,
  getProgressOverview,
  getWeeklyActivity,
  getWorkoutProgress,
} from "@/lib/actions/progress.actions";
import { useQuery } from "@tanstack/react-query";

export function useProgressOverview() {
  return useQuery({
    queryKey: ["progress", "overview"],
    queryFn: async () => {
      const result = await getProgressOverview();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useWorkoutProgress() {
  return useQuery({
    queryKey: ["progress", "workouts"],
    queryFn: async () => {
      const result = await getWorkoutProgress();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useExerciseProgress(workoutId: string) {
  return useQuery({
    queryKey: ["progress", "exercises", workoutId],
    queryFn: async () => {
      const result = await getExerciseProgress(workoutId);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    enabled: !!workoutId,
  });
}

export function useWeeklyActivity() {
  return useQuery({
    queryKey: ["progress", "weekly"],
    queryFn: async () => {
      const result = await getWeeklyActivity();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useMonthlyProgress() {
  return useQuery({
    queryKey: ["progress", "monthly"],
    queryFn: async () => {
      const result = await getMonthlyProgress();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}
