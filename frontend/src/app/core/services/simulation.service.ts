import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SimulationRequest, TrafficSimulationResult } from '../models/simulation.models';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private readonly apiUrl = '/api/simulation';

  constructor(private http: HttpClient) {}

  simulatePath(request: SimulationRequest): Observable<TrafficSimulationResult> {
    return this.http.post<TrafficSimulationResult>(`${this.apiUrl}/path`, request);
  }
}
