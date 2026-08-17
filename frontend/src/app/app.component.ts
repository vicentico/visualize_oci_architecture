import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <mat-toolbar class="app-toolbar">
      <div class="brand" routerLink="/">
        <mat-icon class="toolbar-icon">cloud</mat-icon>
        <span class="toolbar-title">OCI Architecture Lab</span>
      </div>

      <nav class="nav-links">
        <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
          <mat-icon>folder_open</mat-icon>
          <span>Architectures</span>
        </a>
        <a mat-button routerLink="/designer" routerLinkActive="active-link">
          <mat-icon>design_services</mat-icon>
          <span>Visual Designer</span>
        </a>
      </nav>

      <div class="toolbar-actions">
        <span class="version-badge">FASE 1 — Canvas MVP</span>
      </div>
    </mat-toolbar>

    <main class="app-main">
      <router-outlet />
    </main>
  `,
  styles: [`
    .app-toolbar {
      background: #1a1f2e;
      color: #e8eaf6;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 20;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
    }

    .toolbar-icon {
      color: #c5221f;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .toolbar-title {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0.3px;
      color: #f8fafc;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-links a {
      color: #94a3b8;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .nav-links a:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }

    .nav-links a.active-link {
      color: #ffffff;
      background: rgba(197, 34, 31, 0.25);
      border-bottom: 2px solid #c5221f;
    }

    .version-badge {
      font-size: 11px;
      font-weight: 700;
      background: #334155;
      color: #cbd5e1;
      padding: 4px 10px;
      border-radius: 12px;
      letter-spacing: 0.5px;
    }

    .app-main {
      height: calc(100vh - 64px);
      overflow: hidden;
      background: #f8fafc;
    }
  `]
})
export class AppComponent {
  title = 'OCI Architecture Lab';
}
