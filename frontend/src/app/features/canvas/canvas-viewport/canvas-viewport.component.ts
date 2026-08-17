import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  computed,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasStateService } from '../services/canvas-state.service';
import { CanvasNode, CanvasConnection, CanvasPort } from '../../../core/models/canvas.models';

@Component({
  selector: 'app-canvas-viewport',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #viewportContainer
      class="viewport-container"
      (mousedown)="onContainerMouseDown($event)"
      (mousemove)="onContainerMouseMove($event)"
      (mouseup)="onContainerMouseUp($event)"
      (wheel)="onWheel($event)"
      (dragover)="onDragOver($event)"
      (drop)="onDrop($event)"
      (contextmenu)="$event.preventDefault()"
    >
      <svg #svgCanvas class="canvas-svg" width="100%" height="100%">
        <!-- SVG Definitions (Markers & Patterns) -->
        <defs>
          <!-- Infinite Dot Grid -->
          <pattern
            id="dotGrid"
            [attr.width]="24 * viewport().zoom"
            [attr.height]="24 * viewport().zoom"
            patternUnits="userSpaceOnUse"
            [attr.x]="viewport().x % (24 * viewport().zoom)"
            [attr.y]="viewport().y % (24 * viewport().zoom)"
          >
            <circle
              [attr.cx]="12 * viewport().zoom"
              [attr.cy]="12 * viewport().zoom"
              [attr.r]="1.2 * Math.min(1.5, Math.max(0.6, viewport().zoom))"
              fill="#cbd5e1"
            />
          </pattern>

          <!-- Marker: Directed Arrow -->
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
          </marker>

          <!-- Marker: Selected Arrow -->
          <marker
            id="arrowhead-selected"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#c5221f" />
          </marker>

          <!-- Drop Shadow Filter for Nodes -->
          <filter id="nodeShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.08" />
          </filter>
          <filter id="nodeShadowSelected" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#c5221f" flood-opacity="0.25" />
          </filter>
        </defs>

        <!-- Grid Background Plane -->
        <rect width="100%" height="100%" fill="url(#dotGrid)" />

        <!-- ── MAIN WORLD TRANSFORM GROUP ──────────────────────── -->
        <g [attr.transform]="worldTransform()">

          <!-- 1. Connections Layer -->
          <g class="connections-layer">
            @for (conn of connections(); track conn.id) {
              <g
                class="connection-group"
                [class.selected]="selectedConnectionId() === conn.id"
                (mousedown)="onConnectionClick($event, conn)"
              >
                <!-- Invisible wider hit-testing path for easy clicking -->
                <path
                  [attr.d]="getConnectionPath(conn)"
                  class="connection-hit-area"
                />

                <!-- Visible Connection Path -->
                <path
                  [attr.d]="getConnectionPath(conn)"
                  class="connection-path"
                  [attr.marker-end]="selectedConnectionId() === conn.id ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'"
                />

                <!-- Protocol Badge on Connection Midpoint -->
                @if (getConnectionMidpoint(conn); as mid) {
                  <g class="connection-label-group" [attr.transform]="'translate(' + mid.x + ',' + mid.y + ')'">
                    <rect
                      x="-38"
                      y="-11"
                      width="76"
                      height="22"
                      rx="4"
                      class="label-badge-bg"
                    />
                    <text y="3" text-anchor="middle" class="label-badge-text">
                      {{ conn.label || conn.protocol }}
                    </text>
                  </g>
                }
              </g>
            }

            <!-- Active Linking Preview Line -->
            @if (linkingSource() && linkingMousePos()) {
              <path
                [attr.d]="getPreviewLinkingPath()"
                class="linking-preview-line"
                marker-end="url(#arrowhead-selected)"
              />
            }
          </g>

          <!-- 2. Nodes Layer -->
          <g class="nodes-layer">
            @for (node of nodes(); track node.id) {
              <g
                class="node-group"
                [class.selected]="selectedNodeId() === node.id"
                [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
                (mousedown)="onNodeMouseDown($event, node)"
              >
                <!-- Node Background Card -->
                <rect
                  [attr.width]="node.width"
                  [attr.height]="node.height"
                  rx="10"
                  class="node-card-bg"
                  [attr.filter]="selectedNodeId() === node.id ? 'url(#nodeShadowSelected)' : 'url(#nodeShadow)'"
                  [attr.stroke]="selectedNodeId() === node.id ? '#c5221f' : '#e2e8f0'"
                  [attr.stroke-width]="selectedNodeId() === node.id ? 2.5 : 1"
                />

                <!-- Top Accent Line -->
                <path
                  [attr.d]="'M 0 10 Q 0 0 10 0 L ' + (node.width - 10) + ' 0 Q ' + node.width + ' 0 ' + node.width + ' 10 L ' + node.width + ' 6 L 0 6 Z'"
                  [attr.fill]="node.color"
                />

                <!-- Node Icon & Header -->
                <!-- Icon Box -->
                <rect
                  x="12"
                  y="16"
                  width="28"
                  height="28"
                  rx="6"
                  [attr.fill]="node.color + '18'"
                />
                <!-- SVG Icon (Material Symbol Fallback / Representation) -->
                <g [attr.transform]="'translate(16, 20)'">
                  <text
                    font-family="'Material Icons'"
                    font-size="20"
                    [attr.fill]="node.color"
                    dominant-baseline="hanging"
                  >{{ node.icon }}</text>
                </g>

                <!-- Type & Name Text -->
                <text x="48" y="27" class="node-type-label">{{ node.type }}</text>
                <text x="48" y="42" class="node-name-label">{{ truncate(node.name, 16) }}</text>

                <!-- Sub-info line if applicable (e.g. CIDR, shape, DB workload) -->
                <text x="14" y="66" class="node-sub-info">
                  {{ getNodeSummary(node) }}
                </text>

                <!-- Connection Ports (Top, Right, Bottom, Left) -->
                @for (port of node.ports; track port.id) {
                  <circle
                    [attr.cx]="port.xRatio * node.width"
                    [attr.cy]="port.yRatio * node.height"
                    r="5.5"
                    class="port-handle"
                    (mousedown)="onPortMouseDown($event, node, port)"
                    (mouseup)="onPortMouseUp($event, node, port)"
                  />
                }
              </g>
            }
          </g>

        </g>
      </svg>
    </div>
  `,
  styles: [`
    .viewport-container {
      flex: 1;
      height: 100%;
      background: #f8fafc;
      overflow: hidden;
      position: relative;
      cursor: default;
      user-select: none;
    }

    .viewport-container:active {
      cursor: grabbing;
    }

    .canvas-svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* Connections */
    .connection-group {
      cursor: pointer;
    }

    .connection-hit-area {
      fill: none;
      stroke: transparent;
      stroke-width: 16;
    }

    .connection-path {
      fill: none;
      stroke: #64748b;
      stroke-width: 2;
      transition: stroke 0.15s, stroke-width 0.15s;
    }

    .connection-group:hover .connection-path {
      stroke: #0284c7;
      stroke-width: 2.5;
    }

    .connection-group.selected .connection-path {
      stroke: #c5221f;
      stroke-width: 3;
    }

    .label-badge-bg {
      fill: #ffffff;
      stroke: #cbd5e1;
      stroke-width: 1;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.06));
    }

    .connection-group.selected .label-badge-bg {
      stroke: #c5221f;
      fill: #fffbfa;
    }

    .label-badge-text {
      font-size: 10px;
      font-weight: 700;
      fill: #334155;
      font-family: monospace;
      pointer-events: none;
    }

    .linking-preview-line {
      fill: none;
      stroke: #c5221f;
      stroke-width: 2.5;
      stroke-dasharray: 6 4;
      pointer-events: none;
    }

    /* Nodes */
    .node-group {
      cursor: move;
    }

    .node-card-bg {
      fill: #ffffff;
      transition: stroke 0.15s, filter 0.15s;
    }

    .node-group:hover .node-card-bg {
      filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.12));
    }

    .node-type-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      fill: #64748b;
    }

    .node-name-label {
      font-size: 11.5px;
      font-weight: 700;
      fill: #0f172a;
    }

    .node-sub-info {
      font-size: 9.5px;
      fill: #94a3b8;
      font-family: monospace;
    }

    /* Ports */
    .port-handle {
      fill: #ffffff;
      stroke: #64748b;
      stroke-width: 2;
      cursor: crosshair;
      transition: transform 0.15s, fill 0.15s, stroke 0.15s;
    }

    .port-handle:hover {
      fill: #c5221f;
      stroke: #ffffff;
      stroke-width: 2.5;
      r: 7.5;
    }
  `]
})
export class CanvasViewportComponent {
  @ViewChild('viewportContainer') containerRef!: ElementRef<HTMLDivElement>;

  public canvasState = inject(CanvasStateService);

  readonly nodes = this.canvasState.nodes;
  readonly connections = this.canvasState.connections;
  readonly viewport = this.canvasState.viewport;
  readonly selectedNodeId = this.canvasState.selectedNodeId;
  readonly selectedConnectionId = this.canvasState.selectedConnectionId;
  readonly linkingSource = this.canvasState.linkingSource;
  readonly linkingMousePos = this.canvasState.linkingMousePos;

  readonly Math = Math;

  // Interaction State
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

  private draggingNodeId: string | null = null;
  private dragNodeOffsetX = 0;
  private dragNodeOffsetY = 0;

  readonly worldTransform = computed(() => {
    const vp = this.viewport();
    return `translate(${vp.x}, ${vp.y}) scale(${vp.zoom})`;
  });

  // ─────────────────────────────────────────────────────────────
  // Mouse & Viewport Events
  // ─────────────────────────────────────────────────────────────

  onContainerMouseDown(event: MouseEvent) {
    // If left click directly on background
    if (event.button === 0 && (event.target as HTMLElement).tagName === 'rect') {
      this.isPanning = true;
      this.panStartX = event.clientX;
      this.panStartY = event.clientY;
      this.canvasState.clearSelection();
    }
  }

  onContainerMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      const dx = event.clientX - this.panStartX;
      const dy = event.clientY - this.panStartY;
      this.panStartX = event.clientX;
      this.panStartY = event.clientY;
      this.canvasState.pan(dx, dy);
      return;
    }

    if (this.draggingNodeId) {
      const rect = this.containerRef.nativeElement.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;
      const vp = this.viewport();
      const worldX = (clientX - vp.x) / vp.zoom - this.dragNodeOffsetX;
      const worldY = (clientY - vp.y) / vp.zoom - this.dragNodeOffsetY;
      this.canvasState.updateNodePosition(this.draggingNodeId, worldX, worldY);
      return;
    }

    if (this.linkingSource()) {
      const rect = this.containerRef.nativeElement.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;
      const vp = this.viewport();
      const worldX = (clientX - vp.x) / vp.zoom;
      const worldY = (clientY - vp.y) / vp.zoom;
      this.canvasState.updateLinkingMouse(worldX, worldY);
    }
  }

  onContainerMouseUp(event: MouseEvent) {
    if (this.isPanning) {
      this.isPanning = false;
    }

    if (this.draggingNodeId) {
      const node = this.nodes().find(n => n.id === this.draggingNodeId);
      if (node) {
        this.canvasState.updateNodePosition(node.id, node.x, node.y, true);
      }
      this.draggingNodeId = null;
    }

    if (this.linkingSource()) {
      // Released in empty space -> cancel connection
      this.canvasState.cancelLinking();
    }
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    this.canvasState.zoom(zoomFactor, clientX, clientY);
  }

  // ─────────────────────────────────────────────────────────────
  // Node Dragging & Selection
  // ─────────────────────────────────────────────────────────────

  onNodeMouseDown(event: MouseEvent, node: CanvasNode) {
    event.stopPropagation();
    if (event.button !== 0) return;

    this.canvasState.selectNode(node.id);
    this.draggingNodeId = node.id;

    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;
    const vp = this.viewport();
    const worldMouseX = (clientX - vp.x) / vp.zoom;
    const worldMouseY = (clientY - vp.y) / vp.zoom;

    this.dragNodeOffsetX = worldMouseX - node.x;
    this.dragNodeOffsetY = worldMouseY - node.y;
  }

  // ─────────────────────────────────────────────────────────────
  // Port Linking
  // ─────────────────────────────────────────────────────────────

  onPortMouseDown(event: MouseEvent, node: CanvasNode, port: CanvasPort) {
    event.stopPropagation();
    if (event.button !== 0) return;

    const portWorldX = node.x + port.xRatio * node.width;
    const portWorldY = node.y + port.yRatio * node.height;
    this.canvasState.startLinking(node.id, port.id, portWorldX, portWorldY);
  }

  onPortMouseUp(event: MouseEvent, node: CanvasNode, port: CanvasPort) {
    event.stopPropagation();
    if (this.linkingSource()) {
      this.canvasState.completeLinking(node.id, port.id);
    }
  }

  onConnectionClick(event: MouseEvent, conn: CanvasConnection) {
    event.stopPropagation();
    this.canvasState.selectConnection(conn.id);
  }

  // ─────────────────────────────────────────────────────────────
  // HTML5 Drag & Drop from Catalog Palette
  // ─────────────────────────────────────────────────────────────

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const rawData = event.dataTransfer.getData('application/json');
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      if (data.type === 'catalog_item' && data.catalogType) {
        const rect = this.containerRef.nativeElement.getBoundingClientRect();
        const clientX = event.clientX - rect.left;
        const clientY = event.clientY - rect.top;
        const vp = this.viewport();
        const worldX = (clientX - vp.x) / vp.zoom;
        const worldY = (clientY - vp.y) / vp.zoom;

        this.canvasState.addNodeFromCatalog(data.catalogType, worldX, worldY);
      }
    } catch (e) {
      console.warn('Error parsing drop payload', e);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SVG Path Generators for Connections
  // ─────────────────────────────────────────────────────────────

  getConnectionPath(conn: CanvasConnection): string {
    const source = this.nodes().find(n => n.id === conn.sourceNodeId);
    const target = this.nodes().find(n => n.id === conn.targetNodeId);
    if (!source || !target) return '';

    const sourcePort = source.ports.find(p => p.id === conn.sourcePortId) || source.ports[1]; // default bottom
    const targetPort = target.ports.find(p => p.id === conn.targetPortId) || target.ports[0]; // default top

    const sx = source.x + sourcePort.xRatio * source.width;
    const sy = source.y + sourcePort.yRatio * source.height;
    const tx = target.x + targetPort.xRatio * target.width;
    const ty = target.y + targetPort.yRatio * target.height;

    // Cubic Bézier Curve
    const deltaY = Math.abs(ty - sy);
    const curvature = Math.max(40, deltaY * 0.5);

    return `M ${sx} ${sy} C ${sx} ${sy + curvature}, ${tx} ${ty - curvature}, ${tx} ${ty}`;
  }

  getConnectionMidpoint(conn: CanvasConnection): { x: number; y: number } | null {
    const source = this.nodes().find(n => n.id === conn.sourceNodeId);
    const target = this.nodes().find(n => n.id === conn.targetNodeId);
    if (!source || !target) return null;

    const sourcePort = source.ports.find(p => p.id === conn.sourcePortId) || source.ports[1];
    const targetPort = target.ports.find(p => p.id === conn.targetPortId) || target.ports[0];

    const sx = source.x + sourcePort.xRatio * source.width;
    const sy = source.y + sourcePort.yRatio * source.height;
    const tx = target.x + targetPort.xRatio * target.width;
    const ty = target.y + targetPort.yRatio * target.height;

    return {
      x: Math.round((sx + tx) / 2),
      y: Math.round((sy + ty) / 2)
    };
  }

  getPreviewLinkingPath(): string {
    const src = this.linkingSource();
    const mouse = this.linkingMousePos();
    if (!src || !mouse) return '';

    const deltaY = Math.abs(mouse.y - src.y);
    const curvature = Math.max(30, deltaY * 0.4);

    return `M ${src.x} ${src.y} C ${src.x} ${src.y + curvature}, ${mouse.x} ${mouse.y - curvature}, ${mouse.x} ${mouse.y}`;
  }

  truncate(str: string, maxLen: number): string {
    return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
  }

  getNodeSummary(node: CanvasNode): string {
    if (node.type === 'VCN' && node.properties['cidrBlock']) {
      return `CIDR: ${node.properties['cidrBlock']}`;
    }
    if ((node.type === 'PublicSubnet' || node.type === 'PrivateSubnet') && node.properties['cidrBlock']) {
      return `CIDR: ${node.properties['cidrBlock']}`;
    }
    if (node.type === 'ComputeInstance' && node.properties['ocpus']) {
      return `${node.properties['ocpus']} OCPU · ${node.properties['memoryInGBs'] || 16}GB`;
    }
    if (node.type === 'LoadBalancer') {
      return node.properties['isPrivate'] ? 'Private LB' : 'Public LB';
    }
    if (node.type === 'Database' && node.properties['workload']) {
      return `${node.properties['workload']}`;
    }
    return '';
  }
}
