import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QuotationService } from '../quotations';
import { ProductService } from '../../inventory/product';

type Item = {
  product: string;   // product _id
  qty: number;
  price: number;
  lineTotal: number;
};

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quotation-form.html',
  styleUrls: ['./quotation-form.css']
})
export class QuotationFormComponent implements OnInit {
  isEdit = false;
  id: string | null = null;

  products: any[] = [];

  quotation: any = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [] as Item[],
    validityDays: 30,
    notes: '',
    discountPercent: 0,
    subtotal: 0,
    discountAmount: 0,
    grandTotal: 0
  };

  constructor(
    private qs: QuotationService,
    private ps: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Load products first so we can map prices on edit load
    this.ps.getProducts().subscribe((prods: any[]) => {
      this.products = prods || [];

      this.id = this.route.snapshot.paramMap.get('id');
      this.isEdit = !!this.id;

      if (this.isEdit && this.id) {
        this.qs.getQuotation(this.id).subscribe(q => {
          // Normalize incoming quotation
          this.quotation = {
            customerName: q.customerName || '',
            customerEmail: q.customerEmail || '',
            customerPhone: q.customerPhone || '',
            validityDays: q.validityDays ?? 30,
            notes: q.notes || '',
            discountPercent: Number(q.discountPercent || 0),
            subtotal: Number(q.subtotal || 0),
            discountAmount: Number(q.discountAmount || 0),
            grandTotal: Number(q.grandTotal || 0),
            items: (q.items || []).map((it: any) => ({
              // If backend populated items.product, it may be object; normalize to id
              product: typeof it.product === 'object' ? it.product?._id : it.product,
              qty: Number(it.qty || 0),
              // Prefer stored price; if missing, infer from product list (rate or price)
              price:
                it.price != null
                  ? Number(it.price)
                  : this.findProductPrice(typeof it.product === 'object' ? it.product?._id : it.product),
              lineTotal: Number(it.lineTotal || 0)
            }))
          };

          // Ensure prices are correct for each row (in case product pricing changed)
          this.quotation.items.forEach((_: any, i: number) => this.ensurePriceFromCatalog(i));
          this.recalcAll();
        });
      } else {
        // New quotation: start with one empty row
        this.addItem();
      }
    });
  }

  /** Safely get product price from catalog: prefer `rate`, fallback to `price`, else 0 */
  private findProductPrice(productId: string): number {
    const p = this.products.find(pp => pp._id === productId);
    if (!p) return 0;
    // Many schemas use `rate`. We also accept `price` as a fallback.
    const val = p.rate ?? p.price ?? 0;
    return Number(val) || 0;
  }

  addItem() {
    this.quotation.items.push({
      product: '',
      qty: 1,
      price: 0,
      lineTotal: 0
    });
  }

  removeItem(i: number) {
    this.quotation.items.splice(i, 1);
    this.recalcAll();
  }

  /** Called when a product is changed in row i */
  onProductChange(i: number) {
    this.ensurePriceFromCatalog(i);
    this.calculateItem(i);
  }

  /** If row has a product selected, auto-fill/refresh the price from catalog */
  private ensurePriceFromCatalog(i: number) {
    const it = this.quotation.items[i];
    if (!it?.product) return;

    const priceFromCatalog = this.findProductPrice(it.product);
    // Only overwrite if price is 0/empty OR always refresh (choose policy). Here we refresh always.
    it.price = priceFromCatalog;
  }

  calculateItem(i: number) {
    const it = this.quotation.items[i];
    const qty = Number(it.qty || 0);
    const price = Number(it.price || 0);
    it.lineTotal = +(qty * price).toFixed(2);
    this.recalcAll();
  }

  recalcAll() {
    // Ensure numbers
    this.quotation.discountPercent = Math.min(
      100,
      Math.max(0, Number(this.quotation.discountPercent || 0))
    );

    this.quotation.subtotal = +this.quotation.items
      .reduce((sum: number, it: Item) => sum + (Number(it.lineTotal) || 0), 0)
      .toFixed(2);

    this.quotation.discountAmount = +(
      (this.quotation.subtotal * this.quotation.discountPercent) /
      100
    ).toFixed(2);

    this.quotation.grandTotal = +(
      this.quotation.subtotal - this.quotation.discountAmount
    ).toFixed(2);
  }

  save() {
    const payload = {
      customerName: this.quotation.customerName,
      customerEmail: this.quotation.customerEmail,
      customerPhone: this.quotation.customerPhone,
      validityDays: Number(this.quotation.validityDays || 30),
      notes: this.quotation.notes || '',
      discountPercent: Number(this.quotation.discountPercent || 0),
      // send only necessary fields; backend will recompute totals
      items: (this.quotation.items || []).map((it: Item) => ({
        product: it.product,
        qty: Number(it.qty || 0),
        price: Number(it.price || 0)
      }))
    };

    const obs = this.isEdit && this.id
      ? this.qs.updateQuotation(this.id, payload)
      : this.qs.addQuotation(payload);

    obs.subscribe({
      next: () => this.router.navigate(['/quotations']),
      error: (e) => alert('Save failed: ' + (e?.error?.error || 'Unknown error'))
    });
  }
}
