import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { GratitudeEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-gratitude-journal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gratitude-journal.component.html',
  styleUrl: './gratitude-journal.component.scss'
})
export class GratitudeJournalComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  gratitudeEntries: GratitudeEntry[] = [];
  gratitudeForm: FormGroup;
  isLoading = false;
  showForm = false;
  selectedColor = '#a855f7';

  colors = [
    { name: 'Ljubičasta', value: '#a855f7', emoji: '💜' },
    { name: 'Plava', value: '#3b82f6', emoji: '💙' },
    { name: 'Zelena', value: '#10b981', emoji: '💚' },
    { name: 'Žuta', value: '#f59e0b', emoji: '💛' },
    { name: 'Roza', value: '#ec4899', emoji: '💗' },
    { name: 'Crvena', value: '#ef4444', emoji: '❤️' }
  ];

  constructor() {
    this.gratitudeForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      items: this.fb.array([
        this.fb.control('', [Validators.required, Validators.minLength(3)]),
        this.fb.control('', [Validators.required, Validators.minLength(3)]),
        this.fb.control('', [Validators.required, Validators.minLength(3)])
      ]),
      highlight: ['', [Validators.required, Validators.minLength(5)]],
      mood: ['good', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadGratitudeEntries();
  }

  get items(): FormArray {
    return this.gratitudeForm.get('items') as FormArray;
  }

  addItem() {
    if (this.items.length < 10) {
      this.items.push(this.fb.control('', [Validators.required, Validators.minLength(3)]));
    }
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  async loadGratitudeEntries() {
    this.isLoading = true;
    try {
      this.gratitudeEntries = await this.firestoreService.getGratitudeEntries();
    } catch (error) {
      console.error('Greška:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addGratitudeEntry() {
    if (this.gratitudeForm.invalid) return;

    const { date, items, highlight, mood } = this.gratitudeForm.value;
    const filteredItems = items.filter((item: string) => item.trim() !== '');

    try {
      const streak = this.calculateStreak();
      
      await this.firestoreService.addGratitudeEntry({
        date: new Date(date),
        items: filteredItems,
        highlight,
        mood,
        color: this.selectedColor,
        streak
      });

      this.gratitudeForm.reset({
        date: new Date().toISOString().split('T')[0],
        items: ['', '', ''],
        highlight: '',
        mood: 'good'
      });
      
      // Reset items array
      while (this.items.length > 3) {
        this.items.removeAt(this.items.length - 1);
      }
      
      this.selectedColor = '#a855f7';
      this.showForm = false;
      await this.loadGratitudeEntries();
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  calculateStreak(): number {
    if (this.gratitudeEntries.length === 0) return 1;
    
    const sortedDates = this.gratitudeEntries
      .map(e => new Date(e.date).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 1;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const entryDate = new Date(sortedDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  async deleteGratitudeEntry(entryId: string | undefined) {
    if (!entryId) return;
    
    if (confirm('Obrisati ovaj zapis?')) {
      try {
        await this.firestoreService.deleteGratitudeEntry(entryId);
        await this.loadGratitudeEntries();
      } catch (error) {
        console.error('Greška:', error);
      }
    }
  }

  getCurrentStreak(): number {
    return this.calculateStreak();
  }

  getLongestStreak(): number {
    return Math.max(...this.gratitudeEntries.map(e => e.streak), 0);
  }

  getMoodEmoji(mood: string): string {
    const emojis: any = {
      amazing: '🤩',
      good: '😊',
      okay: '😐',
      rough: '😔'
    };
    return emojis[mood] || '😊';
  }

  getMoodName(mood: string): string {
    const names: any = {
      amazing: 'Nevjerovatno',
      good: 'Dobro',
      okay: 'Okej',
      rough: 'Teško'
    };
    return names[mood] || mood;
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