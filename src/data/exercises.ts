import { db } from "@/db";
import { exerciseDefinitions } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function getAllExerciseDefinitions() {
  return db
    .select()
    .from(exerciseDefinitions)
    .orderBy(asc(exerciseDefinitions.name));
}
