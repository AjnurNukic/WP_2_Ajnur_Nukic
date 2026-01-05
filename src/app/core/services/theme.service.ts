import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

export type Theme = 'green' | 'blue' | 'dark';

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


  setTheme(theme: Theme): void {
   this.renderer.removeClass(document.body, `theme-${this.currentTheme}`);
this.renderer.addClass(document.body, `theme-${theme}`);
    this.currentTheme = theme;
    this.renderer.addClass(document.body, `theme-${theme}`);
    localStorage.setItem('userTheme', theme);
  }


  loadTheme(): void {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.theme) {
          this.setTheme(currentUser.theme);
          return;
        }
      } catch (e) {
        console.error('Error parsing currentUser:', e);
      }
    }


    const savedTheme = localStorage.getItem('userTheme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('green'); 
    }
  }


  getCurrentTheme(): Theme {
    return this.currentTheme;
  }


  getAvailableThemes(): Theme[] {
    return ['green', 'blue', 'dark'];
  }
}