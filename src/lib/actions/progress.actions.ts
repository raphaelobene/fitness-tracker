"use server";

import prisma from "@/lib/prisma";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { requireAuth } from "./auth.actions";

export async function getProgressOverview() {
  try {
    const user = await requireAuth();
    const now = new Date();

    // Get total stats
    const totalWorkouts = await prisma.workout.count({
      where: { userId: user.id },
    });

    const totalLogs = await prisma.workoutLog.count({
      where: { userId: user.id },
    });

    // Get this week's logs
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const thisWeekLogs = await prisma.workoutLog.count({
      where: {
        userId: user.id,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    // Get last week's logs for comparison
    const lastWeekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });

    const lastWeekLogs = await prisma.workoutLog.count({
      where: {
        userId: user.id,
        date: {
          gte: lastWeekStart,
          lte: lastWeekEnd,
        },
      },
    });

    // Get this month's logs
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonthLogs = await prisma.workoutLog.count({
      where: {
        userId: user.id,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Get total duration
    const durationSum = await prisma.workoutLog.aggregate({
      where: {
        userId: user.id,
        duration: { not: null },
      },
      _sum: {
        duration: true,
      },
    });

    // Get all logs for streak calculation
    const allLogs = await prisma.workoutLog.findMany({
      where: { userId: user.id },
      select: { date: true },
      orderBy: { date: "desc" },
    });

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    if (allLogs.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const logDates = allLogs.map((log) => {
        const d = new Date(log.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

      const uniqueDates = [...new Set(logDates)].sort((a, b) => b - a);

      // Calculate current streak
      let checkDate = today.getTime();
      for (const logDate of uniqueDates) {
        if (logDate === checkDate || logDate === checkDate - 86400000) {
          currentStreak++;
          checkDate = logDate - 86400000;
        } else {
          break;
        }
      }

      // Calculate best streak
      const sortedAsc = [...uniqueDates].sort((a, b) => a - b);
      tempStreak = 1;
      bestStreak = 1;

      for (let i = 1; i < sortedAsc.length; i++) {
        if (sortedAsc[i] - sortedAsc[i - 1] === 86400000) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    return {
      success: true,
      data: {
        totalWorkouts,
        totalLogs,
        thisWeekLogs,
        lastWeekLogs,
        thisMonthLogs,
        totalDuration: durationSum._sum.duration || 0,
        currentStreak,
        bestStreak,
      },
    };
  } catch (error) {
    console.error("Get progress overview error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch progress overview" };
  }
}

export async function getWorkoutProgress() {
  try {
    const user = await requireAuth();

    const workouts = await prisma.workout.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            logs: true,
          },
        },
        exercises: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        logs: {
          _count: "desc",
        },
      },
    });

    const workoutsWithProgress = await Promise.all(
      workouts.map(async (workout) => {
        // Get last 5 logs for this workout
        const recentLogs = await prisma.workoutLog.findMany({
          where: {
            userId: user.id,
            workoutId: workout.id,
          },
          include: {
            entries: {
              select: {
                exerciseId: true,
                completed: true,
              },
            },
          },
          orderBy: { date: "desc" },
          take: 5,
        });

        // Calculate completion rate
        let totalExercises = 0;
        let completedExercises = 0;

        recentLogs.forEach((log) => {
          totalExercises += workout.exercises.length;
          completedExercises += log.entries.filter((e) => e.completed).length;
        });

        const completionRate =
          totalExercises > 0
            ? Math.round((completedExercises / totalExercises) * 100)
            : 0;

        // Get last completed date
        const lastLog = recentLogs[0];
        const lastCompleted = lastLog ? lastLog.date : null;

        return {
          id: workout.id,
          name: workout.name,
          totalLogs: workout._count.logs,
          exerciseCount: workout.exercises.length,
          completionRate,
          lastCompleted,
        };
      })
    );

    return {
      success: true,
      data: workoutsWithProgress,
    };
  } catch (error) {
    console.error("Get workout progress error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch workout progress" };
  }
}

export async function getExerciseProgress(workoutId: string) {
  try {
    const user = await requireAuth();

    // Verify workout ownership
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      select: { userId: true },
    });

    if (!workout || workout.userId !== user.id) {
      return { error: "Workout not found or unauthorized" };
    }

    // Get all exercises for this workout
    const exercises = await prisma.exercise.findMany({
      where: { workoutId },
      orderBy: { order: "asc" },
    });

    // Get all log entries for these exercises
    const exerciseProgress = await Promise.all(
      exercises.map(async (exercise) => {
        const entries = await prisma.logEntry.findMany({
          where: {
            exerciseId: exercise.id,
            log: {
              userId: user.id,
            },
          },
          include: {
            log: {
              select: {
                date: true,
              },
            },
          },
          orderBy: {
            log: {
              date: "desc",
            },
          },
          take: 10,
        });

        // Calculate stats
        const completedCount = entries.filter((e) => e.completed).length;
        const totalCount = entries.length;
        const completionRate =
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Get weight progression
        const weightEntries = entries
          .filter((e) => e.weight !== null && e.completed)
          .map((e) => ({ weight: e.weight!, date: e.log.date }))
          .slice(0, 5)
          .reverse();

        const maxWeight =
          weightEntries.length > 0
            ? Math.max(...weightEntries.map((e) => e.weight))
            : null;

        return {
          id: exercise.id,
          name: exercise.name,
          totalLogs: totalCount,
          completionRate,
          maxWeight,
          recentWeights: weightEntries,
          lastCompleted: entries.find((e) => e.completed)?.log.date || null,
        };
      })
    );

    return {
      success: true,
      data: exerciseProgress,
    };
  } catch (error) {
    console.error("Get exercise progress error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch exercise progress" };
  }
}

export async function getWeeklyActivity() {
  try {
    const user = await requireAuth();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Get 3 days before, current day, and 3 days after
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const date = addDays(now, i);
      days.push(date);
    }

    const activity = await Promise.all(
      days.map(async (day) => {
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const count = await prisma.workoutLog.count({
          where: {
            userId: user.id,
            date: {
              gte: day,
              lt: nextDay,
            },
          },
        });

        const isToday = day.getTime() === now.getTime();

        return {
          date: day.toISOString(),
          count,
          isToday,
        };
      })
    );

    return {
      success: true,
      data: activity,
    };
  } catch (error) {
    console.error("Get weekly activity error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch weekly activity" };
  }
}

// export async function getMonthlyProgress() {
//   try {
//     const user = await requireAuth();
//     const now = new Date();

//     const months = [];

//     // Start from current month, then descend
//     for (let i = 0; i < 6; i++) {
//       const date = subMonths(now, i);
//       const monthStart = startOfMonth(date);
//       const monthEnd = endOfMonth(date);

//       const totalWorkouts = await prisma.workoutLog.count({
//         where: {
//           userId: user.id,
//           date: {
//             gte: monthStart,
//             lte: monthEnd,
//           },
//         },
//       });

//       const daysInMonth = monthEnd.getDate();
//       const weeks = Math.ceil(daysInMonth / 7);
//       const averagePerWeek = totalWorkouts > 0 ? totalWorkouts / weeks : 0;

//       months.push({
//         month: date.getMonth() + 1,
//         year: date.getFullYear(),
//         totalWorkouts,
//         averagePerWeek,
//       });
//     }

//     return {
//       success: true,
//       data: months,
//     };
//   } catch (error) {
//     console.error("Get monthly progress error:", error);
//     if (error instanceof Error) {
//       return { error: error.message };
//     }
//     return { error: "Failed to fetch monthly progress" };
//   }
// }

export async function getMonthlyProgress() {
  try {
    const user = await requireAuth();
    const now = new Date();

    const months = [];

    const offsets = [1, 0, -1, -2, -3, -4];

    for (const offset of offsets) {
      const date =
        offset >= 0 ? addMonths(now, offset) : subMonths(now, Math.abs(offset));

      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const totalWorkouts = await prisma.workoutLog.count({
        where: {
          userId: user.id,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const daysInMonth = monthEnd.getDate();
      const weeks = Math.ceil(daysInMonth / 7);
      const averagePerWeek = totalWorkouts > 0 ? totalWorkouts / weeks : 0;

      months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        totalWorkouts,
        averagePerWeek,
      });
    }

    return {
      success: true,
      data: months,
    };
  } catch (error) {
    console.error("Get monthly progress error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch monthly progress" };
  }
}
