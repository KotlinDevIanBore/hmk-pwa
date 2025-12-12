'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { User, Lock, Mail, Calendar, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { validateIdNumber, getIdValidationMessage } from '@/lib/validation';

interface PWDRegistrationFormProps {
  phoneNumber: string;
  onSuccess?: () => void;
}

export function PWDRegistrationForm({ phoneNumber, onSuccess }: PWDRegistrationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<string>('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [ward, setWard] = useState('');
  const [village, setVillage] = useState('');
  const [idType, setIdType] = useState<string>('NATIONAL_ID');
  const [idNumber, setIdNumber] = useState('');
  const [disabilityType, setDisabilityType] = useState<string>('MOBILITY');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim() || firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!lastName.trim() || lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (age && (parseInt(age) < 0 || parseInt(age) > 120)) {
      newErrors.age = 'Age must be between 0 and 120';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!county.trim()) {
      newErrors.county = 'County is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!idType) {
      newErrors.idType = 'ID type is required';
    }
    
    if (!idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    } else if (!validateIdNumber(idType, idNumber)) {
      newErrors.idNumber = getIdValidationMessage(idType);
    }
    
    if (!disabilityType) {
      newErrors.disabilityType = 'Disability type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!pin || !/^\d{4,6}$/.test(pin)) {
      newErrors.pin = 'PIN must be 4-6 digits';
    }
    
    if (!confirmPin) {
      newErrors.confirmPin = 'Please confirm your PIN';
    } else if (pin !== confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }
    
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep4()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/users/register-pwd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          firstName,
          lastName,
          email: email || undefined,
          age: age ? parseInt(age) : undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          county,
          subCounty: subCounty || undefined,
          ward: ward || undefined,
          village: village || undefined,
          idType,
          idNumber,
          disabilityType,
          pin,
          confirmPin,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      toast({
        title: 'Success',
        description: 'Registration completed successfully!',
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Registration failed',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex-1 h-2 rounded ${
              step <= currentStep ? 'bg-primary' : 'bg-gray-200'
            } ${step < 4 ? 'mr-2' : ''}`}
          />
        ))}
      </div>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.firstName}
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-red-500" role="alert">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.lastName}
                />
              </div>
              {errors.lastName && (
                <p className="text-sm text-red-500" role="alert">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500" role="alert">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={errors.age ? 'border-red-500' : ''}
                aria-invalid={!!errors.age}
              />
              {errors.age && (
                <p className="text-sm text-red-500" role="alert">{errors.age}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="pl-10"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender" className={errors.gender ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
                <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-500" role="alert">{errors.gender}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Location Information */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="county">County *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className={`pl-10 ${errors.county ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.county}
              />
            </div>
            {errors.county && (
              <p className="text-sm text-red-500" role="alert">{errors.county}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subCounty">Sub-County</Label>
            <Input
              id="subCounty"
              value={subCounty}
              onChange={(e) => setSubCounty(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ward">Ward</Label>
            <Input
              id="ward"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="village">Village</Label>
            <Input
              id="village"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 3: ID and Disability Information */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ID & Disability Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="idType">ID Type *</Label>
            <Select value={idType} onValueChange={setIdType}>
              <SelectTrigger id="idType" className={errors.idType ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                <SelectItem value="PASSPORT">Passport</SelectItem>
                <SelectItem value="BIRTH_CERTIFICATE">Birth Certificate</SelectItem>
                <SelectItem value="NCPWD">NCPWD Card</SelectItem>
              </SelectContent>
            </Select>
            {errors.idType && (
              <p className="text-sm text-red-500" role="alert">{errors.idType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                className={`pl-10 ${errors.idNumber ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.idNumber}
              />
            </div>
            {errors.idNumber && (
              <p className="text-sm text-red-500" role="alert">{errors.idNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="disabilityType">Disability Type *</Label>
            <Select value={disabilityType} onValueChange={setDisabilityType}>
              <SelectTrigger id="disabilityType" className={errors.disabilityType ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOBILITY">Mobility</SelectItem>
                <SelectItem value="VISUAL">Visual</SelectItem>
                <SelectItem value="HEARING">Hearing</SelectItem>
                <SelectItem value="COGNITIVE">Cognitive</SelectItem>
                <SelectItem value="MULTIPLE">Multiple</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.disabilityType && (
              <p className="text-sm text-red-500" role="alert">{errors.disabilityType}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 4: PIN Setup */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Set Your PIN</h3>
          
          <div className="space-y-2">
            <Label htmlFor="pin">Create PIN (4-6 digits) *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className={`pl-10 ${errors.pin ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.pin}
              />
            </div>
            {errors.pin && (
              <p className="text-sm text-red-500" role="alert">{errors.pin}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm PIN *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className={`pl-10 ${errors.confirmPin ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.confirmPin}
              />
            </div>
            {errors.confirmPin && (
              <p className="text-sm text-red-500" role="alert">{errors.confirmPin}</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        
        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="ml-auto"
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isLoading}
            className="ml-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Complete Registration'
            )}
          </Button>
        )}
      </div>
    </form>
  );
}


