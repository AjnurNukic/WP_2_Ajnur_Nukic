import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'dashboard/habit-tracker',
    loadComponent: () =>
      import('./features/dashboard/trackers/habit-tracker/habit-tracker.component')
        .then(m => m.HabitTrackerComponent)
  },
  {
    path: 'dashboard/sleep-tracker',
    loadComponent: () =>
      import('./features/dashboard/trackers/sleep-tracker/sleep-tracker.component')
        .then(m => m.SleepTrackerComponent)
  },
  {
    path: 'dashboard/study-planner',
    loadComponent: () =>
      import('./features/dashboard/trackers/study-planner/study-planner.component')
        .then(m => m.StudyPlannerComponent)
  },
  {
    path: 'dashboard/fitness-planner',
    loadComponent: () =>
      import('./features/dashboard/trackers/fitness-planner/fitness-planner.component')
        .then(m => m.FitnessPlannerComponent)
  },
  {
    path: 'dashboard/task-planner',
    loadComponent: () =>
      import('./features/dashboard/trackers/task-planner/task-planner.component')
        .then(m => m.TaskPlannerComponent)
  },
  {
    path: 'dashboard/meal-planner',
    loadComponent: () =>
      import('./features/dashboard/trackers/meal-planner/meal-planner.component')
        .then(m => m.MealPlannerComponent)
  },
  {
    path: 'dashboard/mood-tracker',
    loadComponent: () =>
      import('./features/dashboard/trackers/mood-tracker/mood-tracker.component')
        .then(m => m.MoodTrackerComponent)
  },
  {
    path: 'dashboard/calendar',
    loadComponent: () =>
      import('./features/dashboard/trackers/calendar-tracker/calendar-tracker.component')
        .then(m => m.CalendarTrackerComponent)
  },
  {
    path: 'dashboard/finance-tracker',
    loadComponent: () =>
      import('./features/dashboard/trackers/finance-tracker/finance-tracker.component')
        .then(m => m.FinanceTrackerComponent)
  },
  /* ✅ GRATITUDE JOURNAL */
  {
    path: 'dashboard/gratitude-journal',
    loadComponent: () =>
      import('./features/dashboard/trackers/gratitude-journal/gratitude-journal.component')
        .then(m => m.GratitudeJournalComponent)
  },
  {
  path: 'dashboard/daily-reflection',
  loadComponent: () =>
    import('./features/dashboard/trackers/daily-reflection/daily-reflection.component')
      .then(m => m.DailyReflectionComponent)
},

  {
    path: '**',
    redirectTo: '/login'
  }
];