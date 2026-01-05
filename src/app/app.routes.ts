import { Routes } from '@angular/router';
import { TrackersListComponent } from './features/dashboard/trackers/trackers-list.component';
import { TrackerSettingsComponent } from './features/dashboard/tracker-settings/tracker-settings.component';
import { authGuard } from './core/guards/auth.guard';
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
  path: 'dashboard/water-intake', 
  loadComponent: () => import('./features/dashboard/trackers/water-intake/water-intake.component')
    .then(m => m.WaterIntakeComponent) 
},
{
  path: 'fun-zone',
  loadComponent: () =>
    import('./features/dashboard/student-fun-zone/student-fun-zone.component')
      .then(m => m.StudentFunZoneComponent)
},
{
  path: 'fun-zone/bingo',
  loadComponent: () =>
    import('./features/dashboard/student-fun-zone/bingo/bingo.component')
      .then(m => m.BingoComponent)
},
{
  path: 'fun-zone/quiz',
  loadComponent: () => import('./features/dashboard/student-fun-zone/kviz/quiz.component')
    .then(m => m.QuizComponent)
},
{
  path: 'fun-zone/whiteboard',
  loadComponent: () =>
    import('./features/dashboard/student-fun-zone/whiteboard/whiteboard.component')
      .then(m => m.WhiteboardComponent)
},
{
  path: 'fun-zone/kanban',
  loadComponent: () =>
    import('./features/dashboard/student-fun-zone/kanban/kanban.component')
      .then(m => m.KanbanComponent)
},
{
  path: 'fun-zone/vision-board',
  loadComponent: () =>
    import('./features/dashboard/student-fun-zone/vision-board/vision-board.component')
      .then(m => m.VisionBoardComponent)
},
{
  path: 'dashboard/statistics',
  loadComponent: () =>
    import('./features/dashboard/statistics/statistics.component')
      .then(m => m.StatisticsComponent)
},

{
  path: 'dashboard/trackers',
  component: TrackersListComponent,
  canActivate: [authGuard]
},
{
  path: 'dashboard/tracker-settings',
  component: TrackerSettingsComponent,
  canActivate: [authGuard]
},
  {
    path: '**',
    redirectTo: '/login'
  }
];