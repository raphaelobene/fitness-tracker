import {
  createWorkout,
  deleteWorkout,
  getFeedWorkouts,
  getUserWorkouts,
  getWorkout,
  updateWorkout,
} from "@/lib/actions/workout.actions";
import {
  UpdateWorkoutInput,
  WorkoutInput,
} from "@/lib/validations/workout.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useWorkout(workoutId: string) {
  return useQuery({
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      const result = await getWorkout(workoutId);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useUserWorkouts(userId?: string) {
  return useQuery({
    queryKey: ["workouts", "user", userId],
    queryFn: async () => {
      const result = await getUserWorkouts(userId);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useFeedWorkouts() {
  return useQuery({
    queryKey: ["workouts", "feed"],
    queryFn: async () => {
      const result = await getFeedWorkouts();
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkoutInput) => {
      const result = await createWorkout(data);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create workout");
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateWorkoutInput) => {
      const result = await updateWorkout(data);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workout", data.id] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update workout");
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (workoutId: string) => {
      const result = await deleteWorkout(workoutId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout deleted successfully");
      router.push("/workouts");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete workout");
    },
  });
}
