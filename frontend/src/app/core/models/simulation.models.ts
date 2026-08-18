export interface TrafficHop {
  connectionId: string;
  sourceResourceId: string;
  targetResourceId: string;
  sequenceOrder: number;
}

export interface TrafficSimulationResult {
  isPathFound: boolean;
  errorMessage?: string;
  path: TrafficHop[];
}

export interface SimulationRequest {
  sourceNodeId: string;
  targetNodeId: string;
  architectureState: any;
}
