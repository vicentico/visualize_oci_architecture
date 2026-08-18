import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private readonly apiUrl = `${environment.apiUrl}/export`;

  constructor(private http: HttpClient) {}

  exportMarkdown(architectureId: string): void {
    // Download file directly
    this.http.get(`${this.apiUrl}/${architectureId}/markdown`, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe(response => {
      const blob = response.body;
      if (!blob) return;

      // Extract filename from Content-Disposition if present
      let filename = 'architecture.md';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  exportTerraform(architectureId: string): void {
    // Download file directly
    this.http.get(`${this.apiUrl}/${architectureId}/terraform`, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe(response => {
      const blob = response.body;
      if (!blob) return;

      // Extract filename from Content-Disposition if present
      let filename = 'architecture.tf';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
