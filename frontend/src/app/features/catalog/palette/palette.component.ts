import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { OCI_CATALOG, OciCatalogItem, OciCategory } from '../../../core/models/catalog.models';
import { CanvasStateService } from '../../canvas/services/canvas-state.service';

@Component({
  selector: 'app-component-palette',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatTooltipModule,
    MatButtonModule
  ],
  template: `
    <aside class="palette-container">
      <div class="palette-header">
        <div class="header-title">
          <mat-icon class="header-icon">category</mat-icon>
          <span>OCI Catalog</span>
        </div>
        <span class="palette-hint">Drag & drop to canvas</span>
      </div>

      <!-- Search Box -->
      <div class="search-box">
        <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
          <mat-icon matPrefix class="search-icon">search</mat-icon>
          <input
            matInput
            placeholder="Search components..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
          />
          @if (searchQuery()) {
            <button matSuffix mat-icon-button (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
      </div>

      <!-- Category Groups -->
      <div class="categories-list">
        @for (category of filteredCategories(); track category) {
          <div class="category-section">
            <div class="category-title">
              <span>{{ category }}</span>
              <span class="category-count">({{ getItemsByCategory(category).length }})</span>
            </div>

            <div class="items-grid">
              @for (item of getItemsByCategory(category); track item.type) {
                <div
                  class="palette-item"
                  draggable="true"
                  (dragstart)="onDragStart($event, item)"
                  (click)="onItemClick(item)"
                  [matTooltip]="item.educationalWhy"
                  matTooltipPosition="right"
                >
                  <div class="item-icon-wrapper" [style.background-color]="item.color + '15'" [style.color]="item.color">
                    <mat-icon class="item-icon">{{ item.icon }}</mat-icon>
                  </div>
                  <div class="item-info">
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-desc">{{ item.description }}</span>
                  </div>
                  <mat-icon class="drag-handle">drag_indicator</mat-icon>
                </div>
              }
            </div>
          </div>
        }

        @if (filteredCategories().length === 0) {
          <div class="empty-results">
            <mat-icon>search_off</mat-icon>
            <p>No components found for "{{ searchQuery() }}"</p>
          </div>
        }
      </div>
    </aside>
  `,
  styles: [`
    .palette-container {
      width: 280px;
      height: 100%;
      background: #ffffff;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      user-select: none;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
    }

    .palette-header {
      padding: 16px;
      border-bottom: 1px solid #f3f4f6;
      background: #fafafa;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 700;
      color: #1a1f2e;
    }

    .header-icon {
      color: #c5221f;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .palette-hint {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
      display: block;
    }

    .search-box {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
    }

    .search-field {
      width: 100%;
      font-size: 13px;
    }

    .search-icon {
      color: #9ca3af;
      margin-right: 6px;
    }

    .categories-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .category-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .category-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .category-count {
      font-weight: 400;
      color: #9ca3af;
    }

    .items-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .palette-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: grab;
      transition: all 0.15s ease;
    }

    .palette-item:hover {
      border-color: #c5221f;
      background: #fffbfa;
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(197, 34, 31, 0.08);
    }

    .palette-item:active {
      cursor: grabbing;
    }

    .item-icon-wrapper {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .item-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .item-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .item-name {
      font-size: 12px;
      font-weight: 600;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-desc {
      font-size: 10px;
      color: #9ca3af;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .drag-handle {
      color: #d1d5db;
      font-size: 16px;
      width: 16px;
      height: 16px;
      opacity: 0;
      transition: opacity 0.15s;
    }

    .palette-item:hover .drag-handle {
      opacity: 1;
    }

    .empty-results {
      padding: 32px 16px;
      text-align: center;
      color: #9ca3af;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .empty-results mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
  `]
})
export class ComponentPaletteComponent {
  searchQuery = signal('');
  readonly allCategories: OciCategory[] = [
    'Core',
    'External',
    'Networking',
    'Compute',
    'Application',
    'Storage',
    'Database'
  ];

  readonly filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allCategories;

    return this.allCategories.filter(cat => {
      const items = this.getItemsByCategory(cat);
      return items.length > 0;
    });
  });

  constructor(private canvasState: CanvasStateService) {}

  onSearchChange(value: string) {
    this.searchQuery.set(value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  getItemsByCategory(category: OciCategory): OciCatalogItem[] {
    const q = this.searchQuery().toLowerCase().trim();
    const items = OCI_CATALOG.filter(i => i.category === category);
    if (!q) return items;

    return items.filter(
      i =>
        i.name.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
  }

  onDragStart(event: DragEvent, item: OciCatalogItem) {
    if (event.dataTransfer) {
      event.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          type: 'catalog_item',
          catalogType: item.type
        })
      );
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onItemClick(item: OciCatalogItem) {
    // Click on item adds it near canvas center
    const vp = this.canvasState.viewport();
    const targetWorldX = (400 - vp.x) / vp.zoom;
    const targetWorldY = (300 - vp.y) / vp.zoom;
    this.canvasState.addNodeFromCatalog(item.type, targetWorldX, targetWorldY);
  }
}
