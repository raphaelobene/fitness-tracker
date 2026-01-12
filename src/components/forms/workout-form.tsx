"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Visibility } from "@/lib/constants";
import {
  ExerciseLibraryItem,
  getExerciseById,
  getExerciseSuggestions,
} from "@/lib/data/exercise-library";
import { WorkoutInput, workoutSchema } from "@/lib/validations/workout.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, GripVertical, Info, Plus, Trash2 } from "lucide-react";
import { useReducer } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { LoadingSwap } from "../loading-swap";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface WorkoutFormProps {
  defaultValues?: Partial<WorkoutInput>;
  onSubmit: (data: WorkoutInput) => void;
  _isLoading?: boolean;
}

type ExerciseFormState = {
  searchValues: Map<string, string>;
  showSuggestions: Map<string, boolean>;
  selectedExerciseInfo: ExerciseLibraryItem | null;
};

type ExerciseFormAction =
  | {
      type: "UPDATE_SEARCH";
      fieldId: string;
      value: string;
      showSuggestions?: boolean;
    }
  | { type: "REMOVE_EXERCISE"; fieldId: string }
  | { type: "SHOW_EXERCISE_INFO"; payload: ExerciseLibraryItem | null };

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

function exerciseFormReducer(
  state: ExerciseFormState,
  action: ExerciseFormAction
): ExerciseFormState {
  switch (action.type) {
    case "UPDATE_SEARCH": {
      const searchValues = new Map(state.searchValues);
      const showSuggestions = new Map(state.showSuggestions);

      searchValues.set(action.fieldId, action.value);
      showSuggestions.set(
        action.fieldId,
        action.showSuggestions ?? action.value.length > 0
      );

      return { ...state, searchValues, showSuggestions };
    }

    case "REMOVE_EXERCISE": {
      const searchValues = new Map(state.searchValues);
      const showSuggestions = new Map(state.showSuggestions);

      searchValues.delete(action.fieldId);
      showSuggestions.delete(action.fieldId);

      return { ...state, searchValues, showSuggestions };
    }

    case "SHOW_EXERCISE_INFO":
      return { ...state, selectedExerciseInfo: action.payload };

    default:
      return state;
  }
}

/* -------------------------------------------------------------------------- */
/*                             Component                                      */
/* -------------------------------------------------------------------------- */

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
      visibility: Visibility.PRIVATE,
      exercises: [{ name: "", order: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const [state, dispatch] = useReducer(
    exerciseFormReducer,
    fields,
    (fields) => {
      const searchValues = new Map<string, string>();
      const showSuggestions = new Map<string, boolean>();

      fields.forEach((field) => {
        if (field.name) {
          searchValues.set(field.id, field.name);
          showSuggestions.set(field.id, false);
        }
      });

      return {
        searchValues,
        showSuggestions,
        selectedExerciseInfo: null,
      };
    }
  );

  const isSubmitting = form.formState.isSubmitting;
  const isLoading = _isLoading || isSubmitting;

  /* ------------------------------------------------------------------------ */
  /*                              Handlers                                    */
  /* ------------------------------------------------------------------------ */

  const handleSearchChange = (
    fieldId: string,
    value: string,
    index: number
  ) => {
    dispatch({ type: "UPDATE_SEARCH", fieldId, value });
    form.setValue(`exercises.${index}.name`, value);
  };

  const selectExercise = (
    fieldId: string,
    exerciseName: string,
    index: number
  ) => {
    dispatch({
      type: "UPDATE_SEARCH",
      fieldId,
      value: exerciseName,
      showSuggestions: false,
    });

    form.setValue(`exercises.${index}.name`, exerciseName);

    const exercise = getExerciseById(
      exerciseName.toLowerCase().replace(/\s+/g, "-")
    );

    if (exercise?.equipment.some((e) => e === "barbell" || e === "dumbbell")) {
      form.setValue(`exercises.${index}.sets`, 3);
      form.setValue(`exercises.${index}.reps`, 10);
    }
  };

  const showExerciseInfo = (exerciseName: string) => {
    const exercise = getExerciseById(
      exerciseName.toLowerCase().replace(/\s+/g, "-")
    );

    if (exercise) {
      dispatch({ type: "SHOW_EXERCISE_INFO", payload: exercise });
    }
  };

  const handleRemoveExercise = (index: number, fieldId: string) => {
    dispatch({ type: "REMOVE_EXERCISE", fieldId });
    remove(index);
  };

  const exerciseNumberFields = ["sets", "reps", "weight", "duration"] as const;
  /* ------------------------------------------------------------------------ */
  /*                                  JSX                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workout Name</FormLabel>
                <FormControl>
                  <Input placeholder="Upper Body Strength" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Focus on compound movements..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Visibility.PRIVATE}>
                      Private (only you)
                    </SelectItem>
                    <SelectItem value={Visibility.FOLLOWERS}>
                      Followers
                    </SelectItem>
                    <SelectItem value={Visibility.PUBLIC}>Public</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Exercises</FormLabel>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ name: "", order: fields.length })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const searchValue = state.searchValues.get(field.id) || "";
                const suggestions = getExerciseSuggestions(searchValue);
                const showSuggestions =
                  state.showSuggestions.get(field.id) && suggestions.length > 0;

                return (
                  <Card key={field.id} className="p-4">
                    <div className="flex gap-4">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />

                      <div className="flex-1 space-y-3">
                        <FormField
                          control={form.control}
                          name={`exercises.${index}.name`}
                          render={() => (
                            <FormItem>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Input
                                    value={searchValue}
                                    placeholder="Exercise name..."
                                    onChange={(e) =>
                                      handleSearchChange(
                                        field.id,
                                        e.target.value,
                                        index
                                      )
                                    }
                                    onFocus={() =>
                                      searchValue &&
                                      dispatch({
                                        type: "UPDATE_SEARCH",
                                        fieldId: field.id,
                                        value: searchValue,
                                        showSuggestions: true,
                                      })
                                    }
                                    onBlur={() =>
                                      setTimeout(
                                        () =>
                                          dispatch({
                                            type: "UPDATE_SEARCH",
                                            fieldId: field.id,
                                            value: searchValue,
                                            showSuggestions: false,
                                          }),
                                        150
                                      )
                                    }
                                  />

                                  {showSuggestions && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                                      {suggestions.map((exercise) => (
                                        <button
                                          key={exercise.id}
                                          type="button"
                                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex justify-between"
                                          onClick={() =>
                                            selectExercise(
                                              field.id,
                                              exercise.name,
                                              index
                                            )
                                          }
                                        >
                                          <div>
                                            <div className="font-medium">
                                              {exercise.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {exercise.primaryMuscles.join(
                                                ", "
                                              )}
                                            </div>
                                          </div>
                                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {searchValue &&
                                  getExerciseById(
                                    searchValue
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                  ) && (
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      onClick={() =>
                                        showExerciseInfo(searchValue)
                                      }
                                    >
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  )}
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* sets / reps / weight / duration */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {exerciseNumberFields.map((key) => (
                            <FormField
                              key={key}
                              control={form.control}
                              name={`exercises.${index}.${key}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step={
                                        key === "weight" ? "0.1" : undefined
                                      }
                                      placeholder={key}
                                      value={field.value ?? ""}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value
                                            ? Number(e.target.value)
                                            : null
                                        )
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
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
                        size="icon"
                        variant="ghost"
                        disabled={fields.length === 1}
                        onClick={() => handleRemoveExercise(index, field.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
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
