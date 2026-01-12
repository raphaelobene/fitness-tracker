"use server";

import prisma from "@/lib/prisma";
import { workoutLogSchema } from "@/lib/validations/log.schema";
import { revalidatePath } from "next/cache";
import { requireAuth } from "./auth.actions";

export async function createWorkoutLog(data: unknown) {
  try {
    const user = await requireAuth();
    const validated = workoutLogSchema.parse(data);

    // Verify workout exists and user has access to it
    const workout = await prisma.workout.findUnique({
      where: { id: validated.workoutId },
      include: {
        exercises: {
          select: { id: true },
        },
      },
    });

    if (!workout) {
      return { error: "Workout not found" };
    }

    // Verify all exercise IDs belong to this workout
    const workoutExerciseIds = new Set(workout.exercises.map((e) => e.id));
    const invalidExercises = validated.entries.filter(
      (entry) => !workoutExerciseIds.has(entry.exerciseId)
    );

    if (invalidExercises.length > 0) {
      return { error: "Invalid exercise IDs in log entries" };
    }

    // Create the log with all entries
    const log = await prisma.workoutLog.create({
      data: {
        userId: user.id,
        workoutId: validated.workoutId,
        date: validated.date,
        duration: validated.duration || null,
        notes: validated.notes || null,
        entries: {
          create: validated.entries.map((entry) => ({
            exerciseId: entry.exerciseId,
            sets: entry.sets || null,
            reps: entry.reps || null,
            weight: entry.weight || null,
            duration: entry.duration || null,
            completed: entry.completed,
            notes: entry.notes || null,
          })),
        },
      },
      include: {
        workout: {
          include: {
            exercises: {
              orderBy: { order: "asc" },
            },
          },
        },
        entries: {
          include: {
            exercise: true,
          },
        },
      },
    });

    revalidatePath("/profile");
    revalidatePath(`/workouts/${validated.workoutId}`);
    return { success: true, data: log };
  } catch (error) {
    console.error("Create workout log error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create workout log" };
  }
}

export async function getUserLogs(
  userId?: string,
  cursor?: string,
  limit = 20
) {
  try {
    const currentUser = await requireAuth();
    const targetUserId = userId || currentUser.id;

    const logs = await prisma.workoutLog.findMany({
      where: { userId: targetUserId },
      include: {
        workout: {
          include: {
            exercises: {
              orderBy: { order: "asc" },
            },
          },
        },
        entries: {
          include: {
            exercise: true,
          },
          orderBy: {
            exercise: {
              order: "asc",
            },
          },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    return {
      success: true,
      data: logs,
      nextCursor: logs.length === limit ? logs[logs.length - 1].id : null,
    };
  } catch (error) {
    console.error("Get user logs error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch logs" };
  }
}

export async function getWorkoutLogs(
  workoutId: string,
  cursor?: string,
  limit = 10
) {
  try {
    const user = await requireAuth();

    // Verify user has access to this workout
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      select: {
        userId: true,
        visibility: true,
      },
    });

    if (!workout) {
      return { error: "Workout not found" };
    }

    // Only owner can see logs for their workout
    if (workout.userId !== user.id) {
      return { error: "Unauthorized to view these logs" };
    }

    const logs = await prisma.workoutLog.findMany({
      where: {
        workoutId,
        userId: user.id,
      },
      include: {
        entries: {
          include: {
            exercise: true,
          },
          orderBy: {
            exercise: {
              order: "asc",
            },
          },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    return {
      success: true,
      data: logs,
      nextCursor: logs.length === limit ? logs[logs.length - 1].id : null,
    };
  } catch (error) {
    console.error("Get workout logs error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch workout logs" };
  }
}

export async function getLogDetail(logId: string) {
  try {
    const user = await requireAuth();

    const log = await prisma.workoutLog.findUnique({
      where: { id: logId },
      include: {
        workout: {
          include: {
            exercises: {
              orderBy: { order: "asc" },
            },
          },
        },
        entries: {
          include: {
            exercise: true,
          },
          orderBy: {
            exercise: {
              order: "asc",
            },
          },
        },
      },
    });

    if (!log) {
      return { error: "Log not found" };
    }

    if (log.userId !== user.id) {
      return { error: "Unauthorized to view this log" };
    }

    return { success: true, data: log };
  } catch (error) {
    console.error("Get log detail error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch log" };
  }
}

export async function deleteWorkoutLog(logId: string) {
  try {
    const user = await requireAuth();

    const log = await prisma.workoutLog.findUnique({
      where: { id: logId },
      select: {
        userId: true,
        workoutId: true,
      },
    });

    if (!log) {
      return { error: "Log not found" };
    }

    if (log.userId !== user.id) {
      return { error: "Unauthorized to delete this log" };
    }

    await prisma.workoutLog.delete({
      where: { id: logId },
    });

    revalidatePath("/profile");
    revalidatePath(`/workouts/${log.workoutId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete workout log error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete log" };
  }
}

export async function getLogStats(userId?: string) {
  try {
    const currentUser = await requireAuth();
    const targetUserId = userId || currentUser.id;

    // Get total workout count
    const totalLogs = await prisma.workoutLog.count({
      where: { userId: targetUserId },
    });

    // Get total duration
    const durationSum = await prisma.workoutLog.aggregate({
      where: {
        userId: targetUserId,
        duration: { not: null },
      },
      _sum: {
        duration: true,
      },
    });

    // Get workouts in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = await prisma.workoutLog.count({
      where: {
        userId: targetUserId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get most logged workout
    const workoutCounts = await prisma.workoutLog.groupBy({
      by: ["workoutId"],
      where: { userId: targetUserId },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 1,
    });

    let favoriteWorkout = null;
    if (workoutCounts.length > 0) {
      favoriteWorkout = await prisma.workout.findUnique({
        where: { id: workoutCounts[0].workoutId },
        select: {
          id: true,
          name: true,
        },
      });
    }

    return {
      success: true,
      data: {
        totalLogs,
        totalDuration: durationSum._sum.duration || 0,
        recentLogs,
        favoriteWorkout,
      },
    };
  } catch (error) {
    console.error("Get log stats error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch log statistics" };
  }
}
