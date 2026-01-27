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
import { Search, Info, Package } from 'lucide-react';

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

export default function DevicesPage() {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();
  const [devices, setDevices] = useState<MobilityDevice[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<MobilityDevice[]>([]);
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.devices) {
        setDevices(data.devices);
        setFilteredDevices(data.devices);
      } else {
        console.error('API returned unsuccessful response:', data);
        toast.toast({
          title: t('common.error'),
          description: data.error || 'Failed to load devices',
          variant: 'error',
        });
        // Set empty arrays on error
        setDevices([]);
        setFilteredDevices([]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Failed to load devices',
        variant: 'error',
      });
      // Set empty arrays on error so UI shows "no devices" instead of loading forever
      setDevices([]);
      setFilteredDevices([]);
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

  const handleViewDetails = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedDevice(data.device);
        setIsDialogOpen(true);
      } else {
        throw new Error('Failed to load device details');
      }
    } catch (error) {
      toast.toast({
        title: t('common.error'),
        description: 'Failed to load device details',
        variant: 'error',
      });
    }
  };

  const handleRequestService = () => {
    // Get locale from pathname
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/(en|sw)/);
    const locale = localeMatch ? localeMatch[1] : 'en';
    router.push(`/${locale}/dashboard/services`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500">Loading devices...</p>
          </div>
        </div>
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
            Browse our catalog of mobility devices and assistive technology
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Want to request a device?
                </p>
                <p className="text-sm text-blue-700">
                  Browse the catalog below, then visit our Services page to request a device fitting or assessment.
                </p>
              </div>
              <Button onClick={handleRequestService} variant="outline" size="sm">
                Request Service
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters and search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search devices by name, description, or category..."
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
            {searchQuery && (
              <p className="text-sm text-gray-600 mt-2">
                Found {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Device grid */}
        {filteredDevices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery || categoryFilter !== 'all'
                    ? 'No devices found matching your search criteria'
                    : 'No devices available'}
                </p>
                {(searchQuery || categoryFilter !== 'all') && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDevices.map((device) => (
              <Card
                key={device.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{device.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {device.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
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
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t('common.close')}
                  </Button>
                  <Button onClick={handleRequestService}>
                    Request This Device
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
