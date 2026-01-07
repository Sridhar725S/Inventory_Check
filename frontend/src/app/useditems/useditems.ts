import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UseditemsService {

  private apiUrl = environment.apiUrl  + '/useditems';

  constructor(private http: HttpClient, private auth: AuthService) {}

  addUsedItem(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.auth.getAuthHeaders() });
  }

  getUsedItems(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.auth.getAuthHeaders() });
  }

 // useditems.service.ts
updateUsedItem(id: string, data: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, data, {
    headers: this.auth.getAuthHeaders(),
  });
}

deleteUsedItem(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`, {
    headers: this.auth.getAuthHeaders(),
  });
}


}
