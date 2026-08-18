import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CanvasStateService } from '../services/canvas-state.service';
import { CanvasHistoryService } from '../services/canvas-history.service';

import { ExportService } from '../../../core/services/export.service';
import { TemplateService, ArchitectureTemplate } from '../../../core/services/template.service';

@Component({
  selector: 'app-canvas-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatSlideToggleModule
  ],
  template: `
    <header class="toolbar-container">
        <div class="v-divider"></div>

        <!-- Validation Status Badge -->
        <button mat-button class="validation-badge" [ngClass]="validationStatusClass()" (click)="openValidationPanel()">
          <mat-icon>{{ validationIcon() }}</mat-icon>
          <span>{{ validationText() }}</span>
        </button>
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
          @for (template of templates; track template.id) {
            <button mat-menu-item (click)="loadTemplate(template)">
              <mat-icon>{{ template.icon }}</mat-icon>
              <span>{{ template.name }}</span>
            </button>
          }
        </mat-menu>

        <!-- Import / Export Menu -->
        <button mat-button [matMenuTriggerFor]="fileMenu" class="action-btn">
          <mat-icon>folder_open</mat-icon>
          <span>File</span>
          <mat-icon class="arrow-down">expand_more</mat-icon>
        </button>
        <mat-menu #fileMenu="matMenu">
          <button mat-menu-item (click)="exportJson()">
            <mat-icon>data_object</mat-icon>
            <span>Export JSON</span>
          </button>
          <button mat-menu-item (click)="exportMarkdown()">
            <mat-icon>description</mat-icon>
            <span>Export Markdown</span>
          </button>
          <button mat-menu-item (click)="exportTerraform()">
            <mat-icon>code</mat-icon>
            <span>Export Terraform</span>
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

        <div class="v-divider"></div>

        <mat-slide-toggle 
          color="accent" 
          [checked]="canvasState.learningMode()"
          (change)="canvasState.toggleLearningMode()">
          Learning Mode
        </mat-slide-toggle>

        <div class="v-divider"></div>

        <mat-slide-toggle 
          color="primary" 
          [checked]="canvasState.simulationMode()"
          (change)="canvasState.toggleSimulationMode()">
          Simulation Mode
        </mat-slide-toggle>

        <div class="v-divider"></div>

        <!-- Save to Cloud Button -->
        <button mat-flat-button color="primary" class="save-btn" (click)="saveCloud()" [disabled]="isSaving">
          <mat-icon>{{ isSaving ? 'sync' : 'cloud_upload' }}</mat-icon>
          <span>{{ isSaving ? 'Saving...' : 'Save to Cloud' }}</span>
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

    .validation-badge {
      font-size: 12px;
      font-weight: 600;
      height: 34px;
      border-radius: 16px;
      padding: 0 12px;
    }
    .validation-badge.valid { color: #10b981; background: #d1fae5; }
    .validation-badge.warning { color: #d97706; background: #fef3c7; }
    .validation-badge.error { color: #ef4444; background: #fee2e2; }
    .validation-badge.loading { color: #64748b; background: #f1f5f9; }
  `]
})
export class CanvasToolbarComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  isSaving = false;
  templates: ArchitectureTemplate[] = [];

  constructor(
    public canvasState: CanvasStateService,
    public historyService: CanvasHistoryService,
    private snackBar: MatSnackBar,
    private exportService: ExportService,
    private templateService: TemplateService
  ) {}

  ngOnInit() {
    this.templates = this.templateService.getTemplates();
  }

  validationStatusClass(): string {
    const res = this.canvasState.validationResult();
    if (!res) return 'loading';
    if (res.isValid && res.messages.length === 0) return 'valid';
    if (!res.isValid) return 'error';
    return 'warning';
  }

  validationIcon(): string {
    const res = this.canvasState.validationResult();
    if (!res) return 'hourglass_empty';
    if (res.isValid && res.messages.length === 0) return 'check_circle';
    if (!res.isValid) return 'error';
    return 'warning';
  }

  validationText(): string {
    const res = this.canvasState.validationResult();
    if (!res) return 'Validating...';
    if (res.isValid && res.messages.length === 0) return 'Valid';
    
    const errors = res.messages.filter(m => m.severity === 'Error').length;
    const warnings = res.messages.filter(m => m.severity === 'Warning').length;
    
    if (errors > 0) return `${errors} Error${errors > 1 ? 's' : ''}`;
    return `${warnings} Warning${warnings > 1 ? 's' : ''}`;
  }

  openValidationPanel() {
    const res = this.canvasState.validationResult();
    if (!res || res.messages.length === 0) {
      this.snackBar.open('Architecture is fully valid!', 'OK', { duration: 2000 });
      return;
    }
    // For MVP, just show the first error in snackbar
    const firstMsg = res.messages[0];
    this.snackBar.open(`[${firstMsg.ruleId}] ${firstMsg.message}`, 'Close', { duration: 5000 });
  }

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

  loadTemplate(template: ArchitectureTemplate) {
    if (this.canvasState.nodes().length > 0) {
      if (!confirm(`Are you sure you want to load the '${template.name}' template? This will replace your current design.`)) {
        return;
      }
    }
    this.canvasState.loadTemplate(template.data);
    this.historyService.clear();
    this.canvasState.setArchitectureId(crypto.randomUUID());
    this.snackBar.open(`Loaded ${template.name} template`, 'OK', { duration: 2500 });
  }



  clearCanvas() {
    this.canvasState.clearCanvas();
    this.snackBar.open('Canvas cleared', 'OK', { duration: 2000 });
  }

  saveLocal() {
    this.canvasState.saveToLocalStorage();
    this.snackBar.open('Architecture saved locally', 'OK', { duration: 2000 });
  }

  async saveCloud() {
    this.isSaving = true;
    try {
      await this.canvasState.saveToCloud();
      this.snackBar.open('Architecture saved to MongoDB successfully!', 'OK', { duration: 3000 });
    } catch (error) {
      console.error('Save to cloud failed', error);
      this.snackBar.open('Failed to save to cloud', 'Error', { duration: 3000 });
    } finally {
      this.isSaving = false;
    }
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

  exportMarkdown() {
    const archId = this.canvasState.architectureId();
    this.isSaving = true;
    this.canvasState.saveToCloud().then(() => {
      this.isSaving = false;
      this.exportService.exportMarkdown(archId);
      this.snackBar.open('Exporting to Markdown...', 'OK', { duration: 2000 });
    }).catch(err => {
      this.isSaving = false;
      this.snackBar.open('Failed to save to cloud before export.', 'Error', { duration: 3000 });
    });
  }

  exportTerraform() {
    const archId = this.canvasState.architectureId();
    this.isSaving = true;
    this.canvasState.saveToCloud().then(() => {
      this.isSaving = false;
      this.exportService.exportTerraform(archId);
      this.snackBar.open('Exporting Terraform...', 'OK', { duration: 2000 });
    }).catch(err => {
      this.isSaving = false;
      this.snackBar.open('Failed to save to cloud before export.', 'Error', { duration: 3000 });
    });
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
