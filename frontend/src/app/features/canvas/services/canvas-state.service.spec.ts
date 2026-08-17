import { TestBed } from '@angular/core/testing';
import { CanvasStateService } from './canvas-state.service';
import { CanvasHistoryService } from './canvas-history.service';

describe('CanvasStateService', () => {
  let service: CanvasStateService;
  let history: CanvasHistoryService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [CanvasStateService, CanvasHistoryService]
    });
    service = TestBed.inject(CanvasStateService);
    history = TestBed.inject(CanvasHistoryService);
  });

  it('should initialize with default starter architecture', () => {
    expect(service.nodes().length).toBeGreaterThan(0);
    expect(service.connections().length).toBeGreaterThan(0);
    expect(service.architectureName()).toBe('OCI Web Application');
  });

  it('should add a new node from catalog correctly', () => {
    const initialCount = service.nodes().length;
    const added = service.addNodeFromCatalog('ComputeInstance', 200, 200);

    expect(added).not.toBeNull();
    expect(service.nodes().length).toBe(initialCount + 1);
    expect(added?.type).toBe('ComputeInstance');
    expect(service.selectedNodeId()).toBe(added?.id || null);
  });

  it('should remove a node and delete dangling connections (cascade delete)', () => {
    // Start with known starter architecture
    service.loadStarterArchitecture();
    const lbNode = service.nodes().find(n => n.type === 'LoadBalancer');
    expect(lbNode).toBeDefined();

    const initialConns = service.connections().length;
    expect(initialConns).toBeGreaterThan(0);

    // Remove Load Balancer
    if (lbNode) {
      service.removeNode(lbNode.id);
      // Verify node removed
      expect(service.nodes().some(n => n.id === lbNode.id)).toBeFalse();
      // Verify all connections touching this node are removed
      const remainingConns = service.connections();
      expect(remainingConns.some(c => c.sourceNodeId === lbNode.id || c.targetNodeId === lbNode.id)).toBeFalse();
    }
  });

  it('should create a valid connection between two nodes', () => {
    service.clearCanvas();
    const n1 = service.addNodeFromCatalog('Internet', 100, 100);
    const n2 = service.addNodeFromCatalog('LoadBalancer', 100, 300);

    expect(n1).not.toBeNull();
    expect(n2).not.toBeNull();

    if (n1 && n2) {
      service.startLinking(n1.id, n1.ports[1].id, 100, 150);
      const connected = service.completeLinking(n2.id, n2.ports[0].id);

      expect(connected).toBeTrue();
      expect(service.connections().length).toBe(1);
      const conn = service.connections()[0];
      expect(conn.sourceNodeId).toBe(n1.id);
      expect(conn.targetNodeId).toBe(n2.id);
      expect(conn.protocol).toBe('HTTPS');
      expect(conn.port).toBe(443);
    }
  });

  it('should disallow self-connections on the same node', () => {
    service.clearCanvas();
    const n1 = service.addNodeFromCatalog('ComputeInstance', 100, 100);
    if (n1) {
      service.startLinking(n1.id, n1.ports[1].id, 100, 150);
      const connected = service.completeLinking(n1.id, n1.ports[0].id);
      expect(connected).toBeFalse();
      expect(service.connections().length).toBe(0);
    }
  });

  it('should perform undo and redo operations accurately', () => {
    service.clearCanvas();
    expect(service.nodes().length).toBe(0);

    service.addNodeFromCatalog('Internet', 100, 100);
    expect(service.nodes().length).toBe(1);

    service.addNodeFromCatalog('Database', 200, 200);
    expect(service.nodes().length).toBe(2);

    // Undo 1 step
    service.undo();
    expect(service.nodes().length).toBe(1);

    // Undo 2nd step
    service.undo();
    expect(service.nodes().length).toBe(0);

    // Redo 1 step
    service.redo();
    expect(service.nodes().length).toBe(1);
  });

  it('should export and import JSON correctly', () => {
    service.loadStarterArchitecture();
    const originalCount = service.nodes().length;
    const json = service.exportToJson();

    expect(json).toContain('OCI Web Application');
    expect(json).toContain('sa-santiago-1');

    service.clearCanvas();
    expect(service.nodes().length).toBe(0);

    const success = service.importFromJson(json);
    expect(success).toBeTrue();
    expect(service.nodes().length).toBe(originalCount);
  });
});
