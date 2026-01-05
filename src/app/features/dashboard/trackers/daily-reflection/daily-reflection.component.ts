import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { ReflectionEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-daily-reflection',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './daily-reflection.component.html',
  styleUrls: ['./daily-reflection.component.scss']
})
export class DailyReflectionComponent implements OnInit {
  reflectionForm!: FormGroup;
  reflectionEntries: ReflectionEntry[] = [];
  showForm = false;
  isLoading = false;
  selectedColor = '#3b82f6';

  categories = [
    { value: 'work', label: 'Posao', icon: '💼', color: '#3b82f6' },
    { value: 'personal', label: 'Lično', icon: '🧘', color: '#8b5cf6' },
    { value: 'health', label: 'Zdravlje', icon: '💪', color: '#10b981' },
    { value: 'learning', label: 'Učenje', icon: '📚', color: '#f59e0b' },
    { value: 'relationships', label: 'Odnosi', icon: '❤️', color: '#ec4899' }
  ];

  colors = [
    { name: 'Plava', value: '#3b82f6', emoji: '💙' },
    { name: 'Ljubičasta', value: '#8b5cf6', emoji: '💜' },
    { name: 'Zelena', value: '#10b981', emoji: '💚' },
    { name: 'Žuta', value: '#f59e0b', emoji: '💛' },
    { name: 'Roza', value: '#ec4899', emoji: '💗' },
    { name: 'Crvena', value: '#ef4444', emoji: '❤️' },
    { name: 'Tirkizna', value: '#06b6d4', emoji: '🩵' },
    { name: 'Narandžasta', value: '#f97316', emoji: '🧡' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadReflectionEntries();
  }

  initForm(): void {
    this.reflectionForm = this.fb.group({
      date: [this.getTodayDate(), Validators.required],
      time: [this.getCurrentTime(), Validators.required],
      rating: [7, [Validators.required, Validators.min(1), Validators.max(10)]],
      category: ['personal', Validators.required],
      mood: ['good', Validators.required],
      

      whatLearned: ['', Validators.required],
      whatToDoDifferently: ['', Validators.required],
      

      goalsAchieved: [false],
      goalsDescription: [''],
      

      wins: this.fb.array([this.fb.control('', Validators.required)]),
      lessons: this.fb.array([this.fb.control('', Validators.required)]),
      

      freeThoughts: ['', Validators.required]
    });
  }

  get wins(): FormArray {
    return this.reflectionForm.get('wins') as FormArray;
  }

  get lessons(): FormArray {
    return this.reflectionForm.get('lessons') as FormArray;
  }

  addWin(): void {
    if (this.wins.length < 5) {
      this.wins.push(this.fb.control('', Validators.required));
    }
  }

  removeWin(index: number): void {
    if (this.wins.length > 1) {
      this.wins.removeAt(index);
    }
  }

  addLesson(): void {
    if (this.lessons.length < 5) {
      this.lessons.push(this.fb.control('', Validators.required));
    }
  }

  removeLesson(index: number): void {
    if (this.lessons.length > 1) {
      this.lessons.removeAt(index);
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  }

  async loadReflectionEntries(): Promise<void> {
    this.isLoading = true;
    try {
      this.reflectionEntries = await this.firestoreService.getReflectionEntries(30);
    } catch (error) {
      console.error('Error loading reflection entries:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addReflectionEntry(): Promise<void> {
    if (this.reflectionForm.invalid) {
      alert('Molimo popunite sva obavezna polja');
      return;
    }

    try {
      const formValue = this.reflectionForm.value;
      const wins = formValue.wins.filter((win: string) => win.trim() !== '');
      const lessons = formValue.lessons.filter((lesson: string) => lesson.trim() !== '');

      if (wins.length === 0) {
        alert('Molimo dodajte barem jednu pobedu');
        return;
      }

      if (lessons.length === 0) {
        alert('Molimo dodajte barem jednu lekciju');
        return;
      }

      const entry: Omit<ReflectionEntry, 'id' | 'userId'> = {
        date: new Date(formValue.date),
        time: formValue.time,
        rating: formValue.rating,
        category: formValue.category,
        mood: formValue.mood,
        whatLearned: formValue.whatLearned,
        whatToDoDifferently: formValue.whatToDoDifferently,
        goalsAchieved: formValue.goalsAchieved,
        goalsDescription: formValue.goalsDescription,
        wins: wins,
        lessons: lessons,
        freeThoughts: formValue.freeThoughts,
        color: this.selectedColor
      };

      await this.firestoreService.addReflectionEntry(entry);
      await this.loadReflectionEntries();
      this.resetForm();
      this.showForm = false;
    } catch (error) {
      console.error('Error adding reflection entry:', error);
      alert('Greška pri dodavanju refleksije');
    }
  }

  async deleteReflectionEntry(entryId: string | undefined): Promise<void> {
    if (!entryId) return;

    if (confirm('Da li ste sigurni da želite obrisati ovu refleksiju?')) {
      try {
        await this.firestoreService.deleteReflectionEntry(entryId);
        await this.loadReflectionEntries();
      } catch (error) {
        console.error('Error deleting reflection entry:', error);
        alert('Greška pri brisanju refleksije');
      }
    }
  }

  resetForm(): void {
    this.reflectionForm.reset({
      date: this.getTodayDate(),
      time: this.getCurrentTime(),
      rating: 7,
      category: 'personal',
      mood: 'good',
      goalsAchieved: false
    });
    this.wins.clear();
    this.wins.push(this.fb.control('', Validators.required));
    this.lessons.clear();
    this.lessons.push(this.fb.control('', Validators.required));
    this.selectedColor = '#3b82f6';
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

  getCategoryInfo(category: string) {
    return this.categories.find(cat => cat.value === category) || this.categories[0];
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

  getAverageRating(): number {
    if (this.reflectionEntries.length === 0) return 0;
    const sum = this.reflectionEntries.reduce((acc, entry) => acc + entry.rating, 0);
    return Math.round((sum / this.reflectionEntries.length) * 10) / 10;
  }

  getGoalsAchievedCount(): number {
    return this.reflectionEntries.filter(entry => entry.goalsAchieved).length;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/trackers']);
  }
}