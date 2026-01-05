import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Note {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-vision-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vision-board.component.html',
  styleUrls: ['./vision-board.component.scss']
})
export class VisionBoardComponent implements OnInit {
  notes: Note[] = [];
  showAddModal = false;
  newNoteText = '';
  selectedColor = '#fef08a'; 

  colors = [
    { name: 'Žuta', value: '#fef08a' },
    { name: 'Plava', value: '#bfdbfe' },
    { name: 'Zelena', value: '#bbf7d0' },
    { name: 'Roza', value: '#fbcfe8' },
    { name: 'Narandžasta', value: '#fed7aa' },
    { name: 'Ljubičasta', value: '#e9d5ff' }
  ];

  draggedNote: Note | null = null;
  offsetX = 0;
  offsetY = 0;

  ngOnInit(): void {
    this.loadNotes();
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.newNoteText = '';
    this.selectedColor = '#fef08a';
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newNoteText = '';
  }

  addNote(): void {
    if (!this.newNoteText.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      text: this.newNoteText.trim(),
      color: this.selectedColor,
      x: Math.random() * 60 + 10, 
      y: Math.random() * 60 + 10
    };

    this.notes.push(newNote);
    this.saveNotes();
    this.closeAddModal();
  }

  deleteNote(noteId: string): void {
    this.notes = this.notes.filter(n => n.id !== noteId);
    this.saveNotes();
  }

  clearBoard(): void {
    const confirmed = confirm('Da li ste sigurni da želite obrisati sve sa ploče?');
    if (confirmed) {
      this.notes = [];
      this.saveNotes();
    }
  }

  onNoteMouseDown(event: MouseEvent, note: Note): void {
    this.draggedNote = note;
    const noteElement = event.target as HTMLElement;
    const rect = noteElement.getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
  }

  onBoardMouseMove(event: MouseEvent): void {
    if (!this.draggedNote) return;

    const board = event.currentTarget as HTMLElement;
    const rect = board.getBoundingClientRect();
    
    const x = ((event.clientX - rect.left - this.offsetX) / rect.width) * 100;
    const y = ((event.clientY - rect.top - this.offsetY) / rect.height) * 100;

    this.draggedNote.x = Math.max(0, Math.min(90, x));
    this.draggedNote.y = Math.max(0, Math.min(90, y));
  }

  onBoardMouseUp(): void {
    if (this.draggedNote) {
      this.saveNotes();
      this.draggedNote = null;
    }
  }

  saveNotes(): void {
    localStorage.setItem('vision-board-notes', JSON.stringify(this.notes));
  }

  loadNotes(): void {
    const saved = localStorage.getItem('vision-board-notes');
    if (saved) {
      try {
        this.notes = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading vision board notes:', e);
      }
    }
  }
}