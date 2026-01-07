// add-product.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../product';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxBarcode6Module } from 'ngx-barcode6';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxBarcode6Module, RouterModule],
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.css']
})
export class AddProductComponent {
  product: any = {};
  savedProduct: any = null;
  categories = ['sensor', 'module', 'microcontroller'];

  constructor(private service: ProductService, private router: Router) {}

  save() {
    this.service.addProduct(this.product).subscribe(res => {
      this.savedProduct = res; // keep saved product with code
    });
  }
  

  printBarcode() {
  const barcodeElement = document.querySelector('.barcode-container') as HTMLElement;
  const newWindow = window.open('', '_blank');
  newWindow?.document.write(`
    <html>
      <head><title>Print Barcode</title></head>
      <body>${barcodeElement?.innerHTML}</body>
    </html>
  `);
  newWindow?.document.close();
  newWindow?.print();
}


}
