import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PurchaseService } from '../purchase';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxPaginationModule],
  templateUrl: './purchase-list.html',
  styleUrls: ['./purchase-list.css']
})
export class PurchaseListComponent implements OnInit {
  purchases: any[] = [];
  filteredPurchases: any[] = [];

  searchText: string = '';
  sortBy: string = '';
  totalAmount: number = 0;

  selectedRange: string = 'thisMonth';
  customStart: string = '';
  customEnd: string = '';
  editingId: string | null = null;
  backupPurchase: any = null;
  

  // Pagination
  page: number = 1;
  itemsPerPage: number = 5;
  pageSizes: number[] = [5, 10, 25, 50];


  // Dropdown options like Salesforce/QuickBooks
  dateOptions = [
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'This Quarter', value: 'thisQuarter' },
    { label: 'Last Quarter', value: 'lastQuarter' },
    { label: 'This Financial Year', value: 'thisFY' },
    { label: 'Last Financial Year', value: 'lastFY' },
    { label: 'Custom Range', value: 'custom' }
  ];

  constructor(private service: PurchaseService, private router: Router) {}

  ngOnInit() {
    this.service.getPurchases().subscribe((res: any) => {
      this.purchases = res;
      this.applyFilters();
    });
  }

  addPurchase() {
    this.router.navigate(['/add-purchase']);
  }
   

startEdit(id: string) {
  this.editingId = id;
  // Deep copy backup in case user cancels
  const original = this.purchases.find(p => p._id === id);
  this.backupPurchase = JSON.parse(JSON.stringify(original));
}

cancelEdit() {
  if (this.editingId && this.backupPurchase) {
    // restore old state
    const idx = this.purchases.findIndex(p => p._id === this.editingId);
    this.purchases[idx] = this.backupPurchase;
    this.applyFilters();
  }
  this.editingId = null;
  this.backupPurchase = null;
}

saveEdit(purchase: any) {
  // recalc totalValue before sending to backend
  purchase.totalValue = purchase.products.reduce(
    (sum: number, prod: any) => sum + (prod.qty * prod.purchasePrice),
    0
  );

  this.service.updatePurchase(purchase._id, purchase).subscribe({
    next: () => {
      this.editingId = null;
      this.backupPurchase = null;
      this.applyFilters(); // refresh totals
    },
    error: (err) => console.error('Update failed:', err)
  });
}


deletePurchase(id: string) {
  if (confirm('Are you sure you want to delete this purchase?')) {
    this.service.deletePurchase(id).subscribe({
      next: () => {
        this.purchases = this.purchases.filter(p => p._id !== id);
        this.applyFilters();
      },
      error: (err) => console.error('Delete failed:', err)
    });
  }
}



  // Main filter method
  applyFilters() {
    let data = [...this.purchases];

    // 1. Search
    if (this.searchText) {
      const lower = this.searchText.toLowerCase();
      data = data.filter(p =>
        p.supplierId?.name?.toLowerCase().includes(lower) ||
        p.products.some((prod: any) =>
          prod.productId?.itemName?.toLowerCase().includes(lower)
        )
      );
    }

    // 2. Date filter
    let { start, end } = this.getDateRange();
    if (start && end) {
      data = data.filter(p => {
        const date = new Date(p.invoiceDate);
        return date >= start && date <= end;
      });
    }

    // 3. Sorting
    if (this.sortBy) {
      data.sort((a, b) => {
        if (this.sortBy === 'dateAsc') return new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
        if (this.sortBy === 'dateDesc') return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
        if (this.sortBy === 'valueAsc') return a.totalValue - b.totalValue;
        if (this.sortBy === 'valueDesc') return b.totalValue - a.totalValue;
        return 0;
      });
    }

    // 4. Assign filtered data + totals
    this.filteredPurchases = data;
    this.totalAmount = data.reduce((sum, p) => sum + (p.totalValue || 0), 0);
  }

  // Helper: calculate date ranges
  getDateRange() {
    let start: Date | null = null;
    let end: Date | null = null;
    const now = new Date();

    switch (this.selectedRange) {
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisQuarter':
        const q = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), q * 3, 1);
        end = new Date(now.getFullYear(), q * 3 + 3, 0);
        break;
      case 'lastQuarter':
        let lastQ = Math.floor(now.getMonth() / 3) - 1;
        let year = now.getFullYear();
        if (lastQ < 0) { lastQ = 3; year--; }
        start = new Date(year, lastQ * 3, 1);
        end = new Date(year, lastQ * 3 + 3, 0);
        break;
      case 'thisFY':
        start = new Date(now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1, 3, 1);
        end = new Date(start.getFullYear() + 1, 2, 31);
        break;
      case 'lastFY':
        start = new Date(now.getMonth() >= 3 ? now.getFullYear() - 1 : now.getFullYear() - 2, 3, 1);
        end = new Date(start.getFullYear() + 1, 2, 31);
        break;
      case 'custom':
        if (this.customStart && this.customEnd) {
          start = new Date(this.customStart);
          end = new Date(this.customEnd);
        }
        break;
    }

    return { start, end };
  }
}
