import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from './navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('Frontend');
  isLoginPage: boolean = false;

  constructor( private router: Router) {
    // You can initialize any global state or services here if needed
    console.log('App component initialized');

    
  }

  ngOnInit(){
    // Initialize theme from localStorage
    this.initializeTheme();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Current URL:', event.urlAfterRedirects);
        this.isLoginPage = event.urlAfterRedirects === '/login';
        
        if(this.isLoginPage) {
          console.log('User is on the login page');
          document.body.style.overflow = "hidden"; 
        } else {
          console.log('User is not on the login page');
          document.body.style.overflow = ""; 
        }
      });
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const root = document.documentElement;
    const body = document.body;
    
    if (savedTheme === 'dark') {
      root.classList.add('dark-theme');
      body.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
      body.classList.remove('dark-theme');
    }
  }
}
