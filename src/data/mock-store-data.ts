import { Company, Store, FilterConfig } from '@/types/store-locator';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock companies
export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'TechMart Electronics',
    slug: 'techmart',
    allowedDomains: ['localhost', 'techmart.com', 'www.techmart.com'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'company-2',
    name: 'Fresh Foods Market',
    slug: 'freshfoods',
    allowedDomains: ['localhost', 'freshfoods.com'],
    createdAt: new Date('2024-02-20'),
  },
];

// Mock stores for TechMart
export const mockStores: Store[] = [
  {
    id: 'store-1',
    companyId: 'company-1',
    name: 'TechMart Downtown',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA',
    lat: 37.7749,
    lng: -122.4194,
    phone: '(415) 555-0101',
    email: 'downtown@techmart.com',
    website: 'https://techmart.com/downtown',
    hours: {
      monday: '9:00 AM - 9:00 PM',
      tuesday: '9:00 AM - 9:00 PM',
      wednesday: '9:00 AM - 9:00 PM',
      thursday: '9:00 AM - 9:00 PM',
      friday: '9:00 AM - 10:00 PM',
      saturday: '10:00 AM - 10:00 PM',
      sunday: '11:00 AM - 7:00 PM',
    },
    category: 'Flagship',
    tags: ['Apple Authorized', 'Repair Center', 'Trade-In'],
  },
  {
    id: 'store-2',
    companyId: 'company-1',
    name: 'TechMart Mission Bay',
    address: '456 Mission Bay Blvd',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94158',
    country: 'USA',
    lat: 37.7699,
    lng: -122.3894,
    phone: '(415) 555-0102',
    email: 'missionbay@techmart.com',
    hours: {
      monday: '10:00 AM - 8:00 PM',
      tuesday: '10:00 AM - 8:00 PM',
      wednesday: '10:00 AM - 8:00 PM',
      thursday: '10:00 AM - 8:00 PM',
      friday: '10:00 AM - 9:00 PM',
      saturday: '10:00 AM - 9:00 PM',
      sunday: '11:00 AM - 6:00 PM',
    },
    category: 'Standard',
    tags: ['Trade-In'],
  },
  {
    id: 'store-3',
    companyId: 'company-1',
    name: 'TechMart Oakland',
    address: '789 Broadway',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94607',
    country: 'USA',
    lat: 37.8044,
    lng: -122.2712,
    phone: '(510) 555-0103',
    email: 'oakland@techmart.com',
    hours: {
      monday: '9:00 AM - 8:00 PM',
      tuesday: '9:00 AM - 8:00 PM',
      wednesday: '9:00 AM - 8:00 PM',
      thursday: '9:00 AM - 8:00 PM',
      friday: '9:00 AM - 9:00 PM',
      saturday: '10:00 AM - 9:00 PM',
      sunday: '11:00 AM - 6:00 PM',
    },
    category: 'Standard',
    tags: ['Apple Authorized', 'Trade-In'],
  },
  {
    id: 'store-4',
    companyId: 'company-1',
    name: 'TechMart Berkeley',
    address: '321 University Ave',
    city: 'Berkeley',
    state: 'CA',
    zipCode: '94704',
    country: 'USA',
    lat: 37.8716,
    lng: -122.2727,
    phone: '(510) 555-0104',
    email: 'berkeley@techmart.com',
    hours: {
      monday: '10:00 AM - 7:00 PM',
      tuesday: '10:00 AM - 7:00 PM',
      wednesday: '10:00 AM - 7:00 PM',
      thursday: '10:00 AM - 7:00 PM',
      friday: '10:00 AM - 8:00 PM',
      saturday: '10:00 AM - 8:00 PM',
      sunday: '12:00 PM - 6:00 PM',
    },
    category: 'Express',
    tags: ['Repair Center'],
  },
  {
    id: 'store-5',
    companyId: 'company-1',
    name: 'TechMart Palo Alto',
    address: '555 Stanford Shopping Center',
    city: 'Palo Alto',
    state: 'CA',
    zipCode: '94304',
    country: 'USA',
    lat: 37.4419,
    lng: -122.1430,
    phone: '(650) 555-0105',
    email: 'paloalto@techmart.com',
    website: 'https://techmart.com/paloalto',
    hours: {
      monday: '10:00 AM - 9:00 PM',
      tuesday: '10:00 AM - 9:00 PM',
      wednesday: '10:00 AM - 9:00 PM',
      thursday: '10:00 AM - 9:00 PM',
      friday: '10:00 AM - 9:00 PM',
      saturday: '10:00 AM - 9:00 PM',
      sunday: '11:00 AM - 6:00 PM',
    },
    category: 'Flagship',
    tags: ['Apple Authorized', 'Repair Center', 'Trade-In', 'Business Center'],
  },
];

// Mock filter configurations
export const mockFilterConfigs: FilterConfig[] = [
  {
    id: 'filter-1',
    companyId: 'company-1',
    fieldName: 'category',
    displayName: 'Store Type',
    fieldType: 'select',
    options: ['Flagship', 'Standard', 'Express'],
  },
  {
    id: 'filter-2',
    companyId: 'company-1',
    fieldName: 'tags',
    displayName: 'Services',
    fieldType: 'multiselect',
    options: ['Apple Authorized', 'Repair Center', 'Trade-In', 'Business Center'],
  },
];

// Helper functions for CRUD operations (simulating a data store)
class MockDataStore {
  private companies: Company[] = [...mockCompanies];
  private stores: Store[] = [...mockStores];
  private filterConfigs: FilterConfig[] = [...mockFilterConfigs];

  // Companies
  getCompanies(): Company[] {
    return this.companies;
  }

  getCompanyById(id: string): Company | undefined {
    return this.companies.find(c => c.id === id);
  }

  getCompanyBySlug(slug: string): Company | undefined {
    return this.companies.find(c => c.slug === slug);
  }

  addCompany(company: Omit<Company, 'id' | 'createdAt'>): Company {
    const newCompany: Company = {
      ...company,
      id: generateId(),
      createdAt: new Date(),
    };
    this.companies.push(newCompany);
    return newCompany;
  }

  updateCompany(id: string, updates: Partial<Company>): Company | undefined {
    const index = this.companies.findIndex(c => c.id === id);
    if (index !== -1) {
      this.companies[index] = { ...this.companies[index], ...updates };
      return this.companies[index];
    }
    return undefined;
  }

  // Stores
  getStores(): Store[] {
    return this.stores;
  }

  getStoresByCompanyId(companyId: string): Store[] {
    return this.stores.filter(s => s.companyId === companyId);
  }

  getStoreById(id: string): Store | undefined {
    return this.stores.find(s => s.id === id);
  }

  addStore(store: Omit<Store, 'id'>): Store {
    const newStore: Store = {
      ...store,
      id: generateId(),
    };
    this.stores.push(newStore);
    return newStore;
  }

  addStores(stores: Omit<Store, 'id'>[]): Store[] {
    return stores.map(store => this.addStore(store));
  }

  updateStore(id: string, updates: Partial<Store>): Store | undefined {
    const index = this.stores.findIndex(s => s.id === id);
    if (index !== -1) {
      this.stores[index] = { ...this.stores[index], ...updates };
      return this.stores[index];
    }
    return undefined;
  }

  deleteStore(id: string): boolean {
    const index = this.stores.findIndex(s => s.id === id);
    if (index !== -1) {
      this.stores.splice(index, 1);
      return true;
    }
    return false;
  }

  // Filter configs
  getFiltersByCompanyId(companyId: string): FilterConfig[] {
    return this.filterConfigs.filter(f => f.companyId === companyId);
  }

  // Domain validation
  validateDomain(companyId: string, domain: string): boolean {
    const company = this.getCompanyById(companyId);
    if (!company) return false;
    
    // Check if the domain is in the allowed list
    return company.allowedDomains.some(allowed => {
      // Support wildcard matching for subdomains
      if (allowed.startsWith('*.')) {
        const baseDomain = allowed.substring(2);
        return domain === baseDomain || domain.endsWith('.' + baseDomain);
      }
      return domain === allowed;
    });
  }

  updateAllowedDomains(companyId: string, domains: string[]): boolean {
    const company = this.getCompanyById(companyId);
    if (company) {
      company.allowedDomains = domains;
      return true;
    }
    return false;
  }
}

export const dataStore = new MockDataStore();
