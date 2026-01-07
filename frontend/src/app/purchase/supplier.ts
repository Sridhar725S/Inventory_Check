import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private baseUrl = environment.apiUrl+ '/purchases/supplier';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getSuppliers(): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.auth.getAuthHeaders() });
  }

  addSupplier(supplier: any): Observable<any> {
    return this.http.post(this.baseUrl, supplier, { headers: this.auth.getAuthHeaders() });
  }
}
