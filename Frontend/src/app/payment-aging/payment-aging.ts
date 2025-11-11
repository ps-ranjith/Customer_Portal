import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api-service';
import { AuthService } from '../auth.service';

interface PaymentAgingItem {
  VBELN: string;
  FKDAT: string;
  ZFBDT: string;
  KUNNR: string;
  NETWR: string;
  WAERK: string;
  ZTERM: string;
  DUE_DATE: string;
  AGING_DAYS: string;
}

interface PaymentAgingResponse {
  status: string;
  data: PaymentAgingItem[];
}

@Component({
  selector: 'app-payment-aging',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-aging.html',
  styleUrls: ['./payment-aging.css']
})
export class PaymentAgingComponent implements OnInit {
  paymentAgingData: PaymentAgingItem[] = [];
  isLoading: boolean = false;
  error: string = '';
  showData: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadPaymentAgingData();
  }

  loadPaymentAgingData(): void {
    this.isLoading = true;
    this.error = '';
    this.showData = false;

    this.apiService.getPaymentAging().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status === 'S' && response.data) {
          this.paymentAgingData = response.data;
          setTimeout(() => {
            this.showData = true;
          }, 100);
        } else {
          this.error = 'No payment aging data available';
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.authService.clearSession();
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load payment aging data. Please try again.';
        }
      }
    });
  }

  formatCurrency(amount: string, currency: string): string {
    if (!amount) return 'N/A';
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2
    }).format(numAmount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTotalInvoices(): number {
    return this.paymentAgingData.length;
  }

  getTotalAmount(): string {
    const total = this.paymentAgingData.reduce((sum, item) => {
      return sum + (parseFloat(item.NETWR) || 0);
    }, 0);
    return this.formatCurrency(total.toString(), 'EUR');
  }

  getAverageAmount(): string {
    if (this.paymentAgingData.length === 0) return this.formatCurrency('0', 'EUR');
    const total = this.paymentAgingData.reduce((sum, item) => {
      return sum + (parseFloat(item.NETWR) || 0);
    }, 0);
    const average = total / this.paymentAgingData.length;
    return this.formatCurrency(average.toString(), 'EUR');
  }

  getOverdueAmount(): string {
    const overdue = this.paymentAgingData.filter(item => {
      const agingDays = parseInt(item.AGING_DAYS);
      return agingDays > 0;
    });
    
    const total = overdue.reduce((sum, item) => {
      return sum + (parseFloat(item.NETWR) || 0);
    }, 0);
    return this.formatCurrency(total.toString(), 'EUR');
  }

  getOverdueCount(): number {
    return this.paymentAgingData.filter(item => {
      const agingDays = parseInt(item.AGING_DAYS);
      return agingDays > 0;
    }).length;
  }

  getAgingStatus(agingDays: string): string {
    const days = parseInt(agingDays);
    if (days < 0) return 'Not Due';
    if (days === 0) return 'Due Today';
    if (days <= 30) return '1-30 Days';
    if (days <= 60) return '31-60 Days';
    if (days <= 90) return '61-90 Days';
    return 'Over 90 Days';
  }

  getAgingClass(agingDays: string): string {
    const days = parseInt(agingDays);
    if (days < 0) return 'not-due';
    if (days === 0) return 'due-today';
    if (days <= 30) return 'aging-1-30';
    if (days <= 60) return 'aging-31-60';
    if (days <= 90) return 'aging-61-90';
    return 'aging-over-90';
  }

  getAgingIcon(agingDays: string): string {
    const days = parseInt(agingDays);
    if (days < 0) return 'fas fa-check-circle';
    if (days === 0) return 'fas fa-exclamation-triangle';
    if (days <= 30) return 'fas fa-circle text-warning';
    if (days <= 60) return 'fas fa-circle text-orange';
    if (days <= 90) return 'fas fa-circle text-danger';
    return 'fas fa-exclamation-triangle text-danger';
  }

  refreshData(): void {
    this.loadPaymentAgingData();
  }
}
