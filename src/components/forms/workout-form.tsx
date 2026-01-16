"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  ExerciseLibraryItem,
  getExerciseSuggestions,
} from "@/lib/data/exercise-library";
import { WorkoutInput, workoutSchema } from "@/lib/validations/workout.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReducer } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Autocomplete } from "../autocomplete";
import CustomFormField, { FormFieldType } from "../custom-form-field";
import { Icons } from "../icons";
import { LoadingSwap } from "../loading-swap";

interface WorkoutFormProps {
  defaultValues?: Partial<WorkoutInput>;
  onSubmit: (data: WorkoutInput) => void;
  _isLoading?: boolean;
}

type ExerciseFormState = {
  selectedExerciseInfo: ExerciseLibraryItem | null;
};

type ExerciseFormAction = {
  type: "SHOW_EXERCISE_INFO";
  payload: ExerciseLibraryItem | null;
};

function exerciseFormReducer(
  state: ExerciseFormState,
  action: ExerciseFormAction
): ExerciseFormState {
  switch (action.type) {
    case "SHOW_EXERCISE_INFO":
      return {
        ...state,
        selectedExerciseInfo: action.payload,
      };
    default:
      return state;
  }
}

export function WorkoutForm({
  defaultValues,
  onSubmit,
  _isLoading,
}: WorkoutFormProps) {
  const form = useForm<WorkoutInput>({
    resolver: zodResolver(workoutSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      visibility: "PRIVATE",
      exercises: [{ name: "", order: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const [state, dispatch] = useReducer(exerciseFormReducer, {
    selectedExerciseInfo: null,
  });

  const isSubmitting = form.formState.isSubmitting;
  const isLoading = _isLoading || isSubmitting;

  const exerciseNumberFields = [
    { key: "sets", placeholder: "Sets" },
    { key: "reps", placeholder: "Reps" },
    { key: "weight", placeholder: "Weight" },
    { key: "duration", placeholder: "Duration" },
  ] as const;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="name"
            label="Workout Name"
            placeholder="Upper Body Strength"
          />
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            name="description"
            label="Workout Description (optional)"
            placeholder="Focus on compound movements..."
          />
          <CustomFormField
            fieldType={FormFieldType.SELECT}
            name="visibility"
            label="Visibility"
            options={[
              { value: "PRIVATE", label: "Private (only you)" },
              { value: "FOLLOWERS", label: "Followers" },
              { value: "PUBLIC", label: "Public" },
            ]}
          />

          {/* Exercises */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel>Exercises</FormLabel>
              <Button
                type="button"
                size="xs"
                variant="link"
                onClick={() => append({ name: "", order: fields.length })}
                className="p-0 h-auto rounded-none"
              >
                <Icons.plus />
                Add Exercise
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-3 border border-border rounded-xl flex gap-2"
                >
                  <div className="flex-1 space-y-3">
                    <CustomFormField
                      fieldType={FormFieldType.SKELETON}
                      name={`exercises.${index}.name`}
                      renderSkeleton={(field) => (
                        <Autocomplete
                          name={field.name}
                          value={field.value ?? ""}
                          placeholder="Exercise name..."
                          fetchItems={getExerciseSuggestions}
                          getItemValue={(item) => item.name}
                          onChange={field.onChange}
                          onSelect={(exercise) => {
                            form.setValue(
                              `exercises.${index}.name`,
                              exercise.name
                            );

                            if (
                              exercise.equipment.some(
                                (e) => e === "barbell" || e === "dumbbell"
                              )
                            ) {
                              form.setValue(`exercises.${index}.sets`, 3);
                              form.setValue(`exercises.${index}.reps`, 10);
                            }
                          }}
                          renderItem={(exercise) => exercise.name}
                        />
                      )}
                    />

                    {/* sets / reps / weight / duration */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {exerciseNumberFields.map(({ key, placeholder }) => (
                        <CustomFormField
                          key={key}
                          name={`exercises.${index}.${key}`}
                          fieldType={FormFieldType.INPUT}
                          placeholder={placeholder}
                          type="number"
                        />
                      ))}
                    </div>

                    <FormField
                      control={form.control}
                      name={`exercises.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              rows={2}
                              placeholder="Notes (optional)"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="-mx-1 text-destructive"
                  >
                    <Icons.trash />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <LoadingSwap isLoading={isLoading}>Save Workout</LoadingSwap>
          </Button>
        </form>
      </Form>

      {/* Exercise Info Dialog */}
      <Dialog
        open={!!state.selectedExerciseInfo}
        onOpenChange={() =>
          dispatch({
            type: "SHOW_EXERCISE_INFO",
            payload: null,
          })
        }
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {state.selectedExerciseInfo && (
            <>
              <DialogHeader>
                <DialogTitle>{state.selectedExerciseInfo.name}</DialogTitle>
                <DialogDescription>
                  {state.selectedExerciseInfo.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-2">How to Perform</h4>
                  <ol className="space-y-2">
                    {state.selectedExerciseInfo.instructions.map(
                      (instruction, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                            {i + 1}
                          </span>
                          <span className="text-sm pt-0.5">{instruction}</span>
                        </li>
                      )
                    )}
                  </ol>
                </div>

                {state.selectedExerciseInfo.tips &&
                  state.selectedExerciseInfo.tips.length > 0 && (
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Tips</h4>
                      <ul className="space-y-1">
                        {state.selectedExerciseInfo.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="text-sm flex items-start gap-2"
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
