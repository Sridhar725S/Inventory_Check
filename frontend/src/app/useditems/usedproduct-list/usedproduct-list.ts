import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { UseditemsService } from '../useditems';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-usedproduct-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, RouterModule],
  templateUrl: './usedproduct-list.html',
  styleUrls: ['./usedproduct-list.css']
})
export class UsedproductListComponent implements OnInit {
  usedItems: any[] = [];
  filteredItems: any[] = [];

  searchTerm: string = '';
  selectedCategories: string[] = [];
  sortDirection: 'asc' | 'desc' = 'asc';

  // edit mode
  editIndex: number | null = null;
  editData: any = {};

  // Pagination
  page: number = 1;
  pageSize: number = 5;

  constructor(private usedService: UseditemsService, private router: Router) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.usedService.getUsedItems().subscribe((res: any) => {
      this.usedItems = res;
      this.applyFilters();
    });
  }

  addUsedProduct() {
    this.router.navigate(['/add-used-item']);
  }

  toggleCategory(category: string) {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  applyFilters() {
    let items = [...this.usedItems];

    // search filter
    if (this.searchTerm) {
      items = items.filter(u =>
        u.product?.itemName?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // category filter
    if (this.selectedCategories.length > 0) {
      items = items.filter(u => this.selectedCategories.includes(u.category));
    }

    // sorting
    items = items.sort((a, b) =>
      this.sortDirection === 'asc' ? a.qty - b.qty : b.qty - a.qty
    );

    this.filteredItems = items;
  }

  changeSort(dir: 'asc' | 'desc') {
    this.sortDirection = dir;
    this.applyFilters();
  }

  changePageSize(event: any) {
    this.pageSize = +event.target.value;
    this.page = 1; // reset to first page
  }

  // inline edit
  enableEdit(i: number, item: any) {
    this.editIndex = i;
    this.editData = { ...item };
  }

  cancelEdit() {
    this.editIndex = null;
    this.editData = {};
  }

  saveEdit(item: any) {
  const payload = {
    productId: this.editData.product._id, // productId required by backend
    qty: this.editData.qty
  };
  this.usedService.updateUsedItem(item._id, payload).subscribe(() => {
    this.loadItems();
    this.cancelEdit();
  });
}


  deleteUsedProduct(id: string) {
    if (confirm('Are you sure you want to delete this used item?')) {
      this.usedService.deleteUsedItem(id).subscribe(() => {
        this.usedItems = this.usedItems.filter(u => u._id !== id);
        this.applyFilters();
      });
    }
  }
}
