import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private baseUrl = environment.apiUrl + '/suppliers';

  constructor(private http: HttpClient, private auth: AuthService) {}

  // Get all suppliers
  getSuppliers(): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.auth.getAuthHeaders() });
  }

  // Add supplier
  addSupplier(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data, { headers: this.auth.getAuthHeaders() });
  }

  // Update supplier
  updateSupplier(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data, { headers: this.auth.getAuthHeaders() });
  }

  // Delete supplier
  deleteSupplier(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.auth.getAuthHeaders() });
  }
}
