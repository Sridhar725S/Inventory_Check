import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { QuotationService } from '../quotations';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, DatePipe, CurrencyPipe],
  templateUrl: './quotation-list.html',
  styleUrls: ['./quotation-list.css']
})
export class QuotationListComponent implements OnInit {
  quotations: any[] = [];
  total = 0;

  // filters & pagination
  search = '';
  page = 1;
  pageSize = 10;
  pageSizes = [5, 10, 25, 50];

  loading = false;

  constructor(private qs: QuotationService, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.qs.getQuotations(this.page, this.pageSize, this.search).subscribe({
      next: (res) => {
        this.quotations = res.quotations || [];
        this.total = res.total || 0;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  onSearch() {
    this.page = 1;
    this.load();
  }

  onPageChange(p: number) {
    this.page = p;
    this.load();
  }

  onPageSizeChange() {
    this.page = 1;
    this.load();
  }

  add() {
    this.router.navigate(['/quotations/new']);
  }

  edit(q: any) {
    this.router.navigate(['/quotations', q._id, 'edit']);
  }

  del(q: any) {
    if (!confirm('Delete this quotation?')) return;
    this.qs.deleteQuotation(q._id).subscribe(() => this.load());
  }

  // ---- Helpers ----

  private formatINR(v: number | string | null | undefined): string {
    const num = Number(v || 0);
    // Use INR text instead of ₹ to avoid font issues
    return 'INR ' + new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  // === Pro Corporate PDF (A4) ===
  async download(q: any) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top brand bar
    doc.setFillColor(41, 128, 185); // corporate blue
    doc.rect(0, 0, pageWidth, 26, 'F');

    // Company name on brand bar
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('BIG MAN ENTERPRISES PVT LTD', 8, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('123 Corporate Street, Tech City, India - 600001', 8, 20);
    doc.text('Phone: +91 9876543210   |   Email: contact@bigman.com', 8, 25);

    // Title + meta
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('QUOTATION', pageWidth - 8, 15, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Quotation No: ${q.quotationNo || q._id}`, pageWidth - 8, 20, { align: 'right' });
    doc.text(`Date: ${new Date(q.date).toLocaleDateString('en-IN')}`, pageWidth - 8, 25, { align: 'right' });

    // Bill To block
    const leftX = 10;
    let cursorY = 36;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Bill To', leftX, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(q.customerName || 'Customer Name', leftX, cursorY); cursorY += 5;
    if (q.customerEmail) { doc.text(q.customerEmail, leftX, cursorY); cursorY += 5; }
    if (q.customerPhone) { doc.text(`Phone: ${q.customerPhone}`, leftX, cursorY); cursorY += 5; }

    // Items table
    const body = (q.items || []).map((it: any) => {
      const qty = Number(it.qty || 0);
      const price = Number(it.price || 0);
      const lineTotal = qty * price;
      return [
        it.product?.itemName || '—',
        String(qty),
        this.formatINR(price),
        this.formatINR(lineTotal)
      ];
    });

    autoTable(doc, {
      startY: 58,
      head: [['Product', 'Qty', 'Unit Price', 'Line Total']],
      body,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 96 },     // Product
        1: { halign: 'center', cellWidth: 18 }, // Qty
        2: { halign: 'right', cellWidth: 35 },  // Unit Price
        3: { halign: 'right', cellWidth: 35 }   // Line Total
      }
    });

    const endY = (doc as any).lastAutoTable.finalY || 90;

    // Summary panel (right side)
    const boxX = pageWidth - 90;
    const boxY = endY + 8;
    const boxW = 80;
    const lineH = 7;

    doc.setDrawColor(200);
    doc.roundedRect(boxX, boxY, boxW, 32, 2, 2);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text('Summary', boxX + 4, boxY + 7);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text('Subtotal', boxX + 4, boxY + 7 + lineH);
    doc.text(this.formatINR(q.subtotal), boxX + boxW - 4, boxY + 7 + lineH, { align: 'right' });

    const discountLine = `Discount (${Number(q.discountPercent || 0)}%)`;
    doc.text(discountLine, boxX + 4, boxY + 7 + 2 * lineH);
    doc.text(this.formatINR(q.discountAmount), boxX + boxW - 4, boxY + 7 + 2 * lineH, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total', boxX + 4, boxY + 7 + 3 * lineH);
    doc.text(this.formatINR(q.grandTotal), boxX + boxW - 4, boxY + 7 + 3 * lineH, { align: 'right' });

    // Terms / Notes (left)
    let tY = boxY;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text('Terms & Notes', 10, tY);
    tY += 6;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text(`Validity: ${q.validityDays} days`, 10, tY); tY += 6;
    if (q.notes) {
      const wrapped = doc.splitTextToSize(q.notes, boxX - 16);
      doc.text(wrapped, 10, tY);
      tY += wrapped.length * 5;
    }

    // Signature block
    const sigY = Math.max(tY + 12, boxY + 40);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);

    if (q.signature) {
      try {
        doc.text('Authorized Signatory', pageWidth - 55, sigY + 20);
        doc.addImage(q.signature, 'PNG', pageWidth - 70, sigY, 45, 15);
      } catch {
        doc.text('Authorized Signatory', pageWidth - 55, sigY + 20);
        doc.line(pageWidth - 70, sigY + 16, pageWidth - 25, sigY + 16);
      }
    } else {
      doc.text('Authorized Signatory', pageWidth - 55, sigY + 20);
      doc.line(pageWidth - 70, sigY + 16, pageWidth - 25, sigY + 16);
    }

    // Footer
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120);
    doc.text('This is a computer-generated quotation. No physical stamp required.', pageWidth / 2, 290, { align: 'center' });

    doc.save(`Quotation_${q.quotationNo || q._id}.pdf`);
  }
}
