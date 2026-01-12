"use client";

import { useToggleLike } from "@/hooks/use-social";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useState } from "react";

interface LikeButtonProps {
  workoutId: string;
  initialLiked: boolean;
  likeCount: number;
}

export function LikeButton({
  workoutId,
  initialLiked,
  likeCount,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(likeCount);
  const toggleLike = useToggleLike();

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setCount(newLiked ? count + 1 : count - 1);

    try {
      await toggleLike.mutateAsync(workoutId);
    } catch (error) {
      // Revert on error
      console.log(error);
      setIsLiked(isLiked);
      setCount(count);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={toggleLike.isPending}
      className="flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      <Heart
        className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")}
      />
      <span>{count}</span>
    </button>
  );
}
