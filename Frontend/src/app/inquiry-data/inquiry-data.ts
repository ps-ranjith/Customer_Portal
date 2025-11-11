import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api-service';
import { AuthService } from '../auth.service';

interface InquiryItem {
  VBELN: string;
  ERDAT: string;
  MATNR: string;
  ARKTX: string;
  KWMENG: string;
  VRKME: string;
  NETWR: string;
  WAERK: string;
}

interface InquiryResponse {
  status: string;
  data: InquiryItem[];
}

@Component({
  selector: 'app-inquiry-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inquiry-data.html',
  styleUrl: './inquiry-data.css'
})
export class InquiryData implements OnInit {
  inquiryData: InquiryItem[] = [];
  isLoading: boolean = false;
  error: string = '';
  showData: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {
    console.log('InquiryDataComponent initialized');
  }

  ngOnInit() {
    // Check if user is authenticated before making API call
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.loadInquiryData();
  }

  loadInquiryData() {
    this.isLoading = true;
    this.error = '';
    this.showData = false;

    this.apiService.getInquiryData().subscribe({
      next: (response: any) => {
        console.log('Inquiry data fetched successfully:', response);
        this.inquiryData = response.data || [];
        this.isLoading = false;
        
        // Trigger animation after data loads
        setTimeout(() => {
          this.showData = true;
        }, 100);
      },
      error: (error) => {
        console.error('Error fetching inquiry data:', error);
        this.isLoading = false;
        
        // Handle 401 Unauthorized error
        if (error.status === 401) {
          console.log('Unauthorized access, clearing session and redirecting to login');
          this.authService.clearSession();
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load inquiry data. Please try again.';
        }
      }
    });
  }

  refreshData() {
    this.loadInquiryData();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: string, currency: string): string {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2
    }).format(numAmount);
  }

  getTotalValue(): string {
    const total = this.inquiryData.reduce((sum, item) => sum + parseFloat(item.NETWR), 0);
    return this.formatCurrency(total.toString(), 'EUR');
  }

  getAverageValue(): string {
    if (this.inquiryData.length === 0) {
      return this.formatCurrency('0', 'EUR');
    }
    const total = this.inquiryData.reduce((sum, item) => sum + parseFloat(item.NETWR), 0);
    const average = total / this.inquiryData.length;
    return this.formatCurrency(average.toString(), 'EUR');
  }

  getStatusClass(vbeln: string): string {
    // Simple logic to determine status based on order number
    const lastDigit = parseInt(vbeln.slice(-1));
    if (lastDigit % 3 === 0) return 'status-completed';
    if (lastDigit % 3 === 1) return 'status-pending';
    return 'status-processing';
  }

  getStatusText(vbeln: string): string {
    const lastDigit = parseInt(vbeln.slice(-1));
    if (lastDigit % 3 === 0) return 'Completed';
    if (lastDigit % 3 === 1) return 'Pending';
    return 'Processing';
  }
}

