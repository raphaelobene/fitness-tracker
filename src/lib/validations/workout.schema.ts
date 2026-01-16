import { z } from "zod";
import { VISIBILITY } from "../constants";

// Exercise schema with proper validation
// export const exerciseSchema = z.object({
//   id: z.string().optional(),
//   name: z.string().min(1, "Exercise name is required").max(100),
//   sets: z.coerce.number().min(0).max(100).optional().nullable(),
//   reps: z.coerce.number().min(0).max(1000).optional().nullable(),
//   duration: z.coerce.number().min(0).optional().nullable(),
//   weight: z.coerce.number().min(0).optional().nullable(),
//   notes: z.string().max(500).optional().nullable(),
//   order: z.number().default(0),
// });

const exerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  order: z.coerce.number<number>().int(),
  sets: z.coerce.number<number>().nullable().optional(),
  reps: z.coerce.number<number>().nullable().optional(),
  duration: z.coerce.number<number>().nullable().optional(),
  weight: z.coerce.number<number>().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const workoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  description: z.string().max(500).nullable().optional(),
  visibility: z.enum(VISIBILITY),
  exercises: z
    .array(exerciseSchema)
    .min(1, "At least one exercise is required"),
});

// Update schema includes the workout ID
export const updateWorkoutSchema = workoutSchema.extend({
  id: z.string().min(1, "Workout ID is required"),
});

// Schema for quick workout actions (clone, duplicate)
export const cloneWorkoutSchema = z.object({
  workoutId: z.string().min(1, "Workout ID is required"),
  name: z.string().min(1, "Workout name is required").max(100).optional(),
  visibility: z.enum(VISIBILITY).optional(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type WorkoutInput = z.infer<typeof workoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type CloneWorkoutInput = z.infer<typeof cloneWorkoutSchema>;
