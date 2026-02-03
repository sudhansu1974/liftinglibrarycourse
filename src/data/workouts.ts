import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";

export type SetInput = {
  weight: string;
  reps: number;
  isWarmup: boolean;
};

export async function createWorkoutWithExercise(
  date: string,
  exerciseDefinitionId: number,
  setsData: SetInput[]
) {
  const userId = await getCurrentUserId();

  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      workoutDate: date,
    })
    .returning();

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({
      workoutId: workout.id,
      exerciseDefinitionId,
      order: 0,
    })
    .returning();

  if (setsData.length > 0) {
    await db.insert(sets).values(
      setsData.map((set, index) => ({
        workoutExerciseId: workoutExercise.id,
        setNumber: index + 1,
        weight: set.weight,
        reps: set.reps,
        isWarmup: set.isWarmup,
      }))
    );
  }

  return workout;
}

export async function getUserWorkoutsByDate(date: string) {
  const userId = await getCurrentUserId();

  const result = await db.query.workouts.findMany({
    where: and(eq(workouts.userId, userId), eq(workouts.workoutDate, date)),
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
        with: {
          exerciseDefinition: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
  });

  return result;
}

export async function getUserWorkoutById(workoutId: number) {
  const userId = await getCurrentUserId();

  const result = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
        with: {
          exerciseDefinition: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
  });

  return result;
}

export async function updateWorkoutExerciseSets(
  workoutId: number,
  workoutExerciseId: number,
  exerciseDefinitionId: number,
  setsData: SetInput[]
) {
  const userId = await getCurrentUserId();

  // Verify ownership
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  });

  if (!workout) {
    throw new Error("Workout not found");
  }

  // Update exercise definition if changed
  await db
    .update(workoutExercises)
    .set({ exerciseDefinitionId })
    .where(eq(workoutExercises.id, workoutExerciseId));

  // Delete existing sets
  await db.delete(sets).where(eq(sets.workoutExerciseId, workoutExerciseId));

  // Insert new sets
  if (setsData.length > 0) {
    await db.insert(sets).values(
      setsData.map((set, index) => ({
        workoutExerciseId,
        setNumber: index + 1,
        weight: set.weight,
        reps: set.reps,
        isWarmup: set.isWarmup,
      }))
    );
  }

  return workout;
}
