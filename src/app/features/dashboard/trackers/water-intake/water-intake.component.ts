import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { WaterEntry } from '../../../../core/models/tracker.model';

@Component({
  selector: 'app-water-intake',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './water-intake.component.html',
  styleUrls: ['./water-intake.component.scss']
})
export class WaterIntakeComponent implements OnInit {
  waterForm!: FormGroup;
  waterEntries: WaterEntry[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.waterForm = this.fb.group({
      date: [this.getTodayDate(), Validators.required],
      glasses: [0, [Validators.required, Validators.min(0)]],
      goal: [8, [Validators.required, Validators.min(1)]]
    });
    this.loadEntries();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  async loadEntries(): Promise<void> {
    this.isLoading = true;
    try {
      this.waterEntries = await this.firestoreService.getWaterEntries();
    } catch (error) {
      console.error('Greška pri učitavanju:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addEntry(): Promise<void> {
    if (this.waterForm.invalid) return;

    try {
      const value = this.waterForm.value;
      const entry: Omit<WaterEntry, 'id' | 'userId'> = {
        date: new Date(value.date),
        glasses: value.glasses,
        goal: value.goal
      };
      await this.firestoreService.addWaterEntry(entry);
      await this.loadEntries();
      this.waterForm.patchValue({ glasses: 0 });
    } catch (error) {
      console.error('Greška pri dodavanju:', error);
    }
  }

  async deleteEntry(id: string | undefined): Promise<void> {
    if (!id || !confirm('Da li ste sigurni da želite obrisati ovaj unos?')) return;
    try {
      await this.firestoreService.deleteWaterEntry(id);
      await this.loadEntries();
    } catch (error) {
      console.error('Greška pri brisanju:', error);
    }
  }

  getProgress(entry: WaterEntry): number {
    if (!entry.goal || entry.goal === 0) return 0;
    return Math.min((entry.glasses / entry.goal) * 100, 100);
  }

  formatDate(date: any): string {

    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('sr-RS');
  }

  goBack(): void {
    this.router.navigate(['/dashboard/trackers']);
  }
}