import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../invoice';
import { ProductService } from '../../inventory/product';
import { Router, RouterModule } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';

@Component({
  selector: 'app-add-invoice',
  standalone: true,
  imports: [FormsModule, CommonModule, ZXingScannerModule, RouterModule],
  templateUrl: './add-invoice.html',
  styleUrls: ['./add-invoice.css']
})
export class AddInvoiceComponent implements OnInit {
  invoice: any = { products: [], status: 'pending', email: '' };
  allProducts: any[] = [];
  statuses = ['pending', 'paid', 'cancelled'];
  selectedDevice: MediaDeviceInfo | undefined;
  scannerEnabled = false; // initially off
  scannerStartedOnce = false; // to only unlock audio once

scannerMode: 'hardware' | 'camera' = 'hardware'; // default to hardware

toggleScanner() {
  if (this.scannerMode !== 'camera') return; // only allow if camera mode
  this.scannerEnabled = !this.scannerEnabled;

  if (this.scannerEnabled && !this.scannerStartedOnce) {
    this.unlockAudio();
    this.scannerStartedOnce = true;
  }
}


  // Supported barcode formats
  formats: BarcodeFormat[] = [BarcodeFormat.EAN_13, BarcodeFormat.CODE_128];

  constructor(
    private service: InvoiceService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
     this.beep.load();
      this.unlockAudio();
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.allProducts = res || [];
        console.log('Fetched Products:', this.allProducts);
      },
      error: (err) => console.error('Failed to fetch products', err)
    });
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
  // Try to pick back camera if available
  const backCam = devices.find(d => d.label.toLowerCase().includes('back'))
                  || devices[devices.length - 1]; // fallback to last
  this.selectedDevice = backCam || devices[0];
  console.log('Selected Camera:', this.selectedDevice?.label);
}

  
  beep = new Audio('assets/beep.mp3');
  notFoundBeep = new Audio('assets/error.mp3');
  unlockAudio() {
  this.beep.play().then(() => {
    this.beep.pause();
    this.beep.currentTime = 0;
    console.log('Audio unlocked ✅');
  }).catch(err => console.log('Unlock failed', err));
}
 barcodeValue: string = ''; // works for hardware scanner + manual entry

// When hardware scanner/manual input fires Enter key
handleBarcode(code: string) {
  if (!code?.trim()) return;
  console.log("Hardware/Manual Barcode:", code);
  this.processBarcode(code);
  this.barcodeValue = ''; // clear input

  // Auto-focus for next scan
  setTimeout(() => {
    const inputEl = document.querySelector<HTMLInputElement>('input[placeholder*="Scan barcode"]');
    inputEl?.focus();
  }, 50);
}

// When camera scanner (ZXing) detects barcode
onBarcodeScanned(code: string) {
  console.log("Camera Barcode:", code);

  // play beep
  this.beep.currentTime = 0;
  this.beep.play().catch(err => console.warn('Play blocked', err));

  this.processBarcode(code);
}

// Common method to handle barcode logic (used by both scanner types)
processBarcode(code: string) {
  this.productService.getProductByCode(code).subscribe({
    next: (prod: any) => {
      const existing = this.invoice.products.find((p: any) => p.productId === prod._id);
      if (existing) {
        existing.qty += 1;
      } else {
        this.invoice.products.push({
          productId: prod._id,
          itemName: prod.itemName,
          stockQty: prod.qty,
          qty: 1,
          rate: prod.rate,
          place: prod.place || 'N/A' 
        });
      }
    },
    error: () => {
      const unknown = this.invoice.products.find((p: any) => p.itemName === 'Unknown Product');
      if (unknown) {
        unknown.qty += 1;
      } else {
        this.invoice.products.push({ itemName: `Unknown Product`, qty: 1, rate: 0 });
      }

      this.notFoundBeep.currentTime = 0;
      this.notFoundBeep.play().catch(err => console.warn('Play blocked', err));
    }
  });
}


  addProduct() {
    this.invoice.products.push({ itemName: '', qty: 1, rate: 0, place: '', filteredProducts: [] });
  }

  removeProduct(index: number) {
    this.invoice.products.splice(index, 1);
  }

  save() {
  const invoiceToSave = { ...this.invoice };
  invoiceToSave.products = invoiceToSave.products.map((p: any) => {
    const base = p.qty * p.rate;
    const gst = base * 0.18;
    return {
      productId: p.productId || null,
      itemName: p.itemName,
      qty: p.qty,
      rate: p.rate,
      gst,
      totalValue: base + gst
    };
  });
  this.service.addInvoice(invoiceToSave).subscribe(() => this.router.navigate(['/invoices']));
}


  // Filter products for dropdown as user types
  onProductInput(p: any) {
    const term = p.itemName.toLowerCase().trim();
    if (term.length === 0) {
      p.filteredProducts = [];
      return;
    }
    p.filteredProducts = this.allProducts.filter(prod =>
      prod.itemName.toLowerCase().includes(term)
    );
  }

  // When user selects from dropdown
  // When user selects from dropdown
selectProduct(p: any, prod: any) {
  if (!prod || !prod._id || !prod.itemName) {
    console.warn("Invalid product selected");
    return;
  }

  p.itemName = prod.itemName;
  p.productId = prod._id;
  p.stockQty = prod.qty ?? 0;
  p.rate = prod.rate ?? 0;
  p.filteredProducts = [];
  p.place = prod.place || 'N/A';


  // qty vs stock validation
  if (p.qty && p.qty > p.stockQty) {
    alert("Selected quantity exceeds stock!");
    p.qty = p.stockQty; // reset to max available
  }
}

validateQty(p: any) {
  if (p.qty > p.stockQty) {
    alert("Selected quantity exceeds stock!");
    p.qty = '';
  } else if (p.qty < 1) {
    p.qty = 1; // minimum qty = 1
  }
}

}   
