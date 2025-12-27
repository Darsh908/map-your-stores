import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Store } from '@/types/store-locator';
import { dataStore } from '@/data/mock-store-data';
import { StoreMapWidget, StoreDetails } from '@/components/embed/StoreMapWidget';
import { AlertCircle } from 'lucide-react';

const EmbedMap = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidDomain, setIsValidDomain] = useState(true);

  useEffect(() => {
    if (!companySlug) {
      setError('Company not specified');
      return;
    }

    const company = dataStore.getCompanyBySlug(companySlug);
    if (!company) {
      setError('Company not found');
      return;
    }

    // Domain validation - check referrer
    const referrer = document.referrer;
    let referrerDomain = 'localhost'; // Default for direct access
    
    if (referrer) {
      try {
        const url = new URL(referrer);
        referrerDomain = url.hostname;
      } catch {
        referrerDomain = 'unknown';
      }
    }

    // Also check if we're in an iframe
    const isInIframe = window.self !== window.top;
    
    // Validate domain (allow localhost for testing)
    const isDomainValid = dataStore.validateDomain(company.id, referrerDomain);
    
    if (!isDomainValid && isInIframe && referrerDomain !== 'localhost') {
      setIsValidDomain(false);
      setError(`This widget is not authorized for ${referrerDomain}`);
      return;
    }

    // Load stores
    const companyStores = dataStore.getStoresByCompanyId(company.id);
    setStores(companyStores);
  }, [companySlug]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <StoreMapWidget
        stores={stores}
        selectedStore={selectedStore}
        onSelectStore={setSelectedStore}
      />
      {selectedStore && (
        <StoreDetails
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
        />
      )}
    </div>
  );
};

export default EmbedMap;
