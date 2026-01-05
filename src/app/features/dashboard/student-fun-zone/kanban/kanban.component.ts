import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Task {
  id: string;
  title: string;
  description?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {
  columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: []
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      tasks: []
    },
    {
      id: 'done',
      title: 'Done',
      tasks: []
    }
  ];

  newTaskTitle = '';
  newTaskDescription = '';
  showAddTaskModal = false;
  selectedColumnId = '';

  draggedTask: Task | null = null;
  draggedFromColumnId = '';

  ngOnInit(): void {
    this.loadKanban();
  }

  openAddTaskModal(columnId: string): void {
    this.selectedColumnId = columnId;
    this.showAddTaskModal = true;
    this.newTaskTitle = '';
    this.newTaskDescription = '';
  }

  closeAddTaskModal(): void {
    this.showAddTaskModal = false;
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.selectedColumnId = '';
  }

  addTask(): void {
    if (!this.newTaskTitle.trim()) return;

    const column = this.columns.find(c => c.id === this.selectedColumnId);
    if (!column) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: this.newTaskTitle.trim(),
      description: this.newTaskDescription.trim()
    };

    column.tasks.push(newTask);
    this.saveKanban();
    this.closeAddTaskModal();
  }

  deleteTask(columnId: string, taskId: string): void {
    const column = this.columns.find(c => c.id === columnId);
    if (!column) return;

    const confirmed = confirm('Da li ste sigurni da želite obrisati ovaj zadatak?');
    if (confirmed) {
      column.tasks = column.tasks.filter(t => t.id !== taskId);
      this.saveKanban();
    }
  }

  onDragStart(task: Task, columnId: string): void {
    this.draggedTask = task;
    this.draggedFromColumnId = columnId;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetColumnId: string): void {
    event.preventDefault();

    if (!this.draggedTask || !this.draggedFromColumnId) return;


    const fromColumn = this.columns.find(c => c.id === this.draggedFromColumnId);
    if (fromColumn) {
      fromColumn.tasks = fromColumn.tasks.filter(t => t.id !== this.draggedTask!.id);
    }


    const toColumn = this.columns.find(c => c.id === targetColumnId);
    if (toColumn) {
      toColumn.tasks.push(this.draggedTask);
    }

    this.saveKanban();
    this.draggedTask = null;
    this.draggedFromColumnId = '';
  }

  clearColumn(columnId: string): void {
    const column = this.columns.find(c => c.id === columnId);
    if (!column) return;

    const confirmed = confirm(`Da li ste sigurni da želite obrisati sve zadatke iz "${column.title}"?`);
    if (confirmed) {
      column.tasks = [];
      this.saveKanban();
    }
  }

  saveKanban(): void {
    localStorage.setItem('kanban-data', JSON.stringify(this.columns));
  }

  loadKanban(): void {
    const saved = localStorage.getItem('kanban-data');
    if (saved) {
      try {
        this.columns = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading kanban data:', e);
      }
    }
  }
}