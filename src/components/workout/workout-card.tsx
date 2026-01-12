"use client";

import { LikeButton } from "@/components/social/like-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth/auth-client";
import { WorkoutWithDetails } from "@/lib/types";
import { Calendar, MessageCircle } from "lucide-react";
import Link from "next/link";
import AvatarWrapper from "../avatar-wrapper";
import { Icons } from "../icons";
import ReactTimeAgo from "../react-time-ago";
import { Button } from "../ui/button";

interface WorkoutCardProps {
  workout: WorkoutWithDetails;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const { data: session } = useSession();
  const isOwner = session?.user.id === workout.userId;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <Link
            href={`/profile/${workout.user.username}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <AvatarWrapper user={workout.user} />
            <div>
              <p className="font-medium">
                {workout.user.name || workout.user.username}
              </p>
              <p className="text-sm text-gray-500">@{workout.user.username}</p>
            </div>
          </Link>
          <Badge variant="secondary">{workout.visibility.toLowerCase()}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Link
          href={`/workouts/${workout.id}`}
          className="block space-y-3 hover:opacity-90 transition-opacity"
        >
          <div>
            <h3 className="text-xl font-semibold">{workout.name}</h3>
            {workout.description && (
              <p className="text-gray-600 mt-1 line-clamp-2">
                {workout.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {workout.exercises.slice(0, 3).map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <span className="font-medium">{exercise.name}</span>
                {exercise.sets && exercise.reps && (
                  <span className="text-gray-400">
                    {exercise.sets} × {exercise.reps}
                  </span>
                )}
                {exercise.weight && (
                  <span className="text-gray-400">{exercise.weight}kg</span>
                )}
              </div>
            ))}
            {workout.exercises.length > 3 && (
              <p className="text-sm text-gray-400">
                +{workout.exercises.length - 3} more exercises
              </p>
            )}
          </div>
        </Link>

        {isOwner && (
          <Link href={`/workouts/${workout.id}/log`} className="block mt-4">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Icons.refresh />
              Log Workout
            </Button>
          </Link>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <LikeButton
            workoutId={workout.id}
            initialLiked={workout.isLiked || false}
            likeCount={workout._count.likes}
          />

          <Link
            href={`/workouts/${workout.id}#comments`}
            className="flex items-center gap-1 hover:text-gray-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{workout._count.comments}</span>
          </Link>

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{workout._count.logs}</span>
          </div>
        </div>

        <ReactTimeAgo
          date={workout.createdAt}
          className="text-xs text-muted-foreground"
        />
      </CardFooter>
    </Card>
  );
}
