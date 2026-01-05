import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { GratitudeEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-gratitude-journal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gratitude-journal.component.html',
  styleUrls: ['./gratitude-journal.component.scss']
})
export class GratitudeJournalComponent implements OnInit {
  gratitudeForm!: FormGroup;
  gratitudeEntries: GratitudeEntry[] = [];
  showForm = false;
  isLoading = false;
  selectedColor = '#10b981';

  colors = [
    { name: 'Zelena', value: '#10b981', emoji: '🌿' },
    { name: 'Plava', value: '#3b82f6', emoji: '💙' },
    { name: 'Ljubičasta', value: '#8b5cf6', emoji: '💜' },
    { name: 'Roza', value: '#ec4899', emoji: '💗' },
    { name: 'Žuta', value: '#f59e0b', emoji: '💛' },
    { name: 'Narandžasta', value: '#f97316', emoji: '🧡' },
    { name: 'Crvena', value: '#ef4444', emoji: '❤️' },
    { name: 'Tirkizna', value: '#06b6d4', emoji: '💚' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadGratitudeEntries();
  }

  initForm(): void {
    this.gratitudeForm = this.fb.group({
      date: [this.getTodayDate(), Validators.required],
      items: this.fb.array([this.fb.control('', Validators.required)]),
      highlight: ['', Validators.required],
      mood: ['good', Validators.required]
    });
  }

  get items(): FormArray {
    return this.gratitudeForm.get('items') as FormArray;
  }

  addItem(): void {
    if (this.items.length < 10) {
      this.items.push(this.fb.control('', Validators.required));
    }
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  async loadGratitudeEntries(): Promise<void> {
    this.isLoading = true;
    try {
      this.gratitudeEntries = await this.firestoreService.getGratitudeEntries(30);
      this.calculateStreaks();
    } catch (error) {
      console.error('Error loading gratitude entries:', error);
    } finally {
      this.isLoading = false;
    }
  }

  calculateStreaks(): void {
    if (this.gratitudeEntries.length === 0) return;

    const sortedEntries = [...this.gratitudeEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - currentStreak);
      expectedDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
        sortedEntries[i].streak = currentStreak;
      } else if (i === 0 && entryDate.getTime() < expectedDate.getTime()) {
        break;
      } else {
        sortedEntries[i].streak = 1;
      }
    }
  }

  getCurrentStreak(): number {
    if (this.gratitudeEntries.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedEntries = [...this.gratitudeEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const latestEntry = sortedEntries[0];
    const latestDate = new Date(latestEntry.date);
    latestDate.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (latestDate.getTime() !== today.getTime() && 
        latestDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let streak = 0;
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);
      expectedDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  getLongestStreak(): number {
    if (this.gratitudeEntries.length === 0) return 0;

    const sortedEntries = [...this.gratitudeEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(sortedEntries[i - 1].date);
      const currDate = new Date(sortedEntries[i].date);
      
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);

      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  async addGratitudeEntry(): Promise<void> {
    if (this.gratitudeForm.invalid) {
      alert('Molimo popunite sva polja');
      return;
    }

    try {
      const formValue = this.gratitudeForm.value;
      const items = formValue.items.filter((item: string) => item.trim() !== '');

      if (items.length === 0) {
        alert('Molimo dodajte barem jednu stavku zahvalnosti');
        return;
      }

      const entry: Omit<GratitudeEntry, 'id' | 'userId'> = {
        date: new Date(formValue.date),
        items: items,
        highlight: formValue.highlight,
        mood: formValue.mood,
        color: this.selectedColor,
        streak: 1
      };

      await this.firestoreService.addGratitudeEntry(entry);
      await this.loadGratitudeEntries();
      this.resetForm();
      this.showForm = false;
    } catch (error) {
      console.error('Error adding gratitude entry:', error);
      alert('Greška pri dodavanju zapisa');
    }
  }

  async deleteGratitudeEntry(entryId: string | undefined): Promise<void> {
    if (!entryId) return;

    if (confirm('Da li ste sigurni da želite obrisati ovaj zapis?')) {
      try {
        await this.firestoreService.deleteGratitudeEntry(entryId);
        await this.loadGratitudeEntries();
      } catch (error) {
        console.error('Error deleting gratitude entry:', error);
        alert('Greška pri brisanju zapisa');
      }
    }
  }

  resetForm(): void {
    this.gratitudeForm.reset({
      date: this.getTodayDate(),
      mood: 'good'
    });
    this.items.clear();
    this.items.push(this.fb.control('', Validators.required));
    this.selectedColor = '#10b981';
  }

  getMoodEmoji(mood: string): string {
    const moods: { [key: string]: string } = {
      'amazing': '🤩',
      'good': '😊',
      'okay': '😐',
      'rough': '😔'
    };
    return moods[mood] || '😊';
  }

  getMoodName(mood: string): string {
    const moods: { [key: string]: string } = {
      'amazing': 'Odlično',
      'good': 'Dobro',
      'okay': 'Okej',
      'rough': 'Teško'
    };
    return moods[mood] || 'Dobro';
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return d.toLocaleDateString('sr-Latn-RS', options);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/trackers']);
  }
}