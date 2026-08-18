export type OciCategory =
  | 'Core'
  | 'Networking'
  | 'Compute'
  | 'Application'
  | 'Storage'
  | 'Database'
  | 'External';

export interface OciCatalogItem {
  type: string;
  name: string;
  category: OciCategory;
  icon: string;
  color: string;
  description: string;
  educationalWhy: string;
  defaultProperties: Record<string, any>;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const OCI_CATALOG: OciCatalogItem[] = [
  // Core
  {
    type: 'Region',
    name: 'OCI Region',
    category: 'Core',
    icon: 'public',
    color: '#0f172a',
    description: 'A localized geographic area that contains one or more data centers.',
    educationalWhy: 'The top-level boundary for cloud resources. Choosing the right region minimizes latency and satisfies data residency.',
    defaultProperties: { regionId: 'us-ashburn-1' },
    defaultWidth: 400,
    defaultHeight: 300
  },
  {
    type: 'AvailabilityDomain',
    name: 'Availability Domain',
    category: 'Core',
    icon: 'domain',
    color: '#334155',
    description: 'One or more isolated, fault-tolerant data centers within a region.',
    educationalWhy: 'Distributing resources across ADs ensures high availability if a single data center fails.',
    defaultProperties: { adNumber: 1 },
    defaultWidth: 350,
    defaultHeight: 250
  },
  {
    type: 'FaultDomain',
    name: 'Fault Domain',
    category: 'Core',
    icon: 'grid_view',
    color: '#475569',
    description: 'A grouping of hardware and infrastructure within an Availability Domain.',
    educationalWhy: 'Protects against unexpected hardware failures and planned hardware maintenance within a single AD.',
    defaultProperties: { fdNumber: 1 },
    defaultWidth: 300,
    defaultHeight: 200
  },

  // External
  {
    type: 'Internet',
    name: 'Internet / Public Users',
    category: 'External',
    icon: 'public',
    color: '#0284c7',
    description: 'External clients or users accessing services over the Internet.',
    educationalWhy: 'Represents external untrusted traffic origins reaching your cloud architecture.',
    defaultProperties: { ipRange: '0.0.0.0/0' }
  },
  {
    type: 'User',
    name: 'Corporate User / Admin',
    category: 'External',
    icon: 'person',
    color: '#0369a1',
    description: 'Authorized engineer or corporate user connecting via VPN/FastConnect.',
    educationalWhy: 'Distinguishes trusted corporate access from untrusted public Internet traffic.',
    defaultProperties: { role: 'Admin' }
  },

  // Networking
  {
    type: 'VCN',
    name: 'Virtual Cloud Network',
    category: 'Networking',
    icon: 'cloud_queue',
    color: '#059669',
    description: 'Customizable and private software-defined network in OCI.',
    educationalWhy: 'Provides complete network isolation. All subnets, gateways and compute reside in a VCN.',
    defaultProperties: { cidrBlock: '10.0.0.0/16', dnsLabel: 'mainvcn' },
    defaultWidth: 260,
    defaultHeight: 180
  },
  {
    type: 'PublicSubnet',
    name: 'Public Subnet',
    category: 'Networking',
    icon: 'lan',
    color: '#10b981',
    description: 'Subnet that assigns public IPs and can route traffic directly to the Internet Gateway.',
    educationalWhy: 'Used for resources requiring direct internet exposure, such as Public Load Balancers or Bastion hosts.',
    defaultProperties: { cidrBlock: '10.0.1.0/24', isPublic: true }
  },
  {
    type: 'PrivateSubnet',
    name: 'Private Subnet',
    category: 'Networking',
    icon: 'lock',
    color: '#047857',
    description: 'Subnet where resources have only private IPs, shielded from direct internet access.',
    educationalWhy: 'Essential security boundary for databases, backend APIs, and workloads that must never be directly accessed from the internet.',
    defaultProperties: { cidrBlock: '10.0.2.0/24', isPublic: false }
  },
  {
    type: 'InternetGateway',
    name: 'Internet Gateway (IGW)',
    category: 'Networking',
    icon: 'router',
    color: '#0d9488',
    description: 'Virtual router providing bidirectional connectivity between a VCN and the public internet.',
    educationalWhy: 'Allows public subnets to communicate with the internet. Subnets in private zones should NOT route through an IGW.',
    defaultProperties: { isEnabled: true }
  },
  {
    type: 'NatGateway',
    name: 'NAT Gateway',
    category: 'Networking',
    icon: 'swap_horiz',
    color: '#0891b2',
    description: 'Enables private resources to initiate outbound internet connections without exposing public IPs.',
    educationalWhy: 'Allows private instances/databases to download software updates or patches safely without receiving inbound connections.',
    defaultProperties: { isEnabled: true }
  },
  {
    type: 'ServiceGateway',
    name: 'Service Gateway (SGW)',
    category: 'Networking',
    icon: 'hub',
    color: '#0e7490',
    description: 'Private connection from a VCN to public OCI services (Object Storage, Autonomous DB) without internet traversal.',
    educationalWhy: 'Keeps all OCI service traffic entirely on the Oracle internal backbone network for maximum security and zero egress cost.',
    defaultProperties: { service: 'All OCI Services in Region' }
  },
  {
    type: 'Drg',
    name: 'Dynamic Routing Gateway (DRG)',
    category: 'Networking',
    icon: 'alt_route',
    color: '#115e59',
    description: 'Virtual router providing private interconnectivity between VCNs and on-premises networks (VPN/FastConnect).',
    educationalWhy: 'Central hub for hybrid cloud and multi-VCN hub-and-spoke transit routing.',
    defaultProperties: { type: 'Transit' }
  },
  {
    type: 'SecurityList',
    name: 'Security List',
    category: 'Networking',
    icon: 'list_alt',
    color: '#1e293b',
    description: 'Virtual firewall rules controlling ingress and egress traffic at the subnet level.',
    educationalWhy: 'Applies baseline security rules to all VNICs within a subnet.',
    defaultProperties: { defaultAction: 'DenyAll' }
  },
  {
    type: 'NetworkSecurityGroup',
    name: 'Network Security Group (NSG)',
    category: 'Networking',
    icon: 'security',
    color: '#0f172a',
    description: 'Virtual firewall rules controlling ingress and egress traffic at the VNIC level.',
    educationalWhy: 'Provides granular security control for individual instances or databases, regardless of their subnet.',
    defaultProperties: { defaultAction: 'DenyAll' }
  },
  {
    type: 'RouteTable',
    name: 'Route Table',
    category: 'Networking',
    icon: 'alt_route',
    color: '#115e59',
    description: 'Contains rules to route traffic from subnets to destinations outside the VCN.',
    educationalWhy: 'Determines how traffic flows out of a subnet to the internet, on-premises networks, or other VCNs.',
    defaultProperties: { routeRules: [] }
  },

  // Compute
  {
    type: 'ComputeInstance',
    name: 'Compute Instance (VM)',
    category: 'Compute',
    icon: 'memory',
    color: '#d97706',
    description: 'Virtual Machine running application code, microservices or background jobs.',
    educationalWhy: 'Executes your custom business logic. Should reside in private subnets behind a load balancer for high availability.',
    defaultProperties: { shape: 'VM.Standard.E5.Flex', ocpus: 2, memoryInGBs: 16, os: 'Oracle Linux 9' }
  },

  // Application
  {
    type: 'LoadBalancer',
    name: 'Load Balancer (Public/Private)',
    category: 'Application',
    icon: 'call_split',
    color: '#b45309',
    description: 'Distributes incoming network traffic across backend compute instances or microservices.',
    educationalWhy: 'Eliminates single points of failure, performs health checks, and handles TLS termination.',
    defaultProperties: { shape: 'flexible', minBandwidthMbps: 10, maxBandwidthMbps: 100, isPrivate: false }
  },

  // Storage
  {
    type: 'ObjectStorage',
    name: 'Object Storage Bucket',
    category: 'Storage',
    icon: 'inventory_2',
    color: '#7c3aed',
    description: 'Scalable, highly durable object storage for unstructured data, logs and backups.',
    educationalWhy: 'Ideal for static assets, backups, logs, and big data with high durability (11 9s).',
    defaultProperties: { tier: 'Standard', isPublic: false }
  },
  {
    type: 'BlockVolume',
    name: 'Block Volume',
    category: 'Storage',
    icon: 'album',
    color: '#6d28d9',
    description: 'Persistent, high-performance block storage attached to compute instances.',
    educationalWhy: 'Provides dedicated, low-latency disk storage for operating systems, databases, and stateful workloads.',
    defaultProperties: { sizeInGB: 50, vpusPerGB: 10 }
  },

  // Database
  {
    type: 'Database',
    name: 'Autonomous / OCI Database',
    category: 'Database',
    icon: 'dns',
    color: '#c5221f',
    description: 'Fully managed Oracle Database, MySQL HeatWave, or PostgreSQL service.',
    educationalWhy: 'Stores persistent application data. MUST ALWAYS be placed in private subnets with strict NSG rules.',
    defaultProperties: { workload: 'Transaction Processing (OLTP)', cpuCount: 2, storageInTB: 1 }
  },

  // Advanced / Application Integration
  {
    type: 'ApiGateway',
    name: 'API Gateway',
    category: 'Networking',
    icon: 'api',
    color: '#0d9488',
    description: 'A highly available, fully managed API gateway to expose HTTP APIs securely.',
    educationalWhy: 'Centralizes authentication, rate limiting, and routing for serverless functions and containerized microservices.',
    defaultProperties: { endpointType: 'PUBLIC', rateLimiting: true }
  },
  {
    type: 'OKECluster',
    name: 'OKE Cluster (Kubernetes)',
    category: 'Compute',
    icon: 'view_in_ar',
    color: '#4f46e5',
    description: 'Oracle Cloud Infrastructure Container Engine for Kubernetes.',
    educationalWhy: 'Orchestrates containerized applications. Best practice is to deploy worker nodes in private subnets.',
    defaultProperties: { kubernetesVersion: 'v1.31.1', nodeCount: 3, nodeShape: 'VM.Standard.E5.Flex' },
    defaultWidth: 200,
    defaultHeight: 120
  },
  {
    type: 'Functions',
    name: 'OCI Functions',
    category: 'Compute',
    icon: 'functions',
    color: '#d97706',
    description: 'Serverless compute platform based on Fn Project.',
    educationalWhy: 'Executes event-driven logic without managing servers. Charges only for execution time.',
    defaultProperties: { memoryInMBs: 1024, timeoutInSeconds: 120 }
  },
  {
    type: 'Queue',
    name: 'OCI Queue',
    category: 'Application',
    icon: 'queue',
    color: '#b45309',
    description: 'Highly available, fully managed serverless queuing service.',
    educationalWhy: 'Decouples microservices by buffering asynchronous messages.',
    defaultProperties: { visibilityTimeout: 30, retentionInDays: 1 }
  },
  {
    type: 'Streaming',
    name: 'OCI Streaming',
    category: 'Application',
    icon: 'waves',
    color: '#b45309',
    description: 'Apache Kafka-compatible real-time event streaming platform.',
    educationalWhy: 'Ideal for ingestion of high-volume logs, telemetry data, and real-time analytics.',
    defaultProperties: { partitions: 1, retentionInHours: 24 }
  },
  {
    type: 'Events',
    name: 'OCI Events Service',
    category: 'Application',
    icon: 'bolt',
    color: '#ca8a04',
    description: 'Reacts to state changes in OCI resources and triggers actions.',
    educationalWhy: 'Automates cloud operations. E.g., trigger a Function when an Object is uploaded to a bucket.',
    defaultProperties: { ruleCondition: 'Object Create' }
  },
  {
    type: 'Vault',
    name: 'OCI Vault',
    category: 'Core', // Can also be Security
    icon: 'lock',
    color: '#1e293b',
    description: 'Managed service for storing and managing encryption keys and secrets.',
    educationalWhy: 'Crucial for centralizing and securing API keys, passwords, and custom KMS encryption keys.',
    defaultProperties: { vaultType: 'VIRTUAL_PRIVATE' }
  },
  {
    type: 'Logging',
    name: 'OCI Logging',
    category: 'Core',
    icon: 'receipt_long',
    color: '#475569',
    description: 'Highly scalable, fully managed single pane of glass for all logs in a tenancy.',
    educationalWhy: 'Consolidates audit, service, and custom application logs for security analysis and troubleshooting.',
    defaultProperties: { logType: 'SERVICE' }
  },
  {
    type: 'Monitoring',
    name: 'OCI Monitoring',
    category: 'Core',
    icon: 'insights',
    color: '#334155',
    description: 'Provides metrics and alarms for OCI resources.',
    educationalWhy: 'Triggers scaling actions or notifications when infrastructure thresholds (like CPU) are exceeded.',
    defaultProperties: { alarmSeverity: 'CRITICAL', interval: '1m' }
  }
];
