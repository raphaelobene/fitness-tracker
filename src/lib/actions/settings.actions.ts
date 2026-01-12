"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSlug } from "../utils";
import { requireAuth } from "./auth.actions";

export async function updateProfile(data: {
  name?: string;
  bio?: string;
  image?: string;
}) {
  try {
    const user = await requireAuth();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        bio: data.bio,
        username: createSlug(data.name ?? user.username ?? ""),
        image: data.image,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        bio: true,
        image: true,
      },
    });

    revalidatePath("/profile/[username]", "page");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Update profile error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to update profile" };
  }
}

export async function getSettings() {
  try {
    const user = await requireAuth();

    // For now, we'll just return user data
    // In the future, you can create a Settings model
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          bio: null,
          image: null,
        },
        preferences: {
          units: "metric" as const, // or 'imperial'
          defaultVisibility: "PRIVATE" as const,
          weekStart: "monday" as const,
        },
      },
    };
  } catch (error) {
    console.error("Get settings error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to fetch settings" };
  }
}
