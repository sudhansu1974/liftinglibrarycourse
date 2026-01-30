import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// Exercise Definitions (Lookup Table)
// ============================================
export const exerciseDefinitions = pgTable(
  "exercise_definitions",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

// ============================================
// Workouts (Parent Table)
// ============================================
export const workouts = pgTable(
  "workouts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name"),
    workoutDate: date("workout_date").notNull().defaultNow(),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("workouts_user_id_idx").on(table.userId),
    index("workouts_user_id_workout_date_idx").on(table.userId, table.workoutDate),
    index("workouts_workout_date_idx").on(table.workoutDate),
  ]
);

// ============================================
// Workout Exercises (Junction Table)
// ============================================
export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: serial("id").primaryKey(),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseDefinitionId: integer("exercise_definition_id")
      .notNull()
      .references(() => exerciseDefinitions.id, { onDelete: "restrict" }),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("workout_exercises_workout_id_idx").on(table.workoutId),
    index("workout_exercises_workout_id_order_idx").on(table.workoutId, table.order),
    index("workout_exercises_exercise_definition_id_idx").on(table.exerciseDefinitionId),
  ]
);

// ============================================
// Sets (Child Table)
// ============================================
export const sets = pgTable(
  "sets",
  {
    id: serial("id").primaryKey(),
    workoutExerciseId: integer("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    weight: numeric("weight", { precision: 7, scale: 2 }),
    reps: integer("reps"),
    isWarmup: boolean("is_warmup").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("sets_workout_exercise_id_idx").on(table.workoutExerciseId),
    index("sets_workout_exercise_id_set_number_idx").on(table.workoutExerciseId, table.setNumber),
  ]
);

// ============================================
// Relations (for Drizzle Query API)
// ============================================
export const exerciseDefinitionsRelations = relations(
  exerciseDefinitions,
  ({ many }) => ({
    workoutExercises: many(workoutExercises),
  })
);

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one, many }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exerciseDefinition: one(exerciseDefinitions, {
      fields: [workoutExercises.exerciseDefinitionId],
      references: [exerciseDefinitions.id],
    }),
    sets: many(sets),
  })
);

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// ============================================
// Type Exports
// ============================================
export type ExerciseDefinition = typeof exerciseDefinitions.$inferSelect;
export type NewExerciseDefinition = typeof exerciseDefinitions.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;
