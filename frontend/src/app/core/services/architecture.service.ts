import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Architecture,
  ArchitectureSummary,
  CreateArchitectureRequest,
  UpdateArchitectureRequest
} from '../models/architecture.models';

/**
 * HTTP service for Architecture CRUD operations.
 * Communicates with the .NET 10 backend API.
 * The proxy.conf.json routes /api/* to localhost:5000 in development.
 */
@Injectable({
  providedIn: 'root'
})
export class ArchitectureService {
  private readonly apiUrl = '/api/architectures';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ArchitectureSummary[]> {
    return this.http.get<ArchitectureSummary[]>(this.apiUrl);
  }

  getById(id: string): Observable<Architecture> {
    return this.http.get<Architecture>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateArchitectureRequest): Observable<Architecture> {
    return this.http.post<Architecture>(this.apiUrl, request);
  }

  update(id: string, request: UpdateArchitectureRequest): Observable<Architecture> {
    return this.http.put<Architecture>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  saveState(id: string, request: any): Observable<Architecture> {
    return this.http.put<Architecture>(`${this.apiUrl}/${id}/state`, request);
  }
}
