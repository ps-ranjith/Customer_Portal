import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { ApiService } from '../services/api-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  @Input() activeSection: string = 'dashboard';
  
  // Emits when a new section is selected
  @Output() sectionChange = new EventEmitter<string>();

  // Simulated user data (replace with dynamic logic if needed)
  user = {
    name: 'John Anderson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80'
  };

  isDarkTheme: boolean = false;

  constructor(private router: Router, private authService: AuthService, private apiService: ApiService) { 
    this.checkTheme();
  }

  // Navigation methods with hover effects
  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  navigateToFinanceSheet() {
    this.router.navigate(['/finance-sheet']);
  }

  navigateToUserProfile() {
    this.router.navigate(['/user-profile']);
  }

  // Handles section tab click
  changeSection(section: string): void {
    this.sectionChange.emit(section);
  }

  // Check current theme
  private checkTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
  }

  // Theme toggler (light/dark class toggle)
  toggleTheme(): void {
    const root = document.documentElement;
    const body = document.body;
    const isDark = root.classList.contains('dark-theme');
    
    if (isDark) {
      root.classList.remove('dark-theme');
      body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      this.isDarkTheme = false;
    } else {
      root.classList.add('dark-theme');
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      this.isDarkTheme = true;
    }
  }

  logout(): void {
    // Call backend logout endpoint
    this.apiService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Still clear session and redirect even if backend call fails
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }
}
