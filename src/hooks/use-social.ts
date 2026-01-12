import {
  addComment,
  deleteComment,
  getComments,
  getUserProfile,
  toggleFollow,
  toggleLike,
} from "@/lib/actions/social.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workoutId: string) => {
      const result = await toggleLike(workoutId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout"] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to like workout");
    },
  });
}

export function useComments(workoutId: string) {
  return useQuery({
    queryKey: ["comments", workoutId],
    queryFn: async () => {
      const result = await getComments(workoutId);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workoutId,
      content,
    }: {
      workoutId: string;
      content: string;
    }) => {
      const result = await addComment(workoutId, content);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.workoutId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workout", variables.workoutId],
      });
      toast.success("Comment added");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add comment");
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const result = await deleteComment(commentId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Comment deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await toggleFollow(userId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to follow user");
    },
  });
}

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      const result = await getUserProfile(username);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
  });
}
