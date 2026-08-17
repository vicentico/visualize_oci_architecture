import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CanvasStateService } from '../services/canvas-state.service';
import { CanvasHistoryService } from '../services/canvas-history.service';

@Component({
  selector: 'app-canvas-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  template: `
    <header class="toolbar-container">

      <!-- Left: Architecture Identity & Status -->
      <div class="toolbar-group left-group">
        <div class="arch-badge">
          <mat-icon class="arch-icon">account_tree</mat-icon>
          <div class="arch-info">
            <span class="arch-name">{{ canvasState.architectureName() }}</span>
            <span class="arch-region">{{ canvasState.architectureRegion() }}</span>
          </div>
        </div>
      </div>

      <!-- Center: Undo/Redo & Viewport Controls -->
      <div class="toolbar-group center-group">
        <!-- Undo / Redo -->
        <button
          mat-icon-button
          [disabled]="!historyService.canUndo()"
          (click)="canvasState.undo()"
          matTooltip="Undo (Ctrl+Z)"
        >
          <mat-icon>undo</mat-icon>
        </button>

        <button
          mat-icon-button
          [disabled]="!historyService.canRedo()"
          (click)="canvasState.redo()"
          matTooltip="Redo (Ctrl+Y)"
        >
          <mat-icon>redo</mat-icon>
        </button>

        <div class="v-divider"></div>

        <!-- Zoom Controls -->
        <button mat-icon-button (click)="zoomOut()" matTooltip="Zoom Out (-)">
          <mat-icon>remove</mat-icon>
        </button>

        <button mat-button class="zoom-level-btn" (click)="resetZoom()" matTooltip="Reset Zoom to 100%">
          {{ zoomPercentage() }}%
        </button>

        <button mat-icon-button (click)="zoomIn()" matTooltip="Zoom In (+)">
          <mat-icon>add</mat-icon>
        </button>

        <button mat-icon-button (click)="fitToScreen()" matTooltip="Fit Architecture to Screen">
          <mat-icon>fit_screen</mat-icon>
        </button>

        <div class="v-divider"></div>

        <!-- Auto Layout -->
        <button
          mat-stroked-button
          class="tool-btn"
          (click)="autoLayout()"
          matTooltip="Automatically arrange components in logical OCI tiers"
        >
          <mat-icon>auto_awesome</mat-icon>
          <span>Auto Layout</span>
        </button>
      </div>

      <!-- Right: Actions & File Operations -->
      <div class="toolbar-group right-group">
        <!-- Templates Menu -->
        <button mat-button [matMenuTriggerFor]="templateMenu" class="action-btn">
          <mat-icon>layers</mat-icon>
          <span>Templates</span>
          <mat-icon class="arrow-down">expand_more</mat-icon>
        </button>
        <mat-menu #templateMenu="matMenu">
          <button mat-menu-item (click)="loadStarter()">
            <mat-icon>web</mat-icon>
            <span>OCI Web App Baseline (MVP)</span>
          </button>
        </mat-menu>

        <!-- Import / Export Menu -->
        <button mat-button [matMenuTriggerFor]="fileMenu" class="action-btn">
          <mat-icon>folder_open</mat-icon>
          <span>File</span>
          <mat-icon class="arrow-down">expand_more</mat-icon>
        </button>
        <mat-menu #fileMenu="matMenu">
          <button mat-menu-item (click)="exportJson()">
            <mat-icon>download</mat-icon>
            <span>Export JSON</span>
          </button>
          <button mat-menu-item (click)="fileInput.click()">
            <mat-icon>upload_file</mat-icon>
            <span>Import JSON...</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="clearCanvas()">
            <mat-icon color="warn">delete_sweep</mat-icon>
            <span style="color: #ef4444">Clear Canvas</span>
          </button>
        </mat-menu>

        <!-- Hidden file input for import -->
        <input #fileInput type="file" accept=".json" style="display: none" (change)="onFileSelected($event)" />

        <!-- Save Button -->
        <button mat-flat-button color="primary" class="save-btn" (click)="saveLocal()">
          <mat-icon>save</mat-icon>
          <span>Save</span>
        </button>
      </div>

    </header>
  `,
  styles: [`
    .toolbar-container {
      height: 52px;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      user-select: none;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      z-index: 10;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .arch-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 4px 12px;
      border-radius: 8px;
    }

    .arch-icon {
      color: #c5221f;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .arch-info {
      display: flex;
      flex-direction: column;
    }

    .arch-name {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }

    .arch-region {
      font-size: 10px;
      color: #64748b;
    }

    .v-divider {
      width: 1px;
      height: 24px;
      background: #e5e7eb;
      margin: 0 6px;
    }

    .zoom-level-btn {
      font-size: 12px;
      font-weight: 600;
      color: #4b5563;
      min-width: 54px;
      padding: 0 6px;
    }

    .tool-btn {
      font-size: 12px;
      font-weight: 600;
      height: 34px;
      display: flex;
      align-items: center;
      gap: 4px;
      color: #374151;
    }

    .action-btn {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      height: 34px;
    }

    .arrow-down {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-left: 2px;
    }

    .save-btn {
      font-size: 12px;
      font-weight: 600;
      height: 34px;
      background: #c5221f;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `]
})
export class CanvasToolbarComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    public canvasState: CanvasStateService,
    public historyService: CanvasHistoryService,
    private snackBar: MatSnackBar
  ) {}

  zoomPercentage(): number {
    return Math.round(this.canvasState.viewport().zoom * 100);
  }

  zoomIn() {
    this.canvasState.zoom(1.2);
  }

  zoomOut() {
    this.canvasState.zoom(0.8);
  }

  resetZoom() {
    this.canvasState.resetViewport();
  }

  fitToScreen() {
    this.canvasState.fitToScreen();
  }

  autoLayout() {
    this.canvasState.autoLayout();
    this.snackBar.open('Layout organized in architectural tiers', 'OK', { duration: 2000 });
  }

  loadStarter() {
    this.canvasState.loadStarterArchitecture();
    this.canvasState.fitToScreen();
    this.snackBar.open('Loaded baseline OCI Web Architecture', 'OK', { duration: 2500 });
  }

  clearCanvas() {
    this.canvasState.clearCanvas();
    this.snackBar.open('Canvas cleared', 'OK', { duration: 2000 });
  }

  saveLocal() {
    this.canvasState.saveToLocalStorage();
    this.snackBar.open('Architecture saved locally', 'OK', { duration: 2000 });
  }

  exportJson() {
    const json = this.canvasState.exportToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.canvasState.architectureName().toLowerCase().replace(/\\s+/g, '_')}_architecture.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('Architecture JSON exported', 'OK', { duration: 2000 });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result as string;
        const success = this.canvasState.importFromJson(content);
        if (success) {
          this.snackBar.open('Architecture imported successfully', 'OK', { duration: 2500 });
        } else {
          this.snackBar.open('Invalid architecture JSON file', 'Error', { duration: 3000 });
        }
      };
      reader.readAsText(input.files[0]);
    }
  }
}
