// challans/list-challan.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ChallanService } from '../challan';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-challan-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, DatePipe],
  templateUrl: './list-challan.html',
  styleUrls: ['./list-challan.css']
})
export class ChallanListComponent implements OnInit {
  challans: any[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  pageSizes = [5, 10, 25, 50];
  search = '';
  loading = false;

  constructor(private svc: ChallanService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.list(this.page, this.pageSize, this.search).subscribe({
      next: (res: any) => {
        this.challans = res.challans || [];
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
    this.router.navigate(['/challans/new']);
  }

  edit(c: any) {
    this.router.navigate(['/challans', c._id, 'edit']);
  }

  del(c: any) {
    if (!confirm(`Delete challan ${c.challanNo || c._id}?`)) return;
    this.svc.delete(c._id).subscribe(() => this.load());
  }

  // === PDF Download ===
  download(c: any) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('DELIVERY CHALLAN', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Challan No: ${c.challanNo || c._id}`, 14, 30);
    doc.text(`Date: ${new Date(c.date).toLocaleDateString('en-IN')}`, pageWidth - 14, 30, { align: 'right' });

    // Items Table
    const body = (c.items || []).map((it: any, idx: number) => [
      String(idx + 1),
      it.description || '—',
      String(it.quantity || 0)
    ]);

    autoTable(doc, {
  startY: 40,
  head: [['S.No', 'Item Description', 'Quantity']],
  body,
  theme: 'grid',
  styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
  headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
  columnStyles: {
    0: { halign: 'center', cellWidth: 15 }, // small column
    1: { halign: 'left' },                  // auto width
    2: { halign: 'center', cellWidth: 30 }  // compact qty col
  }
});


// ✅ Smart placement of signatures
const pageHeight = doc.internal.pageSize.getHeight();
let y = (doc as any).lastAutoTable.finalY + 20;

if (y > pageHeight - 60) {
  y = pageHeight - 60;
}

// 🔹 Fetch from challan.footer
const authorizedByName = c.footer?.authorizedBy;
const receivedByName   = c.footer?.receivedBy;

// === Authorized By ===
doc.text('Authorized By:', 14, y);

// draw line
doc.line(40, y, 90, y);

// print name below line if present, else placeholder
if (authorizedByName) {
  doc.setFontSize(9);
  doc.text(authorizedByName, 40, y + 6); // name just under line
} else {
  doc.setFontSize(9);
  doc.text('____________', 40, y + 6);
}

// === Received By ===
doc.setFontSize(10);
doc.text('Received By:', pageWidth - 80, y);

// draw line
doc.line(pageWidth - 55, y, pageWidth - 15, y);

// print name below line if present, else placeholder
if (receivedByName) {
  doc.setFontSize(9);
  doc.text(receivedByName, pageWidth - 55, y + 6);
} else {
  doc.setFontSize(9);
  doc.text('____________', pageWidth - 55, y + 6);
}


    // Footer note
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('This is a system-generated challan.', pageWidth / 2, 290, { align: 'center' });

    doc.save(`Challan_${c.challanNo || c._id}.pdf`);
  }
}
