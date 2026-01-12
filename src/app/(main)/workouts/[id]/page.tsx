"use client";

import HeaderActions from "@/components/header-actions";
import { Icons } from "@/components/icons";
import { MutationButton } from "@/components/mutation-button";
import ReactTimeAgo from "@/components/react-time-ago";
import {
  SectionHeader,
  SectionHeaderDescription,
  SectionHeaderHeading,
} from "@/components/section-header";
import { CommentList } from "@/components/social/comment-list";
import { LikeButton } from "@/components/social/like-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteWorkout, useWorkout } from "@/hooks/use-workouts";
import { useSession } from "@/lib/auth/auth-client";
import { cn, durationTime } from "@/lib/utils";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function WorkoutDetailPage({ params }: SearchParamProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { data: workout, isLoading } = useWorkout(id);
  const { mutate: deleteWorkout, isPending } = useDeleteWorkout();

  const handleDelete = () => deleteWorkout(id);

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
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

  const isOwner = session.user.id === workout.userId;

  return (
    <>
      <HeaderActions title={workout.name}>
        {isOwner && (
          <>
            <Link
              href={`/workouts/${workout.id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "-mx-2 [&_svg:not([class*='size-'])]:size-5.5 hover:bg-transparent border-0 shadow-none"
              )}
            >
              <Icons.edit />
            </Link>
            <MutationButton
              size="icon-sm"
              variant="destructive"
              mutation={handleDelete}
              mutationArgs={id}
              isLoading={isPending}
              actionButtonClassname="bg-destructive/30 text-destructive not-disabled:hover:bg-destructive/35"
              className="bg-transparent text-destructive not-disabled:hover:bg-transparent -mx-2 [&_svg:not([class*='size-'])]:size-4.5"
              actionButtonText="Delete Workout"
              areYouSureDescription={
                <>
                  <span>Are you sure you want to delete this workout?</span>
                  <span className="text-destructive font-semibold">
                    This action cannot be undone.
                  </span>
                </>
              }
              requireAreYouSure
            >
              <Icons.trash />
            </MutationButton>
          </>
        )}
      </HeaderActions>
      <div className="space-y-6">
        <SectionHeader className="flex-col">
          <div className="flex flex-col w-full gap-1">
            <SectionHeaderHeading className="text-3xl">
              {workout.name}
            </SectionHeaderHeading>
            {workout.description && (
              <SectionHeaderDescription>
                {workout.description}
              </SectionHeaderDescription>
            )}
          </div>
          <div className="flex w-full items-center gap-2 text-muted-foreground">
            <Link
              href={`/profile/${workout.user.username}`}
              className="font-bold uppercase text-[0.6875rem]"
            >
              {workout.user.name}
            </Link>
            <Icons.dot className="size-4 -mx-2" />
            <span className="font-medium text-xs">
              Created <ReactTimeAgo date={workout.createdAt} />
            </span>
          </div>
        </SectionHeader>
        {isOwner && (
          <div className="grid auto-fit-5xl gap-3 bg-background">
            <Link
              href={`/workouts/${workout.id}/log`}
              className={cn(
                buttonVariants({ variant: "gradient" }),
                "w-full font-serif"
              )}
            >
              <Icons.refresh />
              Log this Workout
            </Link>
            {workout._count.logs > 0 && (
              <Link
                href={`/workouts/${workout.id}/progression`}
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "w-full font-serif"
                )}
              >
                <Icons.trendingUp className="h-5 w-5" />
                View Progress
              </Link>
            )}
          </div>
        )}
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Exercises</h2>
              {workout.exercises.map((exercise, index) => (
                <div key={exercise.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{exercise.name}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        {exercise.sets && (
                          <span>
                            <strong>Sets:</strong> {exercise.sets}
                          </span>
                        )}
                        {exercise.reps && (
                          <span>
                            <strong>Reps:</strong> {exercise.reps}
                          </span>
                        )}
                        {exercise.weight && (
                          <span>
                            <strong>Weight:</strong> {exercise.weight}kg
                          </span>
                        )}
                        {exercise.duration && (
                          <span>
                            <strong>Duration:</strong>{" "}
                            {durationTime(exercise.duration)}
                          </span>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className="mt-2 text-sm text-gray-600">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center gap-6">
              <LikeButton
                workoutId={workout.id}
                initialLiked={workout.isLiked || false}
                likeCount={workout._count.likes}
              />
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{workout._count.logs} completions</span>
              </div>
            </div>

            <Separator />

            <CommentList workoutId={workout.id} user={session.user} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
