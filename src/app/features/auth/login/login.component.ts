import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  constructor() {
    // Inicijalizuj formu
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Učitaj sačuvanu temu
    this.themeService.loadTheme();
  }

  /**
   * Submit login-a
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email, password);
      // AuthService automatski redirektuje na dashboard
    } catch (error: any) {
      this.errorMessage = error.message;
      this.isLoading = false;
    }
  }

  /**
   * Označi sva polja kao touched
   */
  private markFormAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Helper za pristup form kontrolama
   */
  get f() {
    return this.loginForm.controls;
  }
}