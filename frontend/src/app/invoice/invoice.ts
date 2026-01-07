import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private baseUrl = environment.apiUrl + '/invoices';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return { headers: new HttpHeaders({ Authorization: 'Bearer ' + this.auth.getToken() }) };
  }

  getInvoices() {
    return this.http.get(this.baseUrl, this.getHeaders());
  }

  addInvoice(invoice: any) {
    return this.http.post(this.baseUrl, invoice, this.getHeaders());
  }

  updateInvoice(id: string, invoice: any) {
  return this.http.put(`${this.baseUrl}/${id}`, invoice, this.getHeaders());
}

deleteInvoice(id: string) {
  return this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders());
}

}
