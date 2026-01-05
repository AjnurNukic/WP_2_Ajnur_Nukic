import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bingo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bingo.component.html',
  styleUrls: ['./bingo.component.scss']
})
export class BingoComponent {
  bingoItems = [
    'Putovao je van zemlje.',
    'Letio je avionom.',
    'Ima vise od troje brace i sestara',
    'Ima pet kucnih ljubimaca',
    'Voli jesti kisele krastavce',
    'Igra kosarku',
    'Voli Disney-eve crtane filmove',
    'Voli crtati',
    'Voli HTML',
    'Zna roniti',
    'Omiljena boja je narandzasta',
    'Ne voli plazu',
    'Ima veci prosjek od 9.0',
    'Dobar je u matematici',
    'Nema kucne ljubimce',
    'Ne voli cokoladu',
    'Boji se pauka',
    'Voli peci kolacice',
    'Svira instrument',
    'Alergican je na macke ili pse',
    'Slavi rodjendan u oktobru',
    'Voli jesti sir',
    'Igra online igre',
    'Ne voli pizzu',
    'Voli pjevati'
  ];

  bingoCard: string[] = [];
  markedCells: boolean[] = [];

  constructor(private router: Router) {
    this.generateCard();
  }

  generateCard(): void {
    const shuffled = [...this.bingoItems].sort(() => Math.random() - 0.5);
    this.bingoCard = shuffled.slice(0, 25);
    this.bingoCard[12] = 'SLOBODAN PROSTOR 🌟';
    this.markedCells = new Array(25).fill(false);
    this.markedCells[12] = true;
  }

  toggleCell(index: number): void {
    if (index === 12) return;
    this.markedCells[index] = !this.markedCells[index];
    this.checkBingo();
  }

  checkBingo(): boolean {
    for (let i = 0; i < 5; i++) {
      if (this.markedCells.slice(i * 5, i * 5 + 5).every(cell => cell)) {
        this.showBingo();
        return true;
      }
    }

    for (let i = 0; i < 5; i++) {
      if ([0, 1, 2, 3, 4].every(row => this.markedCells[row * 5 + i])) {
        this.showBingo();
        return true;
      }
    }

    if ([0, 6, 12, 18, 24].every(i => this.markedCells[i])) {
      this.showBingo();
      return true;
    }

    if ([4, 8, 12, 16, 20].every(i => this.markedCells[i])) {
      this.showBingo();
      return true;
    }

    return false;
  }

  showBingo(): void {
    setTimeout(() => {
      alert('🎉 BINGO! 🎉');
    }, 100);
  }

  resetGame(): void {
    this.generateCard();
  }

  goBack(): void {
    this.router.navigate(['/fun-zone']);
  }
}