import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ComponentPaletteComponent } from '../catalog/palette/palette.component';
import { CanvasToolbarComponent } from './canvas-toolbar/canvas-toolbar.component';
import { CanvasViewportComponent } from './canvas-viewport/canvas-viewport.component';
import { InspectorPanelComponent } from '../inspector/inspector-panel/inspector-panel.component';
import { LearningPanelComponent } from '../learning/learning-panel/learning-panel.component';
import { CanvasStateService } from './services/canvas-state.service';
import { CanvasHistoryService } from './services/canvas-history.service';

@Component({
  selector: 'app-canvas-designer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ComponentPaletteComponent,
    CanvasToolbarComponent,
    CanvasViewportComponent,
    InspectorPanelComponent,
    LearningPanelComponent
  ],
  template: `
    <div class="designer-layout">
      <!-- Top Canvas Controls Toolbar -->
      <app-canvas-toolbar />

      <!-- Main Tri-Pane Workspace -->
      <div class="workspace-body">
        <!-- 1. Left: Component Catalog Palette -->
        <app-component-palette />

        <!-- 2. Center: Interactive SVG Canvas -->
        <main class="canvas-area">
          <app-canvas-viewport />
        </main>

        <!-- 3. Right: Contextual Properties Inspector OR Learning Panel -->
        @if (canvasState.learningMode()) {
          <app-learning-panel />
        } @else {
          <app-inspector-panel />
        }
      </div>
    </div>
  `,
  styles: [`
    .designer-layout {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 64px);
      width: 100%;
      overflow: hidden;
      background: #f8fafc;
    }

    .workspace-body {
      display: flex;
      flex: 1;
      height: calc(100% - 52px);
      width: 100%;
      overflow: hidden;
      position: relative;
    }

    .canvas-area {
      flex: 1;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
  `]
})
export class CanvasDesignerComponent {
  constructor(
    public canvasState: CanvasStateService,
    private historyService: CanvasHistoryService
  ) {}

  // Global Keyboard Shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Undo: Ctrl+Z or Cmd+Z
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
      event.preventDefault();
      if (this.historyService.canUndo()) {
        this.canvasState.undo();
      }
    }
    // Redo: Ctrl+Y or Ctrl+Shift+Z
    if (
      ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'z')
    ) {
      event.preventDefault();
      if (this.historyService.canRedo()) {
        this.canvasState.redo();
      }
    }
    // Delete: Delete or Backspace when node/connection is selected (if not typing in input)
    if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
    ) {
      const selectedNodeId = this.canvasState.selectedNodeId();
      const selectedConnId = this.canvasState.selectedConnectionId();
      if (selectedNodeId) {
        event.preventDefault();
        this.canvasState.removeNode(selectedNodeId);
      } else if (selectedConnId) {
        event.preventDefault();
        this.canvasState.removeConnection(selectedConnId);
      }
    }
    // Escape: cancel selection or linking
    if (event.key === 'Escape') {
      this.canvasState.clearSelection();
      this.canvasState.cancelLinking();
    }
  }
}
