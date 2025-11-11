import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api-service';

interface UserProfile {
  KUNNR: string;
  NAME1: string;
  NAME2: string;
  KTOKD: string;
  VKORG: string;
  VTWEG: string;
  SPART: string;
  STRAS: string;
  ORT01: string;
  REGIO: string;
  LAND1: string;
  PSTLZ: string;
  TELF1: string;
  SMTP_ADDR: string;
  STCD1: string;
}

interface UserDetailsResponse {
  status: string;
  profile: {
    USER_TABLE: {
      item: UserProfile;
    };
  };
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  loading: boolean = true;
  error: string | null = null;
  animationState: 'loading' | 'loaded' | 'error' = 'loading';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.animationState = 'loading';
    
    this.apiService.getUserDetails().subscribe({
      next: (response: any) => {
        if (response.status === 'S' && response.profile?.USER_TABLE?.item) {
          this.userProfile = response.profile.USER_TABLE.item;
          this.animationState = 'loaded';
        } else {
          this.error = 'Invalid response format';
          this.animationState = 'error';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        this.error = 'Failed to load user profile';
        this.animationState = 'error';
        this.loading = false;
      }
    });
  }

  getInitials(): string {
    if (!this.userProfile?.NAME1) return 'U';
    return this.userProfile.NAME1.charAt(0).toUpperCase();
  }

  getFullName(): string {
    if (!this.userProfile) return '';
    return this.userProfile.NAME2 
      ? `${this.userProfile.NAME1} ${this.userProfile.NAME2}`
      : this.userProfile.NAME1;
  }

  getAddress(): string {
    if (!this.userProfile) return '';
    const parts = [
      this.userProfile.STRAS,
      this.userProfile.ORT01,
      this.userProfile.REGIO,
      this.userProfile.PSTLZ,
      this.userProfile.LAND1
    ].filter(part => part && part.trim());
    
    return parts.join(', ');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  retry(): void {
    this.loadUserProfile();
  }
}
