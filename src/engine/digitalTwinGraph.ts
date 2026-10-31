/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Supplier,
  RawMaterial,
  BOMItem,
  Factory,
  ProductionSchedule,
  DistributionCenter,
  RetailStore,
  CustomerOrder,
  TransportRoute,
  DigitalTwinGraphNode,
  DigitalTwinGraphEdge,
  BlastRadiusResult,
  NodeHealthStatus,
  CompanyIntelligenceProfile,
} from '../types/supplyChain';

export interface GraphState {
  nodes: DigitalTwinGraphNode[];
  edges: DigitalTwinGraphEdge[];
}

export class DigitalTwinNetwork {
  private suppliers: Map<string, Supplier> = new Map();
  private materials: Map<string, RawMaterial> = new Map();
  private bom: BOMItem[] = [];
  private factories: Map<string, Factory> = new Map();
  private schedules: Map<string, ProductionSchedule> = new Map();
  private distributionCenters: Map<string, DistributionCenter> = new Map();
  private retailStores: Map<string, RetailStore> = new Map();
  private customerOrders: Map<string, CustomerOrder> = new Map();
  private routes: Map<string, TransportRoute> = new Map();

  // Adjacency graph for NetworkX equivalent traversal
  private forwardAdjacency: Map<string, string[]> = new Map();
  private backwardAdjacency: Map<string, string[]> = new Map();

  constructor(
    suppliers: Supplier[],
    materials: RawMaterial[],
    bom: BOMItem[],
    factories: Factory[],
    schedules: ProductionSchedule[],
    dcs: DistributionCenter[],
    stores: RetailStore[],
    orders: CustomerOrder[],
    routes: TransportRoute[]
  ) {
    this.init(suppliers, materials, bom, factories, schedules, dcs, stores, orders, routes);
  }

  public init(
    suppliers: Supplier[],
    materials: RawMaterial[],
    bom: BOMItem[],
    factories: Factory[],
    schedules: ProductionSchedule[],
    dcs: DistributionCenter[],
    stores: RetailStore[],
    orders: CustomerOrder[],
    routes: TransportRoute[]
  ) {
    this.suppliers.clear();
    suppliers.forEach((s) => this.suppliers.set(s.id, { ...s }));

    this.materials.clear();
    materials.forEach((m) => this.materials.set(m.id, { ...m }));

    this.bom = [...bom];

    this.factories.clear();
    factories.forEach((f) => this.factories.set(f.id, { ...f }));

    this.schedules.clear();
    schedules.forEach((sch) => this.schedules.set(sch.id, { ...sch }));

    this.distributionCenters.clear();
    dcs.forEach((dc) => this.distributionCenters.set(dc.id, { ...dc }));

    this.retailStores.clear();
    stores.forEach((st) => this.retailStores.set(st.id, { ...st }));

    this.customerOrders.clear();
    orders.forEach((ord) => this.customerOrders.set(ord.id, { ...ord }));

    this.routes.clear();
    routes.forEach((r) => this.routes.set(r.id, { ...r }));

    this.buildGraphStructure();
  }

  private addDirectedEdge(source: string, target: string) {
    if (!this.forwardAdjacency.has(source)) this.forwardAdjacency.set(source, []);
    this.forwardAdjacency.get(source)!.push(target);

    if (!this.backwardAdjacency.has(target)) this.backwardAdjacency.set(target, []);
    this.backwardAdjacency.get(target)!.push(source);
  }

  private buildGraphStructure() {
    this.forwardAdjacency.clear();
    this.backwardAdjacency.clear();

    // 1. Supplier -> Material
    this.suppliers.forEach((supplier) => {
      supplier.materialsSupplied.forEach((matId) => {
        if (this.materials.has(matId)) {
          this.addDirectedEdge(supplier.id, matId);
        }
      });
    });

    // 2. Material -> Factory (via BOM & Factory production)
    this.factories.forEach((factory) => {
      factory.productsProduced.forEach((fgId) => {
        const requiredMats = this.bom.filter((b) => b.finishedGoodId === fgId).map((b) => b.materialId);
        requiredMats.forEach((matId) => {
          this.addDirectedEdge(matId, factory.id);
        });
      });
    });

    // 3. Factory -> Distribution Center (via Transport Routes or direct)
    this.routes.forEach((route) => {
      if (this.factories.has(route.sourceId) && this.distributionCenters.has(route.destinationId)) {
        this.addDirectedEdge(route.sourceId, route.destinationId);
      }
    });

    // Fallback ensure factory connects to DC
    this.addDirectedEdge('FAC-01', 'DC-01');
    this.addDirectedEdge('FAC-01', 'DC-02');
    this.addDirectedEdge('FAC-02', 'DC-02');

    // 4. DC -> Retail Store
    this.distributionCenters.forEach((dc) => {
      dc.servesStoreIds.forEach((storeId) => {
        if (this.retailStores.has(storeId)) {
          this.addDirectedEdge(dc.id, storeId);
        }
      });
    });

    // 5. Retail Store -> Customer Order
    this.customerOrders.forEach((order) => {
      if (this.retailStores.has(order.targetStoreId)) {
        this.addDirectedEdge(order.targetStoreId, order.id);
      }
    });
  }

  /**
   * Generates graph nodes and layout for SVG visualization
   */
  public getVisualGraph(activeDisruptedIds: Set<string> = new Set(), recoveryIds: Set<string> = new Set()): GraphState {
    const nodes: DigitalTwinGraphNode[] = [];
    const edges: DigitalTwinGraphEdge[] = [];

    // Layout configuration
    const tierX = [90, 290, 490, 690, 890, 1100];
    const canvasHeight = 680;

    // Helper to calculate Y position evenly
    const getY = (index: number, total: number) => {
      const padding = 65;
      const available = canvasHeight - padding * 2;
      if (total <= 1) return canvasHeight / 2;
      return padding + (index / (total - 1)) * available;
    };

    // 1. Suppliers (Tier 0)
    const supplierList = Array.from(this.suppliers.values());
    supplierList.forEach((s, idx) => {
      let status: NodeHealthStatus = s.status;
      if (activeDisruptedIds.has(s.id)) status = 'disrupted';
      else if (recoveryIds.has(s.id)) status = 'recovery';

      nodes.push({
        id: s.id,
        name: s.name,
        entityType: 'supplier',
        tierLevel: 0,
        x: tierX[0],
        y: getY(idx, supplierList.length),
        status,
        subtitle: `${s.location.split(',')[0]} · ${s.reliabilityScore}% Rel.`,
        metrics: {
          'Reliability': `${s.reliabilityScore}%`,
          'Lead Time': `${s.baseLeadTimeDays}d`,
          'Daily Capacity': `${(s.dailyCapacityUnits / 1000).toFixed(0)}k units`,
          'CO2 Factor': `${s.carbonIntensityKgPerUnit} kg/u`,
        },
      });
    });

    // 2. Materials (Tier 1)
    const matList = Array.from(this.materials.values());
    matList.forEach((m, idx) => {
      let status: NodeHealthStatus = m.status;
      if (activeDisruptedIds.has(m.id)) status = 'disrupted';
      else if (recoveryIds.has(m.id)) status = 'recovery';

      nodes.push({
        id: m.id,
        name: m.name,
        entityType: 'material',
        tierLevel: 1,
        x: tierX[1],
        y: getY(idx, matList.length),
        status,
        subtitle: `${(m.currentStockUnits / 1000).toFixed(1)}k kg · $${m.unitCost.toFixed(2)}/u`,
        metrics: {
          'Stock': `${m.currentStockUnits.toLocaleString()} units`,
          'Safety Stock': `${m.safetyStockUnits.toLocaleString()} units`,
          'Daily Burn': `${m.dailyConsumptionRate} u/d`,
          'Substitute': m.substituteMaterialId ? `${m.substituteMaterialId} (${m.substituteCompatibilityPercent}%)` : 'None',
        },
      });
    });

    // 3. Factories (Tier 2)
    const factList = Array.from(this.factories.values());
    factList.forEach((f, idx) => {
      let status: NodeHealthStatus = f.status;
      if (activeDisruptedIds.has(f.id)) status = 'disrupted';
      else if (recoveryIds.has(f.id)) status = 'recovery';

      nodes.push({
        id: f.id,
        name: f.name,
        entityType: 'factory',
        tierLevel: 2,
        x: tierX[2],
        y: getY(idx, factList.length),
        status,
        subtitle: `${(f.currentDailyOutputUnits / 1000).toFixed(0)}k u/d · ${f.efficiencyPercent}% Eff.`,
        metrics: {
          'Max Cap.': `${(f.maxDailyCapacityUnits / 1000).toFixed(0)}k u/d`,
          'Current': `${(f.currentDailyOutputUnits / 1000).toFixed(0)}k u/d`,
          'Cost/hr': `$${f.operatingCostPerHour.toLocaleString()}`,
          'Lines': f.productsProduced.join(', '),
        },
      });
    });

    // 4. DCs (Tier 3)
    const dcList = Array.from(this.distributionCenters.values());
    dcList.forEach((dc, idx) => {
      let status: NodeHealthStatus = dc.status;
      if (activeDisruptedIds.has(dc.id)) status = 'disrupted';
      else if (recoveryIds.has(dc.id)) status = 'recovery';

      nodes.push({
        id: dc.id,
        name: dc.name,
        entityType: 'distribution_center',
        tierLevel: 3,
        x: tierX[3],
        y: getY(idx, dcList.length),
        status,
        subtitle: `${(dc.currentInventoryUnits / 1000).toFixed(0)}k pallet units · ${dc.availableTrucks} trucks`,
        metrics: {
          'Inventory': `${(dc.currentInventoryUnits / 1000).toFixed(0)}k units`,
          'Capacity': `${(dc.totalStorageCapacityUnits / 1000).toFixed(0)}k units`,
          'Fleet': `${dc.availableTrucks} active trucks`,
          'Daily Outflow': `${(dc.dailyDispatchRate / 1000).toFixed(0)}k u/d`,
        },
      });
    });

    // 5. Retail Stores (Tier 4)
    const storeList = Array.from(this.retailStores.values());
    storeList.forEach((st, idx) => {
      let status: NodeHealthStatus = st.status;
      if (activeDisruptedIds.has(st.id)) status = 'disrupted';
      else if (recoveryIds.has(st.id)) status = 'recovery';

      nodes.push({
        id: st.id,
        name: st.name,
        entityType: 'store',
        tierLevel: 4,
        x: tierX[4],
        y: getY(idx, storeList.length),
        status,
        subtitle: `${st.city} · ${st.daysOfInventoryLeft}d stock`,
        metrics: {
          'City': st.city,
          'Current Stock': `${st.currentStockUnits.toLocaleString()} units`,
          'Daily Velocity': `${st.dailySalesRate} u/d`,
          'Days Cover': `${st.daysOfInventoryLeft} days`,
        },
      });
    });

    // 6. Customer Orders (Tier 5)
    const orderList = Array.from(this.customerOrders.values());
    orderList.forEach((ord, idx) => {
      let status: NodeHealthStatus = ord.status;
      if (activeDisruptedIds.has(ord.id)) status = 'disrupted';
      else if (recoveryIds.has(ord.id)) status = 'recovery';

      nodes.push({
        id: ord.id,
        name: ord.customerName,
        entityType: 'customer_order',
        tierLevel: 5,
        x: tierX[5],
        y: getY(idx, orderList.length),
        status,
        subtitle: `${ord.tier.split(' ')[0]} · $${(ord.orderValueUsd / 1000).toFixed(1)}k · SLA ${ord.slaDeadlineDate.substring(5)}`,
        metrics: {
          'Tier': ord.tier,
          'Value': `$${ord.orderValueUsd.toLocaleString()}`,
          'Units': `${ord.orderQuantity.toLocaleString()}`,
          'SLA Penalty': `$${ord.slaPenaltyPerDayUsd}/day`,
        },
      });
    });

    // Build directed edges with disruption flags
    let edgeIdx = 0;
    this.forwardAdjacency.forEach((targets, source) => {
      const sourceDisrupted = activeDisruptedIds.has(source);
      targets.forEach((target) => {
        const targetDisrupted = activeDisruptedIds.has(target);
        const isDisrupted = sourceDisrupted || targetDisrupted;
        const isRecoveryPath = recoveryIds.has(source) && recoveryIds.has(target);

        edges.push({
          id: `edge-${edgeIdx++}`,
          source,
          target,
          isDisrupted,
          isRecoveryPath,
        });
      });
    });

    return { nodes, edges };
  }

  /**
   * Blast Radius Calculation (NetworkX graph traversal equivalent)
   * Recursively traces downstream impact from the point of disruption
   */
  public calculateBlastRadius(
    targetEntityId: string,
    severityPercent: number,
    delayDays: number
  ): BlastRadiusResult {
    const visited = new Set<string>();
    const affectedMaterials = new Set<string>();
    const affectedFactories = new Set<string>();
    const affectedSchedules = new Set<string>();
    const affectedDcs = new Set<string>();
    const affectedStores = new Set<string>();
    const affectedOrders = new Set<string>();

    const traversedPath: BlastRadiusResult['traversedPath'] = [];

    // Traverse downstream dependencies using BFS
    const queue: { id: string; currentSeverity: number }[] = [{ id: targetEntityId, currentSeverity: severityPercent }];
    visited.add(targetEntityId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = this.forwardAdjacency.get(current.id) || [];

      neighbors.forEach((nextId) => {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          const degradedSeverity = Math.max(10, current.currentSeverity * 0.92);
          queue.push({ id: nextId, currentSeverity: degradedSeverity });

          // Categorize affected node
          if (this.materials.has(nextId)) affectedMaterials.add(nextId);
          else if (this.factories.has(nextId)) affectedFactories.add(nextId);
          else if (this.distributionCenters.has(nextId)) affectedDcs.add(nextId);
          else if (this.retailStores.has(nextId)) affectedStores.add(nextId);
          else if (this.customerOrders.has(nextId)) affectedOrders.add(nextId);

          traversedPath.push({
            fromId: current.id,
            toId: nextId,
            impactType: 'cascading_delay',
            severityScore: Math.round(degradedSeverity),
          });
        }
      });
    }

    // Direct check if target itself is a material, factory, etc.
    if (this.materials.has(targetEntityId)) affectedMaterials.add(targetEntityId);
    if (this.factories.has(targetEntityId)) affectedFactories.add(targetEntityId);
    if (this.distributionCenters.has(targetEntityId)) affectedDcs.add(targetEntityId);
    if (this.retailStores.has(targetEntityId)) affectedStores.add(targetEntityId);
    if (this.customerOrders.has(targetEntityId)) affectedOrders.add(targetEntityId);

    // Identify affected production schedules
    this.schedules.forEach((sch) => {
      if (affectedFactories.has(sch.factoryId)) {
        affectedSchedules.add(sch.id);
      }
      const usesDisruptedMaterial = sch.requiredMaterials.some((rm) => affectedMaterials.has(rm.materialId));
      if (usesDisruptedMaterial) {
        affectedSchedules.add(sch.id);
      }
    });

    // Quantify downstream business & SLA impact
    let estimatedShortageUnits = 0;
    affectedSchedules.forEach((schId) => {
      const sch = this.schedules.get(schId);
      if (sch) {
        estimatedShortageUnits += Math.round(sch.plannedQuantity * (severityPercent / 100));
      }
    });
    if (estimatedShortageUnits === 0) {
      estimatedShortageUnits = Math.round(45000 * (severityPercent / 100));
    }

    // Customer order impact
    let estimatedRevenueAtRisk = 0;
    let estimatedSlaPenalties = 0;
    let slaViolationsCount = 0;
    const delayedOrderList: string[] = [];

    this.customerOrders.forEach((order) => {
      // Order is delayed if its store or upstream factory is affected
      const storeAffected = affectedStores.has(order.targetStoreId);
      const isDirectlyAffected = affectedOrders.has(order.id) || storeAffected;

      if (isDirectlyAffected) {
        delayedOrderList.push(order.id);
        estimatedRevenueAtRisk += order.orderValueUsd;
        
        // Check SLA violation: delay exceeds tolerance buffer
        const slaBufferDays = order.tier === 'Tier 1 Enterprise' ? 1 : order.tier === 'Tier 2 Priority' ? 2 : 3;
        if (delayDays > slaBufferDays) {
          slaViolationsCount++;
          const penaltyDays = delayDays - slaBufferDays;
          estimatedSlaPenalties += penaltyDays * order.slaPenaltyPerDayUsd;
        }
      }
    });

    // Earliest stockout calculation
    let earliestStockoutDays = 99;
    affectedStores.forEach((storeId) => {
      const store = this.retailStores.get(storeId);
      if (store && store.daysOfInventoryLeft < earliestStockoutDays) {
        earliestStockoutDays = store.daysOfInventoryLeft;
      }
    });
    if (earliestStockoutDays === 99) earliestStockoutDays = 3.2;

    return {
      disruptionId: targetEntityId,
      targetEntityId,
      affectedMaterialIds: Array.from(affectedMaterials),
      affectedFactoryIds: Array.from(affectedFactories),
      affectedScheduleIds: Array.from(affectedSchedules),
      affectedDcIds: Array.from(affectedDcs),
      affectedStoreIds: Array.from(affectedStores),
      affectedOrderIds: delayedOrderList,
      estimatedProductionShortageUnits: estimatedShortageUnits,
      estimatedDelayedOrdersCount: delayedOrderList.length,
      slaViolationsCount,
      estimatedRevenueAtRiskUsd: estimatedRevenueAtRisk,
      estimatedSlaPenaltiesUsd: estimatedSlaPenalties,
      totalFinancialExposureUsd: estimatedRevenueAtRisk + estimatedSlaPenalties,
      earliestStockoutDays,
      traversedPath,
    };
  }

  // Getters for specific entity deep-dives
  public getSupplier(id: string) { return this.suppliers.get(id); }
  public getMaterial(id: string) { return this.materials.get(id); }
  public getFactory(id: string) { return this.factories.get(id); }
  public getDC(id: string) { return this.distributionCenters.get(id); }
  public getStore(id: string) { return this.retailStores.get(id); }
  public getOrder(id: string) { return this.customerOrders.get(id); }
  public getAllSuppliers() { return Array.from(this.suppliers.values()); }
  public getAllMaterials() { return Array.from(this.materials.values()); }
  public getAllFactories() { return Array.from(this.factories.values()); }
  public getAllDCs() { return Array.from(this.distributionCenters.values()); }
  public getAllStores() { return Array.from(this.retailStores.values()); }
  public getAllOrders() { return Array.from(this.customerOrders.values()); }
  public getBOM() { return [...this.bom]; }

  /**
   * Adds or updates a supplier node dynamically and re-computes graph adjacencies
   */
  public addOrUpdateSupplier(supplier: Supplier): void {
    this.suppliers.set(supplier.id, { ...supplier });
    this.buildGraphStructure();
  }

  /**
   * Directly integrates a company intelligence profile pulled by the agent
   * into the Digital Twin as an operational supplier node
   */
  public integrateCompanyIntoTwin(company: CompanyIntelligenceProfile): Supplier {
    const safePrefix = company.companyName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'VEND';
    const supplierId = company.digitalTwinSupplierId && company.digitalTwinSupplierId.startsWith('SUP-')
      ? company.digitalTwinSupplierId
      : `SUP-${safePrefix}`;

    const defaultMaterials = ['MAT-01', 'MAT-02'];
    const materials = company.materialsSupplied && company.materialsSupplied.length > 0
      ? company.materialsSupplied
      : defaultMaterials;

    const supplier: Supplier = {
      id: supplierId,
      name: company.companyName,
      location: company.location,
      materialsSupplied: materials,
      reliabilityScore: company.reliabilityScore || 95,
      baseLeadTimeDays: company.baseLeadTimeDays || 3,
      dailyCapacityUnits: company.dailyCapacityUnits || 70000,
      costMultiplier: company.costMultiplier || 1.0,
      carbonIntensityKgPerUnit: company.carbonIntensityKgPerUnit || 1.8,
      status: company.operationalStatus === 'Disrupted' ? 'disrupted' : company.operationalStatus === 'Weather Alert' || company.operationalStatus === 'Congested' ? 'warning' : 'healthy',
      contactEmail: `procurement@${company.domain || 'supply.net'}`,
    };

    this.addOrUpdateSupplier(supplier);
    return supplier;
  }

  /**
   * Batch imports suppliers, e.g. when pulled from Cloud Firestore
   */
  public importSuppliers(suppliers: Supplier[]): void {
    suppliers.forEach((s) => {
      this.suppliers.set(s.id, { ...s });
    });
    this.buildGraphStructure();
  }

  /**
   * Exports complete network snapshot for Firestore persistence
   */
  public exportNetworkSnapshot() {
    return {
      suppliers: this.getAllSuppliers(),
      materials: this.getAllMaterials(),
      factories: this.getAllFactories(),
      dcs: this.getAllDCs(),
      stores: this.getAllStores(),
      orders: this.getAllOrders(),
      bom: this.getBOM(),
    };
  }
}
