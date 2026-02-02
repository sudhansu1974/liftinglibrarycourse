import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserWorkoutsByDate } from "@/data/workouts";
import { getAllExerciseDefinitions } from "@/data/exercises";
import { DatePicker } from "./date-picker";
import { LogWorkoutDialog } from "./log-workout-dialog";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const dateStr = params.date || format(new Date(), "yyyy-MM-dd");
  const [workouts, exercises] = await Promise.all([
    getUserWorkoutsByDate(dateStr),
    getAllExerciseDefinitions(),
  ]);

  const displayDate = format(new Date(dateStr + "T00:00:00"), "do MMM yyyy");

  return (
    <main className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="flex items-center gap-4">
          <DatePicker currentDate={dateStr} />
          <LogWorkoutDialog currentDate={dateStr} exercises={exercises} />
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Workouts for {displayDate}
        </h2>
        {workouts.length === 0 ? (
          <p className="text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) =>
              workout.workoutExercises.map((exercise) => (
                <Card key={exercise.id}>
                  <CardHeader>
                    <CardTitle>{exercise.exerciseDefinition.name}</CardTitle>
                    <CardDescription>
                      {exercise.sets.length} sets logged
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {exercise.sets.map((set) => (
                        <li
                          key={set.id}
                          className="text-sm text-muted-foreground"
                        >
                          Set {set.setNumber}: {set.weight} lbs x {set.reps}{" "}
                          reps
                          {set.isWarmup && " (warmup)"}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}
