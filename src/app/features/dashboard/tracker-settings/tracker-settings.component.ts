import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrackerCard } from '../../../core/models/tracker.model';

@Component({
  selector: 'app-tracker-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracker-settings.component.html',
  styleUrl: './tracker-settings.component.scss'
})
export class TrackerSettingsComponent implements OnInit {
  private router = inject(Router);

  trackers: TrackerCard[] = [
    {
      id: 'habit',
      title: 'Habit Tracker',
      icon: '✅',
      description: 'Prati dnevne navike',
      route: '/dashboard/habit-tracker',
      color: '#10b981',
      enabled: true
    },
    {
      id: 'sleep',
      title: 'Sleep Tracker',
      icon: '😴',
      description: 'Evidentiraj sate spavanja',
      route: '/dashboard/sleep-tracker',
      color: '#6366f1',
      enabled: true
    },
    {
      id: 'study',
      title: 'Study Planner',
      icon: '📚',
      description: 'Organizuj učenje',
      route: '/dashboard/study-planner',
      color: '#8b5cf6',
      enabled: true
    },
    {
      id: 'fitness',
      title: 'Fitness Planner',
      icon: '💪',
      description: 'Treniraj redovno',
      route: '/dashboard/fitness-planner',
      color: '#f59e0b',
      enabled: true
    },
    {
      id: 'task',
      title: 'Task Planner',
      icon: '📋',
      description: 'Upravljaj zadacima',
      route: '/dashboard/task-planner',
      color: '#ef4444',
      enabled: true
    },
    {
      id: 'meal',
      title: 'Meal Planner',
      icon: '🍽️',
      description: 'Planiraj obroke',
      route: '/dashboard/meal-planner',
      color: '#ec4899',
      enabled: true
    },
    {
      id: 'mood',
      title: 'Mood Tracker',
      icon: '😊',
      description: 'Prati raspoloženje',
      route: '/dashboard/mood-tracker',
      color: '#06b6d4',
      enabled: true
    },
    {
      id: 'calendar',
      title: 'Calendar',
      icon: '📅',
      description: 'Pregled aktivnosti',
      route: '/dashboard/calendar',
      color: '#14b8a6',
      enabled: true
    },
    {
      id: 'finance',
      title: 'Finance Tracker',
      icon: '💰',
      description: 'Troškovi i prihodi',
      route: '/dashboard/finance-tracker',
      color: '#84cc16',
      enabled: true
    },
    {
      id: 'gratitude',
      title: 'Gratitude Journal',
      icon: '🙏',
      description: 'Dnevnik zahvalnosti',
      route: '/dashboard/gratitude-journal',
      color: '#a855f7',
      enabled: true
    },
    {
      id: 'reflection',
      title: 'Daily Reflection',
      icon: '📝',
      description: 'Dnevna razmišljanja',
      route: '/dashboard/daily-reflection',
      color: '#3b82f6',
      enabled: true
    },
    {
      id: 'water',
      title: 'Water Intake',
      icon: '💧',
      description: 'Prati unos vode',
      route: '/dashboard/water-intake',
      color: '#0ea5e9',
      enabled: true
    }
  ];

  enabledCount = 0;
  totalCount = 0;
  hasChanges = false;
  private originalState: string = '';

  ngOnInit() {
    this.loadPreferences();
    this.updateCount();
    this.originalState = JSON.stringify(this.trackers.map(t => ({ id: t.id, enabled: t.enabled })));
  }

  loadPreferences() {
    const saved = localStorage.getItem('trackerPreferences');
    if (saved) {
      const preferences = JSON.parse(saved);
      this.trackers.forEach(tracker => {
        if (preferences[tracker.id] !== undefined) {
          tracker.enabled = preferences[tracker.id];
        }
      });
    }
  }

  savePreferences() {
    const preferences: any = {};
    this.trackers.forEach(tracker => {
      preferences[tracker.id] = tracker.enabled;
    });
    
    localStorage.setItem('trackerPreferences', JSON.stringify(preferences));
    this.hasChanges = false;
    this.originalState = JSON.stringify(this.trackers.map(t => ({ id: t.id, enabled: t.enabled })));
    
    alert('✅ Postavke sačuvane!');
  }

  updateCount() {
    this.enabledCount = this.trackers.filter(t => t.enabled).length;
    this.totalCount = this.trackers.length;
    

    const currentState = JSON.stringify(this.trackers.map(t => ({ id: t.id, enabled: t.enabled })));
    this.hasChanges = currentState !== this.originalState;
  }

  enableAll() {
    this.trackers.forEach(tracker => tracker.enabled = true);
    this.updateCount();
  }

  disableAll() {
    this.trackers.forEach(tracker => tracker.enabled = false);
    this.updateCount();
  }

  goBack() {
    if (this.hasChanges) {
      const confirm = window.confirm('Imaš nesačuvane promjene. Želiš li izaći bez čuvanja?');
      if (!confirm) return;
    }
    this.router.navigate(['/dashboard']);
  }
}