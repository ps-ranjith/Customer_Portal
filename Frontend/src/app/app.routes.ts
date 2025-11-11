// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login-page/login-page';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard';
import { InquiryData } from './inquiry-data/inquiry-data';
import { SalesOrderComponent } from './sales-order/sales-order';
import { ListOfDeliveryComponent } from './list-of-delivery/list-of-delivery';
import { FinanceSheetComponent } from './finance-sheet/finance-sheet';
import { InvoiceDataComponent } from './invoice-data/invoice-data';
import { PaymentAgingComponent } from './payment-aging/payment-aging';
import { CreditDebitMemoComponent } from './credit-debit-memo/credit-debit-memo';
import { OverallSalesComponent } from './overall-sales/overall-sales';
import { UserProfileComponent } from './user-profile/user-profile';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'inquiry-data', 
    component: InquiryData,
    canActivate: [AuthGuard]
  },
  { 
    path: 'sales-order', 
    component: SalesOrderComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'list-of-delivery', 
    component: ListOfDeliveryComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'finance-sheet', 
    component: FinanceSheetComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'invoice-data', 
    component: InvoiceDataComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'payment-aging', 
    component: PaymentAgingComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'credit-debit-memo', 
    component: CreditDebitMemoComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'overall-sales', 
    component: OverallSalesComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'user-profile', 
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  }
];
