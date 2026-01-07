import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { InvoiceService } from '../invoice';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

declare var require: any;




@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxPaginationModule,HttpClientModule],
  templateUrl: './invoice-list.html',
  styleUrls: ['./invoice-list.css']
})
export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];

  // Filters
  searchTerm: string = '';
  statusFilter: string = 'all';
  selectedRange: string = 'thisMonth';
  customStart: string = '';
  customEnd: string = '';


  invoiceDate: string = '';
invoiceCounterKey = 'invoiceCounter';
  // Pagination
  page: number = 1;
  itemsPerPage: number = 5;

  // Totals
  totalCount: number = 0;
  totalAmount: number = 0;

  // Sorting
  sortField: string = '';
  sortDirection: string = 'asc';
  selectedSort = '';

  sortOptions = [
    { label: 'Date ↑', field: 'date', dir: 'asc' },
    { label: 'Date ↓', field: 'date', dir: 'desc' },
    { label: 'Total Value ↑', field: 'totalInvoiceValue', dir: 'asc' },
    { label: 'Total Value ↓', field: 'totalInvoiceValue', dir: 'desc' },
    { label: 'Name A → Z', field: 'name', dir: 'asc' },
    { label: 'Name Z → A', field: 'name', dir: 'desc' },
  ];

  dateOptions = [
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'This Quarter', value: 'thisQuarter' },
    { label: 'Last Quarter', value: 'lastQuarter' },
    { label: 'This Financial Year', value: 'thisFY' },
    { label: 'Last Financial Year', value: 'lastFY' },
    { label: 'Custom Range', value: 'custom' }
  ];

  constructor(private service: InvoiceService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.service.getInvoices().subscribe((res: any) => {
      this.invoices = res.map((inv: any) => ({
        ...inv,
        statusClass: inv.status?.trim().toLowerCase(),
        isEditing: false,
        showProducts: false // 👈 flag to toggle product display
      }));
      this.applyFilters();
    });
  }

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

  applyFilters() {
    let data = [...this.invoices];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(inv =>
        (inv.name?.toLowerCase() || '').includes(term) ||
        (inv.college?.toLowerCase() || '').includes(term)
      );
    }

    if (this.statusFilter !== 'all') {
      data = data.filter(inv => inv.statusClass === this.statusFilter);
    }

    const { start, end } = this.getDateRange();
    if (start && end) {
      data = data.filter(inv => {
        const d = new Date(inv.date);
        return d >= start && d <= end;
      });
    }

    if (this.selectedSort) {
      const opt = this.sortOptions.find(o => o.label === this.selectedSort);
      if (opt) {
        data.sort((a, b) => {
          let valA = a[opt.field];
          let valB = b[opt.field];
          if (opt.field === 'date') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
          }
          if (valA < valB) return opt.dir === 'asc' ? -1 : 1;
          if (valA > valB) return opt.dir === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    this.totalCount = data.length;
    this.totalAmount = data.reduce((sum, inv) => sum + (inv.totalInvoiceValue || 0), 0);

    this.filteredInvoices = data;
  }

  setSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  addInvoice() {
    this.router.navigate(['/add-invoice']);
  }

  editInvoice(invoice: any) {
    invoice.isEditing = true;
  }

  saveInvoice(invoice: any) {
    this.service.updateInvoice(invoice._id, invoice).subscribe({
      next: () => {
        invoice.isEditing = false;
      },
      error: (err) => console.error('Update failed', err)
    });
  }

  cancelEdit(invoice: any) {
    invoice.isEditing = false;
    this.loadInvoices();
  }

  deleteInvoice(id: string) {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.service.deleteInvoice(id).subscribe({
        next: () => {
          this.invoices = this.invoices.filter(inv => inv._id !== id);
          this.applyFilters();
        },
        error: err => console.error(err)
      });
    }
  }
  printInvoice(invoice: any) {
  this.http.post('http://localhost:5000/print', { invoice }, {
    headers: { 'x-api-key': 'strong_secret' ,
     'Content-Type': 'application/json'}  // important
  }).subscribe({
    next: () => alert('🖨️ Invoice sent to printer securely!'),
    error: err => console.error('Print failed', err)
  });
}

showAddressForm = false;
tempBilling: any = {};
tempShipping: any = {};
currentInvoice: any;

printFormalInvoice(inv: any) {
  this.currentInvoice = inv;

  // Initialize temp objects with empty strings
  this.tempBilling = { name: '', address: '', city: '', state: '' };
  this.tempShipping = { name: '', address: '', city: '', state: '', isWithinState: true };

  this.showAddressForm = true; // show popup
}

confirmAddresses() {
  // Simple validation
  if (
    !this.tempBilling.name || !this.tempBilling.address || !this.tempBilling.city || !this.tempBilling.state ||
    !this.tempShipping.name || !this.tempShipping.address || !this.tempShipping.city || !this.tempShipping.state
  ) {
    alert('Please fill all required fields');
    return;
  }

    // Check invoice date
  if (!this.invoiceDate) {
    alert('Please select an invoice date');
    return;
  }

  // ✅ Auto-increment invoice number using localStorage
  const invoiceCounterKey = 'invoiceCounter';
  let lastNumber = Number(localStorage.getItem(invoiceCounterKey)) || 0;
  lastNumber++;

  // Save updated counter
  localStorage.setItem(invoiceCounterKey, lastNumber.toString());

  // Format invoice number like INV001, INV002...
  const invoiceNo = `INV${String(lastNumber).padStart(3, '0')}`;

  // Attach temp addresses to invoice object temporarily
  this.currentInvoice.invoiceNo = invoiceNo;
  this.currentInvoice.date = this.invoiceDate; // user-provided date
  this.currentInvoice.billingAddress = { ...this.tempBilling };
  this.currentInvoice.shippingAddress = { ...this.tempShipping };
  this.currentInvoice.isWithinState = this.tempShipping.isWithinState;

  this.showAddressForm = false;

  // Generate PDF
  this.generateInvoicePDF(this.currentInvoice);
}


cancelAddressForm() {
  this.showAddressForm = false;
} 

numberToWords(num: number): string {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  const numToWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
    if (n < 1000000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
    return '';
  }

  return numToWords(num);
}


// Move your old jsPDF code here
generateInvoicePDF(inv: any) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 12;
  const rightMargin = 12;

  doc.setFont("NotoSans", "normal");

  // Company Header
  doc.addImage("/assets/logo.png", "PNG", leftMargin, 10, 40, 20);
  doc.setFontSize(14).setFont("NotoSans", "bold");
  doc.text("COMPANY NAME", pageWidth - rightMargin, 15, { align: "right" });

  doc.setFontSize(10).setFont("NotoSans", "normal");
  doc.text("Address Line 1", pageWidth - rightMargin, 22, { align: "right" });
  doc.text("City - Pincode", pageWidth - rightMargin, 27, { align: "right" });
  doc.text("GST: 123456789", pageWidth - rightMargin, 32, { align: "right" });
  doc.text("Phone: 9876543210", pageWidth - rightMargin, 37, { align: "right" });

  // Invoice Title
  doc.setFontSize(16).setFont("NotoSans", "bold");
  doc.text("TAX INVOICE", pageWidth / 2, 50, { align: "center" });

 doc.setFontSize(10).setFont("NotoSans", "normal");
doc.text(`Invoice No: ${inv.invoiceNo || "INV001"}`, leftMargin, 65);

const dateObj = new Date(inv.date);
const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
doc.text(`Date: ${formattedDate}`, leftMargin, 70);

  // Billing & Shipping
  const billingY = 65;
  doc.setFont("NotoSans", "bold");
  doc.text("Billing Address", leftMargin, billingY);
  doc.text("Shipping Address", pageWidth / 2 + 10, billingY);

  doc.setFont("NotoSans", "normal");
  doc.text(inv.billingAddress?.name || "", leftMargin, billingY + 6);
  doc.text(inv.billingAddress?.address || "", leftMargin, billingY + 12);
  doc.text(`${inv.billingAddress?.city}, ${inv.billingAddress?.state}`, leftMargin, billingY + 18);

  doc.text(inv.shippingAddress?.name || "", pageWidth / 2 + 10, billingY + 6);
  doc.text(inv.shippingAddress?.address || "", pageWidth / 2 + 10, billingY + 12);
  doc.text(`${inv.shippingAddress?.city}, ${inv.shippingAddress?.state}`, pageWidth / 2 + 10, billingY + 18);

  // Products Table
  const productData = inv.products.map((p: any, i: number) => {
    const qty = Number(p.qty) || 0;
    const rate = Number(p.rate || p.price) || 0;
    const taxable = +(qty * rate).toFixed(2);
    const tax = +(taxable * 0.18).toFixed(2);
    const total = +(taxable + tax).toFixed(2);

    return [
      i + 1,
      p.itemName || "",
      qty,
      `₹ ${rate.toFixed(2)}`,
      `₹ ${tax.toFixed(2)}`,
      `₹ ${total.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: billingY + 30,
    head: [["S.No", "Item & Description", "Qty", "Unit Rate", inv.isWithinState ? "CGST+SGST (18%)" : "IGST (18%)", "Amount"]],
    body: productData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || billingY + 50;

  // Totals
  const total = inv.totalInvoiceValue || 0;
  const grandTotal = total * 1.18;

  autoTable(doc, {
    startY: finalY + 5,
    theme: "plain",
    body: [
      [{ content: `Total Before Tax: ₹ ${total.toFixed(2)}`, colSpan: 6, styles: { halign: "right" } }],
      [{ content: `Grand Total: ₹ ${grandTotal.toFixed(2)}`, colSpan: 6, styles: { halign: "right", fontStyle: "bold" } }]
    ]
  });

  // Amount in words
  doc.setFont("NotoSans", "italic");
  doc.text(`Amount in Words: ${this.numberToWords(Math.round(grandTotal))} only`, leftMargin, (doc as any).lastAutoTable.finalY + 10);

  // Footer
  doc.setFont("NotoSans", "normal");
  doc.text("This is a computer generated invoice. E.&.O.E.", leftMargin, (doc as any).lastAutoTable.finalY + 25);
  doc.text("Authorized Signatory", pageWidth - rightMargin, (doc as any).lastAutoTable.finalY + 25, { align: "right" });

  doc.save(`Invoice_${inv.invoiceNo || "INV001"}.pdf`);
}

}
