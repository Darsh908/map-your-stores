import React, { useState, useCallback, useRef } from 'react';
import { Store, Company } from '@/types/store-locator';
import { dataStore } from '@/data/mock-store-data';
import { parseCSV, mapCSVToStores, generateCSVTemplate } from '@/lib/csv-parser';
import { geocodeAddress } from '@/lib/geocoding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Phone,
  Mail,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StoreManagerProps {
  company: Company;
  onStoresChange: () => void;
}

export function StoreManager({ company, onStoresChange }: StoreManagerProps) {
  const [stores, setStores] = useState<Store[]>(() =>
    dataStore.getStoresByCompanyId(company.id)
  );
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const refreshStores = useCallback(() => {
    setStores(dataStore.getStoresByCompanyId(company.id));
    onStoresChange();
  }, [company.id, onStoresChange]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        toast({
          title: 'Empty file',
          description: 'The CSV file appears to be empty.',
          variant: 'destructive',
        });
        return;
      }

      const { stores: parsedStores, errors: parseErrors } = mapCSVToStores(rows, company.id);
      
      if (parseErrors.length > 0) {
        toast({
          title: 'Import warnings',
          description: `${parseErrors.length} rows had issues. Check the console for details.`,
          variant: 'destructive',
        });
        console.warn('CSV Import Errors:', parseErrors);
      }

      // Geocode stores without coordinates
      const storesToGeocode = parsedStores.filter(s => s.lat === 0 && s.lng === 0);
      let geocodedCount = 0;

      for (const store of storesToGeocode) {
        const fullAddress = `${store.address}, ${store.city}, ${store.state} ${store.zipCode}, ${store.country}`;
        const result = await geocodeAddress(fullAddress);
        
        if (result) {
          store.lat = result.lat;
          store.lng = result.lng;
          geocodedCount++;
        }

        setImportProgress(
          Math.round(((parsedStores.indexOf(store) + 1) / parsedStores.length) * 100)
        );
      }

      // Add stores to data store
      const validStores = parsedStores.filter(s => s.lat !== 0 || s.lng !== 0);
      dataStore.addStores(validStores);
      refreshStores();

      toast({
        title: 'Import complete!',
        description: `${validStores.length} stores imported successfully. ${geocodedCount} addresses geocoded.`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: 'An error occurred while importing the CSV file.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteStore = (storeId: string) => {
    dataStore.deleteStore(storeId);
    refreshStores();
    toast({
      title: 'Store deleted',
      description: 'The store has been removed.',
    });
  };

  const downloadTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'store-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Stores
          </CardTitle>
          <CardDescription>
            Upload a CSV file with your store data. Addresses will be automatically geocoded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex-1"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
          </div>

          {isImporting && (
            <div className="space-y-2">
              <Progress value={importProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Geocoding addresses... {importProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stores List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Stores ({stores.length})</CardTitle>
            <CardDescription>Manage your store locations</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="mr-2 h-4 w-4" />
                Add Store
              </Button>
            </DialogTrigger>
            <AddStoreDialog
              companyId={company.id}
              onClose={() => setIsAddDialogOpen(false)}
              onSuccess={refreshStores}
            />
          </Dialog>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="font-semibold">No stores yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Import a CSV or add stores manually to get started.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{store.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {store.city}, {store.state}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {store.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        {store.category && (
                          <Badge variant="secondary">{store.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          {store.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {store.phone}
                            </span>
                          )}
                          {store.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {store.email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteStore(store.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface AddStoreDialogProps {
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AddStoreDialog({ companyId, onClose, onSuccess }: AddStoreDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    email: '',
    category: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Geocode the address
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
      const geocodeResult = await geocodeAddress(fullAddress);

      if (!geocodeResult) {
        toast({
          title: 'Geocoding failed',
          description: 'Could not find coordinates for this address. Please check and try again.',
          variant: 'destructive',
        });
        return;
      }

      const store: Omit<Store, 'id'> = {
        ...formData,
        companyId,
        lat: geocodeResult.lat,
        lng: geocodeResult.lng,
      };

      dataStore.addStore(store);
      onSuccess();
      onClose();

      toast({
        title: 'Store added!',
        description: `${formData.name} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding store:', error);
      toast({
        title: 'Error',
        description: 'Failed to add the store. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Add New Store</DialogTitle>
        <DialogDescription>
          Enter the store details. The address will be automatically geocoded.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="name">Store Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Downtown Store"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="San Francisco"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="CA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              placeholder="94102"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="USA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="store@example.com"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Flagship, Standard, Express..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Store'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
