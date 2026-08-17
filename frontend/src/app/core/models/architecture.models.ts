export interface Architecture {
  id: string;
  name: string;
  description: string;
  provider: string;
  region: string;
  resources: OciResource[];
  connections: ResourceConnection[];
  createdAt: string;
  updatedAt: string;
}

export interface ArchitectureSummary {
  id: string;
  name: string;
  description: string;
  region: string;
  resourceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OciResource {
  id: string;
  type: string;
  name: string;
  properties: Record<string, unknown>;
  position: CanvasPosition;
}

export interface CanvasPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResourceConnection {
  id: string;
  sourceResourceId: string;
  targetResourceId: string;
  protocol: string;
  port?: number;
  direction: string;
}

export interface CreateArchitectureRequest {
  name: string;
  region: string;
  description?: string;
}

export interface UpdateArchitectureRequest {
  name: string;
  description: string;
}
