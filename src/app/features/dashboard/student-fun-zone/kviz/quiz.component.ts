import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuizQuestion, QuizResult } from '../../../../core/models/tracker.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  questions: QuizQuestion[] = [
    {
      id: 1,
      question: 'Šta je skraćenica HTML?',
      type: 'single',
      options: [
        { value: 'HyperText Markup Language', label: 'HyperText Markup Language' },
        { value: 'HighText Markdown Language', label: 'HighText Markdown Language' },
        { value: 'HyperText Makeup Language', label: 'HyperText Makeup Language' }
      ],
      correctAnswers: ['HyperText Markup Language']
    },
    {
      id: 2,
      question: 'Koje se oznake koriste za izradu popisa u HTML-u?',
      type: 'multiple',
      options: [
        { value: '<ul>', label: '<ul>' },
        { value: '<ol>', label: '<ol>' },
        { value: '<li>', label: '<li>' },
        { value: '<br>', label: '<br>' }
      ],
      correctAnswers: ['<ul>', '<ol>', '<li>']
    },
    {
      id: 3,
      question: 'Koja se oznaka koristi za umetanje slike?',
      type: 'single',
      options: [
        { value: '<image>', label: '<image>' },
        { value: '<img>', label: '<img>' },
        { value: '<src>', label: '<src>' }
      ],
      correctAnswers: ['<img>']
    },
    {
      id: 4,
      question: 'Koji od sljedećih su valjani HTML atributi?',
      type: 'multiple',
      options: [
        { value: 'href', label: 'href' },
        { value: 'src', label: 'src' },
        { value: 'bold', label: 'bold' },
        { value: 'alt', label: 'alt' }
      ],
      correctAnswers: ['href', 'src', 'alt']
    },
    {
      id: 5,
      question: 'Koji je ispravan način za stvaranje linkova u HTML-u?',
      type: 'single',
      options: [
        { value: '<a url="example.com">Click</a>', label: '<a url="example.com">Click</a>' },
        { value: '<a href="example.com">Click</a>', label: '<a href="example.com">Click</a>' },
        { value: '<link>Click</link>', label: '<link>Click</link>' }
      ],
      correctAnswers: ['<a href="example.com">Click</a>']
    }
  ];

  userAnswers: Map<number, string[]> = new Map();
  quizSubmitted = false;
  result: QuizResult | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.questions.forEach(q => {
      this.userAnswers.set(q.id, []);
    });
  }

  selectSingleAnswer(questionId: number, answer: string) {
    this.userAnswers.set(questionId, [answer]);
  }

  toggleMultipleAnswer(questionId: number, answer: string) {
    const current = this.userAnswers.get(questionId) || [];
    const index = current.indexOf(answer);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(answer);
    }
    
    this.userAnswers.set(questionId, current);
  }

  isAnswerSelected(questionId: number, answer: string): boolean {
    const answers = this.userAnswers.get(questionId) || [];
    return answers.includes(answer);
  }

  submitQuiz() {
    let correctCount = 0;
    
    this.questions.forEach(question => {
      const userAnswer = this.userAnswers.get(question.id) || [];
      const correctAnswer = question.correctAnswers;
      const userSorted = [...userAnswer].sort();
      const correctSorted = [...correctAnswer].sort();
      
      if (JSON.stringify(userSorted) === JSON.stringify(correctSorted)) {
        correctCount++;
      }
    });
    
    const percentage = Math.round((correctCount / this.questions.length) * 100);
    
    this.result = {
      score: correctCount,
      total: this.questions.length,
      percentage: percentage,
      passed: percentage >= 60 
    };
    
    this.quizSubmitted = true;
  }


  isAnswerCorrect(questionId: number): boolean {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return false;
    
    const userAnswer = this.userAnswers.get(questionId) || [];
    const correctAnswer = question.correctAnswers;
    
    const userSorted = [...userAnswer].sort();
    const correctSorted = [...correctAnswer].sort();
    
    return JSON.stringify(userSorted) === JSON.stringify(correctSorted);
  }


  resetQuiz() {
    this.userAnswers.clear();
    this.questions.forEach(q => {
      this.userAnswers.set(q.id, []);
    });
    this.quizSubmitted = false;
    this.result = null;
  }
}
 