import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WastedItemService } from '../wasteditem';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-wasteditem',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-wasteditem.html',
  styleUrls: ['./add-wasteditem.css']
})
export class AddWastedItemComponent implements OnInit {
  products: any[] = [];
  selectedProduct: any = null;
  wastedQty: number = 0;

  constructor(private wastedItemService: WastedItemService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.wastedItemService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  onProductChange(event: any) {
    const productId = event.target.value;
    this.selectedProduct = this.products.find(p => p._id === productId);
  }

  addItem() {
    if (!this.selectedProduct || this.wastedQty <= 0) {
      alert('Select product & enter valid wasted qty');
      return;
    }

    this.wastedItemService.addWastedItem({
      productId: this.selectedProduct._id,
      wastedQty: this.wastedQty
    }).subscribe(() => {
      alert('Wasted item added');
      this.selectedProduct = null;
      this.wastedQty = 0;
    });
  }
}
