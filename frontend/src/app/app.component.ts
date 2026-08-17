import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatIconModule],
  template: `
    <mat-toolbar class="app-toolbar">
      <mat-icon class="toolbar-icon">cloud</mat-icon>
      <span class="toolbar-title">OCI Architecture Lab</span>
      <span class="toolbar-subtitle">Interactive OCI Learning Environment</span>
    </mat-toolbar>
    <main class="app-main">
      <router-outlet />
    </main>
  `,
  styles: [`
    .app-toolbar {
      background: #1a1f2e;
      color: #e8eaf6;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .toolbar-icon {
      color: #c5221f;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .toolbar-title {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .toolbar-subtitle {
      font-size: 13px;
      color: #9fa8da;
      margin-left: 8px;
      font-weight: 400;
    }
    .app-main {
      height: calc(100vh - 64px);
      overflow: auto;
      background: #f5f5f0;
    }
  `]
})
export class AppComponent {
  title = 'OCI Architecture Lab';
}
