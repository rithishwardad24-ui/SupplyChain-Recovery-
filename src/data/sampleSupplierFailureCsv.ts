/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SAMPLE_SUPPLIER_FAILURE_CSV = `SupplierID,SupplierName,MaterialCode,MaterialName,PONumber,ScheduledDelivery,RevisedDelivery,DelayDays,QuantityUnits,Status,Location,RootCause
SUP-01,Apex Global Chemicals,MAT-01,Virgin Polymer Resin,PO-8821,2026-11-01,2026-11-07,6,28000,Delayed,Rotterdam Netherlands,Thermal polymerization reactor pressure vessel leak
SUP-01,Apex Global Chemicals,MAT-03,Concentrated Surfactant 70%,PO-8822,2026-11-02,2026-11-08,6,18000,Delayed,Rotterdam Netherlands,Auxiliary steam condenser shutdown
SUP-01,Apex Global Chemicals,MAT-06,Eco-Stabilizer Preservative,PO-8824,2026-11-03,2026-11-08,5,8500,Delayed,Rotterdam Netherlands,Safety interlock inspection mandatory stand-down
SUP-02,Pacific Polymers Ltd,MAT-01,Virgin Polymer Resin,PO-8830,2026-11-04,2026-11-05,1,12000,At Risk,Singapore,Port container staging backlog
SUP-03,BioPure Extracts Inc,MAT-02,Bio-Circular Polymer Blend,PO-8841,2026-11-02,2026-11-02,0,15000,On Schedule,Lyon France,Normal operations
SUP-04,Horizon Packaging & Foil,MAT-05,Multi-Layer Barrier Foil,PO-8855,2026-11-01,2026-11-01,0,35000,On Schedule,Düsseldorf Germany,Normal operations
SUP-05,Nordic CleanSynthetics,MAT-03,Concentrated Surfactant 70%,PO-8862,2026-11-03,2026-11-03,0,10000,On Schedule,Gothenburg Sweden,Reserve capacity active`;

export interface ParsedSupplierRecord {
  supplierId: string;
  supplierName: string;
  materialCode: string;
  materialName: string;
  poNumber: string;
  scheduledDelivery: string;
  revisedDelivery: string;
  delayDays: number;
  quantityUnits: number;
  status: 'Delayed' | 'At Risk' | 'On Schedule';
  location: string;
  rootCause: string;
}

export function parseSupplierCsv(csvText: string): ParsedSupplierRecord[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const records: ParsedSupplierRecord[] = [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map((v) => v.trim());
    if (values.length < 5) continue;

    const delayDays = parseInt(values[7] || '0', 10) || 0;
    const quantityUnits = parseInt(values[8] || '0', 10) || 0;
    const rawStatus = values[9] || (delayDays > 2 ? 'Delayed' : delayDays > 0 ? 'At Risk' : 'On Schedule');

    records.push({
      supplierId: values[0] || 'SUP-01',
      supplierName: values[1] || 'Supplier',
      materialCode: values[2] || 'MAT-01',
      materialName: values[3] || 'Raw Material',
      poNumber: values[4] || `PO-${i}`,
      scheduledDelivery: values[5] || '2026-11-01',
      revisedDelivery: values[6] || '2026-11-07',
      delayDays,
      quantityUnits,
      status: (rawStatus.toLowerCase().includes('delay') ? 'Delayed' : rawStatus.toLowerCase().includes('risk') ? 'At Risk' : 'On Schedule') as any,
      location: values[10] || 'Europe',
      rootCause: values[11] || 'Supplier logistical constraint',
    });
  }

  return records;
}
