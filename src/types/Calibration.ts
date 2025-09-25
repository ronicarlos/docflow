
import type { BaseDocument } from './User';

export interface CalibrationInstrumentAttachment {
    id: string; // Client-side generated UUID
    fileName: string;
    fileType: string;
    fileSize: number;
    fileLink: string;
    uploadedAt: string; // ISO Date String
}

export interface CalibrationInstrument extends BaseDocument {
  tenantId: string;
  tag: string;
  description: string;
  equipmentType: string; // ex: 'Sensor de Pressão', 'Manômetro'
  location: string;
  brand: string;
  model: string;
  serialNumber: string;
  calibrationFrequency: number; // em dias
  lastCalibrationDate: string; // ISO Date String
  nextCalibrationDate: string; // ISO Date String
  status: 'active' | 'inactive' | 'maintenance';
  attachments: CalibrationInstrumentAttachment[];
}

// A simple type for the dropdown, can be expanded later
export interface EquipmentType {
    name: string;
}
