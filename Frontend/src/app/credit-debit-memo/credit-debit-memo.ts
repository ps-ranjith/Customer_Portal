import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api-service';
import { AuthService } from '../auth.service';

interface CreditDebitMemoItem {
  VBELN: string;
  FKDAT: string;
  FKART: string;
  KUNNR: string;
  NETWR: string;
  WAERK: string;
  ARKTX: string;
  POSNR: string;
  MATNR: string;
}

interface CreditDebitMemoResponse {
  status: string;
  data: CreditDebitMemoItem[];
}

@Component({
  selector: 'app-credit-debit-memo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credit-debit-memo.html',
  styleUrls: ['./credit-debit-memo.css']
})
export class CreditDebitMemoComponent implements OnInit {
  creditDebitMemoData: CreditDebitMemoItem[] = [];
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
    this.loadCreditDebitMemoData();
  }

  loadCreditDebitMemoData(): void {
    this.isLoading = true;
    this.error = '';
    this.showData = false;

    this.apiService.getCreditDebitMemos().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status === 'S' && response.data) {
          this.creditDebitMemoData = response.data;
          setTimeout(() => {
            this.showData = true;
          }, 100);
        } else {
          this.error = 'No credit/debit memo data available';
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.authService.clearSession();
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load credit/debit memo data. Please try again.';
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

  getTotalMemos(): number {
    return this.creditDebitMemoData.length;
  }

  getTotalAmount(): string {
    const total = this.creditDebitMemoData.reduce((sum, item) => {
      return sum + (parseFloat(item.NETWR) || 0);
    }, 0);
    return this.formatCurrency(total.toString(), 'EUR');
  }

  getAverageAmount(): string {
    if (this.creditDebitMemoData.length === 0) return this.formatCurrency('0', 'EUR');
    const total = this.creditDebitMemoData.reduce((sum, item) => {
      return sum + (parseFloat(item.NETWR) || 0);
    }, 0);
    const average = total / this.creditDebitMemoData.length;
    return this.formatCurrency(average.toString(), 'EUR');
  }

  getCreditMemos(): CreditDebitMemoItem[] {
    return this.creditDebitMemoData.filter(item => 
      item.FKART === 'G2' || item.FKART.startsWith('G')
    );
  }

  getDebitMemos(): CreditDebitMemoItem[] {
    return this.creditDebitMemoData.filter(item => 
      item.FKART === 'L2' || item.FKART.startsWith('L')
    );
  }

  getCreditAmount(): string {
    const creditMemos = this.getCreditMemos();
    const total = creditMemos.reduce((sum, item) => {
      return sum + (parseFloat(item.NETWR) || 0);
    }, 0);
    return this.formatCurrency(total.toString(), 'EUR');
  }

  getDebitAmount(): string {
    const debitMemos = this.getDebitMemos();
    const total = debitMemos.reduce((sum, item) => {
      return sum + (parseFloat(item.NETWR) || 0);
    }, 0);
    return this.formatCurrency(total.toString(), 'EUR');
  }

  getMemoTypeText(fkart: string): string {
    const memoTypes: { [key: string]: string } = {
      'G2': 'Credit Memo',
      'L2': 'Debit Memo',
      'G1': 'Credit Note',
      'L1': 'Debit Note',
      'G3': 'Credit Adjustment',
      'L3': 'Debit Adjustment'
    };
    return memoTypes[fkart] || fkart;
  }

  getMemoTypeClass(fkart: string): string {
    if (fkart.startsWith('G')) return 'credit-memo';
    if (fkart.startsWith('L')) return 'debit-memo';
    return 'other-memo';
  }

  getMemoTypeIcon(fkart: string): string {
    if (fkart.startsWith('G')) return 'fas fa-chart-line';
    if (fkart.startsWith('L')) return 'fas fa-chart-line-down';
    return 'fas fa-file-alt';
  }

  getMemoTypeColor(fkart: string): string {
    if (fkart.startsWith('G')) return 'success';
    if (fkart.startsWith('L')) return 'danger';
    return 'info';
  }

  refreshData(): void {
    this.loadCreditDebitMemoData();
  }
}
