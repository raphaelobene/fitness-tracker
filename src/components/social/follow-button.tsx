"use client";

import { Button } from "@/components/ui/button";
import { useToggleFollow } from "@/hooks/use-social";
import { useState } from "react";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
}

export function FollowButton({ userId, initialFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const toggleFollow = useToggleFollow();

  const handleFollow = async () => {
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);

    try {
      await toggleFollow.mutateAsync(userId);
    } catch (error) {
      console.log(error);
      setIsFollowing(isFollowing);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={toggleFollow.isPending}
      variant={isFollowing ? "outline" : "default"}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
