"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createWorkoutWithExercise } from "@/data/workouts";

const setSchema = z.object({
  weight: z.string().min(1, "Weight is required"),
  reps: z.coerce.number().int().positive("Reps must be positive"),
  isWarmup: z.boolean(),
});

const logWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  exerciseDefinitionId: z.coerce.number().int().positive("Exercise is required"),
  sets: z.array(setSchema).min(1, "At least one set is required"),
});

export type LogWorkoutState = {
  success: boolean;
  error?: string;
};

export async function logWorkoutAction(
  _prevState: LogWorkoutState,
  formData: FormData
): Promise<LogWorkoutState> {
  const rawData = {
    date: formData.get("date"),
    exerciseDefinitionId: formData.get("exerciseDefinitionId"),
    sets: JSON.parse(formData.get("sets") as string),
  };

  const result = logWorkoutSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    await createWorkoutWithExercise(
      result.data.date,
      result.data.exerciseDefinitionId,
      result.data.sets
    );

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to log workout:", error);
    return {
      success: false,
      error: "Failed to save workout. Please try again.",
    };
  }
}
