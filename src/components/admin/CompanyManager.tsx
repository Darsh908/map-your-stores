import React, { useState } from 'react';
import { Company } from '@/types/store-locator';
import { dataStore } from '@/data/mock-store-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Globe, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompanySelectorProps {
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
}

export function CompanySelector({ selectedCompany, onSelectCompany }: CompanySelectorProps) {
  const companies = dataStore.getCompanies();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-muted-foreground">Select Company</Label>
      <div className="grid gap-3">
        {companies.map((company) => (
          <Card
            key={company.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedCompany?.id === company.id
                ? 'ring-2 ring-primary shadow-glow'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectCompany(company)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{company.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {dataStore.getStoresByCompanyId(company.id).length} stores
                </p>
              </div>
              <Badge variant="secondary">{company.slug}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface DomainManagerProps {
  company: Company;
  onUpdate: () => void;
}

export function DomainManager({ company, onUpdate }: DomainManagerProps) {
  const [domains, setDomains] = useState<string[]>(company.allowedDomains);
  const [newDomain, setNewDomain] = useState('');
  const { toast } = useToast();

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    
    const domain = newDomain.trim().toLowerCase();
    if (domains.includes(domain)) {
      toast({
        title: 'Domain already exists',
        description: 'This domain is already in the allowed list.',
        variant: 'destructive',
      });
      return;
    }

    const updatedDomains = [...domains, domain];
    setDomains(updatedDomains);
    dataStore.updateAllowedDomains(company.id, updatedDomains);
    setNewDomain('');
    onUpdate();
    
    toast({
      title: 'Domain added',
      description: `${domain} has been added to the allowed list.`,
    });
  };

  const handleRemoveDomain = (domain: string) => {
    const updatedDomains = domains.filter(d => d !== domain);
    setDomains(updatedDomains);
    dataStore.updateAllowedDomains(company.id, updatedDomains);
    onUpdate();
    
    toast({
      title: 'Domain removed',
      description: `${domain} has been removed from the allowed list.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Allowed Domains
        </CardTitle>
        <CardDescription>
          Only these domains can embed your store locator widget.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="example.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
          />
          <Button onClick={handleAddDomain} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {domains.map((domain) => (
            <div
              key={domain}
              className="flex items-center justify-between rounded-lg border bg-secondary/50 px-3 py-2"
            >
              <span className="font-mono text-sm">{domain}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveDomain(domain)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface EmbedCodeGeneratorProps {
  company: Company;
}

export function EmbedCodeGenerator({ company }: EmbedCodeGeneratorProps) {
  const embedUrl = `${window.location.origin}/embed/${company.slug}`;
  const iframeCode = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="600" 
  style="border: none; border-radius: 12px;"
  allow="geolocation"
  title="${company.name} Store Locator"
></iframe>`;

  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(iframeCode);
    toast({
      title: 'Copied!',
      description: 'Embed code copied to clipboard.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Embed Code
        </CardTitle>
        <CardDescription>
          Copy this code to embed the store locator on your website.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-sidebar p-4">
          <pre className="overflow-x-auto text-xs text-sidebar-foreground">
            <code>{iframeCode}</code>
          </pre>
        </div>
        <div className="flex gap-2">
          <Button onClick={copyToClipboard} variant="gradient" className="flex-1">
            Copy Embed Code
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(embedUrl, '_blank')}
          >
            Preview
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Direct link: <code className="rounded bg-muted px-1 py-0.5">{embedUrl}</code>
        </p>
      </CardContent>
    </Card>
  );
}
