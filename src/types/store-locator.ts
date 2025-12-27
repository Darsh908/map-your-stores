// Core types for the Store Locator MVP

export interface Company {
  id: string;
  name: string;
  slug: string;
  allowedDomains: string[];
  createdAt: Date;
}

export interface Store {
  id: string;
  companyId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  website?: string;
  hours?: StoreHours;
  category?: string;
  tags?: string[];
  customData?: Record<string, string | number | boolean>;
}

export interface StoreHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface FilterConfig {
  id: string;
  companyId: string;
  fieldName: string;
  displayName: string;
  fieldType: 'select' | 'multiselect' | 'range' | 'boolean';
  options?: string[];
}

export interface MapViewSettings {
  centerLat: number;
  centerLng: number;
  zoom: number;
  markerColor?: string;
  clusterEnabled?: boolean;
}

// CSV Import
export interface CSVImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  errors: CSVImportError[];
}

export interface CSVImportError {
  row: number;
  field: string;
  message: string;
}

// For the embed widget domain validation
export interface DomainValidationResult {
  valid: boolean;
  message?: string;
}
