"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "./auth.actions";

export async function toggleLike(workoutId: string) {
  try {
    const user = await requireAuth();

    const existing = await prisma.like.findUnique({
      where: {
        userId_workoutId: {
          userId: user.id,
          workoutId,
        },
      },
    });

    if (existing) {
      await prisma.like.delete({
        where: { id: existing.id },
      });
      revalidatePath(`/workouts/${workoutId}`);
      revalidatePath("/feed");
      return { success: true, liked: false };
    } else {
      await prisma.like.create({
        data: {
          userId: user.id,
          workoutId,
        },
      });
      revalidatePath(`/workouts/${workoutId}`);
      revalidatePath("/feed");
      return { success: true, liked: true };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to toggle like" };
  }
}

export async function addComment(workoutId: string, content: string) {
  try {
    const user = await requireAuth();

    if (!content || content.trim().length === 0) {
      return { error: "Comment cannot be empty" };
    }

    if (content.length > 1000) {
      return { error: "Comment is too long" };
    }

    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        workoutId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    revalidatePath(`/workouts/${workoutId}`);
    return { success: true, data: comment };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to add comment" };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const user = await requireAuth();

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.userId !== user.id) {
      return { error: "Comment not found or unauthorized" };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/workouts/${comment.workoutId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete comment" };
  }
}

export async function getComments(workoutId: string) {
  try {
    await requireAuth();

    const comments = await prisma.comment.findMany({
      where: { workoutId },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: comments };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch comments" };
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const user = await requireAuth();

    if (user.id === targetUserId) {
      return { error: "Cannot follow yourself" };
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUserId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({
        where: { id: existing.id },
      });
      revalidatePath(`/profile/${targetUserId}`);
      return { success: true, following: false };
    } else {
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: targetUserId,
        },
      });
      revalidatePath(`/profile/${targetUserId}`);
      return { success: true, following: true };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to toggle follow" };
  }
}

export async function getUserProfile(username: string) {
  try {
    const currentUser = await requireAuth();

    const user = await prisma.user.findFirst({
      where: { username },
      include: {
        _count: {
          select: {
            workouts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: user.id,
        },
      },
    });

    return {
      success: true,
      data: { ...user, isFollowing: !!isFollowing },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch user profile" };
  }
}
