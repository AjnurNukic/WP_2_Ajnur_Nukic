export interface TrackerCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  route: string;
  color: string;
  enabled: boolean;
}



export interface HabitEntry {
  id?: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  completedDates: string[];
  createdAt: Date;
}



export interface SleepEntry {
  id?: string;
  userId: string;
  date: Date;
  hours: number;
  quality: number; 
  notes: string;
}



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



export interface MoodEntry {
  id?: string;
  userId: string;
  date: Date;
  rating: number; 
  emotions: string[];
  notes: string;
}



export interface StudyEntry {
  id?: string;
  userId: string;
  subject: string;
  topic: string;
  hours: number;
  date: Date;
  notes: string;
}





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
  rating: number; 
  category: 'work' | 'personal' | 'health' | 'learning' | 'relationships';
  

  whatLearned: string;
  whatToDoDifferently: string;
  

  goalsAchieved: boolean;
  goalsDescription: string;
  

  wins: string[];
  lessons: string[];
  

  freeThoughts: string;
  

  mood: 'amazing' | 'good' | 'okay' | 'rough';
  color: string;
}
export interface WaterEntry {
  id?: string;
  userId?: string;
  date: Date;
  glasses: number;
  goal: number;
}
export interface QuizQuestion {
  id: number;
  question: string;
  type: 'single' | 'multiple';
  options: QuizOption[];
  correctAnswers: string[];
}

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
}