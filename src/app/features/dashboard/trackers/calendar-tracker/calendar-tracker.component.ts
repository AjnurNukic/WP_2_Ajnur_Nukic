import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { CalendarEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-calendar-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './calendar-tracker.component.html',
  styleUrl: './calendar-tracker.component.scss'
})
export class CalendarTrackerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  calendarEntries: CalendarEntry[] = [];
  calendarForm: FormGroup;
  isLoading = false;
  showForm = false;
  filterType: 'all' | 'event' | 'task' | 'reminder' | 'meeting' = 'all';
  currentMonth: Date = new Date();

  constructor() {
    this.calendarForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      time: ['12:00', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      type: ['event', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadCalendarEntries();
  }

  async loadCalendarEntries() {
    this.isLoading = true;
    try {
      this.calendarEntries = await this.firestoreService.getCalendarEntries();
    } catch (error) {
      console.error('Greška:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addCalendarEntry() {
    if (this.calendarForm.invalid) return;

    const { date, time, title, description, type } = this.calendarForm.value;

    try {
      await this.firestoreService.addCalendarEntry({
        date: new Date(date),
        time,
        title,
        description,
        type,
        completed: false
      });

      this.calendarForm.reset({
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        title: '',
        description: '',
        type: 'event'
      });
      this.showForm = false;
      await this.loadCalendarEntries();
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  async toggleComplete(entry: CalendarEntry) {
    if (!entry.id) return;
    try {
      await this.firestoreService.toggleCalendarComplete(entry.id, !entry.completed);
      await this.loadCalendarEntries();
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  async deleteCalendarEntry(entryId: string | undefined) {
    if (!entryId) return;
    if (confirm('Obrisati događaj?')) {
      try {
        await this.firestoreService.deleteCalendarEntry(entryId);
        await this.loadCalendarEntries();
      } catch (error) {
        console.error('Greška:', error);
      }
    }
  }

  get filteredEntries(): CalendarEntry[] {
    if (this.filterType === 'all') return this.calendarEntries;
    return this.calendarEntries.filter(e => e.type === this.filterType);
  }

  getUpcomingEntries(): CalendarEntry[] {
    const now = new Date();
    return this.calendarEntries.filter(e => new Date(e.date) >= now && !e.completed);
  }

  getCompletedCount(): number {
    return this.calendarEntries.filter(e => e.completed).length;
  }

  getTypeIcon(type: string): string {
    const icons: any = {
      event: '🎉',
      task: '✅',
      reminder: '⏰',
      meeting: '👥'
    };
    return icons[type] || '📅';
  }

  getTypeName(type: string): string {
    const names: any = {
      event: 'Događaj',
      task: 'Zadatak',
      reminder: 'Podsjetnik',
      meeting: 'Sastanak'
    };
    return names[type] || type;
  }

  getTypeColor(type: string): string {
    const colors: any = {
      event: '#8b5cf6',
      task: '#ef4444',
      reminder: '#f59e0b',
      meeting: '#3b82f6'
    };
    return colors[type] || '#6b7280';
  }

  isToday(date: Date): boolean {
    const today = new Date();
    const entryDate = new Date(date);
    return entryDate.toDateString() === today.toDateString();
  }

  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate < today;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('bs-BA', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  formatFullDate(date: Date): string {
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