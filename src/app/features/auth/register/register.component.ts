import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  availableThemes: Theme[];

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  constructor() {
    // Inicijalizuj formu
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      theme: ['green', Validators.required]
    });

    // Učitaj dostupne teme
    this.availableThemes = this.themeService.getAvailableThemes();
  }

  /**
   * Preview teme dok korisnik bira
   */
  onThemeChange(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  /**
   * Submit registracije
   */
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password, theme } = this.registerForm.value;

    try {
      await this.authService.register(name, email, password, theme);
      // AuthService automatski redirektuje na dashboard
    } catch (error: any) {
      this.errorMessage = error.message;
      this.isLoading = false;
    }
  }

  /**
   * Označi sva polja kao touched (da se prikažu greške)
   */
  private markFormAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Helper za pristup form kontrolama u template-u
   */
  get f() {
    return this.registerForm.controls;
  }
}