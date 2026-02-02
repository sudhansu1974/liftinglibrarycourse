"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logWorkoutAction, type LogWorkoutState } from "./actions";
import type { ExerciseDefinition } from "@/db/schema";

type SetFormData = {
  weight: string;
  reps: string;
  isWarmup: boolean;
};

interface LogWorkoutDialogProps {
  currentDate: string;
  exercises: ExerciseDefinition[];
}

const initialSets: SetFormData[] = [{ weight: "", reps: "", isWarmup: false }];

export function LogWorkoutDialog({
  currentDate,
  exercises,
}: LogWorkoutDialogProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [sets, setSets] = useState<SetFormData[]>(initialSets);

  const [state, formAction, isPending] = useActionState<LogWorkoutState, FormData>(
    async (prevState, formData) => {
      const result = await logWorkoutAction(prevState, formData);
      if (result.success) {
        setOpen(false);
        setFormKey((k) => k + 1);
        setSelectedExercise("");
        setSets(initialSets);
      }
      return result;
    },
    { success: false }
  );

  const addSet = () => {
    setSets([...sets, { weight: "", reps: "", isWarmup: false }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (
    index: number,
    field: keyof SetFormData,
    value: string | boolean
  ) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const handleSubmit = (formData: FormData) => {
    formData.set("date", currentDate);
    formData.set("exerciseDefinitionId", selectedExercise);
    formData.set(
      "sets",
      JSON.stringify(
        sets.map((set) => ({
          weight: set.weight,
          reps: parseInt(set.reps) || 0,
          isWarmup: set.isWarmup,
        }))
      )
    );
    formAction(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Log New Workout</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log New Workout</DialogTitle>
        </DialogHeader>
        <form key={formKey} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise</Label>
            <Select
              value={selectedExercise}
              onValueChange={setSelectedExercise}
            >
              <SelectTrigger id="exercise">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={String(exercise.id)}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sets</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSet}>
                Add Set
              </Button>
            </div>

            {sets.map((set, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 border rounded-md"
              >
                <span className="text-sm text-muted-foreground w-8">
                  #{index + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Weight (lbs)"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(index, "weight", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(index, "reps", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`warmup-${index}`}
                      checked={set.isWarmup}
                      onCheckedChange={(checked) =>
                        updateSet(index, "isWarmup", checked === true)
                      }
                    />
                    <Label
                      htmlFor={`warmup-${index}`}
                      className="text-sm font-normal"
                    >
                      Warmup set
                    </Label>
                  </div>
                </div>
                {sets.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSet(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !selectedExercise}
          >
            {isPending ? "Saving..." : "Save Workout"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
