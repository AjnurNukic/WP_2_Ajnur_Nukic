import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; 
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  

  availableThemes: Theme[];
  currentTheme: Theme;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService); 
  private themeService = inject(ThemeService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.availableThemes = this.themeService.getAvailableThemes();
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnInit(): void {
    this.themeService.loadTheme();
  }

 
  onThemeChange(theme: Theme): void {
    this.currentTheme = theme;
    this.themeService.setTheme(theme);
  }

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
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.theme) {
           this.themeService.setTheme(user.theme);
        }
      }
      

      this.router.navigate(['/dashboard']);
      
    } catch (error: any) {
      this.errorMessage = error.message || 'Pogrešan email ili lozinka!';
      this.isLoading = false;
    }
  }

  private markFormAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  get f() { return this.loginForm.controls; }
}