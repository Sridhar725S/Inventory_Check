import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../supplier';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  templateUrl: './supplier-list.html',
  styleUrls: ['./supplier-list.css'],
  imports: [CommonModule, FormsModule, NgxPaginationModule, RouterModule],
})
export class SupplierListComponent implements OnInit {
  suppliers: any[] = [];
  searchTerm: string = '';
  loading = true;

  editSupplierId: string | null = null;
  editData: any = {};

  // pagination
  page: number = 1;
  itemsPerPage: number = 5;

  constructor(private supplierService: SupplierService) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (res) => {
        this.suppliers = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching suppliers:', err);
        this.loading = false;
      },
    });
  }

  get filteredSuppliers() {
    if (!this.searchTerm.trim()) {
      return this.suppliers;
    }
    const term = this.searchTerm.toLowerCase();
    return this.suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.contact.toLowerCase().includes(term)
    );
  }

  deleteSupplier(id: string): void {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => this.loadSuppliers(),
        error: (err) => console.error('Delete failed:', err),
      });
    }
  }

  startEdit(supplier: any): void {
    this.editSupplierId = supplier._id;
    this.editData = { ...supplier }; // clone supplier data
  }

  saveUpdate(id: string): void {
    this.supplierService.updateSupplier(id, this.editData).subscribe({
      next: () => {
        this.editSupplierId = null;
        this.loadSuppliers();
      },
      error: (err) => console.error('Update failed:', err),
    });
  }

  cancelEdit(): void {
    this.editSupplierId = null;
    this.editData = {};
  }

  // trackBy for performance
  trackById(index: number, supplier: any): string {
    return supplier._id;
  }
}
