import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface FunZoneCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-student-fun-zone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-fun-zone.component.html',
  styleUrls: ['./student-fun-zone.component.scss']
})
export class StudentFunZoneComponent {
  funZones: FunZoneCard[] = [
    {
      id: 'bingo',
      title: 'Bingo',
      icon: '📝',
      description: 'Igraj bingo sa osobinama ljudi',
      route: '/fun-zone/bingo',
      color: '#ef4444'
    },
    {
      id: 'quiz',
      title: 'Kviz',
      icon: '❓',
      description: 'Testiraj svoje znanje',
      route: '/fun-zone/quiz',
      color: '#f59e0b'
    },
    {
      id: 'whiteboard',
      title: 'Interaktivni Whiteboard',
      icon: '🖍️',
      description: 'Crtaj i piši slobodno',
      route: '/fun-zone/whiteboard',
      color: '#3b82f6'
    },
    {
      id: 'kanban',
      title: 'Kanban Ploča',
      icon: '📋',
      description: 'Organizuj zadatke',
      route: '/fun-zone/kanban',
      color: '#8b5cf6'
    },
    {
      id: 'vision',
      title: 'Vision Board',
      icon: '🎯',
      description: 'Kreiraj viziju budućnosti',
      route: '/fun-zone/vision-board',
      color: '#ec4899'
    }
    
  ];

  constructor(private router: Router) {}

  goToFunZone(route: string): void {
    this.router.navigate([route]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}