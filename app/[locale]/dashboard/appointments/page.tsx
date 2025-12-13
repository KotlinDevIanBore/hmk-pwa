'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  MapPin,
  Filter,
  RefreshCw,
  Loader2,
  Eye,
  CalendarDays,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  locationType: 'RESOURCE_CENTER' | 'OUTREACH';
  location: string | null;
  outreachLocation: {
    id: string;
    name: string;
    county: string;
    address: string | null;
  } | null;
  purpose: string;
  status: string;
  serviceFee: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

const statusConfig: Record<AppointmentStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  RESCHEDULED: { label: 'Rescheduled', variant: 'info' },
  CHECKED_IN: { label: 'Checked In', variant: 'success' },
  CHECKED_OUT: { label: 'Checked Out', variant: 'info' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  NO_SHOW: { label: 'No Show', variant: 'warning' },
};

export default function AppointmentsPage() {
  const _t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; available: boolean }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (startDateFilter) {
        params.append('startDate', startDateFilter);
      }
      if (endDateFilter) {
        params.append('endDate', endDateFilter);
      }

      const response = await fetch(`/api/appointments/user?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, startDateFilter, endDateFilter, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const fetchAvailableSlots = async (date: string) => {
    if (!date || !selectedAppointment) return;
    setLoadingSlots(true);
    try {
      const params = new URLSearchParams({
        date,
        locationType: selectedAppointment.locationType,
      });
      if (selectedAppointment.locationType === 'OUTREACH' && selectedAppointment.outreachLocation?.id) {
        params.append('outreachLocationId', selectedAppointment.outreachLocation.id);
      }

      const response = await fetch(`/api/appointments/availability?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch slots');
      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load available time slots',
        variant: 'error',
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (rescheduleDate && selectedAppointment) {
      fetchAvailableSlots(rescheduleDate);
    }
  }, [rescheduleDate, selectedAppointment]);

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) {
      toast({
        title: 'Error',
        description: 'Please select both date and time',
        variant: 'error',
      });
      return;
    }

    setRescheduling(true);
    try {
      const response = await fetch('/api/appointments/reschedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          appointmentDate: rescheduleDate,
          appointmentTime: rescheduleTime,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data._error || 'Failed to reschedule');
      }

      toast({
        title: 'Success',
        description: 'Appointment rescheduled successfully',
        variant: 'success',
      });

      setShowRescheduleModal(false);
      setRescheduleDate('');
      setRescheduleTime('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reschedule appointment',
        variant: 'error',
      });
    } finally {
      setRescheduling(false);
    }
  };

  const openRescheduleModal = (appointment: Appointment) => {
    // Check if appointment can be rescheduled
    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
      toast({
        title: 'Cannot Reschedule',
        description: 'This appointment cannot be rescheduled',
        variant: 'error',
      });
      return;
    }

    setSelectedAppointment(appointment);
    setRescheduleDate('');
    setRescheduleTime('');
    setShowRescheduleModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as AppointmentStatus] || { label: status, variant: 'secondary' as const };
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getLocationName = (appointment: Appointment) => {
    if (appointment.locationType === 'OUTREACH' && appointment.outreachLocation) {
      return appointment.outreachLocation.name;
    }
    return 'Resource Center';
  };

  const canReschedule = (status: string) => {
    return status !== 'COMPLETED' && status !== 'CANCELLED';
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="text-gray-600 mt-1">View and manage your appointments</p>
          </div>
          <Button onClick={() => router.push('/dashboard/appointments/book')}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                    <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                    <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setStartDateFilter('');
                    setEndDateFilter('');
                  }}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </CardContent>
          </Card>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No appointments found</p>
              <Button
                onClick={() => router.push('/dashboard/appointments/book')}
                className="mt-4"
              >
                Book Your First Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {formatDate(appointment.appointmentDate)}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.appointmentTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{getLocationName(appointment)}</span>
                        </div>
                        {appointment.serviceFee && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Service Fee: KES {appointment.serviceFee}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span>Purpose: {appointment.purpose}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      {canReschedule(appointment.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRescheduleModal(appointment)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Appointment Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                View complete appointment information
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Date</Label>
                    <p className="font-medium">{formatDate(selectedAppointment.appointmentDate)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Time</Label>
                    <p className="font-medium">{selectedAppointment.appointmentTime}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Location Type</Label>
                    <p className="font-medium">
                      {selectedAppointment.locationType === 'RESOURCE_CENTER' ? 'Resource Center' : 'Outreach'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Location</Label>
                    <p className="font-medium">{getLocationName(selectedAppointment)}</p>
                    {selectedAppointment.outreachLocation?.address && (
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedAppointment.outreachLocation.address}
                      </p>
                    )}
                    {selectedAppointment.outreachLocation?.county && (
                      <p className="text-sm text-gray-600">
                        {selectedAppointment.outreachLocation.county}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Purpose</Label>
                    <p className="font-medium">{selectedAppointment.purpose}</p>
                  </div>
                  {selectedAppointment.notes && (
                    <div className="col-span-2">
                      <Label className="text-gray-500">Notes</Label>
                      <p className="font-medium">{selectedAppointment.notes}</p>
                    </div>
                  )}
                  {selectedAppointment.serviceFee && (
                    <div>
                      <Label className="text-gray-500">Service Fee</Label>
                      <p className="font-medium">KES {selectedAppointment.serviceFee}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-500">Created</Label>
                    <p className="font-medium">{formatDate(selectedAppointment.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              {selectedAppointment && canReschedule(selectedAppointment.status) && (
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openRescheduleModal(selectedAppointment);
                  }}
                >
                  Reschedule
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Modal */}
        <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Select a new date and time for your appointment
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reschedule-date">New Date</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => {
                      setRescheduleDate(e.target.value);
                      setRescheduleTime('');
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {rescheduleDate && (
                  <div>
                    <Label htmlFor="reschedule-time">New Time</Label>
                    {loadingSlots ? (
                      <div className="flex items-center gap-2 p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Loading available slots...</span>
                      </div>
                    ) : (
                      <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                        <SelectTrigger id="reschedule-time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots
                            .filter((slot) => slot.available)
                            .map((slot) => (
                              <SelectItem key={slot.time} value={slot.time}>
                                {slot.time}
                              </SelectItem>
                            ))}
                          {availableSlots.filter((slot) => slot.available).length === 0 && (
                            <SelectItem value="" disabled>
                              No slots available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleDate('');
                  setRescheduleTime('');
                }}
                disabled={rescheduling}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={rescheduling || !rescheduleDate || !rescheduleTime}
              >
                {rescheduling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  'Reschedule'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

