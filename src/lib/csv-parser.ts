import { Store, CSVImportResult, CSVImportError } from '@/types/store-locator';

interface CSVRow {
  [key: string]: string;
}

// Parse CSV string to array of objects
export function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

  // Parse data rows
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: CSVRow = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    
    rows.push(row);
  }

  return rows;
}

// Handle quoted CSV fields with commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Map CSV columns to Store fields
const columnMappings: Record<string, keyof Store | 'fullAddress'> = {
  'name': 'name',
  'store name': 'name',
  'storename': 'name',
  'address': 'address',
  'street': 'address',
  'street address': 'address',
  'city': 'city',
  'state': 'state',
  'province': 'state',
  'zip': 'zipCode',
  'zipcode': 'zipCode',
  'zip code': 'zipCode',
  'postal': 'zipCode',
  'postal code': 'zipCode',
  'country': 'country',
  'lat': 'lat',
  'latitude': 'lat',
  'lng': 'lng',
  'lon': 'lng',
  'long': 'lng',
  'longitude': 'lng',
  'phone': 'phone',
  'telephone': 'phone',
  'email': 'email',
  'website': 'website',
  'url': 'website',
  'category': 'category',
  'type': 'category',
  'full address': 'fullAddress',
  'fulladdress': 'fullAddress',
};

export function mapCSVToStores(
  rows: CSVRow[],
  companyId: string
): { stores: Omit<Store, 'id'>[]; errors: CSVImportError[] } {
  const stores: Omit<Store, 'id'>[] = [];
  const errors: CSVImportError[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because of 0-index and header row

    try {
      const store: Partial<Store> = {
        companyId,
      };

      // Map known columns
      Object.entries(row).forEach(([key, value]) => {
        const mappedKey = columnMappings[key.toLowerCase()];
        if (mappedKey && mappedKey !== 'fullAddress') {
          if (mappedKey === 'lat' || mappedKey === 'lng') {
            const num = parseFloat(value);
            if (!isNaN(num)) {
              (store as any)[mappedKey] = num;
            }
          } else {
            (store as any)[mappedKey] = value;
          }
        }
      });

      // Handle tags (comma-separated)
      if (row.tags || row.services) {
        store.tags = (row.tags || row.services).split(',').map(t => t.trim()).filter(Boolean);
      }

      // Validate required fields
      if (!store.name) {
        errors.push({ row: rowNumber, field: 'name', message: 'Store name is required' });
        return;
      }

      // Check if we have coordinates or need geocoding
      const hasCoordinates = typeof store.lat === 'number' && typeof store.lng === 'number';
      const hasAddress = store.address || row['full address'] || row.fulladdress;

      if (!hasCoordinates && !hasAddress) {
        errors.push({
          row: rowNumber,
          field: 'address',
          message: 'Either coordinates (lat/lng) or address is required',
        });
        return;
      }

      // Set defaults
      store.country = store.country || 'USA';
      store.state = store.state || '';
      store.city = store.city || '';
      store.zipCode = store.zipCode || '';
      store.address = store.address || row['full address'] || row.fulladdress || '';

      // If no coordinates, set placeholder (geocoding will be done later)
      if (!hasCoordinates) {
        store.lat = 0;
        store.lng = 0;
      }

      stores.push(store as Omit<Store, 'id'>);
    } catch (error) {
      errors.push({
        row: rowNumber,
        field: 'general',
        message: `Failed to parse row: ${error}`,
      });
    }
  });

  return { stores, errors };
}

export function validateCSVImport(stores: Omit<Store, 'id'>[]): CSVImportError[] {
  const errors: CSVImportError[] = [];

  stores.forEach((store, index) => {
    const rowNumber = index + 2;

    if (!store.name || store.name.trim() === '') {
      errors.push({ row: rowNumber, field: 'name', message: 'Store name cannot be empty' });
    }

    if (store.lat === 0 && store.lng === 0 && !store.address) {
      errors.push({
        row: rowNumber,
        field: 'location',
        message: 'Store needs either coordinates or an address for geocoding',
      });
    }

    if (store.email && !isValidEmail(store.email)) {
      errors.push({ row: rowNumber, field: 'email', message: 'Invalid email format' });
    }

    if (store.phone && !isValidPhone(store.phone)) {
      errors.push({ row: rowNumber, field: 'phone', message: 'Invalid phone format' });
    }
  });

  return errors;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  // Allow various phone formats
  return /^[\d\s\-\(\)\+]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Generate sample CSV template
export function generateCSVTemplate(): string {
  return `name,address,city,state,zipCode,country,lat,lng,phone,email,category,tags
"Downtown Store","123 Main St","New York","NY","10001","USA",40.7128,-74.0060,"(555) 123-4567","downtown@example.com","Flagship","Open Late,Parking"
"Mall Location","456 Shopping Center","Los Angeles","CA","90001","USA",,,"(555) 987-6543","mall@example.com","Standard","Wheelchair Accessible"`;
}
