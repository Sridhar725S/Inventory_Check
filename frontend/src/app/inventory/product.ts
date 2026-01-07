import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = environment.apiUrl + '/products';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** Get all products */
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, { headers: this.auth.getAuthHeaders() });
  }

  /** Add a new product */
  addProduct(product: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, product, { headers: this.auth.getAuthHeaders() });
  }

  /** Update a product */
  updateProduct(id: string, product: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, product, { headers: this.auth.getAuthHeaders() });
  }

  /** Delete a product */
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, { headers: this.auth.getAuthHeaders() });
  }

  /** Get product by code */
  getProductByCode(code: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/by-code/${code}`, { headers: this.auth.getAuthHeaders() });
  }
}
