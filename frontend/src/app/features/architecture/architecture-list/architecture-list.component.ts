import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ArchitectureService } from '../../../core/services/architecture.service';
import { ArchitectureSummary } from '../../../core/models/architecture.models';

/**
 * Architecture List — home screen for FASE 0.
 * Shows saved architectures and provides a starting point for FASE 1 (Canvas).
 */
@Component({
  selector: 'app-architecture-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">My Architectures</h1>
          <p class="page-subtitle">Design, validate and document OCI architectures interactively.</p>
        </div>
        <button mat-flat-button color="primary" class="new-btn" disabled>
          <mat-icon>add</mat-icon>
          New Architecture
          <span class="coming-soon">FASE 1</span>
        </button>
      </div>

      <mat-divider />

      <!-- Content -->
      <div class="content-area">

        @if (loading()) {
          <div class="center-state">
            <mat-spinner diameter="40" />
            <p>Loading architectures...</p>
          </div>
        }

        @if (error()) {
          <div class="center-state error-state">
            <mat-icon class="state-icon error-icon">cloud_off</mat-icon>
            <h2>Backend not available</h2>
            <p>Make sure the API and MongoDB are running.</p>
            <code>docker-compose up</code>
          </div>
        }

        @if (!loading() && !error() && architectures().length === 0) {
          <div class="center-state empty-state">
            <mat-icon class="state-icon">architecture</mat-icon>
            <h2>No architectures yet</h2>
            <p>Create your first OCI architecture in <strong>FASE 1</strong>.</p>
            <div class="phase-info">
              <mat-chip-set>
                <mat-chip color="accent">✅ FASE 0: Foundation</mat-chip>
                <mat-chip>⏳ FASE 1: Canvas MVP</mat-chip>
                <mat-chip>⏳ FASE 2: Architecture Model</mat-chip>
              </mat-chip-set>
            </div>
          </div>
        }

        @if (!loading() && !error() && architectures().length > 0) {
          <div class="architecture-grid">
            @for (arch of architectures(); track arch.id) {
              <mat-card class="architecture-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar class="card-icon">lan</mat-icon>
                  <mat-card-title>{{ arch.name }}</mat-card-title>
                  <mat-card-subtitle>{{ arch.region }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p class="card-description">{{ arch.description || 'No description.' }}</p>
                  <div class="card-meta">
                    <span class="resource-count">
                      <mat-icon inline>storage</mat-icon>
                      {{ arch.resourceCount }} resources
                    </span>
                    <span class="updated-at">
                      Updated {{ arch.updatedAt | date:'short' }}
                    </span>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #1a1f2e;
      margin: 0 0 4px;
    }

    .page-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .new-btn {
      position: relative;
      flex-shrink: 0;
    }

    .coming-soon {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ff9800;
      color: white;
      font-size: 9px;
      padding: 2px 5px;
      border-radius: 8px;
      font-weight: 700;
    }

    .content-area {
      padding-top: 32px;
    }

    .center-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 320px;
      text-align: center;
      gap: 16px;
    }

    .state-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #9fa8da;
    }

    .error-icon {
      color: #ef5350;
    }

    .error-state code {
      background: #1a1f2e;
      color: #80cbc4;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
    }

    .center-state h2 {
      font-size: 20px;
      font-weight: 600;
      color: #374151;
      margin: 0;
    }

    .center-state p {
      color: #6b7280;
      margin: 0;
    }

    .phase-info {
      margin-top: 8px;
    }

    .architecture-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .architecture-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: box-shadow 0.2s, transform 0.2s;
      cursor: pointer;
    }

    .architecture-card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.14);
      transform: translateY(-2px);
    }

    .card-icon {
      color: #c5221f;
      background: #fce4ec;
      border-radius: 8px;
      padding: 4px;
    }

    .card-description {
      color: #6b7280;
      font-size: 14px;
      margin: 0 0 12px;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #9ca3af;
    }

    .resource-count {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .resource-count mat-icon {
      font-size: 14px;
    }
  `]
})
export class ArchitectureListComponent implements OnInit {
  architectures = signal<ArchitectureSummary[]>([]);
  loading = signal(true);
  error = signal(false);

  constructor(private architectureService: ArchitectureService) {}

  ngOnInit() {
    this.architectureService.getAll().subscribe({
      next: (data) => {
        this.architectures.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}
