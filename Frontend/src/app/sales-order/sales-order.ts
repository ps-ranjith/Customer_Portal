import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api-service';
import { AuthService } from '../auth.service';

interface SalesOrderItem {
  AUART: string;
  VKORG: string;
  KUNNR: string;
  MATNR: string;
  PSTYV: string;
  SPART: string;
  VTWEG: string;
  POSNR: string;
}

interface SalesOrderResponse {
  status: string;
  data: SalesOrderItem[];
}

@Component({
  selector: 'app-sales-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-order.html',
  styleUrl: './sales-order.css'
})
export class SalesOrderComponent implements OnInit {
  salesOrderData: SalesOrderItem[] = [];
  isLoading: boolean = false;
  error: string = '';
  showData: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {
    console.log('SalesOrderComponent initialized');
  }

  ngOnInit() {
    // Check if user is authenticated before making API call
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.loadSalesOrderData();
  }

  loadSalesOrderData() {
    this.isLoading = true;
    this.error = '';
    this.showData = false;

    this.apiService.getSalesOrders().subscribe({
      next: (response: any) => {
        console.log('Sales order data fetched successfully:', response);
        this.salesOrderData = response.data || [];
        this.isLoading = false;
        
        // Trigger animation after data loads
        setTimeout(() => {
          this.showData = true;
        }, 100);
      },
      error: (error) => {
        console.error('Error fetching sales order data:', error);
        this.isLoading = false;
        
        // Handle 401 Unauthorized error
        if (error.status === 401) {
          console.log('Unauthorized access, clearing session and redirecting to login');
          this.authService.clearSession();
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load sales order data. Please try again.';
        }
      }
    });
  }

  refreshData() {
    this.loadSalesOrderData();
  }

  getOrderTypeText(auart: string): string {
    const orderTypes: { [key: string]: string } = {
      'TA': 'Standard Order',
      'KB': 'Credit Order',
      'KR': 'Return Order',
      'DR': 'Direct Order',
      'ZR': 'Rush Order'
    };
    return orderTypes[auart] || auart;
  }

  getOrderTypeClass(auart: string): string {
    const orderTypeClasses: { [key: string]: string } = {
      'TA': 'order-type-standard',
      'KB': 'order-type-credit',
      'KR': 'order-type-return',
      'DR': 'order-type-direct',
      'ZR': 'order-type-rush'
    };
    return orderTypeClasses[auart] || 'order-type-default';
  }

  getStatusClass(posnr: string): string {
    // Simple logic to determine status based on position number
    const lastDigit = parseInt(posnr.slice(-1));
    if (lastDigit % 3 === 0) return 'status-completed';
    if (lastDigit % 3 === 1) return 'status-pending';
    return 'status-processing';
  }

  getStatusText(posnr: string): string {
    const lastDigit = parseInt(posnr.slice(-1));
    if (lastDigit % 3 === 0) return 'Completed';
    if (lastDigit % 3 === 1) return 'Pending';
    return 'Processing';
  }

  getTotalOrders(): number {
    return this.salesOrderData.length;
  }

  getUniqueCustomers(): number {
    const uniqueCustomers = new Set(this.salesOrderData.map(item => item.KUNNR));
    return uniqueCustomers.size;
  }

  getUniqueProducts(): number {
    const uniqueProducts = new Set(this.salesOrderData.map(item => item.MATNR));
    return uniqueProducts.size;
  }

  formatCustomerId(kunnr: string): string {
    return kunnr.padStart(10, '0');
  }

  formatProductId(matnr: string): string {
    return matnr.padStart(18, '0');
  }
}
