import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ValidationResult } from '../models/validation.models';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private readonly apiUrl = '/api/validation';

  constructor(private http: HttpClient) {}

  validate(architectureState: any): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(`${this.apiUrl}/validate`, architectureState);
  }
}
