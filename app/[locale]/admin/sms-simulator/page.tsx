'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Phone, CheckCircle2, XCircle, Clock, Search, RefreshCw } from 'lucide-react';

interface SmsLog {
  id: string;
  phoneNumber: string;
  message: string;
  purpose: string;
  status: string;
  createdAt: string;
  deliveredAt: string | null;
  user: {
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export default function SmsSimulatorPage() {
  const t = useTranslations();
  const { toast } = useToast();
  
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SmsLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPurpose, setFilterPurpose] = useState('all');

  const fetchSmsLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/sms-logs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch SMS logs');
      }
      
      const data = await response.json();
      setSmsLogs(data.smsLogs || []);
      setFilteredLogs(data.smsLogs || []);
    } catch {
      toast({
        title: t('common.error'),
        description: 'Failed to load SMS logs',
        variant: 'error',
      });
      setSmsLogs([]);
      setFilteredLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchSmsLogs();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchSmsLogs, 10000);
    return () => clearInterval(interval);
  }, [fetchSmsLogs]);

  useEffect(() => {
    let filtered = smsLogs;
    
    // Filter by phone number
    if (searchPhone) {
      filtered = filtered.filter(log =>
        log.phoneNumber.includes(searchPhone)
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.status === filterStatus);
    }
    
    // Filter by purpose
    if (filterPurpose !== 'all') {
      filtered = filtered.filter(log => log.purpose === filterPurpose);
    }
    
    setFilteredLogs(filtered);
  }, [smsLogs, searchPhone, filterStatus, filterPurpose]);

  const handleMarkDelivered = async (id: string) => {
    try {
      const response = await fetch('/api/admin/sms-logs/mark-delivered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      toast({
        title: t('common.success'),
        description: 'SMS marked as delivered',
      });
      
      fetchSmsLogs();
    } catch {
      toast({
        title: t('common.error'),
        description: 'Failed to update SMS status',
        variant: 'error',
      });
    }
  };

  const extractOtp = (message: string): string | null => {
    const otpMatch = message.match(/\b\d{6}\b/);
    return otpMatch ? otpMatch[0] : null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getPurposeBadge = (purpose: string) => {
    const colors: Record<string, string> = {
      otp: 'bg-blue-100 text-blue-800',
      notification: 'bg-green-100 text-green-800',
      reminder: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[purpose] || 'bg-gray-100 text-gray-800'}`}>
        {purpose}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SMS Simulator Dashboard
          </h1>
          <p className="text-gray-600">
            View and manage simulated SMS messages for testing
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter SMS logs by phone, status, or purpose</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="searchPhone">Phone Number</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="searchPhone"
                    type="tel"
                    placeholder="Search by phone"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterStatus">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filterStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterPurpose">Purpose</Label>
                <Select value={filterPurpose} onValueChange={setFilterPurpose}>
                  <SelectTrigger id="filterPurpose">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Purposes</SelectItem>
                    <SelectItem value="otp">OTP</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredLogs.length} of {smsLogs.length} messages
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSmsLogs}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SMS Logs */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                Loading SMS logs...
              </CardContent>
            </Card>
          ) : filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No SMS messages found</p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => {
              const otp = extractOtp(log.message);
              
              return (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="font-mono font-medium">
                              {log.phoneNumber}
                            </span>
                          </div>
                          {log.user && (
                            <span className="text-sm text-gray-600">
                              ({log.user.firstName} {log.user.lastName})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          {getPurposeBadge(log.purpose)}
                          <div className="flex items-center gap-1">
                            {getStatusIcon(log.status)}
                            <span className="text-sm text-gray-600 capitalize">
                              {log.status}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-2">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {log.message}
                          </p>
                        </div>

                        {otp && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                            <p className="text-xs text-blue-600 font-medium mb-1">
                              OTP CODE (for testing):
                            </p>
                            <p className="text-2xl font-mono font-bold text-blue-700 tracking-wider">
                              {otp}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Sent: {new Date(log.createdAt).toLocaleString()}
                          </span>
                          {log.deliveredAt && (
                            <span>
                              Delivered: {new Date(log.deliveredAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        {log.status === 'sent' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkDelivered(log.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

