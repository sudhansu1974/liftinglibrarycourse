import { format } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllExerciseDefinitions } from "@/data/exercises";
import { WorkoutForm } from "./workout-form";

interface NewWorkoutPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function NewWorkoutPage({
  searchParams,
}: NewWorkoutPageProps) {
  const params = await searchParams;
  const dateStr = params.date || format(new Date(), "yyyy-MM-dd");
  const exercises = await getAllExerciseDefinitions();
  const displayDate = format(new Date(dateStr + "T00:00:00"), "do MMM yyyy");

  return (
    <main className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/dashboard?date=${dateStr}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log New Workout</CardTitle>
          <CardDescription>Recording workout for {displayDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkoutForm currentDate={dateStr} exercises={exercises} />
        </CardContent>
      </Card>
    </main>
  );
}
