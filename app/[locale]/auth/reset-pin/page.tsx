'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Phone, Lock, Loader2 } from 'lucide-react';

type Step = 'phone' | 'otp' | 'newPin';

export default function ResetPinPage() {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [newPin, setNewPin] = useState('');
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

  const validatePin = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!newPin) {
      newErrors.newPin = t('auth.pinRequired');
    } else if (!/^\d{4,6}$/.test(newPin)) {
      newErrors.newPin = t('auth.pinInvalid');
    }
    
    if (!confirmPin) {
      newErrors.confirmPin = t('auth.confirmPin') + ' ' + t('auth.phoneRequired').toLowerCase();
    } else if (newPin !== confirmPin) {
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
          purpose: 'pin_reset',
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
          purpose: 'pin_reset',
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
      setStep('newPin');
      
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

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePin()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          userId,
          newPin,
          confirmPin,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('auth.pinResetFailed'));
      }
      
      toast({
        title: t('common.success'),
        description: t('auth.pinResetSuccess'),
      });
      
      router.push('/auth/login');
      
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('auth.pinResetFailed'),
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
            {step === 'phone' && t('auth.resetPin')}
            {step === 'otp' && t('auth.verifyOtp')}
            {step === 'newPin' && t('auth.createPin')}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'phone' && t('auth.enterPhone')}
            {step === 'otp' && t('auth.enterOtp')}
            {step === 'newPin' && 'Enter your new PIN'}
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

          {step === 'newPin' && (
            <form onSubmit={handleResetPin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPin">
                  {t('auth.createPin')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder={t('auth.enterPin')}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className={`pl-10 ${errors.newPin ? 'border-red-500' : ''}`}
                    aria-invalid={!!errors.newPin}
                    disabled={isLoading}
                  />
                </div>
                {errors.newPin && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors.newPin}
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
                    {t('auth.resettingPin')}
                  </>
                ) : (
                  t('auth.resetPin')
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-600">
            <Link
              href="/auth/login"
              className="text-primary hover:underline font-medium"
            >
              {t('common.back')} to {t('auth.login')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

