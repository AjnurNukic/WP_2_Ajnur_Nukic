import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { HabitEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-habit-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './habit-tracker.component.html',
  styleUrl: './habit-tracker.component.scss'
})
export class HabitTrackerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  habits: HabitEntry[] = [];
  habitForm: FormGroup;
  isLoading = false;
  showForm = false;

  constructor() {
    this.habitForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      frequency: ['daily', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadHabits();
  }


  async loadHabits() {
    this.isLoading = true;
    try {
      this.habits = await this.firestoreService.getHabits();
    } catch (error) {
      console.error('Greška pri učitavanju navika:', error);
    } finally {
      this.isLoading = false;
    }
  }


  async addHabit() {
    if (this.habitForm.invalid) return;

    const { name, frequency } = this.habitForm.value;

    try {
      await this.firestoreService.addHabit({
        name,
        frequency,
        streak: 0,
        completedDates: [],
        createdAt: new Date()
      });

      this.habitForm.reset({ frequency: 'daily' });
      this.showForm = false;
      await this.loadHabits();
    } catch (error) {
      console.error('Greška pri dodavanju navike:', error);
    }
  }


  async toggleComplete(habit: HabitEntry) {
    if (!habit.id) return;

    try {
      await this.firestoreService.completeHabit(habit.id, habit);
      await this.loadHabits();
    } catch (error) {
      console.error('Greška pri ažuriranju navike:', error);
    }
  }


  async deleteHabit(habitId: string | undefined) {
    if (!habitId) return;
    
    if (confirm('Da li si siguran da želiš obrisati ovu naviku?')) {
      try {
        await this.firestoreService.deleteHabit(habitId);
        await this.loadHabits();
      } catch (error) {
        console.error('Greška pri brisanju navike:', error);
      }
    }
  }


  isCompletedToday(habit: HabitEntry): boolean {
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
  }


  goBack() {
    this.router.navigate(['/dashboard/trackers']);
  }
}