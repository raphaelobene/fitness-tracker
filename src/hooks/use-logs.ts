import {
  createWorkoutLog,
  deleteWorkoutLog,
  getUserLogs,
} from "@/lib/actions/log.actions";
import { WorkoutLogInput } from "@/lib/validations/log.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUserLogs(userId?: string) {
  return useQuery({
    queryKey: ["logs", "user", userId],
    queryFn: async () => {
      const result = await getUserLogs(userId);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkoutLogInput) => {
      const result = await createWorkoutLog(data);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      toast.success("Workout logged successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log workout");
    },
  });
}

export function useDeleteLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      const result = await deleteWorkoutLog(logId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      toast.success("Log deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete log");
    },
  });
}
