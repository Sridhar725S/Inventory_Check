import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChallanService {
  private api = environment.apiUrl + '/challans';

  constructor(private http: HttpClient) {}

    list(page: number, pageSize: number, search: string): Observable<any> {
    return this.http.get<any>(`${this.api}?page=${page}&pageSize=${pageSize}&search=${search}`);
  }


  get(id: string) {
    return this.http.get(`${this.api}/${id}`);
  }

  create(payload: any) {
    return this.http.post(this.api, payload);
  }

  update(id: string, payload: any) {
    return this.http.put(`${this.api}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  downloadPdf(id: string) {
    return this.http.get(`${this.api}/${id}/pdf`, { responseType: 'blob' });
  }
}
