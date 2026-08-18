import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { LearningContent } from '../models/learning.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LearningService {
  private readonly apiUrl = `${environment.apiUrl}/learning`;

  constructor(private http: HttpClient) {}

  getLearningContent(resourceType: string): Observable<LearningContent | null> {
    const encodedType = encodeURIComponent(resourceType);
    return this.http.get<LearningContent>(`${this.apiUrl}/${encodedType}`).pipe(
      catchError(() => of(null)) // Return null if not found
    );
  }
}
