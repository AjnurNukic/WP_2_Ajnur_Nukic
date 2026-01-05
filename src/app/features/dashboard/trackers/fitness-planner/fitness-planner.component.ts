import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { FitnessEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-fitness-planner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fitness-planner.component.html',
  styleUrl: './fitness-planner.component.scss'
})
export class FitnessPlannerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  fitnessEntries: FitnessEntry[] = [];
  fitnessForm: FormGroup;
  isLoading = false;
  showForm = false;

  constructor() {
    this.fitnessForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      exercise: ['', [Validators.required, Validators.minLength(2)]],
      duration: [30, [Validators.required, Validators.min(1)]],
      calories: [0, [Validators.min(0)]],
      type: ['cardio', Validators.required],
      notes: ['']
    });
  }

  async ngOnInit() {
    await this.loadFitnessEntries();
  }

  async loadFitnessEntries() {
    this.isLoading = true;
    try {
      this.fitnessEntries = await this.firestoreService.getFitnessEntries();
    } catch (error) {
      console.error('Greška:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addFitnessEntry() {
    if (this.fitnessForm.invalid) return;

    const { date, exercise, duration, calories, type, notes } = this.fitnessForm.value;

    try {
      await this.firestoreService.addFitnessEntry({
        date: new Date(date),
        exercise,
        duration: parseInt(duration),
        calories: parseInt(calories),
        type,
        notes
      });

      this.fitnessForm.reset({
        date: new Date().toISOString().split('T')[0],
        exercise: '',
        duration: 30,
        calories: 0,
        type: 'cardio',
        notes: ''
      });
      this.showForm = false;
      await this.loadFitnessEntries();
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  async deleteFitnessEntry(entryId: string | undefined) {
    if (!entryId) return;
    
    if (confirm('Obrisati ovaj zapis?')) {
      try {
        await this.firestoreService.deleteFitnessEntry(entryId);
        await this.loadFitnessEntries();
      } catch (error) {
        console.error('Greška:', error);
      }
    }
  }

  getTotalMinutes(): number {
    return this.fitnessEntries.reduce((sum, e) => sum + e.duration, 0);
  }

  getTotalCalories(): number {
    return this.fitnessEntries.reduce((sum, e) => sum + e.calories, 0);
  }

  getTypeIcon(type: string): string {
    const icons: any = {
      cardio: '🏃',
      strength: '🏋️',
      flexibility: '🧘',
      sports: '⚽'
    };
    return icons[type] || '💪';
  }

  getTypeName(type: string): string {
    const names: any = {
      cardio: 'Kardio',
      strength: 'Snaga',
      flexibility: 'Fleksibilnost',
      sports: 'Sport'
    };
    return names[type] || type;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('bs-BA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/trackers']);
  }
}