'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ChangePinPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!currentPin) {
      newErrors.currentPin = 'Current PIN is required';
    } else if (!/^\d{4,6}$/.test(currentPin)) {
      newErrors.currentPin = 'PIN must be 4-6 digits';
    }
    
    if (!newPin) {
      newErrors.newPin = 'New PIN is required';
    } else if (!/^\d{4,6}$/.test(newPin)) {
      newErrors.newPin = 'PIN must be 4-6 digits';
    } else if (newPin === currentPin) {
      newErrors.newPin = 'New PIN must be different from current PIN';
    }
    
    if (!confirmNewPin) {
      newErrors.confirmNewPin = 'Please confirm your new PIN';
    } else if (newPin !== confirmNewPin) {
      newErrors.confirmNewPin = 'PINs do not match';
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
      const response = await fetch('/api/users/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPin,
          newPin,
          confirmNewPin,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change PIN');
      }
      
      toast({
        title: 'Success',
        description: 'Your PIN has been changed successfully',
      });
      
      // Clear form
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
      
      // Redirect to profile after a short delay
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change PIN',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/profile')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Change PIN</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Your PIN</CardTitle>
          <CardDescription>
            Create a new 4-6 digit PIN to secure your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current PIN */}
            <div className="space-y-2">
              <Label htmlFor="currentPin">Current PIN *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="currentPin"
                  type={showCurrentPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                  className={`pl-10 pr-10 ${errors.currentPin ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.currentPin}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showCurrentPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPin && (
                <p className="text-sm text-red-500" role="alert">{errors.currentPin}</p>
              )}
            </div>

            <div className="border-t pt-6">
              {/* New PIN */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="newPin">New PIN (4-6 digits) *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPin"
                    type={showNewPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className={`pl-10 pr-10 ${errors.newPin ? 'border-red-500' : ''}`}
                    aria-invalid={!!errors.newPin}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showNewPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPin && (
                  <p className="text-sm text-red-500" role="alert">{errors.newPin}</p>
                )}
              </div>

              {/* Confirm New PIN */}
              <div className="space-y-2">
                <Label htmlFor="confirmNewPin">Confirm New PIN *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmNewPin"
                    type={showConfirmPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                    className={`pl-10 pr-10 ${errors.confirmNewPin ? 'border-red-500' : ''}`}
                    aria-invalid={!!errors.confirmNewPin}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmNewPin && (
                  <p className="text-sm text-red-500" role="alert">{errors.confirmNewPin}</p>
                )}
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">
                PIN Security Tips:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Use a unique PIN that you haven&apos;t used elsewhere</li>
                <li>Avoid using obvious numbers like 1234 or your birth year</li>
                <li>Don&apos;t share your PIN with anyone</li>
                <li>Change your PIN regularly</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/profile')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing PIN...
                  </>
                ) : (
                  'Change PIN'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

