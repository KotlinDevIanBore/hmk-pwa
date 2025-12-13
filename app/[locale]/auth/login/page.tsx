'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Phone, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!phoneNumber) {
      newErrors.phoneNumber = t('auth.phoneRequired');
    } else if (!/^(?:\+?254|0)?[17]\d{8}$/.test(phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = t('auth.phoneInvalid');
    }
    
    if (!pin) {
      newErrors.pin = t('auth.pinRequired');
    } else if (!/^\d{4,6}$/.test(pin)) {
      newErrors.pin = t('auth.pinInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          pin,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('auth.loginFailed'));
      }
      
      toast({
        title: t('common.success'),
        description: t('auth.loginSuccess'),
      });
      
      // Redirect based on profile completion status
      if (data.user.profileComplete) {
        router.push(`/${locale}/dashboard`);
      } else {
        router.push(`/${locale}/profile/complete`);
      }
      
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('auth.loginFailed'),
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
            {t('auth.welcomeBack')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.login')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="pin">
                {t('auth.pin')}
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
                  aria-describedby={errors.pin ? 'pin-error' : undefined}
                  disabled={isLoading}
                />
              </div>
              {errors.pin && (
                <p id="pin-error" className="text-sm text-red-500" role="alert">
                  {errors.pin}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-end">
              <Link
                href={`/${locale}/auth/reset-pin`}
                className="text-sm text-primary hover:underline"
                tabIndex={isLoading ? -1 : 0}
              >
                {t('auth.forgotPin')}
              </Link>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.loggingIn')}
                </>
              ) : (
                t('auth.login')
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link
              href={`/${locale}/auth/register`}
              className="text-primary hover:underline font-medium"
            >
              {t('auth.register')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

