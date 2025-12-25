import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { 
  HabitEntry, 
  SleepEntry, 
  StudyEntry, 
  FitnessEntry, 
  TaskEntry, 
  MealEntry, 
  MoodEntry, 
  CalendarEntry, 
  GratitudeEntry,
  FinanceEntry,
  ReflectionEntry
} from '../models/tracker.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore;
  private auth: Auth;

  constructor() {
    this.firestore = inject(Firestore);
    this.auth = inject(Auth);
  }

  private async getUserId(): Promise<string> {
    await this.auth.authStateReady();
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Korisnik nije ulogovan');
    }
    return user.uid;
  }

  // ============================================
  // HABIT TRACKER
  // ============================================

  async addHabit(habit: Omit<HabitEntry, 'id' | 'userId'>): Promise<string> {
    try {
      const userId = await this.getUserId();
      const habitsRef = collection(this.firestore, `users/${userId}/habits`);
      const habitData = {
        ...habit,
        userId,
        createdAt: Timestamp.now()
      };
      const docRef = await addDoc(habitsRef, habitData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  }

  async getHabits(): Promise<HabitEntry[]> {
    try {
      const userId = await this.getUserId();
      const habitsRef = collection(this.firestore, `users/${userId}/habits`);
      const q = query(habitsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          name: data['name'] || '',
          frequency: data['frequency'] || 'daily',
          streak: data['streak'] || 0,
          completedDates: data['completedDates'] || [],
          createdAt: data['createdAt']?.toDate() || new Date()
        } as HabitEntry;
      });
    } catch (error) {
      console.error('Error getting habits:', error);
      throw error;
    }
  }

  async updateHabit(habitId: string, data: Partial<HabitEntry>): Promise<void> {
    try {
      const userId = await this.getUserId();
      const habitRef = doc(this.firestore, `users/${userId}/habits/${habitId}`);
      await updateDoc(habitRef, data as any);
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const habitRef = doc(this.firestore, `users/${userId}/habits/${habitId}`);
      await deleteDoc(habitRef);
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  async completeHabit(habitId: string, habit: HabitEntry): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      if (habit.completedDates.includes(today)) {
        const updatedDates = habit.completedDates.filter(d => d !== today);
        await this.updateHabit(habitId, {
          completedDates: updatedDates,
          streak: this.calculateStreak(updatedDates)
        });
      } else {
        const updatedDates = [...habit.completedDates, today].sort();
        await this.updateHabit(habitId, {
          completedDates: updatedDates,
          streak: this.calculateStreak(updatedDates)
        });
      }
    } catch (error) {
      console.error('Error completing habit:', error);
      throw error;
    }
  }

  private calculateStreak(completedDates: string[]): number {
    if (completedDates.length === 0) return 0;
    const sorted = [...completedDates].sort().reverse();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < sorted.length; i++) {
      const date = new Date(sorted[i]);
      date.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);
      expectedDate.setHours(0, 0, 0, 0);
      if (date.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // ============================================
  // SLEEP TRACKER
  // ============================================

  async addSleepEntry(sleep: Omit<SleepEntry, 'id' | 'userId'> & { date: Date }): Promise<string> {
    try {
      const userId = await this.getUserId();
      const sleepRef = collection(this.firestore, `users/${userId}/sleep`);
      const sleepData = {
        ...sleep,
        userId,
        date: Timestamp.fromDate(sleep.date)
      };
      const docRef = await addDoc(sleepRef, sleepData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding sleep entry:', error);
      throw error;
    }
  }

  async getSleepEntries(limit: number = 30): Promise<SleepEntry[]> {
    try {
      const userId = await this.getUserId();
      const sleepRef = collection(this.firestore, `users/${userId}/sleep`);
      const q = query(sleepRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limit).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          date: data['date']?.toDate() || new Date(),
          hours: data['hours'] || 0,
          quality: data['quality'] || 0,
          notes: data['notes'] || ''
        } as SleepEntry;
      });
    } catch (error) {
      console.error('Error getting sleep entries:', error);
      throw error;
    }
  }

  async deleteSleepEntry(entryId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const sleepRef = doc(this.firestore, `users/${userId}/sleep/${entryId}`);
      await deleteDoc(sleepRef);
    } catch (error) {
      console.error('Error deleting sleep entry:', error);
      throw error;
    }
  }

  // ============================================
  // STUDY PLANNER
  // ============================================

  async addStudyEntry(study: Omit<StudyEntry, 'id' | 'userId'> & { date: Date }): Promise<string> {
    try {
      const userId = await this.getUserId();
      const studyRef = collection(this.firestore, `users/${userId}/study`);
      const studyData = {
        ...study,
        userId,
        date: Timestamp.fromDate(study.date)
      };
      const docRef = await addDoc(studyRef, studyData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding study entry:', error);
      throw error;
    }
  }

  async getStudyEntries(limit: number = 50): Promise<StudyEntry[]> {
    try {
      const userId = await this.getUserId();
      const studyRef = collection(this.firestore, `users/${userId}/study`);
      const q = query(studyRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limit).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          subject: data['subject'] || '',
          topic: data['topic'] || '',
          hours: data['hours'] || 0,
          date: data['date']?.toDate() || new Date(),
          notes: data['notes'] || ''
        } as StudyEntry;
      });
    } catch (error) {
      console.error('Error getting study entries:', error);
      throw error;
    }
  }

  async deleteStudyEntry(entryId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const studyRef = doc(this.firestore, `users/${userId}/study/${entryId}`);
      await deleteDoc(studyRef);
    } catch (error) {
      console.error('Error deleting study entry:', error);
      throw error;
    }
  }

  // ============================================
  // FITNESS TRACKER
  // ============================================

  async addFitnessEntry(fitness: Omit<FitnessEntry, 'id' | 'userId'> & { date: Date }): Promise<string> {
    try {
      const userId = await this.getUserId();
      const fitnessRef = collection(this.firestore, `users/${userId}/fitness`);
      const fitnessData = {
        ...fitness,
        userId,
        date: Timestamp.fromDate(fitness.date)
      };
      const docRef = await addDoc(fitnessRef, fitnessData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding fitness entry:', error);
      throw error;
    }
  }

  async getFitnessEntries(limit: number = 50): Promise<FitnessEntry[]> {
    try {
      const userId = await this.getUserId();
      const fitnessRef = collection(this.firestore, `users/${userId}/fitness`);
      const q = query(fitnessRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limit).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          exercise: data['exercise'] || '',
          duration: data['duration'] || 0,
          calories: data['calories'] || 0,
          type: data['type'] || 'cardio',
          date: data['date']?.toDate() || new Date(),
          notes: data['notes'] || ''
        } as FitnessEntry;
      });
    } catch (error) {
      console.error('Error getting fitness entries:', error);
      throw error;
    }
  }

  async deleteFitnessEntry(entryId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const fitnessRef = doc(this.firestore, `users/${userId}/fitness/${entryId}`);
      await deleteDoc(fitnessRef);
    } catch (error) {
      console.error('Error deleting fitness entry:', error);
      throw error;
    }
  }

  // ============================================
  // TASK MANAGER
  // ============================================

  async addTask(task: Omit<TaskEntry, 'id' | 'userId'> & { dueDate: Date }): Promise<string> {
    try {
      const userId = await this.getUserId();
      const tasksRef = collection(this.firestore, `users/${userId}/tasks`);
      const taskData = {
        ...task,
        userId,
        dueDate: Timestamp.fromDate(task.dueDate),
        createdAt: Timestamp.now()
      };
      const docRef = await addDoc(tasksRef, taskData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  async getTasks(): Promise<TaskEntry[]> {
    try {
      const userId = await this.getUserId();
      const tasksRef = collection(this.firestore, `users/${userId}/tasks`);
      const q = query(tasksRef, orderBy('dueDate', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          title: data['title'] || '',
          description: data['description'] || '',
          dueDate: data['dueDate']?.toDate() || new Date(),
          completed: data['completed'] || false,
          priority: data['priority'] || 'medium',
          category: data['category'] || '',
          createdAt: data['createdAt']?.toDate() || new Date()
        } as TaskEntry;
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, data: Partial<TaskEntry>): Promise<void> {
    try {
      const userId = await this.getUserId();
      const taskRef = doc(this.firestore, `users/${userId}/tasks/${taskId}`);
      const updateData: any = { ...data };
      if (data.dueDate) {
        updateData.dueDate = Timestamp.fromDate(data.dueDate);
      }
      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const taskRef = doc(this.firestore, `users/${userId}/tasks/${taskId}`);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async toggleTaskComplete(taskId: string, completed: boolean): Promise<void> {
    try {
      await this.updateTask(taskId, { completed });
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  }

  // ============================================
  // MEAL TRACKER
  // ============================================

  async addMealEntry(meal: Omit<MealEntry, 'id' | 'userId'> & { date: Date }): Promise<string> {
    try {
      const userId = await this.getUserId();
      const mealsRef = collection(this.firestore, `users/${userId}/meals`);
      const mealData = {
        ...meal,
        userId,
        date: Timestamp.fromDate(meal.date)
      };
      const docRef = await addDoc(mealsRef, mealData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding meal entry:', error);
      throw error;
    }
  }

  async getMealEntries(limit: number = 30): Promise<MealEntry[]> {
    try {
      const userId = await this.getUserId();
      const mealsRef = collection(this.firestore, `users/${userId}/meals`);
      const q = query(mealsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limit).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          date: data['date']?.toDate() || new Date(),
          breakfast: data['breakfast'] || '',
          lunch: data['lunch'] || '',
          dinner: data['dinner'] || '',
          snacks: data['snacks'] || '',
          calories: data['calories'] || 0,
          notes: data['notes'] || ''
        } as MealEntry;
      });
    } catch (error) {
      console.error('Error getting meal entries:', error);
      throw error;
    }
  }

  async deleteMealEntry(entryId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const mealRef = doc(this.firestore, `users/${userId}/meals/${entryId}`);
      await deleteDoc(mealRef);
    } catch (error) {
      console.error('Error deleting meal entry:', error);
      throw error;
    }
  }

  // ============================================
  // MOOD TRACKER
  // ============================================

  async addMoodEntry(mood: Omit<MoodEntry, 'id' | 'userId'> & { date: Date }): Promise<string> {
    try {
      const userId = await this.getUserId();
      const moodRef = collection(this.firestore, `users/${userId}/mood`);
      const moodData = {
        ...mood,
        userId,
        date: Timestamp.fromDate(mood.date)
      };
      const docRef = await addDoc(moodRef, moodData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding mood entry:', error);
      throw error;
    }
  }

  async getMoodEntries(limit: number = 30): Promise<MoodEntry[]> {
    try {
      const userId = await this.getUserId();
      const moodRef = collection(this.firestore, `users/${userId}/mood`);
      const q = query(moodRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limit).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          date: data['date']?.toDate() || new Date(),
          rating: data['rating'] || 5,
          emotions: data['emotions'] || [],
          notes: data['notes'] || ''
        } as MoodEntry;
      });
    } catch (error) {
      console.error('Error getting mood entries:', error);
      throw error;
    }
  }

  async deleteMoodEntry(entryId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const moodRef = doc(this.firestore, `users/${userId}/mood/${entryId}`);
      await deleteDoc(moodRef);
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      throw error;
    }
  }

  // ============================================
  // CALENDAR
  // ============================================

  async addCalendarEntry(entry: Omit<CalendarEntry, 'id' | 'userId'> & { date: Date }): Promise<string> {
    try {
      const userId = await this.getUserId();
      const calendarRef = collection(this.firestore, `users/${userId}/calendar`);
      const entryData = {
        ...entry,
        userId,
        date: Timestamp.fromDate(entry.date)
      };
      const docRef = await addDoc(calendarRef, entryData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding calendar entry:', error);
      throw error;
    }
  }

  async getCalendarEntries(limit: number = 50): Promise<CalendarEntry[]> {
    try {
      const userId = await this.getUserId();
      const calendarRef = collection(this.firestore, `users/${userId}/calendar`);
      const q = query(calendarRef, orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.slice(0, limit).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          date: data['date']?.toDate() || new Date(),
          title: data['title'] || '',
          description: data['description'] || '',
          type: data['type'] || 'event',
          time: data['time'] || '12:00',
          completed: data['completed'] || false
        } as CalendarEntry;
      });
    } catch (error) {
      console.error('Error getting calendar entries:', error);
      throw error;
    }
  }

  async updateCalendarEntry(entryId: string, data: Partial<CalendarEntry>): Promise<void> {
    try {
      const userId = await this.getUserId();
      const entryRef = doc(this.firestore, `users/${userId}/calendar/${entryId}`);
      const updateData: any = { ...data };
      if (data.date) {
        updateData.date = Timestamp.fromDate(data.date);
      }
      await updateDoc(entryRef, updateData);
    } catch (error) {
      console.error('Error updating calendar entry:', error);
      throw error;
    }
  }

  async deleteCalendarEntry(entryId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const entryRef = doc(this.firestore, `users/${userId}/calendar/${entryId}`);
      await deleteDoc(entryRef);
    } catch (error) {
      console.error('Error deleting calendar entry:', error);
      throw error;
    }
  }

  async toggleCalendarComplete(entryId: string, completed: boolean): Promise<void> {
    try {
      await this.updateCalendarEntry(entryId, { completed });
    } catch (error) {
      console.error('Error toggling calendar entry:', error);
      throw error;
    }
  }

  // ============================================
  // FINANCE TRACKER
  // ============================================

  async addFinanceEntry(entry: Omit<FinanceEntry, 'id' | 'userId'> & { date: Date }): Promise<string> {
    try {
      const userId = await this.getUserId();
      const financeRef = collection(this.firestore, `users/${userId}/finance`);
      const entryData = {
        ...entry,
        userId,
        date: Timestamp.fromDate(entry.date)
      };
      const docRef = await addDoc(financeRef, entryData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding finance entry:', error);
      throw error;
    }
  }
  
  async getFinanceEntries(limit: number = 100): Promise<FinanceEntry[]> {
    try {
      const userId = await this.getUserId();
      const financeRef = collection(this.firestore, `users/${userId}/finance`);
      const q = query(financeRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.slice(0, limit).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          date: data['date']?.toDate() || new Date(),
          amount: data['amount'] || 0,
          category: data['category'] || '',
          type: data['type'] || 'expense',
          description: data['description'] || '',
          paymentMethod: data['paymentMethod'] || 'cash'
        } as FinanceEntry;
      });
    } catch (error) {
      console.error('Error getting finance entries:', error);
      throw error;
    }
  }
  
  async deleteFinanceEntry(entryId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const entryRef = doc(this.firestore, `users/${userId}/finance/${entryId}`);
      await deleteDoc(entryRef);
    } catch (error) {
      console.error('Error deleting finance entry:', error);
      throw error;
    }
  }

  // ============================================
  // GRATITUDE JOURNAL
  // ============================================

  async addGratitudeEntry(entry: Omit<GratitudeEntry, 'id' | 'userId'> & { date: Date }): Promise<string> {
    try {
      const userId = await this.getUserId();
      const gratitudeRef = collection(this.firestore, `users/${userId}/gratitude`);
      
      const entryData = {
        ...entry,
        userId,
        date: Timestamp.fromDate(entry.date)
      };
      
      const docRef = await addDoc(gratitudeRef, entryData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding gratitude entry:', error);
      throw error;
    }
  }

  async getGratitudeEntries(limit: number = 30): Promise<GratitudeEntry[]> {
    try {
      const userId = await this.getUserId();
      const gratitudeRef = collection(this.firestore, `users/${userId}/gratitude`);
      const q = query(gratitudeRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.slice(0, limit).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          date: data['date']?.toDate() || new Date(),
          items: data['items'] || [],
          highlight: data['highlight'] || '',
          mood: data['mood'] || 'good',
          color: data['color'] || '#10b981',
          streak: data['streak'] || 1
        } as GratitudeEntry;
      });
    } catch (error) {
      console.error('Error getting gratitude entries:', error);
      throw error;
    }
  }

  async deleteGratitudeEntry(entryId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      const entryRef = doc(this.firestore, `users/${userId}/gratitude/${entryId}`);
      await deleteDoc(entryRef);
    } catch (error) {
      console.error('Error deleting gratitude entry:', error);
      throw error;
    }
  }
  async addReflectionEntry(entry: Omit<ReflectionEntry, 'id' | 'userId'> & { date: Date }): Promise<string> {
  try {
    const userId = await this.getUserId();
    const reflectionRef = collection(this.firestore, `users/${userId}/reflections`);
    
    const entryData = {
      ...entry,
      userId,
      date: Timestamp.fromDate(entry.date)
    };
    
    const docRef = await addDoc(reflectionRef, entryData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding reflection entry:', error);
    throw error;
  }
}

async getReflectionEntries(limit: number = 30): Promise<ReflectionEntry[]> {
  try {
    const userId = await this.getUserId();
    const reflectionRef = collection(this.firestore, `users/${userId}/reflections`);
    const q = query(reflectionRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.slice(0, limit).map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data['userId'] || '',
        date: data['date']?.toDate() || new Date(),
        time: data['time'] || '12:00',
        rating: data['rating'] || 7,
        category: data['category'] || 'personal',
        mood: data['mood'] || 'good',
        whatLearned: data['whatLearned'] || '',
        whatToDoDifferently: data['whatToDoDifferently'] || '',
        goalsAchieved: data['goalsAchieved'] || false,
        goalsDescription: data['goalsDescription'] || '',
        wins: data['wins'] || [],
        lessons: data['lessons'] || [],
        freeThoughts: data['freeThoughts'] || '',
        color: data['color'] || '#3b82f6'
      } as ReflectionEntry;
    });
  } catch (error) {
    console.error('Error getting reflection entries:', error);
    throw error;
  }
}

async deleteReflectionEntry(entryId: string): Promise<void> {
  try {
    const userId = await this.getUserId();
    const entryRef = doc(this.firestore, `users/${userId}/reflections/${entryId}`);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error('Error deleting reflection entry:', error);
    throw error;
  }
}
}