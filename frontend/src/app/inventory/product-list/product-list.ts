import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: string[] = [];
  editingId: string | null = null;
  editCache: any = {};

  searchText = '';
  selectedCategories: string[] = [];
  sortKey = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  itemsPerPage: number = 10;
  pageSizes: number[] = [5, 10, 25, 50];
  page: number = 1;

  isListening = false;
  recognition: any;

  constructor(
    private service: ProductService,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.service.getProducts().subscribe((res: any) => {
      this.products = res;
      this.categories = [...new Set(this.products.map((p: any) => p.category))];
      this.applyFilters();
    });
  }

  addProduct() {
    this.router.navigate(['/add-product']);
  }

  // 🎤 Voice search
  startVoiceSearch() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice search not supported 🚫');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      return;
    }

    // Fresh start → clear old search
    this.searchText = '';
    this.applyFilters();

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-IN';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.isListening = true;
    this.recognition.start();

    this.recognition.onresult = (event: any) => {
      let transcript = event.results[0][0].transcript;
      transcript = transcript.replace(/\s+/g, ' ').trim();
      console.log(transcript);
      this.zone.run(() => {
        this.searchText = transcript;
        this.applyFilters();
        this.isListening = false;
      });
    };

    this.recognition.onerror = () => {
      this.zone.run(() => {
        alert('Couldn’t hear you, try again 🎤❌');
        this.isListening = false;
      });
    };

    this.recognition.onend = () => {
      this.zone.run(() => (this.isListening = false));
    };
  }

  editProduct(product: any) {
    this.editingId = product._id;
    this.editCache = { ...product };
  }

  cancelEdit() {
    this.editingId = null;
    this.editCache = {};
  }

  saveEdit(product: any) {
    this.service.updateProduct(product._id, this.editCache).subscribe((res) => {
      Object.assign(product, res);
      this.cancelEdit();
      this.applyFilters();
    });
  }

  deleteProduct(product: any) {
    if (confirm(`Delete product "${product.itemName}"?`)) {
      this.service.deleteProduct(product._id).subscribe(() => {
        this.products = this.products.filter((p) => p._id !== product._id);
        this.applyFilters();
      });
    }
  }

  applyFilters() {
    let data = [...this.products];

    if (this.searchText.trim()) {
      data = data.filter((p) =>
        p.itemName.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    if (this.selectedCategories.length > 0) {
      data = data.filter((p) => this.selectedCategories.includes(p.category));
    }

    if (this.sortKey) {
      data.sort((a, b) => {
        let valA = a[this.sortKey];
        let valB = b[this.sortKey];

        if (this.sortKey === 'value') {
          valA = a.qty * a.rate;
          valB = b.qty * b.rate;
        }

        return this.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    this.filteredProducts = data;
  }

  toggleCategory(cat: string) {
    if (this.selectedCategories.includes(cat)) {
      this.selectedCategories = this.selectedCategories.filter((c) => c !== cat);
    } else {
      this.selectedCategories.push(cat);
    }
    this.applyFilters();
  }

  setSort(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sortKey = target.value;
    this.applyFilters();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  get totalProducts() {
    return this.filteredProducts.length;
  }

  get totalValue() {
    return this.filteredProducts.reduce(
      (sum, p) => sum + p.qty * p.rate,
      0
    );
  }
}
