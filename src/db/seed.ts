import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log('Seeding database...');

  // Insert exercise definitions
  await sql`
    INSERT INTO exercise_definitions (id, name) VALUES
    (1, 'Bench Press'),
    (2, 'Squat'),
    (3, 'Deadlift'),
    (4, 'Overhead Press'),
    (5, 'Barbell Row'),
    (6, 'Pull-ups'),
    (7, 'Leg Press'),
    (8, 'Dumbbell Curl')
  `;
  console.log('✓ Inserted exercise_definitions');

  // Insert workouts
  await sql`
    INSERT INTO workouts (id, user_id, name, workout_date, started_at, ended_at) VALUES
    (1, 'user_38tDVlodM04gqF4SY4tmgU9PVuH', 'Push Day', '2026-01-27', '2026-01-27 08:00:00', '2026-01-27 09:15:00'),
    (2, 'user_38tDVlodM04gqF4SY4tmgU9PVuH', 'Pull Day', '2026-01-28', '2026-01-28 07:30:00', '2026-01-28 08:45:00'),
    (3, 'user_38tDVlodM04gqF4SY4tmgU9PVuH', 'Leg Day', '2026-01-30', '2026-01-30 06:00:00', '2026-01-30 07:20:00')
  `;
  console.log('✓ Inserted workouts');

  // Insert workout_exercises
  await sql`
    INSERT INTO workout_exercises (id, workout_id, exercise_definition_id, "order") VALUES
    (1, 1, 1, 1),
    (2, 1, 4, 2),
    (3, 2, 5, 1),
    (4, 2, 6, 2),
    (5, 2, 8, 3),
    (6, 3, 2, 1),
    (7, 3, 3, 2),
    (8, 3, 7, 3)
  `;
  console.log('✓ Inserted workout_exercises');

  // Insert sets
  await sql`
    INSERT INTO sets (id, workout_exercise_id, set_number, weight, reps, is_warmup) VALUES
    (1, 1, 1, 60, 10, true),
    (2, 1, 2, 80, 8, false),
    (3, 1, 3, 85, 6, false),
    (4, 1, 4, 85, 5, false),
    (5, 2, 1, 40, 8, true),
    (6, 2, 2, 50, 8, false),
    (7, 2, 3, 55, 6, false),
    (8, 3, 1, 50, 10, true),
    (9, 3, 2, 70, 8, false),
    (10, 3, 3, 75, 7, false),
    (11, 4, 1, NULL, 8, false),
    (12, 4, 2, NULL, 7, false),
    (13, 4, 3, NULL, 6, false),
    (14, 5, 1, 12, 12, false),
    (15, 5, 2, 14, 10, false),
    (16, 6, 1, 60, 10, true),
    (17, 6, 2, 100, 8, false),
    (18, 6, 3, 110, 6, false),
    (19, 6, 4, 115, 5, false),
    (20, 7, 1, 80, 8, true),
    (21, 7, 2, 120, 5, false),
    (22, 7, 3, 130, 4, false),
    (23, 8, 1, 100, 12, false),
    (24, 8, 2, 140, 10, false),
    (25, 8, 3, 160, 8, false)
  `;
  console.log('✓ Inserted sets');

  // Update sequences
  await sql`SELECT setval('exercise_definitions_id_seq', 8)`;
  await sql`SELECT setval('workouts_id_seq', 3)`;
  await sql`SELECT setval('workout_exercises_id_seq', 8)`;
  await sql`SELECT setval('sets_id_seq', 25)`;
  console.log('✓ Updated sequences');

  console.log('Done!');
}

seed().catch(console.error);
