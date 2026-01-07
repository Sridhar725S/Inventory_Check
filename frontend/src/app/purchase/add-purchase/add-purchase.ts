import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PurchaseService } from '../purchase';
import { ProductService } from '../../inventory/product';
import { SupplierService } from '../../purchase/supplier';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-purchase',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './add-purchase.html',
  styleUrls: ['./add-purchase.css']
})
export class AddPurchaseComponent implements OnInit {
  purchase: any = { products: [] };
  allProducts: any[] = [];
  suppliers: any[] = [];
  showSupplierForm = false;

  newSupplier: any = { name: '', contact: '', address: '', gstNo: '' };

  constructor(
    private service: PurchaseService,
    private productService: ProductService,
    private supplierService: SupplierService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.getSuppliers();
  }

  loadProducts() {
    this.productService.getProducts().subscribe((res: any) => this.allProducts = res);
  }

  getSuppliers() {
    this.supplierService.getSuppliers().subscribe((res: any) => this.suppliers = res);
  }

  addProduct() {
    this.purchase.products.push({ qty: 1, sellPrice: 0 });
  }

  removeProduct(i: number) {
    this.purchase.products.splice(i, 1);
  }

  save() {
    this.service.addPurchase(this.purchase).subscribe(() => this.router.navigate(['/purchases']));
  }

  addSupplier() {
    this.supplierService.addSupplier(this.newSupplier).subscribe((res: any) => {
      this.suppliers.push(res);          // Add newly created supplier to dropdown
      this.purchase.supplierId = res._id; // Select new supplier automatically
      this.newSupplier = { name: '', contact: '', address: '', gstNo: '' };
      this.showSupplierForm = false;     // Hide supplier form
    });
  }
}
