'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

type LocationType = 'RESOURCE_CENTER' | 'OUTREACH';

interface TimeSlot {
  time: string;
  available: boolean;
  availableForAgeGroup?: '<15' | '15+';
  slotCount?: number;
}

interface OutreachLocation {
  id: string;
  name: string;
  county: string;
  subCounty?: string | null;
  address?: string | null;
}

export default function BookAppointmentPage() {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();

  const [locationType, setLocationType] = useState<LocationType | ''>('');
  const [outreachLocationId, setOutreachLocationId] = useState<string>('');
  const [outreachLocations, setOutreachLocations] = useState<OutreachLocation[]>([]);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showServiceFeeDialog, setShowServiceFeeDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  // Fetch outreach locations when location type is OUTREACH
  useEffect(() => {
    if (locationType === 'OUTREACH') {
      fetchOutreachLocations();
    }
  }, [locationType]);

  // Fetch available slots when date or location changes
  useEffect(() => {
    if (date && locationType && (locationType === 'RESOURCE_CENTER' || outreachLocationId)) {
      fetchAvailability();
    } else {
      setAvailableSlots([]);
      setTime('');
    }
  }, [date, locationType, outreachLocationId]);

  const fetchOutreachLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch('/api/outreach-locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setOutreachLocations(data.locations || []);
    } catch {
      toast({
        title: t('common.error'),
        description: 'Failed to load outreach locations',
        variant: 'error',
      });
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchAvailability = async () => {
    if (!date || !locationType) return;

    setLoadingSlots(true);
    setTime('');
    try {
      const params = new URLSearchParams({
        date,
        locationType,
      });
      
      if (locationType === 'OUTREACH' && outreachLocationId) {
        params.append('outreachLocationId', outreachLocationId);
      }

      const response = await fetch(`/api/appointments/availability?${params}`);
      if (!response.ok) throw new Error('Failed to check availability');
      
      const data = await response.json();
      
      if (!data.dateAvailable) {
        toast({
          title: t('appointments.dateNotAvailable'),
          description: data.message || 'Please select another date',
          variant: 'error',
        });
        setAvailableSlots([]);
      } else {
        setAvailableSlots(data.slots || []);
      }
    } catch {
      toast({
        title: t('common.error'),
        description: 'Failed to check availability',
        variant: 'error',
      });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleLocationTypeChange = (value: LocationType) => {
    setLocationType(value);
    setOutreachLocationId('');
    setDate('');
    setTime('');
    setAvailableSlots([]);
  };

  const handleBooking = async () => {
    // Validation
    if (!locationType) {
      toast({
        title: t('common.error'),
        description: 'Please select a location type',
        variant: 'error',
      });
      return;
    }

    if (locationType === 'OUTREACH' && !outreachLocationId) {
      toast({
        title: t('common.error'),
        description: 'Please select an outreach location',
        variant: 'error',
      });
      return;
    }

    if (!date) {
      toast({
        title: t('common.error'),
        description: 'Please select a date',
        variant: 'error',
      });
      return;
    }

    if (!time) {
      toast({
        title: t('common.error'),
        description: 'Please select a time',
        variant: 'error',
      });
      return;
    }

    if (!purpose.trim()) {
      toast({
        title: t('common.error'),
        description: 'Please provide a purpose for the appointment',
        variant: 'error',
      });
      return;
    }

    // Show service fee dialog for Resource Center
    if (locationType === 'RESOURCE_CENTER') {
      setShowServiceFeeDialog(true);
      return; // Wait for user confirmation
    } else {
      proceedWithBooking();
    }
  };

  const proceedWithBooking = async () => {
    setBooking(true);
    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentDate: date,
          appointmentTime: time,
          locationType,
          outreachLocationId: locationType === 'OUTREACH' ? outreachLocationId : undefined,
          purpose: purpose.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data._error || 'Failed to book appointment');
      }

      setCreatedAppointment(data.appointment);
      setShowConfirmation(true);
      setShowServiceFeeDialog(false);

      toast({
        title: t('appointments.appointmentBooked'),
        description: 'Your appointment has been confirmed',
        variant: 'success',
      });

    } catch (_error: any) {
      toast({
        title: t('common.error'),
        description: _error.message || 'Failed to book appointment',
        variant: 'error',
      });
    } finally {
      setBooking(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    router.push('/dashboard/appointments');
  };

  const _selectedLocation = outreachLocations.find(loc => loc.id === outreachLocationId);
  const selectedSlot = availableSlots.find(slot => slot.time === time);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('appointments.bookAppointment')}</h1>
          <p className="text-muted-foreground mt-2">
            Book an appointment at Resource Center or an Outreach location
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>
              Fill in the details below to book your appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="locationType">{t('appointments.locationType')}</Label>
              <Select value={locationType} onValueChange={handleLocationTypeChange}>
                <SelectTrigger id="locationType">
                  <SelectValue placeholder={t('appointments.selectLocation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESOURCE_CENTER">
                    {t('appointments.resourceCenter')} - {t('appointments.resourceCenterDays')}
                  </SelectItem>
                  <SelectItem value="OUTREACH">
                    {t('appointments.outreach')} - {t('appointments.outreachDays')}
                  </SelectItem>
                </SelectContent>
              </Select>
              {locationType === 'RESOURCE_CENTER' && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {t('appointments.serviceFeeInfo')}
                </p>
              )}
            </div>

            {/* Outreach Location Selection */}
            {locationType === 'OUTREACH' && (
              <div className="space-y-2">
                <Label htmlFor="outreachLocation">{t('appointments.selectOutreachLocation')}</Label>
                {loadingLocations ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading locations...
                  </div>
                ) : (
                  <Select
                    value={outreachLocationId}
                    onValueChange={setOutreachLocationId}
                    disabled={loadingLocations}
                  >
                    <SelectTrigger id="outreachLocation">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {outreachLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} - {location.county}
                          {location.subCounty && `, ${location.subCounty}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date">{t('appointments.appointmentDate')}</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                  disabled={!locationType || (locationType === 'OUTREACH' && !outreachLocationId)}
                />
              </div>
              {date && loadingSlots && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('appointments.loadingSlots')}
                </p>
              )}
            </div>

            {/* Time Slot Selection */}
            {availableSlots.length > 0 && (
              <div className="space-y-2">
                <Label>{t('appointments.appointmentTime')}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setTime(slot.time)}
                      disabled={!slot.available}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${slot.available
                          ? time === slot.time
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                        }
                      `}
                      aria-pressed={time === slot.time}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{slot.time}</span>
                      </div>
                      {slot.available && slot.slotCount !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {slot.slotCount} {slot.slotCount === 1 ? 'slot' : 'slots'}
                        </p>
                      )}
                      {!slot.available && (
                        <p className="text-xs text-muted-foreground mt-1">Full</p>
                      )}
                    </button>
                  ))}
                </div>
                {locationType === 'RESOURCE_CENTER' && selectedSlot?.availableForAgeGroup && (
                  <p className="text-sm text-muted-foreground">
                    Available for age group: {selectedSlot.availableForAgeGroup}
                  </p>
                )}
              </div>
            )}

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">{t('appointments.purpose')} *</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder={t('appointments.purposePlaceholder')}
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t('appointments.notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('appointments.notesPlaceholder')}
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleBooking}
              disabled={booking || !locationType || !date || !time || !purpose.trim()}
              className="w-full"
              size="lg"
            >
              {booking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('appointments.bookNow')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Service Fee Dialog */}
        <Dialog open={showServiceFeeDialog} onOpenChange={setShowServiceFeeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('appointments.serviceFee')}</DialogTitle>
              <DialogDescription>
                {t('appointments.serviceFeeNotice', { amount: '500' })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowServiceFeeDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={proceedWithBooking} disabled={booking}>
                {booking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  t('common.confirm')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Booking Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {t('appointments.bookingConfirmed')}
              </DialogTitle>
              <DialogDescription>
                {t('appointments.appointmentBooked')}
              </DialogDescription>
            </DialogHeader>
            {createdAppointment && (
              <div className="space-y-3 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(createdAppointment.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{createdAppointment.appointmentTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {createdAppointment.location || createdAppointment.outreachLocation?.name}
                  </span>
                </div>
                {createdAppointment.serviceFee && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Service Fee: </span>
                    <span className="font-medium">KES {createdAppointment.serviceFee}</span>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleConfirmationClose} className="w-full">
                {t('common.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

