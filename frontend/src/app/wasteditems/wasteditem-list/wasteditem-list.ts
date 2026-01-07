import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router, RouterModule } from '@angular/router';
import { WastedItemService } from '../wasteditem';

type SortField = '' | 'qty' | 'date' | 'category';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-wasteditem-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, NgxPaginationModule, RouterModule],
  templateUrl: './wasteditem-list.html',
  styleUrls: ['./wasteditem-list.css']
})
export class WastedItemListComponent implements OnInit {
  wastedItems: any[] = [];
  filteredItems: any[] = [];
  editingItemId: string | null = null;

  categories: string[] = [];
  selectedCategories: string[] = [];

  searchTerm: string = '';
  sortField: SortField = '';
  sortDirection: SortDir = 'asc';

  // pagination
  page: number = 1;
  itemsPerPage: number = 5;

  constructor(private wastedItemService: WastedItemService, private router: Router) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    this.wastedItemService.getWastedItems().subscribe(data => {
      this.wastedItems = data;
      this.filteredItems = [...this.wastedItems];
      this.categories = [...new Set(this.wastedItems.map(i => i.category))];
      this.applyFilters();
    });
  }

  // ➕ Add wasted product
  addWastedProduct() {
    this.router.navigate(['/add-wasted-item']);
  }

  deleteItem(id: string) {
    if (confirm('Delete this wasted item?')) {
      this.wastedItemService.deleteWastedItem(id).subscribe(() => this.loadItems());
    }
  }

  // ✏️ Inline edit
  startEdit(item: any) {
    this.editingItemId = item._id;
  }

  saveEdit(item: any) {
    // 🔒 Do NOT send/modify `date` — keep original
    const payload = {
      productId: item.product._id,
      wastedQty: item.wastedQty,
      category: item.category
    };

    this.wastedItemService.updateWastedItem(item._id, payload).subscribe({
      next: () => {
        this.editingItemId = null;
        this.loadItems();
      },
      error: err => console.error('Update failed', err)
    });
  }

  cancelEdit() {
    this.editingItemId = null;
    this.loadItems();
  }

  // 🔍 search + filter + sort
  applyFilters() {
    let items = [...this.wastedItems];

    // search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      items = items.filter(item =>
        item.product.itemName.toLowerCase().includes(term)
      );
    }

    // category filter
    if (this.selectedCategories.length > 0) {
      items = items.filter(item => this.selectedCategories.includes(item.category));
    }

    // sorting (ASC/DESC)
    if (this.sortField) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      items.sort((a, b) => {
        if (this.sortField === 'qty') {
          return (a.wastedQty - b.wastedQty) * dir;
        }
        if (this.sortField === 'date') {
          return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
        }
        if (this.sortField === 'category') {
          return a.category.localeCompare(b.category) * dir;
        }
        return 0;
      });
    }

    this.filteredItems = items;
    // reset to first page after filter/sort to avoid empty page confusion
    this.page = 1;
  }

  toggleCategory(cat: string) {
    if (this.selectedCategories.includes(cat)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
    } else {
      this.selectedCategories.push(cat);
    }
    this.applyFilters();
  }

  trackById(index: number, item: any): string {
  return item._id;
}

}
