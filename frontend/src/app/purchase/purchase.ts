import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private baseUrl = environment.apiUrl + '/purchases';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return { headers: new HttpHeaders({ Authorization: 'Bearer ' + this.auth.getToken() }) };
  }

  getPurchases() {
    return this.http.get(this.baseUrl, this.getHeaders());
  }

  addPurchase(purchase: any) {
    return this.http.post(this.baseUrl, purchase, this.getHeaders());
  }
  
  updatePurchase(id: string, purchase: any) {
  return this.http.put(`${this.baseUrl}/${id}`, purchase, this.getHeaders());
}

deletePurchase(id: string) {
  return this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders());
}


}
