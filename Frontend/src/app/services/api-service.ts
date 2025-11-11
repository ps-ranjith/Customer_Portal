import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  URL = 'http://localhost:3000/';

  constructor(private http: HttpClient) { }

  getInquiryData() {
    // Use session-based authentication instead of hardcoded Basic Auth
    const headers = {
      'Content-Type': 'application/json'
    }
    return this.http.get(this.URL + 'inquiry', {
      headers,
      withCredentials: true
    });
  }

  getUserDetails() {
    return this.http.get(this.URL + 'userDetails', {
      withCredentials: true
    });
  }

  getSalesOrders() {
    return this.http.get(this.URL + 'salesOrders', {
      withCredentials: true
    });
  }

  getDeliveries() {
    return this.http.get(this.URL + 'listDeliveries', {
      withCredentials: true
    });
  }

  getInvoices() {
    return this.http.get(this.URL + 'invoices', {
      withCredentials: true
    });
  }

  getPaymentAging() {
    return this.http.get(this.URL + 'paymentAging', {
      withCredentials: true
    });
  }

  getCreditDebitMemos() {
    return this.http.get(this.URL + 'creditDebitMemos', {
      withCredentials: true
    });
  }

  getOverallSales() {
    return this.http.get(this.URL + 'overallSales', {
      withCredentials: true
    });
  }

  getInvoicePdf(KUNNR: string, VBELN: string) {
    return this.http.post(this.URL + 'api/customer/invoicePdf', 
      { KUNNR, VBELN }, 
      { 
        responseType: 'blob',
        withCredentials: true 
      }
    );
  }

  logout() {
    return this.http.post(this.URL + 'logout', {}, {
      withCredentials: true
    });
  }
}
