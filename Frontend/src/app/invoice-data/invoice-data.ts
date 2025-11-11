import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api-service';
import { AuthService } from '../auth.service';

interface InvoiceItem {
  VBELN: string;
  FKDAT: string;
  KUNNR: string;
  WAERK: string;
  POSNR: string;
  MATNR: string;
  ARKTX: string;
  VRKME: string;
}

interface InvoiceResponse {
  status: string;
  data: InvoiceItem[];
}

@Component({
  selector: 'app-invoice-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-data.html',
  styleUrls: ['./invoice-data.css']
})
export class InvoiceDataComponent implements OnInit {
  invoiceData: InvoiceItem[] = [];
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
    this.loadInvoiceData();
  }

  loadInvoiceData(): void {
    this.isLoading = true;
    this.error = '';
    this.showData = false;

    this.apiService.getInvoices().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status === 'S' && response.data) {
          this.invoiceData = response.data;
          setTimeout(() => {
            this.showData = true;
          }, 100);
        } else {
          this.error = 'No invoice data available';
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.authService.clearSession();
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load invoice data. Please try again.';
        }
      }
    });
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

  formatCurrency(amount: string, currency: string): string {
    if (!amount) return 'N/A';
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2
    }).format(numAmount);
  }

  getTotalInvoices(): number {
    return this.invoiceData.length;
  }

  getTotalValue(): string {
    // Since the API doesn't provide NETWR, we'll show a placeholder
    return this.formatCurrency('0', 'EUR');
  }

  getUniqueCustomers(): number {
    const customers = new Set(this.invoiceData.map(item => item.KUNNR));
    return customers.size;
  }

  getUniqueProducts(): number {
    const products = new Set(this.invoiceData.map(item => item.MATNR));
    return products.size;
  }

  formatCustomerId(customerId: string): string {
    return customerId.replace(/^0+/, '');
  }

  formatProductId(productId: string): string {
    return productId.replace(/^0+/, '');
  }

  previewInvoice(invoice: InvoiceItem): void {
    this.isLoading = true;
    
    this.apiService.getInvoicePdf(invoice.KUNNR, invoice.VBELN).subscribe({
      next: (blob: Blob) => {
        this.isLoading = false;
        
        // Create a blob URL for the PDF
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Open the PDF in a new window/tab
        const newWindow = window.open(blobUrl, '_blank');
        
        if (newWindow) {
          // Clean up the blob URL after a delay to ensure the window loads
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
          }, 1000);
        } else {
          // Fallback: if popup is blocked, show an alert
          alert('Popup blocked! Please allow popups for this site to preview invoices.');
          window.URL.revokeObjectURL(blobUrl);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching PDF:', error);
        
        // Show user-friendly error message
        if (error.status === 400) {
          alert('Invalid invoice data. Please try again.');
        } else if (error.status === 500) {
          alert('Server error. Please try again later.');
        } else {
          alert('Failed to load PDF. Please try again.');
        }
      }
    });
  }

  downloadInvoice(invoice: InvoiceItem): void {
    this.isLoading = true;
    
    this.apiService.getInvoicePdf(invoice.KUNNR, invoice.VBELN).subscribe({
      next: (blob: Blob) => {
        this.isLoading = false;
        
        // Create a blob URL for the PDF
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `invoice-${invoice.VBELN}.pdf`;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error downloading PDF:', error);
        
        // Show user-friendly error message
        if (error.status === 400) {
          alert('Invalid invoice data. Please try again.');
        } else if (error.status === 500) {
          alert('Server error. Please try again later.');
        } else {
          alert('Failed to download PDF. Please try again.');
        }
      }
    });
  }

  refreshData(): void {
    this.loadInvoiceData();
  }
}
