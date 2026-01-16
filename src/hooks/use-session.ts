import { getSettings, updateProfile } from "@/lib/actions/settings.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useUserSession() {
  return useQuery({
    queryKey: ["session", "user"],
    queryFn: getSettings,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      bio?: string;
      image?: string;
    }) => {
      const result = await updateProfile(data);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["session", "user"] });
      queryClient.invalidateQueries({ queryKey: ["session", "user", data.id] });
      toast.success("Profile updated successfully");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}
