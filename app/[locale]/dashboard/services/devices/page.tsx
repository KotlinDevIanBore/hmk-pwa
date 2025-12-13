'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Info, Plus } from 'lucide-react';

interface MobilityDevice {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  price?: number;
  availability: boolean;
  specifications?: Record<string, any>;
}

export default function DeviceCatalogPage() {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();
  const [devices, setDevices] = useState<MobilityDevice[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<MobilityDevice[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [selectedDevice, setSelectedDevice] = useState<MobilityDevice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'wheelchair', label: 'Wheelchairs' },
    { value: 'crutches', label: 'Crutches' },
    { value: 'walker', label: 'Walkers' },
    { value: 'prosthetics', label: 'Prosthetics' },
    { value: 'orthotics', label: 'Orthotics' },
  ];

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchQuery, categoryFilter]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      if (data.success) {
        setDevices(data.devices);
        setFilteredDevices(data.devices);
      }
    } catch {
      toast.toast({
        title: t('common.error'),
        description: 'Failed to load devices',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDevices = () => {
    let filtered = [...devices];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((device) => device.category === categoryFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (device) =>
          device.name.toLowerCase().includes(query) ||
          device.description.toLowerCase().includes(query) ||
          device.category.toLowerCase().includes(query)
      );
    }

    setFilteredDevices(filtered);
  };

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  };

  const handleViewDetails = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedDevice(data.device);
        setIsDialogOpen(true);
      }
    } catch {
      toast.toast({
        title: t('common.error'),
        description: 'Failed to load device details',
        variant: 'error',
      });
    }
  };

  const handleAddToRequest = () => {
    if (selectedDevice) {
      handleDeviceSelect(selectedDevice.id);
      setIsDialogOpen(false);
      toast.toast({
        title: t('common.success'),
        description: 'Device added to request',
      });
    }
  };

  const handleSubmitRequest = async () => {
    if (selectedDevices.size === 0) {
      toast.toast({
        title: t('common.error'),
        description: 'Please select at least one device',
        variant: 'error',
      });
      return;
    }

    try {
      const response = await fetch('/api/services/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'OPERATIONAL',
          title: 'Device Request',
          description: `Requesting ${selectedDevices.size} device(s)`,
          deviceIds: Array.from(selectedDevices),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.toast({
          title: t('common.success'),
          description: t('services.serviceRequested'),
        });
        router.push('/dashboard/services');
      } else {
        throw new Error(data._error);
      }
    } catch {
      toast.toast({
        title: t('common.error'),
        description: 'Failed to submit request',
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Loading devices...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            {t('devices.deviceCatalog')}
          </h1>
          <p className="mt-2 text-gray-600">
            Select one or more mobility devices for your request
          </p>
        </div>

        {/* Filters and search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected devices count */}
        {selectedDevices.size > 0 && (
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {selectedDevices.size} device(s) selected
                </p>
                <Button onClick={handleSubmitRequest}>
                  Submit Request
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Device grid */}
        {filteredDevices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No devices found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDevices.map((device) => (
              <Card
                key={device.id}
                className={`transition-shadow hover:shadow-md ${
                  selectedDevices.has(device.id) ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {device.category}
                      </CardDescription>
                    </div>
                    <Checkbox
                      checked={selectedDevices.has(device.id)}
                      onCheckedChange={() => handleDeviceSelect(device.id)}
                      aria-label={`Select ${device.name}`}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {device.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      {device.price && (
                        <p className="text-sm font-semibold">
                          KES {device.price.toLocaleString()}
                        </p>
                      )}
                      <p
                        className={`text-xs ${
                          device.availability ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {device.availability ? t('devices.available') : t('devices.unavailable')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(device.id)}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Device details dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedDevice?.name}</DialogTitle>
              <DialogDescription>{selectedDevice?.description}</DialogDescription>
            </DialogHeader>
            {selectedDevice && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Category</h4>
                  <p className="text-sm text-gray-600">{selectedDevice.category}</p>
                </div>
                {selectedDevice.price && (
                  <div>
                    <h4 className="font-semibold">Price</h4>
                    <p className="text-sm text-gray-600">
                      KES {selectedDevice.price.toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">Availability</h4>
                  <p
                    className={`text-sm ${
                      selectedDevice.availability ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {selectedDevice.availability ? t('devices.available') : t('devices.unavailable')}
                  </p>
                </div>
                {selectedDevice.specifications && (
                  <div>
                    <h4 className="font-semibold">Specifications</h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {Object.entries(selectedDevice.specifications).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium capitalize">{key}:</span> {String(value)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t('common.close')}
                  </Button>
                  {selectedDevice.availability && (
                    <Button onClick={handleAddToRequest}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Request
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

