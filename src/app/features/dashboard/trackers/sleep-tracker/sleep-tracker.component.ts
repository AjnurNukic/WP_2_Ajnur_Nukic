import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { SleepEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-sleep-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sleep-tracker.component.html',
  styleUrl: './sleep-tracker.component.scss'
})
export class SleepTrackerComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  sleepEntries: SleepEntry[] = [];
  sleepForm: FormGroup;
  isLoading = false;
  showForm = false;

  constructor() {
    this.sleepForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      hours: [7, [Validators.required, Validators.min(0), Validators.max(24)]],
      quality: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      notes: ['']
    });
  }

  async ngOnInit() {
    await this.loadSleepEntries();
  }

  /**
   * Učitaj sve sleep entries
   */
  async loadSleepEntries() {
    this.isLoading = true;
    try {
      this.sleepEntries = await this.firestoreService.getSleepEntries();
    } catch (error) {
      console.error('Greška pri učitavanju:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Dodaj sleep entry
   */
  async addSleepEntry() {
    if (this.sleepForm.invalid) return;

    const { date, hours, quality, notes } = this.sleepForm.value;

    try {
      await this.firestoreService.addSleepEntry({
        date: new Date(date),
        hours: parseFloat(hours),
        quality: parseInt(quality),
        notes: notes
      });

      this.sleepForm.reset({
        date: new Date().toISOString().split('T')[0],
        hours: 7,
        quality: 3,
        notes: ''
      });
      this.showForm = false;
      await this.loadSleepEntries();
    } catch (error) {
      console.error('Greška pri dodavanju:', error);
    }
  }

  /**
   * Obriši entry
   */
  async deleteSleepEntry(entryId: string | undefined) {
    if (!entryId) return;
    
    if (confirm('Da li si siguran da želiš obrisati ovaj zapis?')) {
      try {
        await this.firestoreService.deleteSleepEntry(entryId);
        await this.loadSleepEntries();
      } catch (error) {
        console.error('Greška pri brisanju:', error);
      }
    }
  }

  /**
   * Generiši zvjezdice za prikaz
   */
  getStars(quality: number): string {
    return '⭐'.repeat(quality) + '☆'.repeat(5 - quality);
  }

  /**
   * Prosjek sati spavanja
   */
  getAverageHours(): number {
    if (this.sleepEntries.length === 0) return 0;
    const total = this.sleepEntries.reduce((sum, entry) => sum + entry.hours, 0);
    return Math.round((total / this.sleepEntries.length) * 10) / 10;
  }

  /**
   * Prosjek kvalitete
   */
  getAverageQuality(): number {
    if (this.sleepEntries.length === 0) return 0;
    const total = this.sleepEntries.reduce((sum, entry) => sum + entry.quality, 0);
    return Math.round((total / this.sleepEntries.length) * 10) / 10;
  }

  /**
   * Format datuma
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('bs-BA', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  /**
   * Nazad na dashboard
   */
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}