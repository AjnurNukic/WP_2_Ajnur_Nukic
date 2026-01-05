import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TrackerCard } from '../../core/models/tracker.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  userName: string = 'Korisnik';
  

  trackers: TrackerCard[] = [
    {
      id: 'habit',
      title: 'Habit Tracker',
      icon: '✅',
      description: 'Prati dnevne navike i serije',
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

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user.email) {
      this.userName = user.email.split('@')[0];
    }
    
 
    this.loadTrackerPreferences();
  }

  loadTrackerPreferences() {
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

  get enabledTrackers(): TrackerCard[] {
    return this.trackers.filter(t => t.enabled);
  }

  get enabledTrackersCount(): number {
    return this.enabledTrackers.length;
  }

  get totalTrackersCount(): number {
    return this.trackers.length;
  }

  logout() {
    this.authService.logout();
  }

  goToTrackers() {
    this.router.navigate(['/dashboard/trackers']);
  }

  goToTrackerSettings() {
    this.router.navigate(['/dashboard/tracker-settings']);
  }

  goToFunZone() {
    this.router.navigate(['/fun-zone']);
  }

  goToStatistics() {
    this.router.navigate(['/dashboard/statistics']);
  }

  goToTracker(route: string) {
    this.router.navigate([route]);
  }
}