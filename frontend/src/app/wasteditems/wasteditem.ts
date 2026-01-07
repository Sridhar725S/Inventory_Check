import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WastedItemService {
  private apiUrl = environment.apiUrl + '/wasteditems';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getWastedItems(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.auth.getAuthHeaders() });
  }

  addWastedItem(item: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, item, { headers: this.auth.getAuthHeaders() });
  }

  updateWastedItem(id: string, item: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, item, { headers: this.auth.getAuthHeaders() });
  }

  deleteWastedItem(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.auth.getAuthHeaders() });
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/list`, { headers: this.auth.getAuthHeaders() });
  }
}
