"use server";

import { Visibility } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import {
  cloneWorkoutSchema,
  updateWorkoutSchema,
  workoutSchema,
} from "@/lib/validations/workout.schema";
import { revalidatePath } from "next/cache";
import { requireAuth } from "./auth.actions";

export async function createWorkout(data: unknown) {
  try {
    const user = await requireAuth();
    const validated = workoutSchema.parse(data);

    const workout = await prisma.workout.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        visibility: validated.visibility,
        userId: user.id,
        exercises: {
          create: validated.exercises.map((exercise, index) => ({
            name: exercise.name,
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            duration: exercise.duration || null,
            weight: exercise.weight || null,
            notes: exercise.notes || null,
            order: index,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: { order: "asc" },
        },
      },
    });

    revalidatePath("/workouts");
    revalidatePath("/feed");
    return { success: true, data: workout };
  } catch (error) {
    console.error("Create workout error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create workout" };
  }
}

export async function updateWorkout(data: unknown) {
  try {
    const user = await requireAuth();
    const validated = updateWorkoutSchema.parse(data);

    // Verify ownership
    const existing = await prisma.workout.findUnique({
      where: { id: validated.id },
      select: { userId: true },
    });

    if (!existing) {
      return { error: "Workout not found" };
    }

    if (existing.userId !== user.id) {
      return { error: "Unauthorized to update this workout" };
    }

    // Delete existing exercises and create new ones (simpler than diffing)
    await prisma.exercise.deleteMany({
      where: { workoutId: validated.id },
    });

    const workout = await prisma.workout.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        description: validated.description || null,
        visibility: validated.visibility,
        exercises: {
          create: validated.exercises.map((exercise, index) => ({
            name: exercise.name,
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            duration: exercise.duration || null,
            weight: exercise.weight || null,
            notes: exercise.notes || null,
            order: index,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: { order: "asc" },
        },
      },
    });

    revalidatePath("/workouts");
    revalidatePath(`/workouts/${validated.id}`);
    revalidatePath("/feed");
    return { success: true, data: workout };
  } catch (error) {
    console.error("Update workout error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to update workout" };
  }
}

export async function deleteWorkout(workoutId: string) {
  try {
    const user = await requireAuth();

    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      select: { userId: true },
    });

    if (!workout) {
      return { error: "Workout not found" };
    }

    if (workout.userId !== user.id) {
      return { error: "Unauthorized to delete this workout" };
    }

    await prisma.workout.delete({
      where: { id: workoutId },
    });

    revalidatePath("/workouts");
    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    console.error("Delete workout error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete workout" };
  }
}

export async function getWorkout(workoutId: string) {
  try {
    const user = await requireAuth();

    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        user: true,
        exercises: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            logs: true,
          },
        },
      },
    });

    if (!workout) {
      return { error: "Workout not found" };
    }

    // Check visibility permissions
    if (workout.userId !== user.id) {
      if (workout.visibility === Visibility.PRIVATE) {
        return { error: "Workout not found" };
      }

      if (workout.visibility === Visibility.FOLLOWERS) {
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: workout.userId,
            },
          },
        });

        if (!isFollowing) {
          return { error: "Workout not found" };
        }
      }
    }

    // Check if current user has liked this workout
    const isLiked = await prisma.like.findUnique({
      where: {
        userId_workoutId: {
          userId: user.id,
          workoutId: workout.id,
        },
      },
    });

    return {
      success: true,
      data: { ...workout, isLiked: !!isLiked },
    };
  } catch (error) {
    console.error("Get workout error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch workout" };
  }
}

export async function getUserWorkouts(userId?: string) {
  try {
    const currentUser = await requireAuth();
    const targetUserId = userId || currentUser.id;

    // Build visibility filter
    const visibilityFilter =
      targetUserId === currentUser.id
        ? {} // Own workouts - show all
        : {
            OR: [
              { visibility: Visibility.PUBLIC },
              {
                AND: [
                  { visibility: Visibility.FOLLOWERS },
                  {
                    user: {
                      followers: {
                        some: {
                          followerId: currentUser.id,
                        },
                      },
                    },
                  },
                ],
              },
            ],
          };

    const workouts = await prisma.workout.findMany({
      where: {
        userId: targetUserId,
        ...visibilityFilter,
      },
      include: {
        user: true,
        exercises: {
          orderBy: { order: "asc" },
          take: 10, // Limit exercises for list view
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            logs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Batch check which workouts are liked by current user
    const workoutIds = workouts.map((w) => w.id);
    const likes = await prisma.like.findMany({
      where: {
        userId: currentUser.id,
        workoutId: { in: workoutIds },
      },
      select: { workoutId: true },
    });

    const likedIds = new Set(likes.map((l) => l.workoutId));
    const workoutsWithLikes = workouts.map((workout) => ({
      ...workout,
      isLiked: likedIds.has(workout.id),
    }));

    return { success: true, data: workoutsWithLikes };
  } catch (error) {
    console.error("Get user workouts error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch workouts" };
  }
}

export async function getFeedWorkouts(cursor?: string, limit = 20) {
  try {
    const user = await requireAuth();

    // Get users the current user is following
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    const workouts = await prisma.workout.findMany({
      where: {
        OR: [
          { visibility: Visibility.PUBLIC },
          {
            AND: [
              { visibility: Visibility.FOLLOWERS },
              { userId: { in: followingIds } },
            ],
          },
        ],
      },
      include: {
        user: true,
        exercises: {
          orderBy: { order: "asc" },
          take: 5, // Show fewer exercises in feed
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            logs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    // Batch check likes
    const workoutIds = workouts.map((w) => w.id);
    const likes = await prisma.like.findMany({
      where: {
        userId: user.id,
        workoutId: { in: workoutIds },
      },
      select: { workoutId: true },
    });

    const likedIds = new Set(likes.map((l) => l.workoutId));
    const workoutsWithLikes = workouts.map((workout) => ({
      ...workout,
      isLiked: likedIds.has(workout.id),
    }));

    return {
      success: true,
      data: workoutsWithLikes,
      nextCursor:
        workouts.length === limit ? workouts[workouts.length - 1].id : null,
    };
  } catch (error) {
    console.error("Get feed workouts error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch feed" };
  }
}

export async function cloneWorkout(data: unknown) {
  try {
    const user = await requireAuth();
    const validated = cloneWorkoutSchema.parse(data);

    // Get the original workout
    const original = await prisma.workout.findUnique({
      where: { id: validated.workoutId },
      include: {
        exercises: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!original) {
      return { error: "Workout not found" };
    }

    // Check if user has access to view this workout
    if (original.userId !== user.id) {
      if (original.visibility === Visibility.PRIVATE) {
        return { error: "Cannot clone private workout" };
      }

      if (original.visibility === Visibility.FOLLOWERS) {
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: original.userId,
            },
          },
        });

        if (!isFollowing) {
          return { error: "Cannot clone this workout" };
        }
      }
    }

    // Create the cloned workout
    const cloned = await prisma.workout.create({
      data: {
        name: validated.name || `${original.name} (Copy)`,
        description: original.description,
        visibility: validated.visibility || Visibility.PRIVATE,
        userId: user.id,
        exercises: {
          create: original.exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            duration: exercise.duration,
            weight: exercise.weight,
            notes: exercise.notes,
            order: exercise.order,
          })),
        },
      },
      include: {
        exercises: {
          orderBy: { order: "asc" },
        },
      },
    });

    revalidatePath("/workouts");
    return { success: true, data: cloned };
  } catch (error) {
    console.error("Clone workout error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to clone workout" };
  }
}
