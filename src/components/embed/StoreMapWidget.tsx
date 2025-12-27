import React, { useEffect, useRef, useState } from 'react';
import { Store } from '@/types/store-locator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Phone, Clock, ExternalLink, Search, X } from 'lucide-react';

interface StoreMapWidgetProps {
  stores: Store[];
  onSelectStore: (store: Store) => void;
  selectedStore: Store | null;
}

export function StoreMapWidget({ stores, onSelectStore, selectedStore }: StoreMapWidgetProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStores, setFilteredStores] = useState(stores);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStores(stores);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredStores(
        stores.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.city.toLowerCase().includes(query) ||
            s.address.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, stores]);

  // Calculate center from stores
  const center = stores.length > 0
    ? {
        lat: stores.reduce((sum, s) => sum + s.lat, 0) / stores.length,
        lng: stores.reduce((sum, s) => sum + s.lng, 0) / stores.length,
      }
    : { lat: 37.7749, lng: -122.4194 };

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full border-b lg:w-80 lg:border-b-0 lg:border-r bg-card">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="h-[200px] overflow-y-auto lg:h-[calc(100vh-140px)]">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className={`cursor-pointer border-b p-4 transition-colors hover:bg-secondary/50 ${
                selectedStore?.id === store.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
              }`}
              onClick={() => onSelectStore(store)}
            >
              <h3 className="font-semibold">{store.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {store.address}, {store.city}
              </p>
              {store.category && (
                <Badge variant="secondary" className="mt-2">{store.category}</Badge>
              )}
            </div>
          ))}
          {filteredStores.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No stores found
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="relative flex-1 bg-muted min-h-[400px]">
        <div
          ref={mapRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${center.lng},${center.lat},10,0/800x600@2x?access_token=pk.placeholder')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="text-center p-8 glass rounded-xl">
            <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold text-lg">Google Maps Integration</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Add your Google Maps API key to enable interactive maps
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              {stores.length} stores loaded • Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </p>
          </div>
        </div>
        
        {/* Store markers preview */}
        {filteredStores.slice(0, 10).map((store, i) => (
          <div
            key={store.id}
            className={`absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-110 ${
              selectedStore?.id === store.id
                ? 'bg-primary text-primary-foreground shadow-glow z-10'
                : 'bg-card text-primary border-2 border-primary shadow-md'
            }`}
            style={{
              left: `${20 + (i * 8)}%`,
              top: `${30 + ((i % 3) * 20)}%`,
            }}
            onClick={() => onSelectStore(store)}
          >
            <MapPin className="h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface StoreDetailsProps {
  store: Store;
  onClose: () => void;
}

export function StoreDetails({ store, onClose }: StoreDetailsProps) {
  const getDirectionsUrl = () => {
    const destination = encodeURIComponent(`${store.address}, ${store.city}, ${store.state} ${store.zipCode}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  };

  return (
    <Card className="absolute bottom-4 left-4 right-4 z-20 animate-fade-in lg:left-auto lg:right-4 lg:w-96">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{store.name}</h2>
            {store.category && (
              <Badge variant="secondary" className="mt-1">{store.category}</Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p>{store.address}</p>
              <p className="text-muted-foreground">{store.city}, {store.state} {store.zipCode}</p>
            </div>
          </div>

          {store.phone && (
            <a href={`tel:${store.phone}`} className="flex items-center gap-3 text-primary hover:underline">
              <Phone className="h-5 w-5" />
              {store.phone}
            </a>
          )}

          {store.hours && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="text-sm">
                {Object.entries(store.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between gap-4">
                    <span className="capitalize text-muted-foreground">{day}</span>
                    <span>{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {store.tags && store.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {store.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="gradient" className="flex-1" asChild>
            <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
              <Navigation className="mr-2 h-4 w-4" />
              Get Directions
            </a>
          </Button>
          {store.website && (
            <Button variant="outline" asChild>
              <a href={store.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
