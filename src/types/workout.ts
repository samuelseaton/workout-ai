export interface WorkoutInputs {
  birthday: string;
  gender: string;
  height: string;
  weight: string;
  workoutType: string;
  intensity: string;
  goal: string;
  targetMuscles: string[];
  duration: number;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  tempo: string;
  note: string;
}

export interface SavedWorkout {
  id: string;
  inputs: WorkoutInputs;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}
