"use client";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Equipment,
  equipmentTypes,
  exerciseCategories,
  ExerciseCategory,
  ExerciseLibraryItem,
  searchExercises,
} from "@/lib/data/exercise-library";
import { pluralize } from "@/lib/utils";
import { Dumbbell, Filter, Info, Search } from "lucide-react";
import { useState } from "react";

export default function ExerciseLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ExerciseCategory | "all"
  >("all");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | "all">(
    "all"
  );
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseLibraryItem | null>(null);

  const filteredExercises = searchExercises(
    searchQuery,
    selectedCategory === "all" ? undefined : selectedCategory,
    selectedEquipment === "all" ? undefined : selectedEquipment
  );

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold">Exercise Library</h1>
        <p className="text-muted-foreground mt-1">
          Browse exercises with instructions and tips
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Category
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(value) =>
                  setSelectedCategory(value as ExerciseCategory | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {exerciseCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Equipment
              </label>
              <Select
                value={selectedEquipment}
                onValueChange={(value) =>
                  setSelectedEquipment(value as Equipment | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Equipment</SelectItem>
                  {equipmentTypes.map((eq) => (
                    <SelectItem key={eq.value} value={eq.value}>
                      {eq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(selectedCategory !== "all" ||
            selectedEquipment !== "all" ||
            searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedEquipment("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {pluralize(filteredExercises.length, "exercise")} found
      </div>

      {/* Exercise Grid */}
      <div className="grid auto-fill-[9rem] gap-3">
        {filteredExercises.map((exercise) => {
          const equipments = exercise.equipment.slice(0, 2);
          const remainingCount = exercise.equipment.length - 2;

          return (
            <div
              key={exercise.id}
              className="hover:shadow-sm transition-shadow cursor-pointer bg-muted flex gap-3.5 flex-col rounded-xl border p-3"
              onClick={() => setSelectedExercise(exercise)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="leading-tight font-semibold">
                  {exercise.name}
                </div>
                <Icons.info className="size-4 shrink-0 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm/tight">
                {exercise.description}
              </p>

              <div className="flex items-center-safe flex-wrap text-xs text-primary mt-auto">
                {equipments.map((eq, i) => (
                  <div key={eq} className="inline-flex items-center">
                    <span className="text-nowrap">
                      {equipmentTypes.find((e) => e.value === eq)?.label}
                    </span>
                    {i < exercise.equipment.length - 1 && (
                      <Icons.dot className="size-4 -mx-0.5" />
                    )}
                  </div>
                ))}
                {remainingCount > 0 && <span>+{remainingCount}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No exercises found</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedEquipment("all");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Exercise Detail Dialog */}
      <Dialog
        open={!!selectedExercise}
        onOpenChange={() => setSelectedExercise(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedExercise.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedExercise.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {
                      exerciseCategories.find(
                        (c) => c.value === selectedExercise.category
                      )?.label
                    }
                  </Badge>
                  {selectedExercise.equipment.map((eq) => (
                    <Badge key={eq} variant="outline">
                      {equipmentTypes.find((e) => e.value === eq)?.label}
                    </Badge>
                  ))}
                </div>

                {/* Muscles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Primary Muscles</h3>
                    <ul className="space-y-1">
                      {selectedExercise.primaryMuscles.map((muscle, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {muscle}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {selectedExercise.secondaryMuscles && (
                    <div>
                      <h3 className="font-semibold mb-2">Secondary Muscles</h3>
                      <ul className="space-y-1">
                        {selectedExercise.secondaryMuscles.map((muscle, i) => (
                          <li
                            key={i}
                            className="text-sm flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            {muscle}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-semibold mb-3">How to Perform</h3>
                  <ol className="space-y-3">
                    {selectedExercise.instructions.map((instruction, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {i + 1}
                        </span>
                        <span className="text-sm pt-0.5">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Pro Tips
                    </h3>
                    <ul className="space-y-2">
                      {selectedExercise.tips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
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
    </div>
  );
}
