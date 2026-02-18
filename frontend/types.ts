export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'New' | 'In Progress' | 'Resolved' | 'Closed' | 'Pending';
export type ChangeType = 'Standard' | 'Normal' | 'Emergency';
export type RiskLevel = 'High' | 'Medium' | 'Low';
export type PortfolioStatus = 'Funnel' | 'Review' | 'Analyzing' | 'Portfolio Backlog' | 'Implementing' | 'Done';

export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: string;
  created: string;
  serviceId?: string;
  relatedCiIds?: string[];
  problemId?: string;
  changeId?: string;
  aiAnalysis?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  rootCause: string;
  status: Status;
  priority: Priority;
  impact: 'High' | 'Medium' | 'Low';
  category: 'Hardware' | 'Software' | 'Network' | 'Database' | 'Process';
  serviceId?: string;
  relatedRiskIds?: string[];
  relatedIncidents: string[];
  aiRCA?: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  type: ChangeType;
  risk: RiskLevel;
  status: 'Draft' | 'Requested' | 'Approved' | 'Implemented' | 'Review';
  implementationDate: string;
  aiRiskAssessment?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  owner: string;
  sla: 'Gold' | 'Silver' | 'Bronze';
  status: 'Active' | 'Retired' | 'Pipeline';
  health: 'Healthy' | 'Degraded' | 'Down';
  relatedCapabilityIds?: string[];
  relatedProcessIds?: string[];
}

export interface CI {
  id: string;
  name: string;
  type: 'Server' | 'Application' | 'Database' | 'Network' | 'Device';
  version: string;
  location: string;
  status: 'Active' | 'Maintenance' | 'Retired';
  owner: string;
}

export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  type: 'phase' | 'task';
  progress: number;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  status: PortfolioStatus;
  owner: string;
  strategicTheme: string;
  budget: number;
  wsjf: {
    userBusinessValue: number;
    timeCriticality: number;
    rrOe: number; // Risk Reduction | Opportunity Enablement
    jobSize: number;
    score: number;
  };
  relatedServiceIds?: string[];
  relatedChangeIds?: string[];
  relatedProblemIds?: string[];
  relatedRiskIds?: string[];
  relatedCapabilityIds?: string[];
  relatedGoalIds?: string[];
  aiAnalysis?: string;
  aiWBS?: string;
  aiGantt?: GanttTask[];
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: 'Hardware' | 'Software' | 'Access' | 'Service';
  price: number;
  image: string;
  rating: number;
  deliveryTime: string;
}

export interface ServiceRequest {
  id: string;
  items: CatalogItem[];
  status: 'Submitted' | 'Approval' | 'Fulfillment' | 'Completed';
  created: string;
  totalCost: number;
  justification: string;
}

export type RiskLikelihood = 1 | 2 | 3 | 4 | 5; // 1: Rare, 5: Almost Certain
export type RiskImpact = 1 | 2 | 3 | 4 | 5; // 1: Insignificant, 5: Catastrophic
export type RiskStrategy = 'Avoid' | 'Reduce' | 'Share' | 'Accept';
export type RiskStatus = 'Identified' | 'Assessed' | 'Treated' | 'Monitored' | 'Closed';

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'Strategic' | 'Operational' | 'Financial' | 'Compliance' | 'Security';
  owner: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  score: number; // likelihood * impact
  strategy: RiskStrategy;
  status: RiskStatus;
  mitigationPlan: string;
  relatedServiceIds?: string[];
  relatedEpicIds?: string[];
  relatedAIServiceIds?: string[];
  relatedGoalIds?: string[];
  aiAnalysis?: string;
}

export interface CMDBNode {
  id: string;
  group: 'Process' | 'Application' | 'Server' | 'Database' | 'Network';
  label: string;
}

export interface CMDBLink {
  source: string;
  target: string;
}

export type AIComplianceFramework = 'EU AI Act' | 'ISO 42001' | 'NIST AI RMF';
export type AIRiskLevel = 'Unacceptable' | 'High' | 'Limited' | 'Minimal';
export type AIComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Not Applicable';
export type AIDataCategory = 'Customer Data' | 'Employee Data' | 'Financial Data' | 'Intellectual Property' | 'Public Data' | 'Applicants Data';

export interface AITechnology {
  id: string;
  name: string;
  vendor: string;
  type: 'LLM' | 'SLM' | 'Computer Vision' | 'Predictive' | 'Other';
  version: string;
}

export interface AIService {
  id: string;
  name: string;
  description: string;
  serviceId: string; // Link to Service Portfolio
  technologyId?: string; // Link to AI Technology
  riskLevel: AIRiskLevel;
  frameworks: AIComplianceFramework[];
  dataCategories: AIDataCategory[];
  status: AIComplianceStatus;
  owner: string;
  lastAssessmentDate: string;
  relatedRiskIds?: string[];
  aiAnalysis?: string;
}

export interface BusinessCapability {
  id: string;
  name: string;
  description: string;
  area: string; // Grouping e.g., "Sales & Marketing", "Supply Chain"
  maturity: 'Low' | 'Medium' | 'High';
  strategicImportance: 'Critical' | 'High' | 'Medium' | 'Low';
  relatedProcessIds?: string[];
  relatedServiceIds?: string[];
}

export interface BusinessProcess {
  id: string;
  name: string;
  description: string;
  parentId?: string; // For hierarchy
  owner: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  relatedCapabilityIds?: string[];
  relatedServiceIds?: string[];
}

export interface StrategicTheme {
  id: string;
  name: string;
  description: string;
  owner: string;
  horizon: '1 Year' | '3 Years' | '5 Years';
}

export interface StrategicGoal {
  id: string;
  themeId: string;
  name: string;
  description: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'On Track' | 'At Risk' | 'Off Track';
  deadline: string;
}

export type IdeaStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';

export interface Idea {
  id: string;
  title: string;
  description: string;
  submitter: string;
  created: string;
  status: IdeaStatus;
  votes: number;
  relatedCapabilityIds?: string[];
  relatedServiceIds?: string[];
  relatedGoalIds?: string[];
}
