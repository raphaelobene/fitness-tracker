"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { SignUpInput, signUpSchema } from "@/lib/validations/auth.schema";
import { headers } from "next/headers";
import { createSlug } from "../utils";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function signUpAction(data: SignUpInput) {
  try {
    const validated = signUpSchema.parse(data);

    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingEmail) {
      return { error: "Email already registered" };
    }

    // Create user via better-auth
    const result = await auth.api.signUpEmail({
      body: {
        email: validated.email,
        password: validated.password,
        name: validated.name,
      },
      headers: await headers(),
    });

    await prisma.user.update({
      where: { email: validated.email },
      data: { username: createSlug(validated.name) },
    });

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to sign up" };
  }
}
