import { Incident, Problem, ChangeRequest, Service, CI, Epic, CatalogItem, ServiceRequest, Risk, CMDBNode, CMDBLink, AIService, AITechnology, BusinessCapability, BusinessProcess, StrategicTheme, StrategicGoal, Idea } from './types';

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC001023',
    title: 'Email Service Interruption',
    description: 'Users are unable to send emails to external domains. Internal mail flow is working.',
    priority: 'Critical',
    status: 'In Progress',
    assignee: 'Sarah Jenkins',
    created: '2023-10-24T08:30:00Z',
    serviceId: 'SVC001',
    relatedCiIds: ['CI-SRV-001'],
    problemId: '',
    changeId: ''
  },
  {
    id: 'INC001024',
    title: 'VPN Connectivity Flapping',
    description: 'Remote users reporting intermittent disconnections from the VPN gateway in the East region.',
    priority: 'High',
    status: 'New',
    assignee: 'Network Ops',
    created: '2023-10-24T09:15:00Z',
    serviceId: 'SVC003',
    relatedCiIds: ['CI-NET-001'],
    problemId: '',
    changeId: ''
  },
  {
    id: 'INC001025',
    title: 'Printer Jam on 3rd Floor',
    description: 'The main corridor printer is jamming repeatedly.',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Helpdesk',
    created: '2023-10-23T14:00:00Z',
    serviceId: 'SVC005',
    relatedCiIds: [],
    problemId: '',
    changeId: ''
  },
  {
    id: 'INC001026',
    title: 'CRM Application Slow',
    description: 'Sales team reporting high latency when loading customer records.',
    priority: 'Medium',
    status: 'In Progress',
    assignee: 'App Support',
    created: '2023-10-24T10:00:00Z',
    serviceId: 'SVC002',
    relatedCiIds: ['CI-APP-001', 'CI-DB-001'],
    problemId: 'PRB00047',
    changeId: ''
  }
];

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: 'PRB00045',
    title: 'Recurring Storage Latency',
    description: 'Multiple incidents regarding slow file access on the SAN.',
    rootCause: 'Pending investigation. Suspect firmware bug in storage controller.',
    status: 'In Progress',
    priority: 'High',
    impact: 'High',
    category: 'Hardware',
    serviceId: 'SVC002',
    relatedRiskIds: ['RSK-001'],
    relatedIncidents: ['INC001026', 'INC000998']
  },
  {
    id: 'PRB00046',
    title: 'Authentication Service Memory Leak',
    description: 'Auth service requires weekly restart due to memory consumption.',
    rootCause: 'Identified memory leak in the token validation module.',
    status: 'Resolved',
    priority: 'Medium',
    impact: 'Medium',
    category: 'Software',
    serviceId: 'SVC003',
    relatedRiskIds: [],
    relatedIncidents: ['INC000800']
  },
  {
    id: 'PRB00047',
    title: 'CRM performance and stability issues',
    description: 'CRM system is unstable and has poor user experience.',
    rootCause: 'Outdated technology stack.',
    status: 'In Progress',
    priority: 'High',
    impact: 'High',
    category: 'Software',
    serviceId: 'SVC002',
    relatedRiskIds: ['RSK-005'],
    relatedIncidents: ['INC0001026']
  }
];

export const MOCK_CHANGES: ChangeRequest[] = [
  {
    id: 'CHG00201',
    title: 'Upgrade Oracle Database to 19c',
    description: 'Major version upgrade for the core ERP database.',
    type: 'Normal',
    risk: 'High',
    status: 'Approved',
    implementationDate: '2026-11-03'
  },
  {
    id: 'CHG00202',
    title: 'Patch Web Server Security Vulnerability',
    description: 'Applying critical security patch to public facing web servers.',
    type: 'Emergency',
    risk: 'Medium',
    status: 'Implemented',
    implementationDate: '2026-06-03'
  }
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 'SVC001',
    name: 'Enterprise Email',
    description: 'Exchange Online based email service.',
    owner: 'Infrastructure Team',
    sla: 'Gold',
    status: 'Active',
    health: 'Healthy',
    relatedCapabilityIds: [],
    relatedProcessIds: []
  },
  {
    id: 'SVC002',
    name: 'CRM System',
    description: 'Customer Relationship Management platform.',
    owner: 'Sales Ops',
    sla: 'Gold',
    status: 'Active',
    health: 'Degraded',
    relatedCapabilityIds: ['CAP-002'],
    relatedProcessIds: ['PROC-001']
  },
  {
    id: 'SVC003',
    name: 'VPN Access',
    description: 'Secure remote access solution.',
    owner: 'Network Security',
    sla: 'Silver',
    status: 'Active',
    health: 'Degraded',
    relatedCapabilityIds: [],
    relatedProcessIds: []
  },
  {
    id: 'SVC004',
    name: 'HR Portal',
    description: 'Employee self-service portal.',
    owner: 'HR Systems',
    sla: 'Bronze',
    status: 'Active',
    health: 'Healthy',
    relatedCapabilityIds: ['CAP-004', 'CAP-005'],
    relatedProcessIds: ['PROC-002']
  }
];

export const MOCK_CIS: CI[] = [
  {
    id: 'CI-SRV-001',
    name: 'PROD-DB-01',
    type: 'Server',
    version: 'Windows Server 2019',
    location: 'Data Center A',
    status: 'Active',
    owner: 'Database Team'
  },
  {
    id: 'CI-APP-001',
    name: 'Salesforce Connector',
    type: 'Application',
    version: 'v2.4.1',
    location: 'Cloud',
    status: 'Active',
    owner: 'App Support'
  },
  {
    id: 'CI-NET-001',
    name: 'Core-Switch-01',
    type: 'Network',
    version: 'Cisco IOS XE',
    location: 'Data Center A',
    status: 'Active',
    owner: 'Network Ops'
  },
  {
    id: 'CI-DB-001',
    name: 'ERP_MAIN_DB',
    type: 'Database',
    version: 'Oracle 19c',
    location: 'PROD-DB-01',
    status: 'Active',
    owner: 'Database Team'
  }
];

export const MOCK_EPICS: Epic[] = [
  {
    id: 'EPC-2024-001',
    title: 'Cloud Migration Program',
    description: 'Migrate core legacy ERP and CRM applications to AWS to reduce data center footprint and improve scalability.',
    status: 'Implementing',
    owner: 'CTO Office',
    strategicTheme: 'Modernization',
    budget: 1200000,
    wsjf: {
      userBusinessValue: 13,
      timeCriticality: 8,
      rrOe: 5,
      jobSize: 8,
      score: 3.25
    },
    relatedServiceIds: ['SVC002'],
    relatedChangeIds: ['CHG00201'],
    relatedProblemIds: [],
    relatedRiskIds: ['RSK-001', 'RSK-002'],
    relatedCapabilityIds: ['CAP-002', 'CAP-007'],
    relatedGoalIds: ['SG-004']
  },
  {
    id: 'EPC-2024-002',
    title: 'AI-Driven Customer Support',
    description: 'Implement Generative AI bots for L1 support to reduce ticket volume by 40%.',
    status: 'Analyzing',
    owner: 'Customer Success',
    strategicTheme: 'Operational Excellence',
    budget: 450000,
    wsjf: {
      userBusinessValue: 20,
      timeCriticality: 13,
      rrOe: 8,
      jobSize: 5,
      score: 8.2
    },
    relatedServiceIds: ['SVC002'],
    relatedChangeIds: [],
    relatedProblemIds: [],
    relatedRiskIds: [],
    relatedCapabilityIds: ['CAP-003'],
    relatedGoalIds: ['SG-003', 'SG-006']
  },
  {
    id: 'EPC-2024-003',
    title: 'Zero Trust Security Framework',
    description: 'Implement Zero Trust architecture across all global offices.',
    status: 'Portfolio Backlog',
    owner: 'CISO',
    strategicTheme: 'Security & Compliance',
    budget: 800000,
    wsjf: {
      userBusinessValue: 8,
      timeCriticality: 20,
      rrOe: 13,
      jobSize: 13,
      score: 3.15
    },
    relatedServiceIds: ['SVC003'],
    relatedChangeIds: [],
    relatedProblemIds: [],
    relatedRiskIds: ['RSK-004'],
    relatedCapabilityIds: [],
    relatedGoalIds: ['SG-002']
  },
  {
    id: 'EPC-2024-004',
    title: 'Self-Service HR Portal',
    description: 'Revamp the HR portal to allow employees to manage benefits and time-off autonomously.',
    status: 'Funnel',
    owner: 'HR Director',
    strategicTheme: 'Employee Experience',
    budget: 150000,
    wsjf: {
      userBusinessValue: 5,
      timeCriticality: 3,
      rrOe: 2,
      jobSize: 3,
      score: 3.33
    },
    relatedServiceIds: ['SVC004'],
    relatedChangeIds: [],
    relatedProblemIds: [],
    relatedRiskIds: [],
    relatedCapabilityIds: ['CAP-004', 'CAP-005'],
    relatedGoalIds: ['SG-006']
  },
   {
    id: 'EPC-2024-005',
    title: 'Migrate CRM system to SAAS',
    description: 'Select and implement new CRM SAAS solution.',
    status: 'Analyzing',
    owner: 'Customer Relationship Manager',
    strategicTheme: 'Eliminate Technology Debt',
    budget: 1620000,
    wsjf: {
      userBusinessValue: 17,
      timeCriticality: 16,
      rrOe: 20,
      jobSize: 10,
      score: 3.33
    },
    relatedServiceIds: ['SVC002'],
    relatedChangeIds: [],
    relatedProblemIds: ['PRB00047'],
    relatedRiskIds: ['RSK-005'],
    relatedCapabilityIds: ['CAP-002'],
    relatedGoalIds: ['SG-007']
  }
];

export const MOCK_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'CAT-001',
    name: 'MacBook Pro 16"',
    description: 'Apple M3 Pro chip, 32GB RAM, 1TB SSD. Suitable for developers and designers.',
    category: 'Hardware',
    price: 2499,
    image: 'https://picsum.photos/id/2/400/300',
    rating: 4.8,
    deliveryTime: '2-3 Business Days'
  },
  {
    id: 'CAT-002',
    name: 'Dell Latitude 7440',
    description: 'Intel Core i7, 16GB RAM, 512GB SSD. Standard corporate laptop.',
    category: 'Hardware',
    price: 1299,
    image: 'https://picsum.photos/id/180/400/300',
    rating: 4.5,
    deliveryTime: 'Next Day Delivery'
  },
  {
    id: 'CAT-003',
    name: 'iPhone 15 Pro',
    description: '128GB, Titanium. For mobile workforce.',
    category: 'Hardware',
    price: 999,
    image: 'https://picsum.photos/id/816/400/300',
    rating: 4.9,
    deliveryTime: '3-5 Business Days'
  },
  {
    id: 'CAT-004',
    name: 'VPN Access Request',
    description: 'Request remote access to the corporate network via VPN.',
    category: 'Access',
    price: 0,
    image: 'https://picsum.photos/400/300?random=4',
    rating: 4.2,
    deliveryTime: 'Instant'
  },
  {
    id: 'CAT-005',
    name: 'Adobe Creative Cloud',
    description: 'Full suite license for designers and marketing.',
    category: 'Software',
    price: 600,
    image: 'https://picsum.photos/400/300?random=5',
    rating: 4.7,
    deliveryTime: '1 Business Day'
  },
  {
    id: 'CAT-006',
    name: 'Visual Studio Enterprise',
    description: 'IDE for enterprise developers.',
    category: 'Software',
    price: 2500,
    image: 'https://picsum.photos/400/300?random=6',
    rating: 4.6,
    deliveryTime: 'Instant'
  },
  {
    id: 'CAT-007',
    name: 'New Employee Onboarding',
    description: 'Bundle request for new hires: Laptop, Email, Badge, and Desk setup.',
    category: 'Service',
    price: 0,
    image: 'https://picsum.photos/400/300?random=7',
    rating: 4.9,
    deliveryTime: '5 Business Days'
  },
  {
    id: 'CAT-008',
    name: 'Guest Wi-Fi Access',
    description: 'Temporary Wi-Fi credentials for visitors.',
    category: 'Access',
    price: 0,
    image: 'https://picsum.photos/400/300?random=8',
    rating: 4.0,
    deliveryTime: 'Instant'
  }
];

export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: 'REQ-2024-889',
    items: [MOCK_CATALOG_ITEMS[0]],
    status: 'Fulfillment',
    created: '2026-02-02T14:30:00Z',
    totalCost: 2499,
    justification: 'Replacement for broken laptop'
  },
  {
    id: 'REQ-2024-902',
    items: [MOCK_CATALOG_ITEMS[3]],
    status: 'Completed',
    created: '2026-10-02T14:30:00Z',
    totalCost: 0,
    justification: 'Remote work requirement'
  }
];

export const MOCK_RISKS: Risk[] = [
  {
    id: 'RSK-005',
    title: 'End-of-life CRM system',
    description: 'The current CRM system is out of support / end-of-life.',
    category: 'Technology Debt',
    owner: 'CRM product team',
    likelihood: 4,
    impact: 4,
    score: 16,
    strategy: 'Reduce',
    status: 'Treated',
    mitigationPlan: 'Migrate CRM system to SAAS solution.',
    relatedServiceIds: ['SVC002'],
    relatedEpicIds: ['EPC-2024-005'],
    relatedGoalIds: ['SG-007']
  },
  {
    id: 'RSK-002',
    title: 'GDPR Compliance Violation',
    description: 'Potential for customer data leakage due to unpatched legacy CRM system.',
    category: 'Compliance',
    owner: 'Data Privacy Officer',
    likelihood: 3,
    impact: 5,
    score: 15,
    strategy: 'Avoid',
    status: 'Assessed',
    mitigationPlan: 'Migrate to new CRM system (Project Phoenix) by Q4.',
    relatedServiceIds: ['SVC002'],
    relatedEpicIds: ['EPC-2024-001'],
    relatedAIServiceIds: ['AI-002'],
    relatedGoalIds: ['SG-005']
  },
  {
    id: 'RSK-003',
    title: 'Key Vendor Bankruptcy',
    description: 'Primary software development vendor showing signs of financial instability.',
    category: 'Strategic',
    owner: 'Vendor Management',
    likelihood: 4,
    impact: 4,
    score: 16,
    strategy: 'Share',
    status: 'Monitored',
    mitigationPlan: 'Identifying backup vendors and reviewing contract termination clauses.',
    relatedServiceIds: ['SVC002', 'SVC004'],
    relatedEpicIds: [],
    relatedGoalIds: ['SG-002']
  },
  {
    id: 'RSK-004',
    title: 'Phishing Attack Success',
    description: 'Employees falling for sophisticated phishing attacks leading to credential theft.',
    category: 'Security',
    owner: 'CISO',
    likelihood: 4,
    impact: 3,
    score: 12,
    strategy: 'Reduce',
    status: 'Treated',
    mitigationPlan: 'Quarterly security awareness training and phishing simulation campaigns.',
    relatedServiceIds: ['SVC001', 'SVC003'],
    relatedEpicIds: ['EPC-2024-003'],
    relatedGoalIds: ['SG-002']
  },
  {
    id: 'RSK-001',
    title: 'Data Center Power Failure',
    description: 'Risk of prolonged outage due to failure of backup generators during a power cut.',
    category: 'Operational',
    owner: 'Infrastructure Manager',
    likelihood: 2,
    impact: 5,
    score: 10,
    strategy: 'Reduce',
    status: 'Treated',
    mitigationPlan: 'Installed redundant UPS systems and signed SLA with fuel delivery service.',
    relatedServiceIds: ['SVC001', 'SVC002'],
    relatedEpicIds: ['EPC-2024-001'],
    relatedGoalIds: ['SG-002']
  },
  {
    id: 'RSK-006',
    title: 'Absence of Human Oversight Mechanisms',
    description: 'The "ML model to filter job applicants," providing insufficient human review or intervention points before final decisions, which is critical for High-Risk AI.',
    category: 'Operational',
    owner: 'HR Manager',
    likelihood: 2,
    impact: 5,
    score: 10,
    strategy: 'Reduce',
    status: 'Monitored',
    mitigationPlan: 'Setup manual intervention points.',
    relatedServiceIds: ['SVC004'],
    relatedAIServiceIds: ['AI-002'],
    relatedEpicIds: [],
    relatedGoalIds: ['SG-005']
  }
];

export const MOCK_CMDB_GRAPH: { nodes: CMDBNode[], links: CMDBLink[] } = {
  nodes: [
    { id: 'BP-001', group: 'Process', label: 'Order to Cash' },
    { id: 'SVC002', group: 'Application', label: 'CRM System' },
    { id: 'CI-APP-001', group: 'Application', label: 'Salesforce Connector' },
    { id: 'CI-SRV-001', group: 'Server', label: 'PROD-DB-01' },
    { id: 'CI-DB-001', group: 'Database', label: 'ERP_MAIN_DB' },
    { id: 'CI-NET-001', group: 'Network', label: 'Core-Switch-01' }
  ],
  links: [
    { source: 'BP-001', target: 'SVC002' },
    { source: 'SVC002', target: 'CI-APP-001' },
    { source: 'SVC002', target: 'CI-DB-001' },
    { source: 'CI-DB-001', target: 'CI-SRV-001' },
    { source: 'CI-SRV-001', target: 'CI-NET-001' }
  ]
};

export const MOCK_AI_TECHNOLOGIES: AITechnology[] = [
  { id: 'TECH-001', name: 'Gemini 1.5 Pro', vendor: 'Google', type: 'LLM', version: '1.5' },
  { id: 'TECH-002', name: 'GPT-4', vendor: 'OpenAI', type: 'LLM', version: '4.0' },
  { id: 'TECH-003', name: 'Claude 3 Opus', vendor: 'Anthropic', type: 'LLM', version: '3.0' },
  { id: 'TECH-004', name: 'TensorFlow Custom Model', vendor: 'Internal', type: 'Predictive', version: '1.2' },
  { id: 'TECH-005', name: 'Llama 3', vendor: 'Meta', type: 'LLM', version: '3.0' }
];

export const MOCK_AI_SERVICES: AIService[] = [
  {
    id: 'AI-001',
    name: 'Customer Support Chatbot',
    description: 'GenAI based chatbot for L1 support.',
    serviceId: 'SVC002', // CRM System
    technologyId: 'TECH-001',
    riskLevel: 'Limited',
    frameworks: ['EU AI Act', 'NIST AI RMF'],
    dataCategories: ['Customer Data'],
    status: 'Compliant',
    owner: 'Customer Success',
    lastAssessmentDate: '2025-10-15'
  },
  {
    id: 'AI-002',
    name: 'Resume Screening Algorithm',
    description: 'ML model to filter job applicants.',
    serviceId: 'SVC004', // HR Portal
    technologyId: 'TECH-004',
    riskLevel: 'High',
    frameworks: ['EU AI Act', 'ISO 42001'],
    dataCategories: ['Applicants Data', 'Employee Data'],
    status: 'Pending',
    owner: 'HR Director',
    lastAssessmentDate: '2025-11-01',
    relatedRiskIds: ['RSK-006']
  }
];

export const MOCK_CAPABILITIES: BusinessCapability[] = [
  { id: 'CAP-001', name: 'Market Analysis', description: 'Analyze market trends and competitors.', area: 'Strategy', maturity: 'High', strategicImportance: 'Critical', relatedServiceIds: [] },
  { id: 'CAP-002', name: 'Sales Management', description: 'Manage sales pipeline and customer relationships.', area: 'Sales & Marketing', maturity: 'Medium', strategicImportance: 'High', relatedProcessIds: ['PROC-001'], relatedServiceIds: ['SVC002'] },
  { id: 'CAP-003', name: 'Customer Support', description: 'Provide support to existing customers.', area: 'Service', maturity: 'Low', strategicImportance: 'Medium', relatedServiceIds: ['SVC002'] },
  { id: 'CAP-004', name: 'Talent Acquisition', description: 'Recruit and hire new employees.', area: 'Human Resources', maturity: 'High', strategicImportance: 'High', relatedProcessIds: ['PROC-002'], relatedServiceIds: ['SVC004'] },
  { id: 'CAP-005', name: 'Payroll Management', description: 'Manage employee compensation.', area: 'Human Resources', maturity: 'High', strategicImportance: 'Critical', relatedProcessIds: ['PROC-002'], relatedServiceIds: ['SVC004'] },
  { id: 'CAP-006', name: 'Product Development', description: 'Design and develop new products.', area: 'R&D', maturity: 'Medium', strategicImportance: 'Critical', relatedServiceIds: [] },
  { id: 'CAP-007', name: 'Supply Chain Planning', description: 'Plan and optimize supply chain operations.', area: 'Supply Chain', maturity: 'Medium', strategicImportance: 'High', relatedServiceIds: [] }
];

export const MOCK_PROCESSES: BusinessProcess[] = [
  { id: 'PROC-001', name: 'Order to Cash', description: 'End-to-end process from receiving an order to receiving payment.', owner: 'Sales Director', criticality: 'Critical', relatedCapabilityIds: ['CAP-002'], relatedServiceIds: ['SVC002'] },
  { id: 'PROC-001-1', name: 'Order Capture', description: 'Recording the customer order.', parentId: 'PROC-001', owner: 'Sales Ops', criticality: 'High' },
  { id: 'PROC-001-2', name: 'Order Fulfillment', description: 'Delivering the product or service.', parentId: 'PROC-001', owner: 'Logistics Manager', criticality: 'Critical' },
  { id: 'PROC-001-3', name: 'Invoicing & Billing', description: 'Sending invoice and collecting payment.', parentId: 'PROC-001', owner: 'Finance Manager', criticality: 'High' },
  { id: 'PROC-002', name: 'Hire to Retire', description: 'Employee lifecycle management.', owner: 'CHRO', criticality: 'High', relatedCapabilityIds: ['CAP-004', 'CAP-005'], relatedServiceIds: ['SVC004'] },
  { id: 'PROC-002-1', name: 'Recruitment', description: 'Sourcing and selecting candidates.', parentId: 'PROC-002', owner: 'Recruitment Lead', criticality: 'Medium' },
  { id: 'PROC-002-2', name: 'Onboarding', description: 'Integrating new hires into the company.', parentId: 'PROC-002', owner: 'HR Ops', criticality: 'Medium' }
];

export const MOCK_STRATEGIC_THEMES: StrategicTheme[] = [
  { id: 'ST-001', name: 'Operational Excellence', description: 'Deliver faster and ensure continuous operations.', owner: 'COO', horizon: '1 Year' },
  { id: 'ST-002', name: 'Innovation & Growth', description: 'Increase value delivery through new features and innovation.', owner: 'CPO', horizon: '3 Years' },
  { id: 'ST-003', name: 'Financial Stewardship', description: 'Reduce costs and improve efficiency.', owner: 'CFO', horizon: '1 Year' },
  { id: 'ST-004', name: 'Risk & Compliance', description: 'Reduce risk and ensure regulatory compliance.', owner: 'CRO', horizon: '3 Years' },
  { id: 'ST-005', name: 'People & Culture', description: 'Improve employee experience and retention.', owner: 'CHRO', horizon: '5 Years' }
];

export const MOCK_STRATEGIC_GOALS: StrategicGoal[] = [
  { id: 'SG-001', themeId: 'ST-001', name: 'Reduce Time to Market', description: 'Decrease the average time from idea to production.', metric: 'Cycle Time', targetValue: 20, currentValue: 45, unit: 'Days', status: 'At Risk', deadline: '2024-12-31' },
  { id: 'SG-002', themeId: 'ST-001', name: 'Ensure High Availability', description: 'Maintain 99.99% uptime for critical services.', metric: 'Uptime', targetValue: 99.99, currentValue: 99.95, unit: '%', status: 'On Track', deadline: '2024-12-31' },
  { id: 'SG-003', themeId: 'ST-002', name: 'Launch AI Features', description: 'Deliver 5 new AI-powered features to customers.', metric: 'Features Launched', targetValue: 5, currentValue: 2, unit: 'Count', status: 'On Track', deadline: '2025-06-30' },
  { id: 'SG-004', themeId: 'ST-003', name: 'Reduce Cloud Spend', description: 'Optimize cloud infrastructure to reduce monthly costs.', metric: 'Monthly Cost', targetValue: 15, currentValue: 5, unit: '% Reduction', status: 'Off Track', deadline: '2024-09-30' },
  { id: 'SG-005', themeId: 'ST-004', name: 'AI Act Compliance', description: 'Ensure all AI systems meet EU AI Act requirements.', metric: 'Compliance Rate', targetValue: 100, currentValue: 60, unit: '%', status: 'At Risk', deadline: '2025-01-01' },
  { id: 'SG-007', themeId: 'ST-004', name: 'Reduce Technical Debt', description: 'Ensure all systems are supported and up-to-date.', metric: 'Compliance Rate', targetValue: 100, currentValue: 10, unit: '%', status: 'Off Track', deadline: '2027-01-01' },
  { id: 'SG-006', themeId: 'ST-005', name: 'Improve End-User Support', description: 'Increase internal customer satisfaction with IT support.', metric: 'CSAT Score', targetValue: 4.5, currentValue: 3.8, unit: 'Score (1-5)', status: 'On Track', deadline: '2024-12-31' }
];

export const MOCK_IDEAS: Idea[] = [
  {
    id: 'IDEA-001',
    title: 'Automated Invoice Processing',
    description: 'Use AI to automatically extract data from invoices and enter it into the finance system.',
    submitter: 'John Doe',
    created: '2024-01-15',
    status: 'Submitted',
    votes: 12,
    relatedCapabilityIds: ['CAP-005'],
    relatedServiceIds: ['SVC002'],
    relatedGoalIds: ['SG-001', 'SG-004']
  },
  {
    id: 'IDEA-002',
    title: 'Employee Self-Service Chatbot',
    description: 'Implement a chatbot to answer common HR and IT questions.',
    submitter: 'Jane Smith',
    created: '2024-02-10',
    status: 'Under Review',
    votes: 25,
    relatedCapabilityIds: ['CAP-003'],
    relatedServiceIds: ['SVC004'],
    relatedGoalIds: ['SG-006']
  }
];
