"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateWorkoutExerciseSets } from "@/data/workouts";

const setSchema = z.object({
  weight: z.string().min(1, "Weight is required"),
  reps: z.coerce.number().int().positive("Reps must be positive"),
  isWarmup: z.boolean(),
});

const updateWorkoutSchema = z.object({
  workoutId: z.coerce.number().int().positive("Workout ID is required"),
  workoutExerciseId: z.coerce
    .number()
    .int()
    .positive("Workout exercise ID is required"),
  exerciseDefinitionId: z.coerce
    .number()
    .int()
    .positive("Exercise is required"),
  sets: z.array(setSchema).min(1, "At least one set is required"),
});

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function updateWorkoutAction(data: {
  workoutId: number;
  workoutExerciseId: number;
  exerciseDefinitionId: number;
  sets: { weight: string; reps: number; isWarmup: boolean }[];
}): Promise<ActionResult> {
  const result = updateWorkoutSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    await updateWorkoutExerciseSets(
      result.data.workoutId,
      result.data.workoutExerciseId,
      result.data.exerciseDefinitionId,
      result.data.sets
    );

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to update workout:", error);
    return {
      success: false,
      error: "Failed to update workout. Please try again.",
    };
  }
}
