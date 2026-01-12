import { z } from "zod";

export const logEntrySchema = z.object({
  exerciseId: z.string(),
  sets: z.number().min(0).max(100).optional().nullable(),
  reps: z.number().min(0).max(1000).optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  duration: z.number().min(0).optional().nullable(),
  completed: z.boolean().default(false),
  notes: z.string().max(500).optional().nullable(),
});

export const workoutLogSchema = z.object({
  workoutId: z.string(),
  date: z.date(),
  duration: z.number().min(0).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  entries: z
    .array(logEntrySchema)
    .min(1, "At least one exercise entry is required"),
});

export type LogEntryInput = z.infer<typeof logEntrySchema>;
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
