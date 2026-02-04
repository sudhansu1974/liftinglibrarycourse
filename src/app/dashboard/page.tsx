import { format } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserWorkoutsByDate } from "@/data/workouts";
import { DatePicker } from "./date-picker";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const dateStr = params.date || format(new Date(), "yyyy-MM-dd");
  const workouts = await getUserWorkoutsByDate(dateStr);

  const displayDate = format(new Date(dateStr + "T00:00:00"), "do MMM yyyy");

  return (
    <main className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="flex items-center gap-4">
          <DatePicker currentDate={dateStr} />
          <Button asChild>
            <Link href={`/dashboard/workout/new?date=${dateStr}`}>
              Log New Workout
            </Link>
          </Button>
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
                <Link
                  key={exercise.id}
                  href={`/dashboard/workout/${workout.id}`}
                  className="block transition-transform hover:scale-105"
                >
                  <Card className="h-full cursor-pointer">
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
                </Link>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}
