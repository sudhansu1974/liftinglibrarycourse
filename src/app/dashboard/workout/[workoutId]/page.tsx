import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllExerciseDefinitions } from "@/data/exercises";
import { getUserWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./edit-workout-form";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({
  params,
}: EditWorkoutPageProps) {
  const { workoutId } = await params;
  const workoutIdNum = parseInt(workoutId);

  if (isNaN(workoutIdNum)) {
    notFound();
  }

  const workout = await getUserWorkoutById(workoutIdNum);

  if (!workout) {
    notFound();
  }

  const exercises = await getAllExerciseDefinitions();
  const workoutExercise = workout.workoutExercises[0];
  const displayDate = format(
    new Date(workout.workoutDate + "T00:00:00"),
    "do MMM yyyy"
  );

  return (
    <main className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/dashboard?date=${workout.workoutDate}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
          <CardDescription>Editing workout for {displayDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm
            workoutId={workout.id}
            workoutExerciseId={workoutExercise.id}
            currentDate={workout.workoutDate}
            exercises={exercises}
            initialExerciseId={workoutExercise.exerciseDefinitionId}
            initialSets={workoutExercise.sets.map((set) => ({
              weight: set.weight ?? "",
              reps: String(set.reps ?? ""),
              isWarmup: set.isWarmup,
            }))}
          />
        </CardContent>
      </Card>
    </main>
  );
}
