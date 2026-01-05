import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DailyData {
  date: string;
  sleep: number;
  study: number;
  mood: number;
  water: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('sleepChart') sleepChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('studyChart') studyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('activityChart') activityChartRef!: ElementRef<HTMLCanvasElement>;

  sleepChart: Chart | null = null;
  studyChart: Chart | null = null;
  activityChart: Chart | null = null;


  selectedPeriod: 'week' | 'month' | 'custom' = 'week';
  selectedDays = 7;
  

  startDate = '';
  endDate = '';


  dailyData: DailyData[] = [];
  

  aiInsights: string[] = [];


  avgSleep = 0;
  avgStudy = 0;
  avgMood = 0;
  avgWater = 0;

  ngOnInit(): void {
    this.generateMockData();
    this.setDefaultDates();
    this.calculateStatistics();
    this.generateAIInsights();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  setDefaultDates(): void {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = weekAgo.toISOString().split('T')[0];
  }

  generateMockData(): void {
    const today = new Date();
    this.dailyData = [];

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      this.dailyData.push({
        date: date.toISOString().split('T')[0],
        sleep: Math.floor(Math.random() * 4) + 5,
        study: Math.floor(Math.random() * 5) + 1,
        mood: Math.floor(Math.random() * 5) + 5,
        water: Math.floor(Math.random() * 6) + 3
      });
    }
  }

  getFilteredData(): DailyData[] {
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      return this.dailyData.filter(d => d.date >= this.startDate && d.date <= this.endDate);
    }
    return this.dailyData.slice(-this.selectedDays);
  }

  onPeriodChange(): void {
    if (this.selectedPeriod === 'week') {
      this.selectedDays = 7;
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      this.startDate = weekAgo.toISOString().split('T')[0];
      this.endDate = today.toISOString().split('T')[0];
    } else if (this.selectedPeriod === 'month') {
      this.selectedDays = 30;
      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      this.startDate = monthAgo.toISOString().split('T')[0];
      this.endDate = today.toISOString().split('T')[0];
    }
    this.calculateStatistics();
    this.generateAIInsights();
    this.updateCharts();
  }

  onDateRangeChange(): void {
    if (this.startDate && this.endDate) {
      if (this.startDate > this.endDate) {
        const temp = this.startDate;
        this.startDate = this.endDate;
        this.endDate = temp;
      }
      this.selectedPeriod = 'custom';
      this.calculateStatistics();
      this.generateAIInsights();
      this.updateCharts();
    }
  }

  calculateStatistics(): void {
    const data = this.getFilteredData();
    
    if (data.length === 0) {
      this.avgSleep = 0;
      this.avgStudy = 0;
      this.avgMood = 0;
      this.avgWater = 0;
      return;
    }
    
    this.avgSleep = data.reduce((sum, d) => sum + d.sleep, 0) / data.length;
    this.avgStudy = data.reduce((sum, d) => sum + d.study, 0) / data.length;
    this.avgMood = data.reduce((sum, d) => sum + d.mood, 0) / data.length;
    this.avgWater = data.reduce((sum, d) => sum + d.water, 0) / data.length;
  }

  generateAIInsights(): void {
    this.aiInsights = [];

    if (this.getFilteredData().length === 0) {
      this.aiInsights.push('📅 Nema podataka za izabrani period.');
      return;
    }

    if (this.avgSleep < 6 && this.avgStudy > 3) {
      this.aiInsights.push('⚠️ Učite naporno ali ne spavate dovoljno. Preporučujemo više odmora!');
    }

    if (this.avgSleep > 8 && this.avgMood > 7) {
      this.aiInsights.push('✨ Najproduktivniji ste kada ste dobro odmoreni. Nastavite tako!');
    }

    if (this.avgSleep < 6) {
      this.aiInsights.push('😴 Prosječno spavanje ispod 6 sati. Pokušajte spavati minimum 7-8 sati.');
    }

    if (this.avgSleep >= 7 && this.avgSleep <= 9) {
      this.aiInsights.push('✅ Odličan ritam spavanja! To je idealan broj sati.');
    }

    if (this.avgWater < 5) {
      this.aiInsights.push('💧 Povećajte unos vode! Preporučeno je minimum 6-8 čaša dnevno.');
    }

    if (this.avgWater >= 7) {
      this.aiInsights.push('💪 Odlična hidratacija! Nastavite unositi dovoljno vode.');
    }

    if (this.avgStudy > 4) {
      this.aiInsights.push('📚 Posvećujete dosta vremena učenju. Ne zaboravite na pauze!');
    }

    if (this.avgStudy < 2) {
      this.aiInsights.push('📖 Možda bi bilo dobro povećati vrijeme učenja za bolje rezultate.');
    }

    if (this.avgMood < 5) {
      this.aiInsights.push('😟 Raspoloženje je niže. Potražite aktivnosti koje vas čine sretnima.');
    }

    if (this.avgMood >= 8) {
      this.aiInsights.push('😊 Odlično raspoloženje! Nastavite sa pozitivnim navikama.');
    }

    if (this.avgSleep > 7 && this.avgStudy > 3 && this.avgMood > 7) {
      this.aiInsights.push('🌟 Savršena ravnoteža! Spavanje, učenje i raspoloženje su odlični.');
    }

    if (this.aiInsights.length === 0) {
      this.aiInsights.push('📈 Nastavite pratiti svoje navike za bolje uvide.');
    }
  }

  createCharts(): void {
    this.createSleepChart();
    this.createStudyChart();
    this.createActivityPieChart();
  }

  createSleepChart(): void {
    const data = this.getFilteredData();
    
    if (this.sleepChart) {
      this.sleepChart.destroy();
    }

    this.sleepChart = new Chart(this.sleepChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(d => new Date(d.date).toLocaleDateString('bs-BA', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Sati spavanja',
          data: data.map(d => d.sleep),
          backgroundColor: '#60a5fa',
          borderColor: '#3b82f6',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Sati spavanja',
            font: { size: 18, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 12,
            ticks: {
              stepSize: 2
            }
          }
        }
      }
    });
  }

  createStudyChart(): void {
    const data = this.getFilteredData();
    
    if (this.studyChart) {
      this.studyChart.destroy();
    }

    this.studyChart = new Chart(this.studyChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.map(d => new Date(d.date).toLocaleDateString('bs-BA', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Vrijeme učenja (sati)',
          data: data.map(d => d.study),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#f59e0b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Vrijeme učenja',
            font: { size: 18, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 8
          }
        }
      }
    });
  }

  createActivityPieChart(): void {
    const data = this.getFilteredData();
    
    const totalSleep = data.reduce((sum, d) => sum + d.sleep, 0);
    const totalStudy = data.reduce((sum, d) => sum + d.study, 0);
    const totalFree = data.length * 24 - totalSleep - totalStudy;

    if (this.activityChart) {
      this.activityChart.destroy();
    }

    this.activityChart = new Chart(this.activityChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Spavanje', 'Učenje', 'Slobodno vrijeme'],
        datasets: [{
          data: [totalSleep, totalStudy, totalFree],
          backgroundColor: [
            '#60a5fa',
            '#f59e0b',
            '#34d399'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Raspodjela aktivnosti',
            font: { size: 18, weight: 'bold' }
          }
        }
      }
    });
  }

  updateCharts(): void {
    if (this.sleepChart && this.studyChart && this.activityChart) {
      this.createCharts();
    }
  }

  ngOnDestroy(): void {
    if (this.sleepChart) this.sleepChart.destroy();
    if (this.studyChart) this.studyChart.destroy();
    if (this.activityChart) this.activityChart.destroy();
  }
}