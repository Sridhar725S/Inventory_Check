import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth/auth';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private apiUrl = environment.apiUrl + '/quotations';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers() {
    return { headers: this.auth.getAuthHeaders() };
  }

  getQuotations(page = 1, limit = 10, search = ''): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit).set('search', search);
    return this.http.get(this.apiUrl, { ...this.headers(), params });
  }

  getQuotation(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.headers());
  }

  addQuotation(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, this.headers());
  }

  updateQuotation(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.headers());
  }

  deleteQuotation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.headers());
  }
}
