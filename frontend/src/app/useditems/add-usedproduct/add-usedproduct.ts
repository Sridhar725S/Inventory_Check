import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UseditemsService } from '../useditems';
import { AuthService } from '../../auth/auth';

@Component({
  selector: 'app-add-usedproduct',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-usedproduct.html',
  styleUrls: ['./add-usedproduct.css']
})
export class AddUsedproductComponent implements OnInit {
  products: any[] = [];
  selectedProduct: any = null;
  qty: number = 1;

  constructor(
    private http: HttpClient,
    private usedService: UseditemsService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.http.get('http://localhost:4000/api/products',{ headers: this.auth.getAuthHeaders() }).subscribe((res: any) => {
      this.products = res;
    });
  }

  save() {
    if (!this.selectedProduct || !this.qty) return;
    const data = {
      productId: this.selectedProduct._id,
      qty: this.qty
    };
    this.usedService.addUsedItem(data).subscribe(() => {
      this.router.navigate(['/used-items']);
    });
  }
}
