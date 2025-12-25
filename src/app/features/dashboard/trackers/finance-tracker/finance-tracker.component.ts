import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../../core/services/firestore.service';
import { FinanceEntry } from '../../../../core/models/tracker.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-finance-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finance-tracker.component.html',
  styleUrl: './finance-tracker.component.scss'
})
export class FinanceTrackerComponent implements OnInit, AfterViewInit {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef;

  private firestoreService = inject(FirestoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  financeEntries: FinanceEntry[] = [];
  financeForm: FormGroup;
  isLoading = false;
  showForm = false;
  filterType: 'all' | 'income' | 'expense' = 'all';
  filterPeriod: 'week' | 'month' | 'year' | 'all' = 'month';

  categoryChart: Chart | null = null;
  trendChart: Chart | null = null;
  monthlyChart: Chart | null = null;

  expenseCategories = [
    'Hrana', 'Transport', 'Računi', 'Zabava', 'Zdravlje', 
    'Obrazovanje', 'Odjeća', 'Ostalo'
  ];

  incomeCategories = [
    'Plata', 'Freelance', 'Investicije', 'Poklon', 'Ostalo'
  ];

  constructor() {
    this.financeForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      type: ['expense', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      paymentMethod: ['cash', Validators.required]
    });

    // Update categories when type changes
    this.financeForm.get('type')?.valueChanges.subscribe(() => {
      this.financeForm.patchValue({ category: '' });
    });
  }

  async ngOnInit() {
    await this.loadFinanceEntries();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  async loadFinanceEntries() {
    this.isLoading = true;
    try {
      this.financeEntries = await this.firestoreService.getFinanceEntries();
      this.updateCharts();
    } catch (error) {
      console.error('Greška:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addFinanceEntry() {
    if (this.financeForm.invalid) return;

    const { date, type, amount, category, description, paymentMethod } = this.financeForm.value;

    try {
      await this.firestoreService.addFinanceEntry({
        date: new Date(date),
        type,
        amount: parseFloat(amount),
        category,
        description,
        paymentMethod
      });

      this.financeForm.reset({
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        amount: 0,
        category: '',
        description: '',
        paymentMethod: 'cash'
      });

      this.showForm = false;
      await this.loadFinanceEntries();
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  async deleteFinanceEntry(entryId: string | undefined) {
    if (!entryId) return;
    if (confirm('Obrisati transakciju?')) {
      try {
        await this.firestoreService.deleteFinanceEntry(entryId);
        await this.loadFinanceEntries();
      } catch (error) {
        console.error('Greška:', error);
      }
    }
  }

  get availableCategories(): string[] {
    const type = this.financeForm.get('type')?.value;
    return type === 'income' ? this.incomeCategories : this.expenseCategories;
  }

  get filteredEntries(): FinanceEntry[] {
    let filtered = this.financeEntries;

    // Filter by type
    if (this.filterType !== 'all') {
      filtered = filtered.filter(e => e.type === this.filterType);
    }

    // Filter by period
    const now = new Date();
    if (this.filterPeriod !== 'all') {
      filtered = filtered.filter(e => {
        const entryDate = new Date(e.date);
        const diffTime = now.getTime() - entryDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (this.filterPeriod === 'week') return diffDays <= 7;
        if (this.filterPeriod === 'month') return diffDays <= 30;
        if (this.filterPeriod === 'year') return diffDays <= 365;
        return true;
      });
    }

    return filtered;
  }

  getTotalIncome(): number {
    return this.filteredEntries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getTotalExpense(): number {
    return this.filteredEntries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }

  getCategoryData(): { labels: string[], data: number[], colors: string[] } {
    const categoryMap = new Map<string, number>();
    
    this.filteredEntries
      .filter(e => e.type === 'expense')
      .forEach(e => {
        const current = categoryMap.get(e.category) || 0;
        categoryMap.set(e.category, current + e.amount);
      });

    const labels = Array.from(categoryMap.keys());
    const data = Array.from(categoryMap.values());
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
      '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
    ];

    return { labels, data, colors };
  }

  getMonthlyData(): { labels: string[], income: number[], expense: number[] } {
    const monthMap = new Map<string, { income: number, expense: number }>();

    this.financeEntries.forEach(e => {
      const date = new Date(e.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { income: 0, expense: 0 });
      }

      const data = monthMap.get(monthKey)!;
      if (e.type === 'income') {
        data.income += e.amount;
      } else {
        data.expense += e.amount;
      }
    });

    const sorted = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);

    const labels = sorted.map(([key]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('bs-BA', { month: 'short', year: 'numeric' });
    });

    const income = sorted.map(([, data]) => data.income);
    const expense = sorted.map(([, data]) => data.expense);

    return { labels, income, expense };
  }

  createCharts() {
    this.createCategoryChart();
    this.createTrendChart();
    this.createMonthlyChart();
  }

  updateCharts() {
    if (this.categoryChart) this.categoryChart.destroy();
    if (this.trendChart) this.trendChart.destroy();
    if (this.monthlyChart) this.monthlyChart.destroy();
    
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  createCategoryChart() {
    if (!this.categoryChartRef) return;

    const { labels, data, colors } = this.getCategoryData();
    const ctx = this.categoryChartRef.nativeElement.getContext('2d');

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value.toFixed(2)} KM (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  createTrendChart() {
    if (!this.trendChartRef) return;

    const last30Days = this.financeEntries
      .filter(e => {
        const diffDays = (new Date().getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const labels = last30Days.map(e => new Date(e.date).toLocaleDateString('bs-BA', { day: 'numeric', month: 'short' }));
    const incomeData = last30Days.map(e => e.type === 'income' ? e.amount : 0);
    const expenseData = last30Days.map(e => e.type === 'expense' ? e.amount : 0);

    const ctx = this.trendChartRef.nativeElement.getContext('2d');

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Prihodi',
            data: incomeData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Rashodi',
            data: expenseData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createMonthlyChart() {
    if (!this.monthlyChartRef) return;

    const { labels, income, expense } = this.getMonthlyData();
    const ctx = this.monthlyChartRef.nativeElement.getContext('2d');

    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Prihodi',
            data: income,
            backgroundColor: '#10b981',
            borderRadius: 8
          },
          {
            label: 'Rashodi',
            data: expense,
            backgroundColor: '#ef4444',
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} KM`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('bs-BA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getTypeIcon(type: string): string {
    return type === 'income' ? '💰' : '💸';
  }

  getPaymentIcon(method: string): string {
    const icons: any = {
      cash: '💵',
      card: '💳',
      transfer: '🏦',
      other: '📱'
    };
    return icons[method] || '💵';
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}