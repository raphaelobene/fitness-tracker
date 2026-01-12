export type ExerciseCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "full-body";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "bodyweight"
  | "cable"
  | "kettlebell"
  | "resistance-band"
  | "none";

export type ExerciseLibraryItem = {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment[];
  description: string;
  instructions: string[];
  tips?: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
};

export const exerciseLibrary: ExerciseLibraryItem[] = [
  // Chest
  {
    id: "bench-press",
    name: "Bench Press",
    category: "chest",
    equipment: ["barbell"],
    description:
      "Compound chest exercise targeting pectorals, shoulders, and triceps",
    instructions: [
      "Lie flat on bench with feet on floor",
      "Grip bar slightly wider than shoulder width",
      "Lower bar to mid-chest with control",
      "Press bar back up to starting position",
    ],
    tips: ["Keep shoulder blades retracted", "Maintain arch in lower back"],
    primaryMuscles: ["Pectorals"],
    secondaryMuscles: ["Anterior Deltoids", "Triceps"],
  },
  {
    id: "push-up",
    name: "Push-up",
    category: "chest",
    equipment: ["bodyweight"],
    description:
      "Classic bodyweight exercise for chest, shoulders, and triceps",
    instructions: [
      "Start in plank position, hands shoulder-width apart",
      "Lower body until chest nearly touches floor",
      "Push back up to starting position",
      "Keep core engaged throughout",
    ],
    primaryMuscles: ["Pectorals", "Triceps"],
    secondaryMuscles: ["Anterior Deltoids", "Core"],
  },
  {
    id: "dumbbell-fly",
    name: "Dumbbell Fly",
    category: "chest",
    equipment: ["dumbbell"],
    description: "Isolation exercise for chest development",
    instructions: [
      "Lie on bench holding dumbbells above chest",
      "Lower dumbbells out to sides in arc motion",
      "Feel stretch in chest",
      "Bring dumbbells back together above chest",
    ],
    primaryMuscles: ["Pectorals"],
    secondaryMuscles: ["Anterior Deltoids"],
  },

  // Back
  {
    id: "deadlift",
    name: "Deadlift",
    category: "back",
    equipment: ["barbell"],
    description: "King of compound exercises, targets entire posterior chain",
    instructions: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Bend at hips and knees to grip bar",
      "Keep back straight, chest up",
      "Drive through heels to stand up",
      "Lower bar with control",
    ],
    tips: ["Keep bar close to body", "Engage lats throughout"],
    primaryMuscles: ["Erector Spinae", "Glutes", "Hamstrings"],
    secondaryMuscles: ["Lats", "Traps", "Forearms"],
  },
  {
    id: "pull-up",
    name: "Pull-up",
    category: "back",
    equipment: ["bodyweight"],
    description: "Bodyweight back exercise, builds width and strength",
    instructions: [
      "Hang from bar with overhand grip",
      "Pull body up until chin clears bar",
      "Lower with control",
      "Keep core tight",
    ],
    primaryMuscles: ["Lats", "Upper Back"],
    secondaryMuscles: ["Biceps", "Forearms"],
  },
  {
    id: "barbell-row",
    name: "Barbell Row",
    category: "back",
    equipment: ["barbell"],
    description: "Builds back thickness and strength",
    instructions: [
      "Bend at hips, keep back straight",
      "Grip bar with overhand grip",
      "Pull bar to lower chest",
      "Squeeze shoulder blades",
      "Lower with control",
    ],
    primaryMuscles: ["Lats", "Rhomboids", "Traps"],
    secondaryMuscles: ["Biceps", "Rear Deltoids"],
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    category: "back",
    equipment: ["cable", "machine"],
    description: "Machine exercise for lat development",
    instructions: [
      "Sit at machine, grip bar wider than shoulders",
      "Pull bar down to upper chest",
      "Squeeze lats at bottom",
      "Return to start with control",
    ],
    primaryMuscles: ["Lats"],
    secondaryMuscles: ["Biceps", "Rear Deltoids"],
  },

  // Shoulders
  {
    id: "overhead-press",
    name: "Overhead Press",
    category: "shoulders",
    equipment: ["barbell"],
    description: "Builds shoulder strength and size",
    instructions: [
      "Stand with bar at shoulder height",
      "Press bar overhead until arms extended",
      "Lower bar to shoulders with control",
      "Keep core tight",
    ],
    primaryMuscles: ["Deltoids"],
    secondaryMuscles: ["Triceps", "Upper Chest"],
  },
  {
    id: "lateral-raise",
    name: "Lateral Raise",
    category: "shoulders",
    equipment: ["dumbbell"],
    description: "Isolation for side deltoids",
    instructions: [
      "Stand holding dumbbells at sides",
      "Raise arms out to sides until parallel",
      "Lower with control",
      "Keep slight bend in elbows",
    ],
    primaryMuscles: ["Lateral Deltoids"],
  },
  {
    id: "face-pull",
    name: "Face Pull",
    category: "shoulders",
    equipment: ["cable"],
    description: "Great for rear deltoids and posture",
    instructions: [
      "Set cable at face height",
      "Pull rope attachment to face",
      "Spread rope ends apart",
      "Squeeze rear delts and upper back",
    ],
    primaryMuscles: ["Rear Deltoids", "Upper Back"],
  },

  // Arms
  {
    id: "barbell-curl",
    name: "Barbell Curl",
    category: "arms",
    equipment: ["barbell"],
    description: "Classic bicep builder",
    instructions: [
      "Stand holding bar with underhand grip",
      "Curl bar up to shoulders",
      "Keep elbows stationary",
      "Lower with control",
    ],
    primaryMuscles: ["Biceps"],
  },
  {
    id: "tricep-dip",
    name: "Tricep Dip",
    category: "arms",
    equipment: ["bodyweight"],
    description: "Bodyweight tricep exercise",
    instructions: [
      "Support body on parallel bars",
      "Lower body by bending elbows",
      "Keep torso upright",
      "Push back up to start",
    ],
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Chest", "Shoulders"],
  },
  {
    id: "hammer-curl",
    name: "Hammer Curl",
    category: "arms",
    equipment: ["dumbbell"],
    description: "Targets biceps and forearms",
    instructions: [
      "Hold dumbbells with neutral grip",
      "Curl weights up",
      "Keep wrists neutral",
      "Lower with control",
    ],
    primaryMuscles: ["Biceps", "Brachialis"],
    secondaryMuscles: ["Forearms"],
  },
  {
    id: "tricep-extension",
    name: "Overhead Tricep Extension",
    category: "arms",
    equipment: ["dumbbell"],
    description: "Isolation for triceps long head",
    instructions: [
      "Hold dumbbell overhead with both hands",
      "Lower behind head by bending elbows",
      "Extend arms back to start",
      "Keep elbows pointing forward",
    ],
    primaryMuscles: ["Triceps"],
  },

  // Legs
  {
    id: "squat",
    name: "Barbell Squat",
    category: "legs",
    equipment: ["barbell"],
    description: "King of leg exercises",
    instructions: [
      "Bar on upper back, feet shoulder-width",
      "Descend by bending knees and hips",
      "Keep chest up, back straight",
      "Drive through heels to stand",
    ],
    tips: ["Keep knees tracking over toes", "Squat to parallel or below"],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Core"],
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    category: "legs",
    equipment: ["barbell"],
    description: "Targets hamstrings and glutes",
    instructions: [
      "Hold bar at hip height",
      "Push hips back, slight knee bend",
      "Lower bar to mid-shin",
      "Feel stretch in hamstrings",
      "Drive hips forward to stand",
    ],
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Lower Back"],
  },
  {
    id: "leg-press",
    name: "Leg Press",
    category: "legs",
    equipment: ["machine"],
    description: "Machine exercise for overall leg development",
    instructions: [
      "Sit in machine, feet on platform",
      "Lower weight by bending knees",
      "Push through heels to extend legs",
      "Dont lock out knees",
    ],
    primaryMuscles: ["Quadriceps", "Glutes"],
  },
  {
    id: "lunge",
    name: "Walking Lunge",
    category: "legs",
    equipment: ["dumbbell", "bodyweight"],
    description: "Unilateral leg exercise",
    instructions: [
      "Step forward into lunge position",
      "Lower back knee toward ground",
      "Push through front heel to step forward",
      "Alternate legs",
    ],
    primaryMuscles: ["Quadriceps", "Glutes"],
  },
  {
    id: "calf-raise",
    name: "Standing Calf Raise",
    category: "legs",
    equipment: ["machine", "bodyweight"],
    description: "Isolates calf muscles",
    instructions: [
      "Stand on platform, heels hanging off",
      "Rise up on toes",
      "Squeeze at top",
      "Lower heels below platform",
    ],
    primaryMuscles: ["Calves"],
  },

  // Core
  {
    id: "plank",
    name: "Plank",
    category: "core",
    equipment: ["bodyweight"],
    description: "Isometric core exercise",
    instructions: [
      "Start in forearm plank position",
      "Keep body in straight line",
      "Engage core",
      "Hold position",
    ],
    primaryMuscles: ["Core", "Abs"],
  },
  {
    id: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    category: "core",
    equipment: ["bodyweight"],
    description: "Advanced ab exercise",
    instructions: [
      "Hang from bar",
      "Raise legs to parallel",
      "Lower with control",
      "Avoid swinging",
    ],
    primaryMuscles: ["Lower Abs", "Hip Flexors"],
  },
  {
    id: "russian-twist",
    name: "Russian Twist",
    category: "core",
    equipment: ["bodyweight", "dumbbell"],
    description: "Oblique exercise",
    instructions: [
      "Sit with knees bent, lean back slightly",
      "Rotate torso side to side",
      "Touch ground on each side",
      "Keep core engaged",
    ],
    primaryMuscles: ["Obliques", "Core"],
  },

  // Cardio
  {
    id: "running",
    name: "Running",
    category: "cardio",
    equipment: ["none"],
    description: "Classic cardio exercise",
    instructions: [
      "Start at comfortable pace",
      "Maintain good posture",
      "Land mid-foot",
      "Breathe rhythmically",
    ],
    primaryMuscles: ["Cardiovascular System", "Legs"],
  },
  {
    id: "burpee",
    name: "Burpee",
    category: "cardio",
    equipment: ["bodyweight"],
    description: "Full body cardio exercise",
    instructions: [
      "Start standing",
      "Drop to plank position",
      "Do push-up",
      "Jump feet to hands",
      "Jump up with arms overhead",
    ],
    primaryMuscles: ["Full Body", "Cardiovascular System"],
  },
  {
    id: "jump-rope",
    name: "Jump Rope",
    category: "cardio",
    equipment: ["resistance-band"],
    description: "High-intensity cardio",
    instructions: [
      "Hold rope handles",
      "Swing rope over head",
      "Jump as rope passes under feet",
      "Stay on balls of feet",
    ],
    primaryMuscles: ["Cardiovascular System", "Calves"],
  },
];

export const exerciseCategories: { value: ExerciseCategory; label: string }[] =
  [
    { value: "chest", label: "Chest" },
    { value: "back", label: "Back" },
    { value: "shoulders", label: "Shoulders" },
    { value: "arms", label: "Arms" },
    { value: "legs", label: "Legs" },
    { value: "core", label: "Core" },
    { value: "cardio", label: "Cardio" },
    { value: "full-body", label: "Full Body" },
  ];

export const equipmentTypes: { value: Equipment; label: string }[] = [
  { value: "barbell", label: "Barbell" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "machine", label: "Machine" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "cable", label: "Cable" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "resistance-band", label: "Resistance Band" },
  { value: "none", label: "No Equipment" },
];

export function searchExercises(
  query: string,
  category?: ExerciseCategory,
  equipment?: Equipment
) {
  let filtered = exerciseLibrary;

  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (ex) =>
        ex.name.toLowerCase().includes(lowerQuery) ||
        ex.description.toLowerCase().includes(lowerQuery) ||
        ex.primaryMuscles.some((m) => m.toLowerCase().includes(lowerQuery))
    );
  }

  if (category) {
    filtered = filtered.filter((ex) => ex.category === category);
  }

  if (equipment) {
    filtered = filtered.filter((ex) => ex.equipment.includes(equipment));
  }

  return filtered;
}

export function getExerciseById(id: string) {
  return exerciseLibrary.find((ex) => ex.id === id);
}

export function getExerciseSuggestions(query: string, limit = 5) {
  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  return exerciseLibrary
    .filter((ex) => ex.name.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
}
