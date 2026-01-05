import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { MoodEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-mood-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mood-tracker.component.html',
  styleUrl: './mood-tracker.component.scss'
})
export class MoodTrackerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  moodEntries: MoodEntry[] = [];
  moodForm: FormGroup;
  isLoading = false;
  showForm = false;

  constructor() {
    this.moodForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      notes: ['']
    });
  }

  async ngOnInit() {
    await this.loadMoodEntries();
  }

  async loadMoodEntries() {
    this.isLoading = true;
    try {
      this.moodEntries = await this.firestoreService.getMoodEntries();
    } catch (error) {
      console.error('Greška:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addMoodEntry() {
    if (this.moodForm.invalid) return;

    const { date, rating, notes } = this.moodForm.value;

    try {
      await this.firestoreService.addMoodEntry({
        date: new Date(date),
        rating: parseInt(rating),
        emotions: [], 
        notes
      });

      this.moodForm.reset({
        date: new Date().toISOString().split('T')[0],
        rating: 5,
        notes: ''
      });
      this.showForm = false;
      await this.loadMoodEntries();
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  async deleteMoodEntry(entryId: string | undefined) {
    if (!entryId) return;
    if (confirm('Obrisati ovaj zapis?')) {
      try {
        await this.firestoreService.deleteMoodEntry(entryId);
        await this.loadMoodEntries();
      } catch (error) {
        console.error('Greška:', error);
      }
    }
  }

  getAverageRating(): number {
    if (this.moodEntries.length === 0) return 0;
    const sum = this.moodEntries.reduce((acc, e) => acc + e.rating, 0);
    return Math.round((sum / this.moodEntries.length) * 10) / 10;
  }

  getMoodEmoji(rating: number): string {
    if (rating >= 9) return '😄';
    if (rating >= 7) return '😊';
    if (rating >= 5) return '😐';
    if (rating >= 3) return '😔';
    return '😢';
  }

  getMoodColor(rating: number): string {
    if (rating >= 8) return '#10b981';
    if (rating >= 6) return '#3b82f6';
    if (rating >= 4) return '#f59e0b';
    return '#ef4444';
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
    this.router.navigate(['/dashboard/trackers']);
  }
}