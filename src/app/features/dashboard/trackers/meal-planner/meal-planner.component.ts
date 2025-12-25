import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { MealEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meal-planner.component.html',
  styleUrl: './meal-planner.component.scss'
})
export class MealPlannerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  mealEntries: MealEntry[] = [];
  mealForm: FormGroup;
  isLoading = false;
  showForm = false;

  constructor() {
    this.mealForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      breakfast: ['', Validators.required],
      lunch: ['', Validators.required],
      dinner: ['', Validators.required],
      snacks: [''],
      calories: [0, [Validators.min(0)]],
      notes: ['']
    });
  }

  async ngOnInit() {
    await this.loadMealEntries();
  }

  async loadMealEntries() {
    this.isLoading = true;
    try {
      this.mealEntries = await this.firestoreService.getMealEntries();
    } catch (error) {
      console.error('Greška:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addMealEntry() {
    if (this.mealForm.invalid) return;

    const { date, breakfast, lunch, dinner, snacks, calories, notes } = this.mealForm.value;

    try {
      await this.firestoreService.addMealEntry({
        date: new Date(date),
        breakfast,
        lunch,
        dinner,
        snacks,
        calories: parseInt(calories) || 0,
        notes
      });

      this.mealForm.reset({
        date: new Date().toISOString().split('T')[0],
        breakfast: '',
        lunch: '',
        dinner: '',
        snacks: '',
        calories: 0,
        notes: ''
      });
      this.showForm = false;
      await this.loadMealEntries();
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  async deleteMealEntry(entryId: string | undefined) {
    if (!entryId) return;
    if (confirm('Obrisati ovaj plan?')) {
      try {
        await this.firestoreService.deleteMealEntry(entryId);
        await this.loadMealEntries();
      } catch (error) {
        console.error('Greška:', error);
      }
    }
  }

  getTotalCalories(): number {
    return this.mealEntries.reduce((sum, e) => sum + e.calories, 0);
  }

  getAverageCalories(): number {
    if (this.mealEntries.length === 0) return 0;
    return Math.round(this.getTotalCalories() / this.mealEntries.length);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('bs-BA', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}