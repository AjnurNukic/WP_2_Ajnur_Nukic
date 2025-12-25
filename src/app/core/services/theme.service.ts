import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

export type Theme = 'green' | 'blue' | 'dark' | 'cyberpunk';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: Theme = 'green';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadTheme();
  }

  /**
   * Postavlja temu i čuva je u localStorage
   */
  setTheme(theme: Theme): void {
    // Ukloni prethodnu temu
    this.renderer.removeClass(document.body, `theme-${this.currentTheme}`);
    
    // Primjeni novu temu
    this.currentTheme = theme;
    this.renderer.addClass(document.body, `theme-${theme}`);
    
    // Sačuvaj u localStorage
    localStorage.setItem('userTheme', theme);
  }

  /**
   * Učitava temu iz localStorage
   */
  loadTheme(): void {
    const savedTheme = localStorage.getItem('userTheme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('green'); // Default tema
    }
  }

  /**
   * Vraća trenutnu temu
   */
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Lista dostupnih tema
   */
  getAvailableThemes(): Theme[] {
    return ['green', 'blue', 'dark', 'cyberpunk'];
  }
}