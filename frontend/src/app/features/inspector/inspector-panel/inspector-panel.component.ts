import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CanvasStateService } from '../../canvas/services/canvas-state.service';
import { OCI_CATALOG } from '../../../core/models/catalog.models';

@Component({
  selector: 'app-inspector-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule,
    MatChipsModule,
    MatSlideToggleModule
  ],
  template: `
    <aside class="inspector-container">

      <!-- ── SECTION: Node Selected ──────────────────────────────── -->
      @if (selectedNode(); as node) {
        <div class="inspector-header">
          <div class="header-main">
            <div class="icon-badge" [style.background-color]="node.color + '20'" [style.color]="node.color">
              <mat-icon>{{ node.icon }}</mat-icon>
            </div>
            <div class="header-titles">
              <span class="type-badge">{{ node.type }}</span>
              <h2 class="node-title">{{ node.name }}</h2>
            </div>
          </div>
          <button mat-icon-button color="warn" class="delete-btn" (click)="deleteNode(node.id)" title="Delete resource">
            <mat-icon>delete_outline</mat-icon>
          </button>
        </div>

        <div class="inspector-content">

          <!-- General Properties -->
          <div class="prop-group">
            <label class="group-label">General Configuration</label>

            <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
              <mat-label>Resource Name</mat-label>
              <input matInput [(ngModel)]="node.name" (ngModelChange)="onNodeNameChange(node, $event)" />
            </mat-form-field>

            <div class="meta-row">
              <span class="meta-label">Category</span>
              <span class="meta-val">{{ node.category }}</span>
            </div>

            <div class="meta-row">
              <span class="meta-label">Resource ID</span>
              <span class="meta-val code-val">{{ node.id }}</span>
            </div>
          </div>

          <mat-divider />

          <!-- Component-Specific Properties -->
          <div class="prop-group">
            <label class="group-label">OCI Properties</label>

            @if (node.type === 'VCN') {
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>CIDR Block</mat-label>
                <input matInput [(ngModel)]="node.properties['cidrBlock']" (ngModelChange)="onPropChange(node)" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>DNS Label</mat-label>
                <input matInput [(ngModel)]="node.properties['dnsLabel']" (ngModelChange)="onPropChange(node)" />
              </mat-form-field>
            }

            @if (node.type === 'PublicSubnet' || node.type === 'PrivateSubnet') {
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Subnet CIDR Block</mat-label>
                <input matInput [(ngModel)]="node.properties['cidrBlock']" (ngModelChange)="onPropChange(node)" />
              </mat-form-field>
            }

            @if (node.type === 'ComputeInstance') {
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Compute Shape</mat-label>
                <mat-select [(ngModel)]="node.properties['shape']" (selectionChange)="onPropChange(node)">
                  <mat-option value="VM.Standard.E5.Flex">VM.Standard.E5.Flex (AMD)</mat-option>
                  <mat-option value="VM.Standard3.Flex">VM.Standard3.Flex (Intel)</mat-option>
                  <mat-option value="VM.Standard.A1.Flex">VM.Standard.A1.Flex (Ampere ARM)</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="two-col">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>OCPUs</mat-label>
                  <input matInput type="number" min="1" max="64" [(ngModel)]="node.properties['ocpus']" (ngModelChange)="onPropChange(node)" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>RAM (GB)</mat-label>
                  <input matInput type="number" min="1" max="512" [(ngModel)]="node.properties['memoryInGBs']" (ngModelChange)="onPropChange(node)" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Operating System</mat-label>
                <mat-select [(ngModel)]="node.properties['os']" (selectionChange)="onPropChange(node)">
                  <mat-option value="Oracle Linux 9">Oracle Linux 9</mat-option>
                  <mat-option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS</mat-option>
                  <mat-option value="Windows Server 2022">Windows Server 2022</mat-option>
                </mat-select>
              </mat-form-field>
            }

            @if (node.type === 'LoadBalancer') {
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Min Bandwidth (Mbps)</mat-label>
                <input matInput type="number" min="10" max="8000" [(ngModel)]="node.properties['minBandwidthMbps']" (ngModelChange)="onPropChange(node)" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Max Bandwidth (Mbps)</mat-label>
                <input matInput type="number" min="10" max="8000" [(ngModel)]="node.properties['maxBandwidthMbps']" (ngModelChange)="onPropChange(node)" />
              </mat-form-field>
              <div class="toggle-row">
                <span>Private Load Balancer</span>
                <mat-slide-toggle [(ngModel)]="node.properties['isPrivate']" (change)="onPropChange(node)"></mat-slide-toggle>
              </div>
            }

            @if (node.type === 'Database') {
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Database Workload</mat-label>
                <mat-select [(ngModel)]="node.properties['workload']" (selectionChange)="onPropChange(node)">
                  <mat-option value="Transaction Processing">Autonomous Transaction Processing (ATP)</mat-option>
                  <mat-option value="Data Warehouse">Autonomous Data Warehouse (ADW)</mat-option>
                  <mat-option value="MySQL HeatWave">MySQL HeatWave Lakehouse</mat-option>
                  <mat-option value="OCI PostgreSQL">OCI Database with PostgreSQL</mat-option>
                </mat-select>
              </mat-form-field>
              <div class="two-col">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>ECPUs / OCPUs</mat-label>
                  <input matInput type="number" min="1" max="128" [(ngModel)]="node.properties['cpuCount']" (ngModelChange)="onPropChange(node)" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Storage (TB)</mat-label>
                  <input matInput type="number" min="1" max="128" [(ngModel)]="node.properties['storageInTB']" (ngModelChange)="onPropChange(node)" />
                </mat-form-field>
              </div>
            }

            @if (node.type === 'ObjectStorage') {
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Storage Tier</mat-label>
                <mat-select [(ngModel)]="node.properties['tier']" (selectionChange)="onPropChange(node)">
                  <mat-option value="Standard">Standard (Hot)</mat-option>
                  <mat-option value="InfrequentAccess">Infrequent Access (Cool)</mat-option>
                  <mat-option value="Archive">Archive (Cold)</mat-option>
                </mat-select>
              </mat-form-field>
            }

            @if (node.type === 'OKECluster') {
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Kubernetes Version</mat-label>
                <input matInput [(ngModel)]="node.properties['kubernetesVersion']" (ngModelChange)="onPropChange(node)" />
              </mat-form-field>
              <div class="two-col">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Node Count</mat-label>
                  <input matInput type="number" min="1" max="100" [(ngModel)]="node.properties['nodeCount']" (ngModelChange)="onPropChange(node)" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Node Shape</mat-label>
                  <input matInput [(ngModel)]="node.properties['nodeShape']" (ngModelChange)="onPropChange(node)" />
                </mat-form-field>
              </div>
            }

            @if (node.type === 'Functions') {
              <div class="two-col">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Memory (MBs)</mat-label>
                  <input matInput type="number" min="128" max="2048" [(ngModel)]="node.properties['memoryInMBs']" (ngModelChange)="onPropChange(node)" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Timeout (s)</mat-label>
                  <input matInput type="number" min="1" max="300" [(ngModel)]="node.properties['timeoutInSeconds']" (ngModelChange)="onPropChange(node)" />
                </mat-form-field>
              </div>
            }

            @if (node.type === 'ApiGateway') {
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Endpoint Type</mat-label>
                <mat-select [(ngModel)]="node.properties['endpointType']" (selectionChange)="onPropChange(node)">
                  <mat-option value="PUBLIC">Public</mat-option>
                  <mat-option value="PRIVATE">Private</mat-option>
                </mat-select>
              </mat-form-field>
              <div class="toggle-row">
                <span>Enable Rate Limiting</span>
                <mat-slide-toggle [(ngModel)]="node.properties['rateLimiting']" (change)="onPropChange(node)"></mat-slide-toggle>
              </div>
            }

            @if (node.type === 'Queue') {
              <div class="two-col">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Visibility Timeout (s)</mat-label>
                  <input matInput type="number" min="1" max="43200" [(ngModel)]="node.properties['visibilityTimeout']" (ngModelChange)="onPropChange(node)" />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Retention (Days)</mat-label>
                  <input matInput type="number" min="1" max="7" [(ngModel)]="node.properties['retentionInDays']" (ngModelChange)="onPropChange(node)" />
                </mat-form-field>
              </div>
            }

            @if (node.type === 'Vault') {
              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Vault Type</mat-label>
                <mat-select [(ngModel)]="node.properties['vaultType']" (selectionChange)="onPropChange(node)">
                  <mat-option value="VIRTUAL_PRIVATE">Virtual Private</mat-option>
                  <mat-option value="DEFAULT">Default</mat-option>
                </mat-select>
              </mat-form-field>
            }

          </div>

          <mat-divider />

          <!-- Educational Why Section -->
          <div class="educational-card">
            <div class="edu-header">
              <mat-icon class="edu-icon">lightbulb</mat-icon>
              <span class="edu-title">Architectural Role</span>
            </div>
            <p class="edu-text">{{ getCatalogInfo(node.type)?.educationalWhy }}</p>
          </div>

        </div>
      }

      <!-- ── SECTION: Connection Selected ────────────────────────── -->
      @else if (selectedConnection()) {
        @if (selectedConnection(); as conn) {
          <div class="inspector-header">
            <div class="header-main">
              <div class="icon-badge connection-badge">
                <mat-icon>alt_route</mat-icon>
              </div>
              <div class="header-titles">
                <span class="type-badge">Traffic Connection</span>
                <h2 class="node-title">{{ conn.label || 'Connection' }}</h2>
              </div>
            </div>
            <button mat-icon-button color="warn" class="delete-btn" (click)="deleteConnection(conn.id)" title="Delete connection">
              <mat-icon>delete_outline</mat-icon>
            </button>
          </div>

          <div class="inspector-content">
            <div class="prop-group">
              <label class="group-label">Connection Endpoints</label>

              <div class="flow-endpoints">
                <div class="endpoint-chip source-chip">
                  <span class="ep-label">FROM</span>
                  <span class="ep-name">{{ getNodeName(conn.sourceNodeId) }}</span>
                </div>
                <mat-icon class="flow-arrow">arrow_downward</mat-icon>
                <div class="endpoint-chip target-chip">
                  <span class="ep-label">TO</span>
                  <span class="ep-name">{{ getNodeName(conn.targetNodeId) }}</span>
                </div>
              </div>
            </div>

            <mat-divider />

            <div class="prop-group">
              <label class="group-label">Protocol & Port</label>

              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Protocol</mat-label>
                <mat-select [(ngModel)]="conn.protocol" (selectionChange)="onConnectionChange(conn)">
                  <mat-option value="HTTPS">HTTPS (TLS Encrypted)</mat-option>
                  <mat-option value="HTTP">HTTP (Cleartext)</mat-option>
                  <mat-option value="TCP">TCP Generic</mat-option>
                  <mat-option value="SQL*Net">SQL*Net (Oracle DB)</mat-option>
                  <mat-option value="PostgreSQL">PostgreSQL Wire</mat-option>
                  <mat-option value="SSH">SSH (Port 22)</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Destination Port</mat-label>
                <input matInput type="number" [(ngModel)]="conn.port" (ngModelChange)="onConnectionChange(conn)" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
                <mat-label>Display Label</mat-label>
                <input matInput [(ngModel)]="conn.label" (ngModelChange)="onConnectionChange(conn)" />
              </mat-form-field>
            </div>

            <mat-divider />

            <div class="educational-card">
              <div class="edu-header">
                <mat-icon class="edu-icon">shield</mat-icon>
                <span class="edu-title">Security Considerations</span>
              </div>
              <p class="edu-text">
                In OCI, ensure that the target subnet or NSG contains an Ingress Security Rule matching
                <strong>Protocol: {{ conn.protocol }}</strong> and <strong>Port: {{ conn.port || 'Any' }}</strong>.
              </p>
            </div>
          </div>
        }
      }

      <!-- ── SECTION: Architecture (Nothing Selected) ─────────────── -->
      @else {
        <div class="inspector-header">
          <div class="header-main">
            <div class="icon-badge architecture-badge">
              <mat-icon>cloud</mat-icon>
            </div>
            <div class="header-titles">
              <span class="type-badge">Architecture Overview</span>
              <h2 class="node-title">{{ architectureName() }}</h2>
            </div>
          </div>
        </div>

        <div class="inspector-content">
          <div class="prop-group">
            <label class="group-label">Architecture Details</label>

            <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
              <mat-label>Architecture Name</mat-label>
              <input matInput [ngModel]="architectureName()" (ngModelChange)="onArchitectureNameChange($event)" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
              <mat-label>OCI Region</mat-label>
              <mat-select [ngModel]="architectureRegion()" (selectionChange)="onArchitectureRegionChange($event.value)">
                <mat-option value="sa-santiago-1">sa-santiago-1 (Chile Central - Santiago)</mat-option>
                <mat-option value="sa-saopaulo-1">sa-saopaulo-1 (Brazil East - São Paulo)</mat-option>
                <mat-option value="us-ashburn-1">us-ashburn-1 (US East - Ashburn)</mat-option>
                <mat-option value="us-phoenix-1">us-phoenix-1 (US West - Phoenix)</mat-option>
                <mat-option value="eu-frankfurt-1">eu-frankfurt-1 (Germany Central - Frankfurt)</mat-option>
                <mat-option value="uk-london-1">uk-london-1 (UK South - London)</mat-option>
                <mat-option value="ap-tokyo-1">ap-tokyo-1 (Japan East - Tokyo)</mat-option>
                <mat-option value="ap-sydney-1">ap-sydney-1 (Australia East - Sydney)</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width" subscriptSizing="dynamic">
              <mat-label>Architectural Purpose / Description</mat-label>
              <textarea
                matInput
                rows="4"
                [ngModel]="architectureDescription()"
                (ngModelChange)="onArchitectureDescChange($event)"
              ></textarea>
            </mat-form-field>
          </div>

          <mat-divider />

          <!-- Topology Stats -->
          <div class="prop-group">
            <label class="group-label">Topology Summary</label>

            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-val">{{ nodesCount() }}</span>
                <span class="stat-lbl">Resources</span>
              </div>
              <div class="stat-card">
                <span class="stat-val">{{ connectionsCount() }}</span>
                <span class="stat-lbl">Connections</span>
              </div>
            </div>
          </div>

          <mat-divider />

          <div class="educational-card hint-card">
            <div class="edu-header">
              <mat-icon class="edu-icon">touch_app</mat-icon>
              <span class="edu-title">Interactive Canvas Guide</span>
            </div>
            <ul class="guide-list">
              <li><strong>Drag</strong> components from the OCI Catalog onto the canvas.</li>
              <li><strong>Connect</strong> resources by dragging from port handles on node edges.</li>
              <li><strong>Click</strong> any node or line to inspect and adjust its properties here.</li>
              <li><strong>Pan & Zoom</strong> with the mouse wheel or toolbar controls.</li>
            </ul>
          </div>
        </div>
      }

    </aside>
  `,
  styles: [`
    .inspector-container {
      width: 320px;
      height: 100%;
      background: #ffffff;
      border-left: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      user-select: none;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.03);
    }

    .inspector-header {
      padding: 16px;
      border-bottom: 1px solid #f3f4f6;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .header-main {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .icon-badge {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-badge mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .connection-badge {
      background: #ede9fe;
      color: #7c3aed;
    }

    .architecture-badge {
      background: #fee2e2;
      color: #c5221f;
    }

    .header-titles {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .type-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9ca3af;
    }

    .node-title {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .delete-btn {
      flex-shrink: 0;
    }

    .inspector-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .prop-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .group-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
    }

    .full-width {
      width: 100%;
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      padding: 4px 0;
    }

    .meta-label {
      color: #6b7280;
    }

    .meta-val {
      font-weight: 600;
      color: #374151;
    }

    .code-val {
      font-family: monospace;
      font-size: 10px;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #374151;
      padding: 4px 0;
    }

    .educational-card {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .hint-card {
      background: #f8fafc;
      border-color: #e2e8f0;
    }

    .edu-header {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .edu-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #16a34a;
    }

    .hint-card .edu-icon {
      color: #0284c7;
    }

    .edu-title {
      font-size: 12px;
      font-weight: 700;
      color: #166534;
    }

    .hint-card .edu-title {
      color: #0369a1;
    }

    .edu-text {
      font-size: 11px;
      color: #15803d;
      margin: 0;
      line-height: 1.4;
    }

    .guide-list {
      margin: 0;
      padding-left: 16px;
      font-size: 11px;
      color: #475569;
      line-height: 1.5;
    }

    .flow-endpoints {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .endpoint-chip {
      width: 100%;
      padding: 8px 12px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .source-chip {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
    }

    .target-chip {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
    }

    .ep-label {
      font-size: 10px;
      font-weight: 800;
      color: #6b7280;
    }

    .ep-name {
      font-weight: 600;
      color: #1f2937;
    }

    .flow-arrow {
      color: #9ca3af;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .stat-card {
      background: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-val {
      font-size: 18px;
      font-weight: 800;
      color: #111827;
    }

    .stat-lbl {
      font-size: 10px;
      color: #9ca3af;
      text-transform: uppercase;
    }
  `]
})
export class InspectorPanelComponent {
  private canvasState = inject(CanvasStateService);

  readonly selectedNode = this.canvasState.selectedNode;
  readonly selectedConnection = this.canvasState.selectedConnection;
  readonly architectureName = this.canvasState.architectureName;
  readonly architectureRegion = this.canvasState.architectureRegion;
  readonly architectureDescription = this.canvasState.architectureDescription;

  readonly nodesCount = computed(() => this.canvasState.nodes().length);
  readonly connectionsCount = computed(() => this.canvasState.connections().length);


  getCatalogInfo(type: string) {
    return OCI_CATALOG.find(i => i.type === type);
  }

  getNodeName(nodeId: string): string {
    const node = this.canvasState.nodes().find(n => n.id === nodeId);
    return node ? node.name : nodeId;
  }

  onNodeNameChange(node: any, newName: string) {
    this.canvasState.updateNodeProperties(node.id, newName, node.properties);
  }

  onPropChange(node: any) {
    this.canvasState.updateNodeProperties(node.id, node.name, node.properties);
  }

  onConnectionChange(conn: any) {
    this.canvasState.updateConnectionProperties(
      conn.id,
      conn.protocol,
      conn.port,
      conn.label,
      conn.notes
    );
  }

  deleteNode(id: string) {
    this.canvasState.removeNode(id);
  }

  deleteConnection(id: string) {
    this.canvasState.removeConnection(id);
  }

  onArchitectureNameChange(name: string) {
    this.canvasState.architectureName.set(name);
    this.canvasState.saveToLocalStorage();
  }

  onArchitectureRegionChange(region: string) {
    this.canvasState.architectureRegion.set(region);
    this.canvasState.saveToLocalStorage();
  }

  onArchitectureDescChange(desc: string) {
    this.canvasState.architectureDescription.set(desc);
    this.canvasState.saveToLocalStorage();
  }
}
