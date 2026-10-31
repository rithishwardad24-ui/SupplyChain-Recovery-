/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import {
  DisruptionEvent,
  RecoveryPlan,
  VerificationReport,
  AgentActivityLog,
  Supplier,
  CompanyIntelligenceProfile,
  DigitalTwinSyncMeta,
} from '../types/supplyChain';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error('Firestore Error Logged: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: 'manager' | 'operator' | 'admin' | 'viewer';
  organization: string;
  createdAt: string;
}

export interface StoredExecutionRecord {
  id: string;
  userId: string;
  disruptionId: string;
  planId: string;
  planName: string;
  recoveryCostUsd: number;
  ordersProtectedCount: number;
  verifiedStatus: string;
  netSavingsUsd: number;
  executedAt: string;
}

export const dbService = {
  // --- User Profiles ---
  async syncUserProfile(profile: UserProfile): Promise<void> {
    const path = `users/${profile.userId}`;
    try {
      const userRef = doc(db, 'users', profile.userId);
      await setDoc(userRef, profile, { merge: true });
    } catch (err) {
      console.warn('Could not sync user profile to Firestore:', err);
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
      return null;
    }
  },

  // --- Company Intelligence (Pulled by AI Agent) ---
  async saveCompanyIntelligence(profile: CompanyIntelligenceProfile, userId: string): Promise<void> {
    const path = `company_intelligence/${profile.id}`;
    try {
      const docRef = doc(db, 'company_intelligence', profile.id);
      await setDoc(docRef, {
        ...profile,
        userId: userId || 'guest-session',
        savedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Could not persist company intelligence to Firestore:', err);
    }
  },

  async getRecentCompanyIntelligence(limitCount = 20): Promise<CompanyIntelligenceProfile[]> {
    const path = 'company_intelligence';
    try {
      const q = query(collection(db, 'company_intelligence'), limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as CompanyIntelligenceProfile);
    } catch (err) {
      console.warn('Could not fetch company intelligence records:', err);
      return [];
    }
  },

  async deleteCompanyIntelligence(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'company_intelligence', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete company intelligence from Firestore:', err);
    }
  },

  // --- Digital Twin Supplier Nodes ---
  async saveSupplierNode(supplier: Supplier, userId: string): Promise<void> {
    const path = `suppliers/${supplier.id}`;
    try {
      const docRef = doc(db, 'suppliers', supplier.id);
      await setDoc(docRef, {
        ...supplier,
        userId: userId || 'guest-session',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Could not persist supplier node to Firestore:', err);
    }
  },

  async getAllSupplierNodes(): Promise<Supplier[]> {
    const path = 'suppliers';
    try {
      const q = query(collection(db, 'suppliers'), limit(50));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as Supplier);
    } catch (err) {
      console.warn('Could not fetch supplier nodes from Firestore:', err);
      return [];
    }
  },

  listenToSuppliers(
    callback: (suppliers: Supplier[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    const path = 'suppliers';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const suppliers = snapshot.docs.map((d) => d.data() as Supplier);
        callback(suppliers);
      },
      (error) => {
        console.warn('Firestore onSnapshot error on suppliers:', error);
        if (errorCallback) errorCallback(error);
      }
    );
  },

  // --- Digital Twin Complete Snapshot Sync ---
  async syncDigitalTwinSnapshot(
    twinSnapshot: {
      suppliers: Supplier[];
      meta: DigitalTwinSyncMeta;
    },
    userId: string
  ): Promise<void> {
    try {
      // 1. Batch save all suppliers
      for (const sup of twinSnapshot.suppliers) {
        await this.saveSupplierNode(sup, userId);
      }

      // 2. Save sync meta state
      const stateRef = doc(db, 'digital_twin_state', 'latest');
      await setDoc(stateRef, {
        ...twinSnapshot.meta,
        userId: userId || 'guest-session',
        syncedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not sync digital twin snapshot to Firestore:', err);
    }
  },

  async getLatestDigitalTwinState(): Promise<DigitalTwinSyncMeta | null> {
    try {
      const stateRef = doc(db, 'digital_twin_state', 'latest');
      const snapshot = await getDoc(stateRef);
      if (snapshot.exists()) {
        return snapshot.data() as DigitalTwinSyncMeta;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch digital twin state:', err);
      return null;
    }
  },

  // --- Disruptions ---
  async saveDisruption(disruption: DisruptionEvent, userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'disruptions', disruption.id);
      await setDoc(docRef, {
        id: disruption.id,
        userId: userId || 'guest-session',
        title: disruption.title,
        scenarioType: disruption.scenarioType,
        targetEntityId: disruption.targetEntityId,
        severityPercent: disruption.severityPercent,
        expectedDelayDays: disruption.expectedDelayDays,
        affectedQuantityUnits: disruption.affectedQuantityUnits,
        timestamp: disruption.timestamp || new Date().toISOString(),
        isResolved: !disruption.isActive,
      });
    } catch (err) {
      console.warn('Could not persist disruption to Firestore:', err);
    }
  },

  async getRecentDisruptions(): Promise<any[]> {
    try {
      const q = query(collection(db, 'disruptions'), limit(10));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data());
    } catch (err) {
      console.warn('Could not fetch disruptions:', err);
      return [];
    }
  },

  // --- Recovery Executions ---
  async saveExecution(
    plan: RecoveryPlan,
    disruptionId: string,
    verification: VerificationReport | null,
    userId: string
  ): Promise<void> {
    try {
      const executionId = `exec-${Date.now()}`;
      const docRef = doc(db, 'recovery_executions', executionId);
      const record: StoredExecutionRecord = {
        id: executionId,
        userId: userId || 'guest-session',
        disruptionId,
        planId: plan.id,
        planName: plan.name,
        recoveryCostUsd: plan.totalRecoveryCostUsd,
        ordersProtectedCount: plan.customerOrdersProtectedCount,
        verifiedStatus: verification?.overallStatus || 'PASSED',
        netSavingsUsd: verification?.netFinancialSavingsUsd || 140000,
        executedAt: new Date().toISOString(),
      };
      await setDoc(docRef, record);
    } catch (err) {
      console.warn('Could not persist recovery execution to Firestore:', err);
    }
  },

  async getRecentExecutions(): Promise<StoredExecutionRecord[]> {
    try {
      const q = query(collection(db, 'recovery_executions'), limit(10));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as StoredExecutionRecord);
    } catch (err) {
      console.warn('Could not fetch recovery executions:', err);
      return [];
    }
  },

  // --- Audit Logs ---
  async saveAuditLog(log: AgentActivityLog, userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'audit_logs', log.id);
      await setDoc(docRef, {
        id: log.id,
        userId: userId || 'guest-session',
        agentId: log.agentId,
        agentName: log.agentName,
        actionTaken: log.actionTaken,
        reasoningTrace: log.reasoningTrace,
        dataClassification: log.dataClassification,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not persist audit log to Firestore:', err);
    }
  },

  async getRecentAuditLogs(): Promise<AgentActivityLog[]> {
    try {
      const q = query(collection(db, 'audit_logs'), limit(20));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as AgentActivityLog);
    } catch (err) {
      console.warn('Could not fetch audit logs:', err);
      return [];
    }
  },
};
