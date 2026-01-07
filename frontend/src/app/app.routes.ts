import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { ProductListComponent } from './inventory/product-list/product-list';
import { AddProductComponent } from './inventory/add-product/add-product';
import { PurchaseListComponent } from './purchase/purchase-list/purchase-list';
import { AddPurchaseComponent } from './purchase/add-purchase/add-purchase';
import { InvoiceListComponent } from './invoice/invoice-list/invoice-list';
import { AddInvoiceComponent } from './invoice/add-invoice/add-invoice';
import { AuthGuard } from './auth/auth-guard';
import { UsedproductListComponent } from './useditems/usedproduct-list/usedproduct-list';
import { AddUsedproductComponent } from './useditems/add-usedproduct/add-usedproduct';
import { WastedItemListComponent } from './wasteditems/wasteditem-list/wasteditem-list';
import { AddWastedItemComponent } from './wasteditems/add-wasteditem/add-wasteditem';
import { SupplierListComponent } from './supplier/supplier-list/supplier-list';
import { QuotationListComponent } from './quotations/quotation-list/quotation-list';
import { QuotationFormComponent } from './quotations/quotation-form/quotation-form';
import { ChallanListComponent } from './challans/list-challan/list-challan';
import { AddChallanComponent } from './challans/add-challan/add-challan';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'products', component: ProductListComponent, canActivate: [AuthGuard] },
  { path: 'add-product', component: AddProductComponent, canActivate: [AuthGuard] },
  { path: 'purchases', component: PurchaseListComponent, canActivate: [AuthGuard] },
  { path: 'add-purchase', component: AddPurchaseComponent, canActivate: [AuthGuard] },
  { path: 'invoices', component: InvoiceListComponent, canActivate: [AuthGuard] },
  { path: 'add-invoice', component: AddInvoiceComponent, canActivate: [AuthGuard] },
  { path: 'used-items', component: UsedproductListComponent, canActivate: [AuthGuard] },
  { path: 'add-used-item', component: AddUsedproductComponent, canActivate: [AuthGuard] },
  { path: 'wasted-items', component: WastedItemListComponent, canActivate: [AuthGuard]  },
  { path: 'add-wasted-item', component: AddWastedItemComponent, canActivate: [AuthGuard]  },
  { path: 'supplier-list', component: SupplierListComponent, canActivate: [AuthGuard]  },
  { path: 'quotations', component: QuotationListComponent, canActivate: [AuthGuard] },
  { path: 'quotations/new', component: QuotationFormComponent, canActivate: [AuthGuard] },
  { path: 'quotations/:id/edit', component: QuotationFormComponent, canActivate: [AuthGuard] },
  { path: 'challans', component: ChallanListComponent, canActivate: [AuthGuard] },
  { path: 'challans/new', component: AddChallanComponent, canActivate: [AuthGuard] },
  { path: 'challans/:id/edit', component: AddChallanComponent, canActivate: [AuthGuard] },
    { path: 'challans/:id', component: AddChallanComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
