import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { StudyEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-study-planner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './study-planner.component.html',
  styleUrl: './study-planner.component.scss'
})
export class StudyPlannerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  studyEntries: StudyEntry[] = [];
  studyForm: FormGroup;
  isLoading = false;
  showForm = false;

  constructor() {
    this.studyForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      subject: ['', [Validators.required, Validators.minLength(2)]],
      topic: ['', Validators.required],
      hours: [1, [Validators.required, Validators.min(0.1), Validators.max(24)]],
      notes: ['']
    });
  }

  async ngOnInit() {
    await this.loadStudyEntries();
  }

  async loadStudyEntries() {
    this.isLoading = true;
    try {
      this.studyEntries = await this.firestoreService.getStudyEntries();
    } catch (error) {
      console.error('Greška pri učitavanju:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addStudyEntry() {
    if (this.studyForm.invalid) return;

    const { date, subject, topic, hours, notes } = this.studyForm.value;

    try {
      await this.firestoreService.addStudyEntry({
        date: new Date(date),
        subject,
        topic,
        hours: parseFloat(hours),
        notes
      });

      this.studyForm.reset({
        date: new Date().toISOString().split('T')[0],
        subject: '',
        topic: '',
        hours: 1,
        notes: ''
      });
      this.showForm = false;
      await this.loadStudyEntries();
    } catch (error) {
      console.error('Greška pri dodavanju:', error);
    }
  }

  async deleteStudyEntry(entryId: string | undefined) {
    if (!entryId) return;
    
    if (confirm('Da li si siguran da želiš obrisati ovaj zapis?')) {
      try {
        await this.firestoreService.deleteStudyEntry(entryId);
        await this.loadStudyEntries();
      } catch (error) {
        console.error('Greška pri brisanju:', error);
      }
    }
  }

  getTotalHours(): number {
    return Math.round(this.studyEntries.reduce((sum, entry) => sum + entry.hours, 0) * 10) / 10;
  }

  getSubjectHours(subject: string): number {
    const filtered = this.studyEntries.filter(e => e.subject === subject);
    return Math.round(filtered.reduce((sum, entry) => sum + entry.hours, 0) * 10) / 10;
  }

  getUniqueSubjects(): string[] {
    return [...new Set(this.studyEntries.map(e => e.subject))];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('bs-BA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/trackers']);
  }
}