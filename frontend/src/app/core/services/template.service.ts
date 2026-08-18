import { Injectable } from '@angular/core';

export interface ArchitectureTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  getTemplates(): ArchitectureTemplate[] {
    return [
      {
        id: 'basic-web-app',
        name: 'Basic Web App',
        description: 'Single compute instance connected to a Database via Internet Gateway.',
        icon: 'web',
        data: this.getBasicWebApp()
      },
      {
        id: 'ha-web-app',
        name: 'Highly Available Web App',
        description: 'Load balancer distributing traffic to multiple compute instances connected to a Database.',
        icon: 'dynamic_feed',
        data: this.getHaWebApp()
      },
      {
        id: 'private-api',
        name: 'Private API',
        description: 'API Gateway exposing private compute instances and database.',
        icon: 'vpn_lock',
        data: this.getPrivateApi()
      },
      {
        id: 'three-tier',
        name: 'Three Tier Architecture',
        description: 'Classic three-tier: Presentation (LB), Logic (App servers), Data (DB).',
        icon: 'layers',
        data: this.getThreeTier()
      },
      {
        id: 'containerized',
        name: 'Containerized Application',
        description: 'Load Balancer routing to an OKE (Kubernetes) cluster.',
        icon: 'view_in_ar',
        data: this.getContainerized()
      },
      {
        id: 'microservices',
        name: 'Microservices',
        description: 'API Gateway routing to multiple independent microservices and databases.',
        icon: 'hub',
        data: this.getMicroservices()
      }
    ];
  }

  // --- Helpers for generating the JSON data of each template ---
  // The data structure here matches the exported JSON format from CanvasStateService.
  // It contains 'nodes', 'edges', 'metadata' (architecture name/region).

  private getPorts(idPrefix: string) {
    return [
      { id: `${idPrefix}-in`, type: 'in', position: 'top', xRatio: 0.5, yRatio: 0 },
      { id: `${idPrefix}-out`, type: 'out', position: 'bottom', xRatio: 0.5, yRatio: 1 },
      { id: `${idPrefix}-l`, type: 'in', position: 'left', xRatio: 0, yRatio: 0.5 },
      { id: `${idPrefix}-r`, type: 'out', position: 'right', xRatio: 1, yRatio: 0.5 }
    ];
  }

  private createNode(id: string, type: string, name: string, category: string, icon: string, color: string, x: number, y: number) {
    return {
      id, type, name, category, icon, color,
      x, y, width: 160, height: 75,
      properties: {},
      ports: this.getPorts(id)
    };
  }

  private createEdge(source: string, target: string, portPrefixSource: string, portPrefixTarget: string) {
    return {
      id: `edge-${source}-${target}`,
      sourceNodeId: source,
      targetNodeId: target,
      sourcePortId: `${portPrefixSource}-out`,
      targetPortId: `${portPrefixTarget}-in`,
      protocol: 'TCP',
      port: 80,
      direction: 'Unidirectional'
    };
  }

  private getBasicWebApp() {
    const internet = this.createNode('res-internet', 'Internet', 'Internet', 'External', 'public', '#0284c7', 370, 40);
    const igw = this.createNode('res-igw', 'InternetGateway', 'Internet Gateway', 'Networking', 'router', '#0d9488', 370, 160);
    const compute = this.createNode('res-compute', 'ComputeInstance', 'Web Server', 'Compute', 'computer', '#4f46e5', 370, 280);
    const db = this.createNode('res-db', 'Database', 'Autonomous DB', 'Database', 'storage', '#db2777', 370, 400);

    const edges = [
      this.createEdge('res-internet', 'res-igw', 'res-internet', 'res-igw'),
      this.createEdge('res-igw', 'res-compute', 'res-igw', 'res-compute'),
      this.createEdge('res-compute', 'res-db', 'res-compute', 'res-db')
    ];

    return {
      architectureName: 'Basic Web App',
      architectureRegion: 'us-ashburn-1',
      nodes: [internet, igw, compute, db],
      edges: edges
    };
  }

  private getHaWebApp() {
    const internet = this.createNode('res-internet', 'Internet', 'Internet', 'External', 'public', '#0284c7', 370, 40);
    const igw = this.createNode('res-igw', 'InternetGateway', 'Internet Gateway', 'Networking', 'router', '#0d9488', 370, 160);
    const lb = this.createNode('res-lb', 'LoadBalancer', 'Public LB', 'Networking', 'call_split', '#b45309', 370, 280);
    const comp1 = this.createNode('res-comp1', 'ComputeInstance', 'Web Server 1', 'Compute', 'computer', '#4f46e5', 270, 400);
    const comp2 = this.createNode('res-comp2', 'ComputeInstance', 'Web Server 2', 'Compute', 'computer', '#4f46e5', 470, 400);
    const db = this.createNode('res-db', 'Database', 'HA Database', 'Database', 'storage', '#db2777', 370, 520);

    const edges = [
      this.createEdge('res-internet', 'res-igw', 'res-internet', 'res-igw'),
      this.createEdge('res-igw', 'res-lb', 'res-igw', 'res-lb'),
      this.createEdge('res-lb', 'res-comp1', 'res-lb', 'res-comp1'),
      this.createEdge('res-lb', 'res-comp2', 'res-lb', 'res-comp2'),
      this.createEdge('res-comp1', 'res-db', 'res-comp1', 'res-db'),
      this.createEdge('res-comp2', 'res-db', 'res-comp2', 'res-db')
    ];

    return {
      architectureName: 'Highly Available Web App',
      architectureRegion: 'us-ashburn-1',
      nodes: [internet, igw, lb, comp1, comp2, db],
      edges: edges
    };
  }

  private getPrivateApi() {
    const apiGw = this.createNode('res-apigw', 'ApiGateway', 'API Gateway', 'Networking', 'api', '#0d9488', 370, 160);
    const comp = this.createNode('res-comp', 'ComputeInstance', 'API Backend', 'Compute', 'computer', '#4f46e5', 370, 280);
    const db = this.createNode('res-db', 'Database', 'Private DB', 'Database', 'storage', '#db2777', 370, 400);

    const edges = [
      this.createEdge('res-apigw', 'res-comp', 'res-apigw', 'res-comp'),
      this.createEdge('res-comp', 'res-db', 'res-comp', 'res-db')
    ];

    return {
      architectureName: 'Private API',
      architectureRegion: 'us-ashburn-1',
      nodes: [apiGw, comp, db],
      edges: edges
    };
  }

  private getThreeTier() {
    const internet = this.createNode('res-internet', 'Internet', 'Internet', 'External', 'public', '#0284c7', 370, 40);
    const igw = this.createNode('res-igw', 'InternetGateway', 'Internet Gateway', 'Networking', 'router', '#0d9488', 370, 160);
    const lbWeb = this.createNode('res-lb-web', 'LoadBalancer', 'Web LB', 'Networking', 'call_split', '#b45309', 370, 280);
    const web = this.createNode('res-web', 'ComputeInstance', 'Web Tier', 'Compute', 'computer', '#4f46e5', 370, 400);
    const lbApp = this.createNode('res-lb-app', 'LoadBalancer', 'App LB', 'Networking', 'call_split', '#b45309', 370, 520);
    const app = this.createNode('res-app', 'ComputeInstance', 'App Tier', 'Compute', 'computer', '#4f46e5', 370, 640);
    const db = this.createNode('res-db', 'Database', 'Data Tier', 'Database', 'storage', '#db2777', 370, 760);

    const edges = [
      this.createEdge('res-internet', 'res-igw', 'res-internet', 'res-igw'),
      this.createEdge('res-igw', 'res-lb-web', 'res-igw', 'res-lb-web'),
      this.createEdge('res-lb-web', 'res-web', 'res-lb-web', 'res-web'),
      this.createEdge('res-web', 'res-lb-app', 'res-web', 'res-lb-app'),
      this.createEdge('res-lb-app', 'res-app', 'res-lb-app', 'res-app'),
      this.createEdge('res-app', 'res-db', 'res-app', 'res-db')
    ];

    return {
      architectureName: 'Three Tier Architecture',
      architectureRegion: 'us-ashburn-1',
      nodes: [internet, igw, lbWeb, web, lbApp, app, db],
      edges: edges
    };
  }

  private getContainerized() {
    const internet = this.createNode('res-internet', 'Internet', 'Internet', 'External', 'public', '#0284c7', 370, 40);
    const igw = this.createNode('res-igw', 'InternetGateway', 'Internet Gateway', 'Networking', 'router', '#0d9488', 370, 160);
    const lb = this.createNode('res-lb', 'LoadBalancer', 'Public LB', 'Networking', 'call_split', '#b45309', 370, 280);
    const oke = this.createNode('res-oke', 'OKECluster', 'OKE Cluster', 'Compute', 'view_in_ar', '#4f46e5', 370, 400);
    const db = this.createNode('res-db', 'Database', 'Autonomous DB', 'Database', 'storage', '#db2777', 370, 520);

    const edges = [
      this.createEdge('res-internet', 'res-igw', 'res-internet', 'res-igw'),
      this.createEdge('res-igw', 'res-lb', 'res-igw', 'res-lb'),
      this.createEdge('res-lb', 'res-oke', 'res-lb', 'res-oke'),
      this.createEdge('res-oke', 'res-db', 'res-oke', 'res-db')
    ];

    return {
      architectureName: 'Containerized Application',
      architectureRegion: 'us-ashburn-1',
      nodes: [internet, igw, lb, oke, db],
      edges: edges
    };
  }

  private getMicroservices() {
    const apiGw = this.createNode('res-apigw', 'ApiGateway', 'API Gateway', 'Networking', 'api', '#0d9488', 370, 160);
    const srv1 = this.createNode('res-srv1', 'ComputeInstance', 'Service A', 'Compute', 'computer', '#4f46e5', 200, 280);
    const srv2 = this.createNode('res-srv2', 'ComputeInstance', 'Service B', 'Compute', 'computer', '#4f46e5', 540, 280);
    const db1 = this.createNode('res-db1', 'Database', 'DB A', 'Database', 'storage', '#db2777', 200, 400);
    const db2 = this.createNode('res-db2', 'Database', 'DB B', 'Database', 'storage', '#db2777', 540, 400);

    const edges = [
      this.createEdge('res-apigw', 'res-srv1', 'res-apigw', 'res-srv1'),
      this.createEdge('res-apigw', 'res-srv2', 'res-apigw', 'res-srv2'),
      this.createEdge('res-srv1', 'res-db1', 'res-srv1', 'res-db1'),
      this.createEdge('res-srv2', 'res-db2', 'res-srv2', 'res-db2')
    ];

    return {
      architectureName: 'Microservices',
      architectureRegion: 'us-ashburn-1',
      nodes: [apiGw, srv1, srv2, db1, db2],
      edges: edges
    };
  }
}
