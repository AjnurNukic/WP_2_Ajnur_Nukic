import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { TaskEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-task-planner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-planner.component.html',
  styleUrl: './task-planner.component.scss'
})
export class TaskPlannerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  tasks: TaskEntry[] = [];
  taskForm: FormGroup;
  isLoading = false;
  showForm = false;
  filterStatus: 'all' | 'active' | 'completed' = 'all';

  constructor() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dueDate: [tomorrow.toISOString().split('T')[0], Validators.required],
      priority: ['medium', Validators.required],
      category: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadTasks();
  }

  async loadTasks() {
    this.isLoading = true;
    try {
      this.tasks = await this.firestoreService.getTasks();
    } catch (error) {
      console.error('Greška:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addTask() {
    if (this.taskForm.invalid) return;

    const { title, description, dueDate, priority, category } = this.taskForm.value;

    try {
      await this.firestoreService.addTask({
        title,
        description,
        dueDate: new Date(dueDate),
        priority,
        category,
        completed: false,
        createdAt: new Date()
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      this.taskForm.reset({
        title: '',
        description: '',
        dueDate: tomorrow.toISOString().split('T')[0],
        priority: 'medium',
        category: ''
      });
      this.showForm = false;
      await this.loadTasks();
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  async toggleComplete(task: TaskEntry) {
    if (!task.id) return;
    try {
      await this.firestoreService.toggleTaskComplete(task.id, !task.completed);
      await this.loadTasks();
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  async deleteTask(taskId: string | undefined) {
    if (!taskId) return;
    if (confirm('Obrisati task?')) {
      try {
        await this.firestoreService.deleteTask(taskId);
        await this.loadTasks();
      } catch (error) {
        console.error('Greška:', error);
      }
    }
  }

  get filteredTasks(): TaskEntry[] {
    if (this.filterStatus === 'all') return this.tasks;
    if (this.filterStatus === 'active') return this.tasks.filter(t => !t.completed);
    return this.tasks.filter(t => t.completed);
  }

  getCompletedCount(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  getPendingCount(): number {
    return this.tasks.filter(t => !t.completed).length;
  }

  getPriorityIcon(priority: string): string {
    const icons: any = { low: '🟢', medium: '🟡', high: '🔴' };
    return icons[priority] || '⚪';
  }

  getPriorityName(priority: string): string {
    const names: any = { low: 'Nizak', medium: 'Srednji', high: 'Visok' };
    return names[priority] || priority;
  }

  isOverdue(task: TaskEntry): boolean {
    if (task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('bs-BA', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/trackers']);
  }
}