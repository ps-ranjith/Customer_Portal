import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api-service';
import { AuthService } from '../auth.service';

interface OverallSalesItem {
  VBELN: string;
  KUNNR: string;
  FKDAT: string;
  WAERK: string;
  NETWR: string;
  POSNR: string;
  MATNR: string;
  FKIMG: string;
  VRKME: string;
}

interface OverallSalesResponse {
  status: string;
  data: OverallSalesItem[];
}

@Component({
  selector: 'app-overall-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overall-sales.html',
  styleUrls: ['./overall-sales.css']
})
export class OverallSalesComponent implements OnInit {
  overallSalesData: OverallSalesItem[] = [];
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
    this.loadOverallSalesData();
  }

  loadOverallSalesData(): void {
    this.isLoading = true;
    this.error = '';
    this.showData = false;

    this.apiService.getOverallSales().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status === 'S' && response.data) {
          this.overallSalesData = response.data;
          setTimeout(() => {
            this.showData = true;
          }, 100);
        } else {
          this.error = 'No overall sales data available';
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.authService.clearSession();
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load overall sales data. Please try again.';
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

  formatQuantity(quantity: string, unit: string): string {
    if (!quantity) return 'N/A';
    const numQuantity = parseFloat(quantity);
    return `${numQuantity.toLocaleString()} ${unit}`;
  }

  getTotalOrders(): number {
    const uniqueOrders = new Set(this.overallSalesData.map(item => item.VBELN));
    return uniqueOrders.size;
  }

  getTotalItems(): number {
    return this.overallSalesData.length;
  }

  getTotalAmount(): string {
    const total = this.overallSalesData.reduce((sum, item) => {
      return sum + (parseFloat(item.NETWR) || 0);
    }, 0);
    return this.formatCurrency(total.toString(), 'EUR');
  }

  getAverageOrderValue(): string {
    const uniqueOrders = new Set(this.overallSalesData.map(item => item.VBELN));
    if (uniqueOrders.size === 0) return this.formatCurrency('0', 'EUR');
    
    const total = this.overallSalesData.reduce((sum, item) => {
      return sum + (parseFloat(item.NETWR) || 0);
    }, 0);
    const average = total / uniqueOrders.size;
    return this.formatCurrency(average.toString(), 'EUR');
  }

  getTotalQuantity(): string {
    const total = this.overallSalesData.reduce((sum, item) => {
      return sum + (parseFloat(item.FKIMG) || 0);
    }, 0);
    return total.toLocaleString();
  }

  getCurrencyBreakdown(): { currency: string; amount: number; count: number }[] {
    const breakdown: { [key: string]: { amount: number; count: number } } = {};
    
    this.overallSalesData.forEach(item => {
      const currency = item.WAERK;
      const amount = parseFloat(item.NETWR) || 0;
      
      if (!breakdown[currency]) {
        breakdown[currency] = { amount: 0, count: 0 };
      }
      
      breakdown[currency].amount += amount;
      breakdown[currency].count += 1;
    });
    
    return Object.entries(breakdown).map(([currency, data]) => ({
      currency,
      amount: data.amount,
      count: data.count
    }));
  }

  getUnitBreakdown(): { unit: string; quantity: number; count: number }[] {
    const breakdown: { [key: string]: { quantity: number; count: number } } = {};
    
    this.overallSalesData.forEach(item => {
      const unit = item.VRKME;
      const quantity = parseFloat(item.FKIMG) || 0;
      
      if (!breakdown[unit]) {
        breakdown[unit] = { quantity: 0, count: 0 };
      }
      
      breakdown[unit].quantity += quantity;
      breakdown[unit].count += 1;
    });
    
    return Object.entries(breakdown).map(([unit, data]) => ({
      unit,
      quantity: data.quantity,
      count: data.count
    }));
  }

  getSalesByDate(): { date: string; amount: number; count: number }[] {
    const breakdown: { [key: string]: { amount: number; count: number } } = {};
    
    this.overallSalesData.forEach(item => {
      const date = item.FKDAT;
      const amount = parseFloat(item.NETWR) || 0;
      
      if (!breakdown[date]) {
        breakdown[date] = { amount: 0, count: 0 };
      }
      
      breakdown[date].amount += amount;
      breakdown[date].count += 1;
    });
    
    return Object.entries(breakdown)
      .map(([date, data]) => ({
        date,
        amount: data.amount,
        count: data.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getCurrencyIcon(currency: string): string {
    const currencyIcons: { [key: string]: string } = {
      'EUR': 'fas fa-euro-sign',
      'USD': 'fas fa-dollar-sign',
      'INR': 'fas fa-rupee-sign',
      'GBP': 'fas fa-pound-sign',
      'JPY': 'fas fa-yen-sign'
    };
    return currencyIcons[currency] || 'fas fa-exchange-alt';
  }

  getUnitIcon(unit: string): string {
    const unitIcons: { [key: string]: string } = {
      'EA': 'fas fa-box',
      'IN': 'fas fa-ruler',
      'KG': 'fas fa-weight-hanging',
      'L': 'fas fa-flask',
      'M': 'fas fa-ruler-combined'
    };
    return unitIcons[unit] || 'fas fa-chart-bar';
  }

  refreshData(): void {
    this.loadOverallSalesData();
  }
}
