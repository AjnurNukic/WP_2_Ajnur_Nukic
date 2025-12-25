export interface TrackerCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  route: string;
  color: string;
  enabled: boolean;
}

/* ================= HABITS ================= */

export interface HabitEntry {
  id?: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  completedDates: string[];
  createdAt: Date;
}

/* ================= SLEEP ================= */

export interface SleepEntry {
  id?: string;
  userId: string;
  date: Date;
  hours: number;
  quality: number; // 1-5
  notes: string;
}

/* ================= TASKS ================= */

export interface TaskEntry {
  id?: string;
  userId: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
}

/* ================= MOOD ================= */

export interface MoodEntry {
  id?: string;
  userId: string;
  date: Date;
  rating: number; // 1-10
  emotions: string[];
  notes: string;
}

/* ================= STUDY ================= */

export interface StudyEntry {
  id?: string;
  userId: string;
  subject: string;
  topic: string;
  hours: number;
  date: Date;
  notes: string;
}

/* ================= WATER ================= */

export interface WaterEntry {
  id?: string;
  userId: string;
  date: Date;
  glasses: number;
  goal: number;
}

/* ================= FITNESS ================= */

export interface FitnessEntry {
  id?: string;
  userId: string;
  exercise: string;
  duration: number;
  calories: number;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports';
  date: Date;
  notes: string;
}

/* ================= MEALS ================= */

export interface MealEntry {
  id?: string;
  userId: string;
  date: Date;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  calories: number;
  notes: string;
}

/* ================= FINANCE ================= */

export interface FinanceEntry {
  id?: string;
  userId: string;
  date: Date;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'other';
}

/* ================= CALENDAR ================= */

export interface CalendarEntry {
  id?: string;
  userId: string;
  date: Date;
  title: string;
  description: string;
  type: 'event' | 'task' | 'reminder' | 'meeting';
  time: string;
  completed: boolean;
}

/* ================= GRATITUDE ================= */

export interface GratitudeEntry {
  id?: string;
  userId: string;
  date: Date;
  items: string[];
  highlight: string;
  mood: 'amazing' | 'good' | 'okay' | 'rough';
  color: string;
  streak: number;
}
export interface ReflectionEntry {
  id?: string;
  userId: string;
  date: Date;
  time: string;
  rating: number; // 1-10
  category: 'work' | 'personal' | 'health' | 'learning' | 'relationships';
  
  // Pitanja za razmišljanje
  whatLearned: string;
  whatToDoDifferently: string;
  
  // Ciljevi
  goalsAchieved: boolean;
  goalsDescription: string;
  
  // Wins & Lessons
  wins: string[];
  lessons: string[];
  
  // Slobodna forma
  freeThoughts: string;
  
  // Vizuelno
  mood: 'amazing' | 'good' | 'okay' | 'rough';
  color: string;
}
