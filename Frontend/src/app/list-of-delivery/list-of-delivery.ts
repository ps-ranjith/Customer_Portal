import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api-service';
import { AuthService } from '../auth.service';

interface DeliveryItem {
  VBELN: string;
  ERDAT: string;
  VSTEL: string;
  KUNNR: string;
  MATNR: string;
  ARKTX: string;
  VRKME: string;
  POSNR: string;
  WADAT_IST: string;
}

interface DeliveryResponse {
  status: string;
  data: DeliveryItem[];
}

@Component({
  selector: 'app-list-of-delivery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-of-delivery.html',
  styleUrl: './list-of-delivery.css'
})
export class ListOfDeliveryComponent implements OnInit {
  deliveryData: DeliveryItem[] = [];
  isLoading: boolean = false;
  error: string = '';
  showData: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {
    console.log('ListOfDeliveryComponent initialized');
  }

  ngOnInit() {
    // Check if user is authenticated before making API call
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.loadDeliveryData();
  }

  loadDeliveryData() {
    this.isLoading = true;
    this.error = '';
    this.showData = false;

    this.apiService.getDeliveries().subscribe({
      next: (response: any) => {
        console.log('Delivery data fetched successfully:', response);
        this.deliveryData = response.data || [];
        this.isLoading = false;
        
        // Trigger animation after data loads
        setTimeout(() => {
          this.showData = true;
        }, 100);
      },
      error: (error) => {
        console.error('Error fetching delivery data:', error);
        this.isLoading = false;
        
        // Handle 401 Unauthorized error
        if (error.status === 401) {
          console.log('Unauthorized access, clearing session and redirecting to login');
          this.authService.clearSession();
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load delivery data. Please try again.';
        }
      }
    });
  }

  refreshData() {
    this.loadDeliveryData();
  }

  getDeliveryStatus(wadatIst: string): string {
    if (wadatIst === '0000-00-00' || !wadatIst) {
      return 'Pending';
    }
    return 'Delivered';
  }

  getStatusClass(wadatIst: string): string {
    if (wadatIst === '0000-00-00' || !wadatIst) {
      return 'status-pending';
    }
    return 'status-delivered';
  }

  getStatusText(wadatIst: string): string {
    if (wadatIst === '0000-00-00' || !wadatIst) {
      return 'Pending';
    }
    return 'Delivered';
  }

  getTotalDeliveries(): number {
    return this.deliveryData.length;
  }

  getUniqueCustomers(): number {
    const uniqueCustomers = new Set(this.deliveryData.map(item => item.KUNNR));
    return uniqueCustomers.size;
  }

  getUniqueProducts(): number {
    const uniqueProducts = new Set(this.deliveryData.map(item => item.MATNR));
    return uniqueProducts.size;
  }

  getPendingDeliveries(): number {
    return this.deliveryData.filter(item => 
      item.WADAT_IST === '0000-00-00' || !item.WADAT_IST
    ).length;
  }

  formatCustomerId(kunnr: string): string {
    return kunnr.replace(/^0+/, '') || kunnr;
  }

  formatProductId(matnr: string): string {
    return matnr.replace(/^0+/, '') || matnr;
  }

  formatDate(dateString: string): string {
    if (!dateString || dateString === '0000-00-00') {
      return 'N/A';
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }
}
