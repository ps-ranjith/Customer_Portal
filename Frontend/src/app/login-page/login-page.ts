import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;
  showError: boolean = false;
  showSuccess: boolean = false;
  showPassword: boolean = false;
  showLoginError: boolean = false;
  loginErrorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() { 
    console.log('Login form submitted');
    
    // Reset all states
    this.showError = false;
    this.showLoginError = false;
    this.showSuccess = false;
    this.loginErrorMessage = '';

    // Trim form values
    const userIdControl = this.loginForm.get('userId');
    const passwordControl = this.loginForm.get('password');

    if (userIdControl && passwordControl) {
      const trimmedUserId = userIdControl.value?.trim() || '';
      const trimmedPassword = passwordControl.value?.trim() || '';
      userIdControl.setValue(trimmedUserId, { emitEvent: false });
      passwordControl.setValue(trimmedPassword, { emitEvent: false });
    }

    if (this.loginForm.valid) {
      this.isLoading = true;
      console.log('Form is valid, making API call...');
      
      const customer_id = this.loginForm.get('userId')?.value;
      const password = this.loginForm.get('password')?.value;

      console.log('Sending login request to:', 'http://localhost:3000/login');
      console.log('Request payload:', { customer_id, password: '***' });

      this.authService.login({ customer_id, password })
        .pipe(
          catchError((error) => {
            console.error('Login API error:', error);
            this.isLoading = false;
            this.showLoginError = true;
            this.loginErrorMessage = 'Login failed due to server error. Please try again.';
            this.cdr.detectChanges();
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (response) => {          
            console.log('Login API response:', response);
            this.isLoading = false;
            const userAuthType = response.status;
            const userAuthMsg = response.message;

            if (userAuthType === 'S') {
              console.log('Login successful, redirecting to dashboard...');
              this.showSuccess = true;
              this.showLoginError = false;
              this.loginErrorMessage = '';
              
              // Set authentication state
              this.authService.setAuthenticated(true);
              sessionStorage.setItem('customerId', customer_id);
              
              // Store user info if remember me is checked
              if (this.loginForm.get('rememberMe')?.value) {
                localStorage.setItem('rememberedUser', customer_id);
              } else {
                localStorage.removeItem('rememberedUser');
              }

              setTimeout(() => {
                this.showSuccess = false;
                this.router.navigate(['/dashboard']);
              }, 2000);
            } else {
              console.log('Login failed:', userAuthMsg);
              this.showLoginError = true;
              this.loginErrorMessage = userAuthMsg || 'User ID or password is incorrect.';
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            console.error('Login subscription error:', err);
            this.isLoading = false;
            this.showLoginError = true;
            this.loginErrorMessage = 'Login failed due to server error. Please try again.';
            this.cdr.detectChanges();
          }
        });      
    } else {
      console.log('Form validation failed');
      // Form validation failed
      this.showLoginError = true;
      this.loginErrorMessage = 'Please fill in all required fields correctly.';
      this.markFormGroupTouched();
      this.hideErrorAfterDelay();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  private hideErrorAfterDelay() {
    setTimeout(() => {
      this.showLoginError = false;
      this.loginErrorMessage = '';
    }, 5000); // Show error for 5 seconds
  }

  ngOnInit() {
    console.log('Login component initialized');
    // Check if user was remembered
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      this.loginForm.patchValue({
        userId: rememberedUser,
        rememberMe: true
      });
    }
  }
}