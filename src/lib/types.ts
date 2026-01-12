import {
  Comment,
  Exercise,
  Follow,
  Like,
  LogEntry,
  User,
  Visibility,
  Workout,
  WorkoutLog,
} from "@/generated/prisma/client";

// Extended types with relations
export type WorkoutWithDetails = Workout & {
  user: User;
  exercises: Exercise[];
  _count: {
    likes: number;
    comments: number;
    logs: number;
  };
  isLiked?: boolean;
};

export type WorkoutLogWithDetails = WorkoutLog & {
  workout: Workout & {
    exercises: Exercise[];
  };
  entries: (LogEntry & {
    exercise: Exercise;
  })[];
};

export type UserProfile = User & {
  _count: {
    workouts: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
};

export type CommentWithUser = Comment & {
  user: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
};

// Form types
export type CreateWorkoutInput = {
  name: string;
  description?: string;
  visibility: Visibility;
  exercises: {
    name: string;
    sets?: number;
    reps?: number;
    duration?: number;
    weight?: number;
    notes?: string;
    order: number;
  }[];
};

export type CreateLogInput = {
  workoutId: string;
  date: Date;
  duration?: number;
  notes?: string;
  entries: {
    exerciseId: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    completed: boolean;
    notes?: string;
  }[];
};

export type FeedItem = WorkoutWithDetails;

export { Visibility };
export type {
  Comment,
  Exercise,
  Follow,
  Like,
  LogEntry,
  User,
  Workout,
  WorkoutLog,
};
