'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Phone, User, Lock, Loader2 } from 'lucide-react';

type Step = 'phone' | 'otp' | 'details';
type Role = 'PWD' | 'CAREGIVER';
type DisabilityType = 'MOBILITY' | 'VISUAL' | 'HEARING' | 'COGNITIVE' | 'MULTIPLE' | 'OTHER';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<Role>('PWD');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [disabilityType, setDisabilityType] = useState<DisabilityType>('MOBILITY');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!phoneNumber) {
      newErrors.phoneNumber = t('auth.phoneRequired');
    } else if (!/^(?:\+?254|0)?[17]\d{8}$/.test(phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = t('auth.phoneInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!otp) {
      newErrors.otp = t('auth.otpRequired');
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = t('auth.otpInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDetails = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = t('profile.firstName') + ' ' + t('auth.phoneRequired').toLowerCase();
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = t('profile.lastName') + ' ' + t('auth.phoneRequired').toLowerCase();
    }
    
    if (!pin) {
      newErrors.pin = t('auth.pinRequired');
    } else if (!/^\d{4,6}$/.test(pin)) {
      newErrors.pin = t('auth.pinInvalid');
    }
    
    if (!confirmPin) {
      newErrors.confirmPin = t('auth.confirmPin') + ' ' + t('auth.phoneRequired').toLowerCase();
    } else if (pin !== confirmPin) {
      newErrors.confirmPin = t('auth.pinMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          purpose: 'registration',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('common.error'));
      }
      
      toast({
        title: t('common.success'),
        description: t('auth.otpSent'),
      });
      
      setStep('otp');
      
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.error'),
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOtp()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otp,
          purpose: 'registration',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('auth.otpInvalid'));
      }
      
      toast({
        title: t('common.success'),
        description: t('auth.otpVerified'),
      });
      
      setUserId(data.userId);
      setStep('details');
      
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('auth.otpInvalid'),
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDetails()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          pin,
          confirmPin,
          role,
          firstName,
          lastName,
          disabilityType: role === 'PWD' ? disabilityType : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('auth.registrationFailed'));
      }
      
      toast({
        title: t('common.success'),
        description: t('auth.registrationSuccess'),
      });
      
      router.push('/profile/complete');
      
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('auth.registrationFailed'),
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === 'phone' && t('auth.createAccount')}
            {step === 'otp' && t('auth.verifyOtp')}
            {step === 'details' && t('auth.completeProfile')}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'phone' && t('auth.enterPhone')}
            {step === 'otp' && t('auth.enterOtp')}
            {step === 'details' && t('auth.roleDescription')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 'phone' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  {t('auth.phoneNumber')}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t('auth.enterPhone')}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`pl-10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    aria-invalid={!!errors.phoneNumber}
                    aria-describedby={errors.phoneNumber ? 'phone-error' : undefined}
                    disabled={isLoading}
                  />
                </div>
                {errors.phoneNumber && (
                  <p id="phone-error" className="text-sm text-red-500" role="alert">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.sendingOtp')}
                  </>
                ) : (
                  t('common.next')
                )}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">
                  {t('auth.otp')}
                </Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t('auth.enterOtp')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={`text-center text-2xl tracking-widest ${errors.otp ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.otp}
                  aria-describedby={errors.otp ? 'otp-error' : undefined}
                  disabled={isLoading}
                />
                {errors.otp && (
                  <p id="otp-error" className="text-sm text-red-500" role="alert">
                    {errors.otp}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.verifyingOtp')}
                  </>
                ) : (
                  t('auth.verifyOtp')
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('phone')}
                disabled={isLoading}
              >
                {t('common.back')}
              </Button>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">
                  {t('auth.chooseRole')}
                </Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as Role)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PWD">{t('auth.pwdRole')}</SelectItem>
                    <SelectItem value="CAREGIVER">{t('auth.caregiverRole')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'PWD' && (
                <div className="space-y-2">
                  <Label htmlFor="disabilityType">
                    {t('auth.disabilityTypeLabel')}
                  </Label>
                  <Select
                    value={disabilityType}
                    onValueChange={(value) => setDisabilityType(value as DisabilityType)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="disabilityType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOBILITY">{t('auth.mobilityDisability')}</SelectItem>
                      <SelectItem value="VISUAL">{t('auth.visualDisability')}</SelectItem>
                      <SelectItem value="HEARING">{t('auth.hearingDisability')}</SelectItem>
                      <SelectItem value="COGNITIVE">{t('auth.cognitiveDisability')}</SelectItem>
                      <SelectItem value="MULTIPLE">{t('auth.multipleDisabilities')}</SelectItem>
                      <SelectItem value="OTHER">{t('auth.otherDisability')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t('profile.firstName')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.firstName}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-500" role="alert">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t('profile.lastName')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.lastName}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-500" role="alert">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">
                  {t('auth.createPin')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder={t('auth.enterPin')}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className={`pl-10 ${errors.pin ? 'border-red-500' : ''}`}
                    aria-invalid={!!errors.pin}
                    disabled={isLoading}
                  />
                </div>
                {errors.pin && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors.pin}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPin">
                  {t('auth.confirmPin')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder={t('auth.confirmPin')}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className={`pl-10 ${errors.confirmPin ? 'border-red-500' : ''}`}
                    aria-invalid={!!errors.confirmPin}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPin && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors.confirmPin}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.registering')}
                  </>
                ) : (
                  t('auth.register')
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        {step === 'phone' && (
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-600">
              {t('auth.haveAccount')}{' '}
              <Link
                href="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                {t('auth.login')}
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

