import { Injectable, signal, computed } from '@angular/core';
import {
  CanvasNode,
  CanvasConnection,
  CanvasPort,
  ViewportTransform
} from '../../../core/models/canvas.models';
import { OCI_CATALOG, OciCatalogItem } from '../../../core/models/catalog.models';
import { CanvasHistoryService } from './canvas-history.service';
import { ArchitectureMapperService } from '../../../core/services/architecture-mapper.service';
import { ArchitectureService } from '../../../core/services/architecture.service';
import { ValidationService } from '../../../core/services/validation.service';
import { ValidationResult } from '../../../core/models/validation.models';
import { SimulationService } from '../../../core/services/simulation.service';
import { TrafficSimulationResult } from '../../../core/models/simulation.models';

const LOCAL_STORAGE_KEY = 'oci_lab_current_architecture';

@Injectable({
  providedIn: 'root'
})
export class CanvasStateService {
  // Architecture Metadata
  readonly architectureId = signal<string>('arch-local-001');
  readonly architectureName = signal<string>('OCI Web Application');
  readonly architectureRegion = signal<string>('sa-santiago-1');
  readonly architectureDescription = signal<string>(
    'Reference high-availability web architecture with Public Load Balancer, Private Compute instances and Autonomous Database.'
  );

  // Canvas State Signals
  readonly nodes = signal<CanvasNode[]>([]);
  readonly connections = signal<CanvasConnection[]>([]);
  readonly viewport = signal<ViewportTransform>({ x: 100, y: 80, zoom: 1.0 });

  // Selection Signals
  readonly selectedNodeId = signal<string | null>(null);
  readonly selectedConnectionId = signal<string | null>(null);

  // Linking / Wiring In-Progress Signal
  readonly linkingSource = signal<{
    nodeId: string;
    portId: string;
    x: number;
    y: number;
  } | null>(null);
  readonly linkingMousePos = signal<{ x: number; y: number } | null>(null);

  // Validation State
  readonly validationResult = signal<ValidationResult | null>(null);
  private validationTimeout: any;

  // Mode Toggles
  readonly simulationMode = signal<boolean>(false);
  readonly learningMode = signal<boolean>(false);

  // Interactive Simulation State
  readonly simulationSourceNodeId = signal<string | null>(null);
  readonly trafficSimulationResult = signal<TrafficSimulationResult | null>(null);

  // Computed Properties
  readonly selectedNode = computed(() => {
    const id = this.selectedNodeId();
    return id ? this.nodes().find(n => n.id === id) || null : null;
  });

  readonly selectedConnection = computed(() => {
    const id = this.selectedConnectionId();
    return id ? this.connections().find(c => c.id === id) || null : null;
  });

  readonly isConnecting = computed(() => this.linkingSource() !== null);

  constructor(
    private historyService: CanvasHistoryService,
    private architectureMapper: ArchitectureMapperService,
    private architectureService: ArchitectureService,
    private validationService: ValidationService,
    private simulationService: SimulationService
  ) {
    // Attempt to load from local storage
    const restored = this.loadFromLocalStorage();
    if (!restored) {
      this.clearCanvas();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Snapshots & History
  // ─────────────────────────────────────────────────────────────

  private recordSnapshot() {
    this.historyService.pushSnapshot({
      nodes: this.nodes(),
      connections: this.connections(),
      architectureName: this.architectureName(),
      architectureRegion: this.architectureRegion(),
      architectureDescription: this.architectureDescription()
    });
    this.saveToLocalStorage();
    this.triggerValidation();
  }

  private triggerValidation() {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }
    this.validationTimeout = setTimeout(() => {
      const domainModel = this.architectureMapper.toDomainModel(
        this.architectureId(),
        this.architectureName(),
        this.architectureDescription(),
        this.architectureRegion(),
        this.nodes(),
        this.connections()
      );
      this.validationService.validate(domainModel).subscribe(result => {
        this.validationResult.set(result);
      });
    }, 1000);
  }

  undo() {
    const previous = this.historyService.undo({
      nodes: this.nodes(),
      connections: this.connections(),
      architectureName: this.architectureName(),
      architectureRegion: this.architectureRegion(),
      architectureDescription: this.architectureDescription()
    });
    if (previous) {
      this.nodes.set(previous.nodes);
      this.connections.set(previous.connections);
      this.architectureName.set(previous.architectureName);
      this.architectureRegion.set(previous.architectureRegion);
      this.architectureDescription.set(previous.architectureDescription);
      this.clearSelection();
      this.saveToLocalStorage();
      this.triggerValidation();
    }
  }

  redo() {
    const next = this.historyService.redo({
      nodes: this.nodes(),
      connections: this.connections(),
      architectureName: this.architectureName(),
      architectureRegion: this.architectureRegion(),
      architectureDescription: this.architectureDescription()
    });
    if (next) {
      this.nodes.set(next.nodes);
      this.connections.set(next.connections);
      this.architectureName.set(next.architectureName);
      this.architectureRegion.set(next.architectureRegion);
      this.architectureDescription.set(next.architectureDescription);
      this.clearSelection();
      this.saveToLocalStorage();
      this.triggerValidation();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Node Operations
  // ─────────────────────────────────────────────────────────────

  addNodeFromCatalog(type: string, canvasX: number, canvasY: number): CanvasNode | null {
    const catalogItem = OCI_CATALOG.find(i => i.type === type);
    if (!catalogItem) return null;

    const id = `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const width = catalogItem.defaultWidth || 160;
    const height = catalogItem.defaultHeight || 90;

    const defaultPorts: CanvasPort[] = [
      { id: `${id}-in-top`, type: 'in', position: 'top', xRatio: 0.5, yRatio: 0 },
      { id: `${id}-out-bottom`, type: 'out', position: 'bottom', xRatio: 0.5, yRatio: 1 },
      { id: `${id}-in-left`, type: 'in', position: 'left', xRatio: 0, yRatio: 0.5 },
      { id: `${id}-out-right`, type: 'out', position: 'right', xRatio: 1, yRatio: 0.5 }
    ];

    const newNode: CanvasNode = {
      id,
      type: catalogItem.type,
      name: `${catalogItem.type}-${this.nodes().filter(n => n.type === type).length + 1}`,
      category: catalogItem.category,
      x: Math.round(canvasX - width / 2),
      y: Math.round(canvasY - height / 2),
      width,
      height,
      icon: catalogItem.icon,
      color: catalogItem.color,
      properties: JSON.parse(JSON.stringify(catalogItem.defaultProperties || {})),
      ports: defaultPorts,
      status: 'normal'
    };

    this.nodes.update(list => [...list, newNode]);
    this.selectNode(newNode.id);
    this.recordSnapshot();
    return newNode;
  }

  updateNodePosition(id: string, x: number, y: number, commit = false) {
    this.nodes.update(list =>
      list.map(node => (node.id === id ? { ...node, x: Math.round(x), y: Math.round(y) } : node))
    );
    if (commit) {
      this.recordSnapshot();
    }
  }

  updateNodeProperties(id: string, name: string, properties: Record<string, any>) {
    this.nodes.update(list =>
      list.map(node =>
        node.id === id
          ? {
              ...node,
              name,
              properties: { ...properties }
            }
          : node
      )
    );
    this.recordSnapshot();
  }

  removeNode(id: string) {
    this.nodes.update(list => list.filter(node => node.id !== id));
    // Remove all associated connections (cascade delete)
    this.connections.update(conns =>
      conns.filter(c => c.sourceNodeId !== id && c.targetNodeId !== id)
    );
    if (this.selectedNodeId() === id) {
      this.selectedNodeId.set(null);
    }
    this.recordSnapshot();
  }

  // ─────────────────────────────────────────────────────────────
  // Connection Operations
  // ─────────────────────────────────────────────────────────────

  startLinking(nodeId: string, portId: string, worldX: number, worldY: number) {
    this.linkingSource.set({ nodeId, portId, x: worldX, y: worldY });
    this.linkingMousePos.set({ x: worldX, y: worldY });
  }

  updateLinkingMouse(worldX: number, worldY: number) {
    if (this.linkingSource()) {
      this.linkingMousePos.set({ x: worldX, y: worldY });
    }
  }

  completeLinking(targetNodeId: string, targetPortId: string): boolean {
    const source = this.linkingSource();
    if (!source) return false;

    // Disallow self-connections to the exact same node
    if (source.nodeId === targetNodeId) {
      this.cancelLinking();
      return false;
    }

    // Prevent duplicate connections with the same direction
    const existing = this.connections().some(
      c => c.sourceNodeId === source.nodeId && c.targetNodeId === targetNodeId
    );
    if (existing) {
      this.cancelLinking();
      return false;
    }

    const sourceNode = this.nodes().find(n => n.id === source.nodeId);
    const targetNode = this.nodes().find(n => n.id === targetNodeId);

    // Smart default protocol based on source/target node types
    let protocol = 'TCP';
    let port: number | undefined = 443;
    let label = 'HTTPS:443';

    if (sourceNode?.type === 'Internet' && targetNode?.type === 'LoadBalancer') {
      protocol = 'HTTPS';
      port = 443;
      label = 'HTTPS:443';
    } else if (sourceNode?.type === 'LoadBalancer' && targetNode?.type === 'ComputeInstance') {
      protocol = 'HTTP';
      port = 8080;
      label = 'HTTP:8080';
    } else if (sourceNode?.type === 'ComputeInstance' && targetNode?.type === 'Database') {
      protocol = 'SQL*Net';
      port = 1521;
      label = 'SQL:1521';
    } else if (targetNode?.type === 'ObjectStorage') {
      protocol = 'HTTPS';
      port = 443;
      label = 'HTTPS:443';
    }

    const newConnection: CanvasConnection = {
      id: `conn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sourceNodeId: source.nodeId,
      sourcePortId: source.portId,
      targetNodeId,
      targetPortId,
      protocol,
      port,
      label,
      status: 'normal'
    };

    this.connections.update(conns => [...conns, newConnection]);
    this.cancelLinking();
    this.selectConnection(newConnection.id);
    this.recordSnapshot();
    return true;
  }

  cancelLinking() {
    this.linkingSource.set(null);
    this.linkingMousePos.set(null);
  }

  updateConnectionProperties(
    id: string,
    protocol: string,
    port: number | undefined,
    label: string,
    notes?: string
  ) {
    this.connections.update(list =>
      list.map(c =>
        c.id === id
          ? {
              ...c,
              protocol,
              port,
              label: label || (port ? `${protocol}:${port}` : protocol),
              notes
            }
          : c
      )
    );
    this.recordSnapshot();
  }

  removeConnection(id: string) {
    this.connections.update(list => list.filter(c => c.id !== id));
    if (this.selectedConnectionId() === id) {
      this.selectedConnectionId.set(null);
    }
    this.recordSnapshot();
  }

  // ─────────────────────────────────────────────────────────────
  // Selection & Interactions
  // ─────────────────────────────────────────────────────────────

  toggleSimulationMode() {
    this.simulationMode.set(!this.simulationMode());
    if (this.simulationMode()) {
      this.learningMode.set(false);
    }
    this.simulationSourceNodeId.set(null);
    this.trafficSimulationResult.set(null);
    this.clearSelection();
  }

  toggleLearningMode() {
    this.learningMode.set(!this.learningMode());
    if (this.learningMode()) {
      this.simulationMode.set(false);
      this.simulationSourceNodeId.set(null);
      this.trafficSimulationResult.set(null);
    }
    this.clearSelection();
  }

  selectNode(id: string | null) {
    if (id && this.simulationMode()) {
      if (!this.simulationSourceNodeId()) {
        this.simulationSourceNodeId.set(id);
      } else {
        this.runSimulation(this.simulationSourceNodeId()!, id);
      }
      return;
    }
    this.selectedNodeId.set(id);
    this.selectedConnectionId.set(null);
  }

  private runSimulation(sourceId: string, targetId: string) {
    const domainModel = this.architectureMapper.toDomainModel(
      this.architectureId(),
      this.architectureName(),
      this.architectureDescription(),
      this.architectureRegion(),
      this.nodes(),
      this.connections()
    );

    this.simulationService.simulatePath({
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      architectureState: domainModel
    }).subscribe(result => {
      this.trafficSimulationResult.set(result);
      // Keep source selected to allow another target, or reset to null to start over
      this.simulationSourceNodeId.set(null);
    });
  }

  selectConnection(id: string | null) {
    this.selectedConnectionId.set(id);
    this.selectedNodeId.set(null);
  }

  clearSelection() {
    this.selectedNodeId.set(null);
    this.selectedConnectionId.set(null);
  }

  // ─────────────────────────────────────────────────────────────
  // Viewport / Pan & Zoom
  // ─────────────────────────────────────────────────────────────

  pan(deltaX: number, deltaY: number) {
    this.viewport.update(vp => ({
      ...vp,
      x: vp.x + deltaX,
      y: vp.y + deltaY
    }));
  }

  zoom(factor: number, clientPivotX?: number, clientPivotY?: number) {
    this.viewport.update(vp => {
      const newZoom = Math.min(2.5, Math.max(0.25, vp.zoom * factor));
      if (clientPivotX !== undefined && clientPivotY !== undefined) {
        // Zoom towards mouse pointer
        const mouseWorldX = (clientPivotX - vp.x) / vp.zoom;
        const mouseWorldY = (clientPivotY - vp.y) / vp.zoom;
        const newX = clientPivotX - mouseWorldX * newZoom;
        const newY = clientPivotY - mouseWorldY * newZoom;
        return { x: Math.round(newX), y: Math.round(newY), zoom: Number(newZoom.toFixed(2)) };
      }
      return { ...vp, zoom: Number(newZoom.toFixed(2)) };
    });
  }

  resetViewport() {
    this.viewport.set({ x: 80, y: 80, zoom: 1.0 });
  }

  fitToScreen(containerWidth = 1000, containerHeight = 700) {
    const currentNodes = this.nodes();
    if (currentNodes.length === 0) {
      this.resetViewport();
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of currentNodes) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    }

    const padding = 100;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    const zoom = Math.min(1.2, Math.max(0.4, Math.min(containerWidth / contentWidth, containerHeight / contentHeight)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const x = containerWidth / 2 - centerX * zoom;
    const y = containerHeight / 2 - centerY * zoom;

    this.viewport.set({ x: Math.round(x), y: Math.round(y), zoom: Number(zoom.toFixed(2)) });
  }

  // ─────────────────────────────────────────────────────────────
  // Auto-Layout
  // ─────────────────────────────────────────────────────────────

  autoLayout() {
    const currentNodes = this.nodes();
    if (currentNodes.length === 0) return;

    // Organize by logical tiers:
    // Tier 0: External / Users (Internet)
    // Tier 1: Gateways & Load Balancer (Public subnet)
    // Tier 2: Compute / API instances (Private subnet)
    // Tier 3: Databases & Storage (Private data subnet)
    const tiers: Record<string, CanvasNode[]> = {
      '0': [],
      '1': [],
      '2': [],
      '3': []
    };

    currentNodes.forEach(node => {
      if (node.category === 'External') tiers['0'].push(node);
      else if (node.type === 'InternetGateway' || node.type === 'LoadBalancer' || node.type === 'PublicSubnet') tiers['1'].push(node);
      else if (node.type === 'ComputeInstance' || node.type === 'PrivateSubnet') tiers['2'].push(node);
      else tiers['3'].push(node);
    });

    const startY = 60;
    const tierGapY = 160;
    const nodeGapX = 220;

    const updatedNodes: CanvasNode[] = [];

    Object.keys(tiers).forEach(tierKey => {
      const tierIndex = Number(tierKey);
      const tierList = tiers[tierKey];
      const totalTierWidth = (tierList.length - 1) * nodeGapX;
      const startX = Math.max(100, 450 - totalTierWidth / 2);

      tierList.forEach((node, i) => {
        updatedNodes.push({
          ...node,
          x: Math.round(startX + i * nodeGapX - node.width / 2),
          y: Math.round(startY + tierIndex * tierGapY)
        });
      });
    });

    this.nodes.set(updatedNodes);
    this.recordSnapshot();
  }

  // ─────────────────────────────────────────────────────────────
  // Template Loader
  // ─────────────────────────────────────────────────────────────

  loadTemplate(templateData: any) {
    this.clearCanvas();
    this.architectureName.set(templateData.architectureName);
    this.architectureRegion.set(templateData.architectureRegion);
    
    if (templateData.nodes) {
      this.nodes.set(templateData.nodes);
    }
    
    if (templateData.edges) {
      this.connections.set(templateData.edges);
    }
    
    this.recordSnapshot();
    
    // Auto layout the newly loaded template
    setTimeout(() => {
      this.autoLayout();
      this.fitToScreen();
    }, 50);
  }

  clearCanvas() {
    this.nodes.set([]);
    this.connections.set([]);
    this.clearSelection();
    this.recordSnapshot();
  }

  // ─────────────────────────────────────────────────────────────
  // Persistence & Export/Import (Architecture Domain Model)
  // ─────────────────────────────────────────────────────────────

  saveToLocalStorage(): void {
    try {
      const architecture = this.architectureMapper.toDomainModel(
        this.architectureId(),
        this.architectureName(),
        this.architectureDescription(),
        this.architectureRegion(),
        this.nodes(),
        this.connections()
      );
      
      const payload = {
        architecture,
        viewport: this.viewport() // Save UI state separately from domain model
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Unable to persist to localStorage', e);
    }
  }

  saveToCloud(): Promise<void> {
    return new Promise((resolve, reject) => {
      const isLocal = this.architectureId().startsWith('arch-local');
      
      const domainModel = this.architectureMapper.toDomainModel(
        this.architectureId(),
        this.architectureName(),
        this.architectureDescription(),
        this.architectureRegion(),
        this.nodes(),
        this.connections()
      );

      if (isLocal) {
        // Create new
        this.architectureService.create({
          name: this.architectureName(),
          region: this.architectureRegion(),
          description: this.architectureDescription()
        }).subscribe({
          next: (created) => {
            this.architectureId.set(created.id);
            // Now save the full state using the new ID
            this.architectureService.saveState(created.id, domainModel).subscribe({
              next: () => resolve(),
              error: (err) => reject(err)
            });
          },
          error: (err) => reject(err)
        });
      } else {
        // Update existing
        this.architectureService.saveState(this.architectureId(), domainModel).subscribe({
          next: () => resolve(),
          error: (err) => reject(err)
        });
      }
    });
  }

  loadFromLocalStorage(): boolean {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return false;
      
      const data = JSON.parse(saved);
      // Support backward compatibility if previous save was the raw canvas state
      if (data.nodes && Array.isArray(data.nodes) && !data.architecture) {
        this.architectureId.set(data.id || 'arch-local-001');
        this.architectureName.set(data.name || 'OCI Architecture');
        this.architectureRegion.set(data.region || 'sa-santiago-1');
        this.architectureDescription.set(data.description || '');
        this.nodes.set(data.nodes);
        this.connections.set(data.connections || []);
        if (data.viewport) this.viewport.set(data.viewport);
        return true;
      }

      if (data.architecture) {
        const arch = data.architecture;
        this.architectureId.set(arch.id);
        this.architectureName.set(arch.name);
        this.architectureRegion.set(arch.region);
        this.architectureDescription.set(arch.description);
        
        const canvasState = this.architectureMapper.toCanvasState(arch);
        this.nodes.set(canvasState.nodes);
        this.connections.set(canvasState.connections);
        
        if (data.viewport) this.viewport.set(data.viewport);
        return true;
      }
    } catch (e) {
      console.warn('Failed to parse saved architecture from localStorage', e);
    }
    return false;
  }

  exportToJson(): string {
    const architecture = this.architectureMapper.toDomainModel(
      this.architectureId(),
      this.architectureName(),
      this.architectureDescription(),
      this.architectureRegion(),
      this.nodes(),
      this.connections()
    );
    return JSON.stringify(architecture, null, 2);
  }

  importFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Support backward compatibility
      if (parsed.nodes && Array.isArray(parsed.nodes) && !parsed.resources) {
        this.architectureName.set(parsed.name || 'Imported Architecture');
        this.architectureRegion.set(parsed.region || 'sa-santiago-1');
        this.architectureDescription.set(parsed.description || '');
        this.nodes.set(parsed.nodes);
        this.connections.set(parsed.connections || []);
        this.clearSelection();
        this.fitToScreen();
        this.recordSnapshot();
        return true;
      }

      if (parsed.resources && Array.isArray(parsed.resources)) {
        this.architectureId.set(parsed.id || `arch-${Date.now()}`);
        this.architectureName.set(parsed.name || 'Imported Architecture');
        this.architectureRegion.set(parsed.region || 'sa-santiago-1');
        this.architectureDescription.set(parsed.description || '');

        const canvasState = this.architectureMapper.toCanvasState(parsed);
        this.nodes.set(canvasState.nodes);
        this.connections.set(canvasState.connections);
        this.clearSelection();
        this.fitToScreen();
        this.recordSnapshot();
        return true;
      }
    } catch (e) {
      console.error('Failed to import architecture JSON', e);
    }
    return false;
  }
}
