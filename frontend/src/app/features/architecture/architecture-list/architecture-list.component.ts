import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ArchitectureService } from '../../../core/services/architecture.service';
import { ArchitectureSummary } from '../../../core/models/architecture.models';
import { CanvasStateService } from '../../canvas/services/canvas-state.service';

/**
 * Architecture List — home screen.
 * Lists saved architectures and allows launching the Visual Designer.
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
        <button mat-flat-button color="primary" class="new-btn" (click)="openDesigner()">
          <mat-icon>add</mat-icon>
          New Architecture
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
            <h2>Launch the Interactive Visual Designer</h2>
            <p>Design OCI architectures with drag & drop, configure properties, and connect components.</p>
            <button mat-flat-button color="primary" class="hero-btn" (click)="openDesigner()">
              <mat-icon>design_services</mat-icon>
              Open Visual Designer
            </button>
            <div class="phase-info">
              <mat-chip-set>
                <mat-chip color="primary" selected>✅ FASE 0: Foundation</mat-chip>
                <mat-chip color="accent" selected>🚀 FASE 1: Canvas MVP</mat-chip>
                <mat-chip>⏳ FASE 2: Architecture Model</mat-chip>
              </mat-chip-set>
            </div>
          </div>
        }

        @if (!loading() && !error() && architectures().length > 0) {
          <div class="architecture-grid">
            @for (arch of architectures(); track arch.id) {
              <mat-card class="architecture-card" (click)="openDesigner(arch.id)">
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
      overflow-y: auto;
      height: 100%;
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
      flex-shrink: 0;
      background: #c5221f;
      color: #ffffff;
      height: 40px;
      font-weight: 600;
    }

    .hero-btn {
      background: #c5221f;
      color: #ffffff;
      height: 44px;
      font-size: 14px;
      font-weight: 600;
      padding: 0 24px;
      margin-top: 8px;
    }

    .content-area {
      padding-top: 32px;
    }

    .center-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 360px;
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
      font-size: 22px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .center-state p {
      color: #6b7280;
      margin: 0;
      max-width: 500px;
      line-height: 1.5;
    }

    .phase-info {
      margin-top: 16px;
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

  constructor(
    private architectureService: ArchitectureService,
    private canvasState: CanvasStateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.architectureService.getAll().subscribe({
      next: data => {
        this.architectures.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(false); // Graceful fallback to offline/designer mode
        this.loading.set(false);
      }
    });
  }

  openDesigner(id?: string) {
    if (id) {
      this.router.navigate(['/designer', id]);
    } else {
      this.router.navigate(['/designer']);
    }
  }
}
