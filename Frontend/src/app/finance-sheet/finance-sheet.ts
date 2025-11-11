import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-finance-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance-sheet.html',
  styleUrls: ['./finance-sheet.css']
})
export class FinanceSheetComponent {
  
  constructor(private router: Router) {}
  
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // Specific navigation methods for better UX
  navigateToPaymentAging(): void {
    this.router.navigate(['/payment-aging']);
  }

  navigateToInvoiceData(): void {
    this.router.navigate(['/invoice-data']);
  }

  navigateToCreditDebitMemo(): void {
    this.router.navigate(['/credit-debit-memo']);
  }

  navigateToOverallSales(): void {
    this.router.navigate(['/overall-sales']);
  }
} 