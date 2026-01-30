"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const mockWorkouts = [
  {
    id: 1,
    name: "Bench Press",
    sets: [
      { weight: 135, reps: 10 },
      { weight: 155, reps: 8 },
      { weight: 175, reps: 6 },
    ],
  },
  {
    id: 2,
    name: "Squat",
    sets: [
      { weight: 185, reps: 10 },
      { weight: 225, reps: 8 },
      { weight: 245, reps: 6 },
    ],
  },
  {
    id: 3,
    name: "Deadlift",
    sets: [
      { weight: 225, reps: 8 },
      { weight: 275, reps: 6 },
      { weight: 315, reps: 4 },
    ],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <main className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>
        {mockWorkouts.length === 0 ? (
          <p className="text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle>{workout.name}</CardTitle>
                  <CardDescription>
                    {workout.sets.length} sets logged
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {workout.sets.map((set, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        Set {index + 1}: {set.weight} lbs x {set.reps} reps
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
