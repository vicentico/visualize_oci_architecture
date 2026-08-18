import { Injectable } from '@angular/core';
import { Architecture, OciResource, ResourceConnection } from '../models/architecture.models';
import { CanvasNode, CanvasConnection, CanvasPort } from '../models/canvas.models';
import { OCI_CATALOG, OciCatalogItem } from '../models/catalog.models';

@Injectable({
  providedIn: 'root'
})
export class ArchitectureMapperService {

  /**
   * Translates the Canvas (Visual) state into the pure Domain Architecture Model.
   */
  toDomainModel(
    id: string,
    name: string,
    description: string,
    region: string,
    nodes: CanvasNode[],
    connections: CanvasConnection[]
  ): Architecture {
    
    const resources: OciResource[] = nodes.map(node => ({
      id: node.id,
      type: node.type,
      name: node.name,
      properties: JSON.parse(JSON.stringify(node.properties || {})), // deep copy
      position: {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height
      }
    }));

    const resourceConnections: ResourceConnection[] = connections.map(conn => ({
      id: conn.id,
      sourceResourceId: conn.sourceNodeId,
      targetResourceId: conn.targetNodeId,
      protocol: conn.protocol,
      port: conn.port,
      direction: 'Unidirectional' // By default in MVP
    }));

    return {
      id: id || `arch-${Date.now()}`,
      name: name || 'OCI Architecture',
      description: description || '',
      provider: 'OCI',
      region: region || 'sa-santiago-1',
      resources,
      connections: resourceConnections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Translates the pure Domain Architecture Model back into the Canvas (Visual) state.
   * This involves regenerating ports and attaching visual properties (icon, color) from the Catalog.
   */
  toCanvasState(architecture: Architecture): { nodes: CanvasNode[], connections: CanvasConnection[] } {
    const nodes: CanvasNode[] = architecture.resources.map(res => {
      const catalogItem = OCI_CATALOG.find(i => i.type === res.type);
      
      const category = catalogItem?.category || 'Unknown';
      const icon = catalogItem?.icon || 'help_outline';
      const color = catalogItem?.color || '#94a3b8';

      // Recreate default ports
      const id = res.id;
      const ports: CanvasPort[] = [
        { id: `${id}-in-top`, type: 'in', position: 'top', xRatio: 0.5, yRatio: 0 },
        { id: `${id}-out-bottom`, type: 'out', position: 'bottom', xRatio: 0.5, yRatio: 1 },
        { id: `${id}-in-left`, type: 'in', position: 'left', xRatio: 0, yRatio: 0.5 },
        { id: `${id}-out-right`, type: 'out', position: 'right', xRatio: 1, yRatio: 0.5 }
      ];

      return {
        id: res.id,
        type: res.type,
        name: res.name,
        category,
        x: res.position?.x || 100,
        y: res.position?.y || 100,
        width: res.position?.width || 160,
        height: res.position?.height || 90,
        icon,
        color,
        properties: JSON.parse(JSON.stringify(res.properties || {})),
        ports,
        status: 'normal'
      };
    });

    const connections: CanvasConnection[] = architecture.connections.map(conn => {
      const sourcePortId = `${conn.sourceResourceId}-out-bottom`; // Defaulting logic, can be improved
      const targetPortId = `${conn.targetResourceId}-in-top`;     // Defaulting logic

      const label = conn.port ? `${conn.protocol}:${conn.port}` : conn.protocol;

      return {
        id: conn.id,
        sourceNodeId: conn.sourceResourceId,
        sourcePortId,
        targetNodeId: conn.targetResourceId,
        targetPortId,
        protocol: conn.protocol,
        port: conn.port,
        label,
        status: 'normal'
      };
    });

    return { nodes, connections };
  }
}
