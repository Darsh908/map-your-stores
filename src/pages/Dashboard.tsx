import React, { useState } from 'react';
import { Company } from '@/types/store-locator';
import { dataStore } from '@/data/mock-store-data';
import { CompanySelector, DomainManager, EmbedCodeGenerator } from '@/components/admin/CompanyManager';
import { StoreManager } from '@/components/admin/StoreManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Building2, Settings, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(
    dataStore.getCompanies()[0] || null
  );
  const [, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">StoreLocator</span>
          </div>
          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
            MVP
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your store locations and embed settings
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <CompanySelector
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
            />
          </aside>

          {/* Content */}
          <div className="space-y-6">
            {selectedCompany ? (
              <Tabs defaultValue="stores" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                  <TabsTrigger value="stores" className="gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">Stores</span>
                  </TabsTrigger>
                  <TabsTrigger value="embed" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Embed</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stores">
                  <StoreManager company={selectedCompany} onStoresChange={handleRefresh} />
                </TabsContent>

                <TabsContent value="embed" className="space-y-6">
                  <EmbedCodeGenerator company={selectedCompany} />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <DomainManager company={selectedCompany} onUpdate={handleRefresh} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16">
                <Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="font-semibold">No company selected</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a company from the sidebar to manage stores
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
