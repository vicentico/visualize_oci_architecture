export interface CanvasPort {
  id: string;
  type: 'in' | 'out' | 'bi';
  position: 'top' | 'right' | 'bottom' | 'left';
  xRatio: number; // 0..1 relative to node width
  yRatio: number; // 0..1 relative to node height
}

export type NodeStatus = 'normal' | 'selected' | 'valid' | 'warning' | 'error' | 'active';

export interface CanvasNode {
  id: string;
  type: string;
  name: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  icon: string;
  color: string;
  properties: Record<string, any>;
  ports: CanvasPort[];
  parentId?: string; // Container grouping (e.g. inside VCN or Subnet)
  status?: NodeStatus;
}

export interface CanvasConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  protocol: string;
  port?: number;
  label?: string;
  status?: 'normal' | 'selected' | 'active' | 'blocked';
  notes?: string;
}

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface SelectionState {
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  selectedNodeIds: string[];
}

export interface DragItemData {
  type: 'catalog_item' | 'existing_node';
  catalogType?: string;
  nodeId?: string;
  offsetX?: number;
  offsetY?: number;
}
