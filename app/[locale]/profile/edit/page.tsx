'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Calendar, MapPin, Loader2, ArrowLeft } from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [ward, setWard] = useState('');
  const [village, setVillage] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/users/profile');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }
      
      const prof = data.profile;
      
      // Populate form fields
      setFirstName(prof.firstName || '');
      setLastName(prof.lastName || '');
      setEmail(prof.email || '');
      setDateOfBirth(prof.dateOfBirth ? new Date(prof.dateOfBirth).toISOString().split('T')[0] : '');
      setGender(prof.gender || '');
      setCounty(prof.county || '');
      setSubCounty(prof.subCounty || '');
      setWard(prof.ward || '');
      setVillage(prof.village || '');
      setPreferredLanguage(prof.preferredLanguage || 'en');
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load profile',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (firstName && firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (lastName && lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          email: email || undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender: gender || undefined,
          county: county || undefined,
          subCounty: subCounty || undefined,
          ward: ward || undefined,
          village: village || undefined,
          preferredLanguage,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      
      router.push('/profile');
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/profile')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
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
                <Label htmlFor="lastName">Last Name</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Update your location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="county"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCounty">Sub-County</Label>
              <Input
                id="subCounty"
                value={subCounty}
                onChange={(e) => setSubCounty(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Your app preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="preferredLanguage">Preferred Language</Label>
              <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                <SelectTrigger id="preferredLanguage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Kiswahili</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/profile')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

