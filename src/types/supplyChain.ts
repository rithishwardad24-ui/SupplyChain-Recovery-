/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DataClassification = 'KNOWN' | 'ASSUMED';

export type NodeHealthStatus = 'healthy' | 'warning' | 'disrupted' | 'recovery' | 'inactive';

export type EntityType = 
  | 'supplier'
  | 'material'
  | 'factory'
  | 'distribution_center'
  | 'store'
  | 'customer_order';

export interface ClassifiedValue<T> {
  value: T;
  classification: DataClassification;
  note?: string;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  materialsSupplied: string[]; // Material IDs
  reliabilityScore: number; // 0 - 100
  baseLeadTimeDays: number;
  dailyCapacityUnits: number;
  costMultiplier: number;
  carbonIntensityKgPerUnit: number;
  status: NodeHealthStatus;
  contactEmail: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  category: string;
  unitCost: number;
  currentStockUnits: number;
  safetyStockUnits: number;
  reorderPointUnits: number;
  dailyConsumptionRate: number;
  substituteMaterialId?: string;
  substituteCompatibilityPercent?: number; // e.g. 98% compatible
  status: NodeHealthStatus;
}

export interface BOMItem {
  finishedGoodId: string;
  finishedGoodName: string;
  materialId: string;
  quantityPerUnit: number; // units of raw material per finished good
}

export interface Factory {
  id: string;
  name: string;
  location: string;
  maxDailyCapacityUnits: number;
  currentDailyOutputUnits: number;
  efficiencyPercent: number;
  operatingCostPerHour: number;
  productsProduced: string[];
  status: NodeHealthStatus;
  backupFactoryId?: string;
}

export interface ProductionSchedule {
  id: string;
  factoryId: string;
  finishedGoodId: string;
  finishedGoodName: string;
  plannedQuantity: number;
  startDate: string;
  targetCompletionDate: string;
  status: 'scheduled' | 'in_progress' | 'delayed' | 'completed';
  requiredMaterials: { materialId: string; requiredQty: number; availableQty: number }[];
}

export interface DistributionCenter {
  id: string;
  name: string;
  location: string;
  totalStorageCapacityUnits: number;
  currentInventoryUnits: number;
  availableTrucks: number;
  dailyDispatchRate: number;
  status: NodeHealthStatus;
  servesStoreIds: string[];
}

export interface RetailStore {
  id: string;
  name: string;
  city: string;
  currentStockUnits: number;
  safetyStockUnits: number;
  dailySalesRate: number;
  daysOfInventoryLeft: number;
  servedByDcId: string;
  status: NodeHealthStatus;
}

export type CustomerTier = 'Tier 1 Enterprise' | 'Tier 2 Priority' | 'Tier 3 Standard';

export interface CustomerOrder {
  id: string;
  customerName: string;
  tier: CustomerTier;
  targetStoreId: string;
  productName: string;
  orderQuantity: number;
  orderValueUsd: number;
  promisedDeliveryDate: string;
  slaDeadlineDate: string;
  slaPenaltyPerDayUsd: number;
  currentEstimatedDeliveryDate: string;
  isDelayed: boolean;
  daysDelayed: number;
  slaViolated: boolean;
  status: NodeHealthStatus;
}

export interface TransportRoute {
  id: string;
  sourceId: string;
  destinationId: string;
  mode: 'Road Freight' | 'Green EV Logistics' | 'Express Rail' | 'Air Expedited';
  costPerTonKmUsd: number;
  transitDays: number;
  co2KgPerTonKm: number;
  distanceKm: number;
  reliabilityPercent: number;
  status: 'active' | 'congested' | 'blocked';
}

export interface DisruptionEvent {
  id: string;
  title: string;
  scenarioType: 
    | 'supplier_failure'
    | 'material_shortage'
    | 'factory_shutdown'
    | 'capacity_reduction'
    | 'transport_breakdown'
    | 'warehouse_disruption'
    | 'demand_spike'
    | 'custom';
  targetEntityId: string;
  targetEntityType: EntityType;
  severityPercent: number; // 10 to 100%
  expectedDelayDays: number;
  affectedQuantityUnits: number;
  timestamp: string;
  rootCauseDescription: string;
  isActive: boolean;
  isSecondDisruption?: boolean;
}

export interface BlastRadiusResult {
  disruptionId: string;
  targetEntityId: string;
  affectedMaterialIds: string[];
  affectedFactoryIds: string[];
  affectedScheduleIds: string[];
  affectedDcIds: string[];
  affectedStoreIds: string[];
  affectedOrderIds: string[];
  
  // Quantified Impact
  estimatedProductionShortageUnits: number;
  estimatedDelayedOrdersCount: number;
  slaViolationsCount: number;
  estimatedRevenueAtRiskUsd: number;
  estimatedSlaPenaltiesUsd: number;
  totalFinancialExposureUsd: number;
  earliestStockoutDays: number;
  
  // Graph propagation trace
  traversedPath: {
    fromId: string;
    toId: string;
    impactType: string;
    severityScore: number;
  }[];
}

export type RecoveryStrategyId = 'plan_a' | 'plan_b' | 'plan_c' | 'plan_d' | 'plan_e';

export type ActionCategory = 
  | 'alternative_supplier'
  | 'material_substitution'
  | 'inventory_reallocation'
  | 'production_rescheduling'
  | 'capacity_reallocation'
  | 'transportation_rerouting'
  | 'alternative_dc'
  | 'order_prioritization';

export interface RecoveryActionItem {
  id: string;
  category: ActionCategory;
  title: string;
  description: string;
  sourceEntityId?: string;
  targetEntityId?: string;
  costUsd: number;
  timeHours: number;
  co2DeltaKg: number;
  riskRating: 'Low' | 'Medium' | 'High';
  isFeasible: boolean;
  feasibilityReason?: string;
  applied: boolean;
}

export interface RecoveryPlan {
  id: RecoveryStrategyId;
  name: string;
  subtitle: string;
  objectiveDescription: string;
  isRecommended: boolean;
  
  // Six evaluation criteria
  totalRecoveryCostUsd: number;
  slaPerformancePercent: number;
  recoveryTimeDays: number;
  customerOrdersProtectedCount: number;
  totalOrdersAtRiskCount: number;
  operationalRiskScore: number; // 0 - 100 (lower is better)
  estimatedCo2EmissionsKg: number;
  
  // Execution status & details
  feasibilityStatus: 'FEASIBLE' | 'PARTIALLY_FEASIBLE' | 'INFEASIBLE';
  feasibilityExplanation: string;
  proposedActions: RecoveryActionItem[];
  pros: string[];
  cons: string[];
  
  // Simulated vs Verified
  isVerified?: boolean;
  verificationNotes?: string[];

  // Dynamic Multi-Echelon Recovery Pattern
  activatedSupplierIds: string[];
  activatedMaterialIds: string[];
  activatedFactoryIds: string[];
  activatedDcIds: string[];
  activatedStoreIds: string[];
  protectedOrderIds: string[];
  recoveryNodeIds: string[];
  recoveryPatternSummary: {
    supplierStrategy: string;
    materialStrategy: string;
    factoryStrategy: string;
    dcStrategy: string;
    storeStrategy: string;
    orderStrategy: string;
  };
}

export interface VerificationCheck {
  id: string;
  name: string;
  category: 'inventory' | 'capacity' | 'bom' | 'transport' | 'sla' | 'secondary_shortage';
  passed: boolean;
  metric: string;
  details: string;
  classification: DataClassification;
}

export interface VerificationReport {
  planId: RecoveryStrategyId;
  overallStatus: 'PASSED' | 'PASSED_WITH_WARNINGS' | 'FAILED';
  verificationChecks: VerificationCheck[];
  expectedOutcome: string;
  verifiedOutcome: string;
  remainingRisks: string[];
  secondaryProblemsCreated: string[];
  netFinancialSavingsUsd: number;
  timestamp: string;
}

export interface AgentActivityLog {
  id: string;
  agentId: 'monitoring' | 'prediction' | 'dependency' | 'simulation_optimization' | 'decision' | 'company_intelligence';
  agentName: string;
  timestamp: string;
  actionTaken: string;
  inputSummary: string;
  reasoningTrace: string;
  outputSummary: string;
  status: 'completed' | 'in_progress' | 'alert' | 'decision_needed';
  dataClassification: DataClassification;
}

export interface DigitalTwinGraphNode {
  id: string;
  name: string;
  entityType: EntityType;
  x: number;
  y: number;
  status: NodeHealthStatus;
  subtitle: string;
  metrics: { [key: string]: string | number };
  tierLevel: number; // 0: Supplier, 1: Material, 2: Factory, 3: DC, 4: Store, 5: Customer
}

export interface DigitalTwinGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  isDisrupted: boolean;
  isRecoveryPath?: boolean;
  transitDays?: number;
  capacity?: number;
}

export interface CompanyIntelligenceProfile {
  id: string;
  userId?: string;
  companyName: string;
  domain: string;
  location: string;
  country: string;
  tier: 'Tier 1 Prime' | 'Tier 2 Strategic' | 'Tier 3 Specialized';
  industry: string;
  materialsSupplied: string[];
  suggestedMaterialNames: string[];
  dailyCapacityUnits: number;
  baseLeadTimeDays: number;
  reliabilityScore: number; // 0 - 100
  costMultiplier: number;
  carbonIntensityKgPerUnit: number;
  financialHealthScore: number; // 0 - 100 (solvency/Altman Z index proxy)
  esgRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  geopoliticalRiskScore: number; // 0 - 100
  portExposureScore: number; // 0 - 100
  primaryPorts: string[];
  operationalStatus: 'Normal' | 'Congested' | 'Maintenance' | 'Disrupted' | 'Weather Alert';
  statusDetail: string;
  digitalTwinSupplierId: string;
  extractedAt: string;
  executiveSummary: string;
  recommendedAction: string;
  isIntegratedInTwin?: boolean;
  isPersistedToDb?: boolean;
}

export interface DigitalTwinSyncMeta {
  id: string;
  userId: string;
  syncedAt: string;
  suppliersCount: number;
  materialsCount: number;
  factoriesCount: number;
  dcsCount: number;
  storesCount: number;
  ordersCount: number;
  activeDisruption: string | null;
  status: 'synced' | 'pending' | 'error';
  summary?: string;
}

