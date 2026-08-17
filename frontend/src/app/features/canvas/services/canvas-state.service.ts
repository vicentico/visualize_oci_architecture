import { Injectable, signal, computed } from '@angular/core';
import {
  CanvasNode,
  CanvasConnection,
  CanvasPort,
  ViewportTransform
} from '../../../core/models/canvas.models';
import { OCI_CATALOG, OciCatalogItem } from '../../../core/models/catalog.models';
import { CanvasHistoryService } from './canvas-history.service';

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

  constructor(private historyService: CanvasHistoryService) {
    // Attempt to load from local storage or load default starter architecture
    const restored = this.loadFromLocalStorage();
    if (!restored) {
      this.loadStarterArchitecture();
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
  // Selection
  // ─────────────────────────────────────────────────────────────

  selectNode(id: string | null) {
    this.selectedNodeId.set(id);
    this.selectedConnectionId.set(null);
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
  // Starter Architecture Loader (MVP Baseline)
  // ─────────────────────────────────────────────────────────────

  loadStarterArchitecture() {
    const internet: CanvasNode = {
      id: 'res-internet',
      type: 'Internet',
      name: 'Internet',
      category: 'External',
      x: 370,
      y: 40,
      width: 160,
      height: 70,
      icon: 'public',
      color: '#0284c7',
      properties: { ipRange: '0.0.0.0/0' },
      ports: [
        { id: 'p-int-out', type: 'out', position: 'bottom', xRatio: 0.5, yRatio: 1 },
        { id: 'p-int-in', type: 'in', position: 'top', xRatio: 0.5, yRatio: 0 },
        { id: 'p-int-l', type: 'in', position: 'left', xRatio: 0, yRatio: 0.5 },
        { id: 'p-int-r', type: 'out', position: 'right', xRatio: 1, yRatio: 0.5 }
      ]
    };

    const igw: CanvasNode = {
      id: 'res-igw',
      type: 'InternetGateway',
      name: 'Internet Gateway',
      category: 'Networking',
      x: 370,
      y: 160,
      width: 160,
      height: 70,
      icon: 'router',
      color: '#0d9488',
      properties: { isEnabled: true },
      ports: [
        { id: 'p-igw-in', type: 'in', position: 'top', xRatio: 0.5, yRatio: 0 },
        { id: 'p-igw-out', type: 'out', position: 'bottom', xRatio: 0.5, yRatio: 1 },
        { id: 'p-igw-l', type: 'in', position: 'left', xRatio: 0, yRatio: 0.5 },
        { id: 'p-igw-r', type: 'out', position: 'right', xRatio: 1, yRatio: 0.5 }
      ]
    };

    const lb: CanvasNode = {
      id: 'res-lb',
      type: 'LoadBalancer',
      name: 'Public Load Balancer',
      category: 'Application',
      x: 370,
      y: 280,
      width: 170,
      height: 75,
      icon: 'call_split',
      color: '#b45309',
      properties: { shape: 'flexible', minBandwidthMbps: 10, maxBandwidthMbps: 100, isPrivate: false },
      ports: [
        { id: 'p-lb-in', type: 'in', position: 'top', xRatio: 0.5, yRatio: 0 },
        { id: 'p-lb-out', type: 'out', position: 'bottom', xRatio: 0.5, yRatio: 1 },
        { id: 'p-lb-l', type: 'in', position: 'left', xRatio: 0, yRatio: 0.5 },
        { id: 'p-lb-r', type: 'out', position: 'right', xRatio: 1, yRatio: 0.5 }
      ]
    };

    const api1: CanvasNode = {
      id: 'res-api-1',
      type: 'ComputeInstance',
      name: 'API Instance #1 (AD-1)',
      category: 'Compute',
      x: 230,
      y: 420,
      width: 180,
      height: 75,
      icon: 'memory',
      color: '#d97706',
      properties: { shape: 'VM.Standard.E5.Flex', ocpus: 2, memoryInGBs: 16, os: 'Oracle Linux 9' },
      ports: [
        { id: 'p-api1-in', type: 'in', position: 'top', xRatio: 0.5, yRatio: 0 },
        { id: 'p-api1-out', type: 'out', position: 'bottom', xRatio: 0.5, yRatio: 1 },
        { id: 'p-api1-l', type: 'in', position: 'left', xRatio: 0, yRatio: 0.5 },
        { id: 'p-api1-r', type: 'out', position: 'right', xRatio: 1, yRatio: 0.5 }
      ]
    };

    const api2: CanvasNode = {
      id: 'res-api-2',
      type: 'ComputeInstance',
      name: 'API Instance #2 (AD-2)',
      category: 'Compute',
      x: 510,
      y: 420,
      width: 180,
      height: 75,
      icon: 'memory',
      color: '#d97706',
      properties: { shape: 'VM.Standard.E5.Flex', ocpus: 2, memoryInGBs: 16, os: 'Oracle Linux 9' },
      ports: [
        { id: 'p-api2-in', type: 'in', position: 'top', xRatio: 0.5, yRatio: 0 },
        { id: 'p-api2-out', type: 'out', position: 'bottom', xRatio: 0.5, yRatio: 1 },
        { id: 'p-api2-l', type: 'in', position: 'left', xRatio: 0, yRatio: 0.5 },
        { id: 'p-api2-r', type: 'out', position: 'right', xRatio: 1, yRatio: 0.5 }
      ]
    };

    const db: CanvasNode = {
      id: 'res-db',
      type: 'Database',
      name: 'Autonomous Database (ATP)',
      category: 'Database',
      x: 370,
      y: 560,
      width: 190,
      height: 80,
      icon: 'dns',
      color: '#c5221f',
      properties: { workload: 'Transaction Processing', cpuCount: 2, storageInTB: 1, isPrivate: true },
      ports: [
        { id: 'p-db-in', type: 'in', position: 'top', xRatio: 0.5, yRatio: 0 },
        { id: 'p-db-out', type: 'out', position: 'bottom', xRatio: 0.5, yRatio: 1 },
        { id: 'p-db-l', type: 'in', position: 'left', xRatio: 0, yRatio: 0.5 },
        { id: 'p-db-r', type: 'out', position: 'right', xRatio: 1, yRatio: 0.5 }
      ]
    };

    const defaultNodes = [internet, igw, lb, api1, api2, db];

    const defaultConnections: CanvasConnection[] = [
      {
        id: 'conn-1',
        sourceNodeId: 'res-internet',
        sourcePortId: 'p-int-out',
        targetNodeId: 'res-igw',
        targetPortId: 'p-igw-in',
        protocol: 'HTTPS',
        port: 443,
        label: 'HTTPS:443'
      },
      {
        id: 'conn-2',
        sourceNodeId: 'res-igw',
        sourcePortId: 'p-igw-out',
        targetNodeId: 'res-lb',
        targetPortId: 'p-lb-in',
        protocol: 'HTTPS',
        port: 443,
        label: 'HTTPS:443'
      },
      {
        id: 'conn-3',
        sourceNodeId: 'res-lb',
        sourcePortId: 'p-lb-out',
        targetNodeId: 'res-api-1',
        targetPortId: 'p-api1-in',
        protocol: 'HTTP',
        port: 8080,
        label: 'HTTP:8080'
      },
      {
        id: 'conn-4',
        sourceNodeId: 'res-lb',
        sourcePortId: 'p-lb-out',
        targetNodeId: 'res-api-2',
        targetPortId: 'p-api2-in',
        protocol: 'HTTP',
        port: 8080,
        label: 'HTTP:8080'
      },
      {
        id: 'conn-5',
        sourceNodeId: 'res-api-1',
        sourcePortId: 'p-api1-out',
        targetNodeId: 'res-db',
        targetPortId: 'p-db-in',
        protocol: 'SQL*Net',
        port: 1521,
        label: 'SQL:1521'
      },
      {
        id: 'conn-6',
        sourceNodeId: 'res-api-2',
        sourcePortId: 'p-api2-out',
        targetNodeId: 'res-db',
        targetPortId: 'p-db-in',
        protocol: 'SQL*Net',
        port: 1521,
        label: 'SQL:1521'
      }
    ];

    this.nodes.set(defaultNodes);
    this.connections.set(defaultConnections);
    this.clearSelection();
    this.recordSnapshot();
  }

  clearCanvas() {
    this.nodes.set([]);
    this.connections.set([]);
    this.clearSelection();
    this.recordSnapshot();
  }

  // ─────────────────────────────────────────────────────────────
  // Persistence & Export/Import
  // ─────────────────────────────────────────────────────────────

  saveToLocalStorage(): void {
    try {
      const data = {
        id: this.architectureId(),
        name: this.architectureName(),
        region: this.architectureRegion(),
        description: this.architectureDescription(),
        nodes: this.nodes(),
        connections: this.connections(),
        viewport: this.viewport()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Unable to persist to localStorage', e);
    }
  }

  loadFromLocalStorage(): boolean {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return false;
      const data = JSON.parse(saved);
      if (data.nodes && Array.isArray(data.nodes) && data.nodes.length > 0) {
        this.architectureId.set(data.id || 'arch-local-001');
        this.architectureName.set(data.name || 'OCI Architecture');
        this.architectureRegion.set(data.region || 'sa-santiago-1');
        this.architectureDescription.set(data.description || '');
        this.nodes.set(data.nodes);
        this.connections.set(data.connections || []);
        if (data.viewport) this.viewport.set(data.viewport);
        return true;
      }
    } catch (e) {
      console.warn('Failed to parse saved architecture from localStorage', e);
    }
    return false;
  }

  exportToJson(): string {
    const data = {
      id: this.architectureId(),
      name: this.architectureName(),
      region: this.architectureRegion(),
      description: this.architectureDescription(),
      provider: 'OCI',
      exportedAt: new Date().toISOString(),
      nodes: this.nodes(),
      connections: this.connections()
    };
    return JSON.stringify(data, null, 2);
  }

  importFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.nodes && Array.isArray(parsed.nodes)) {
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
    } catch (e) {
      console.error('Failed to import architecture JSON', e);
    }
    return false;
  }
}
