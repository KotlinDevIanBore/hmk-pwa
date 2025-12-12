'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Phone, MapPin, CreditCard, Heart, Calendar, Edit, Lock, Loader2 } from 'lucide-react';
import type { User as UserType } from '@prisma/client';

interface Beneficiary {
  id: string;
  relationship: string;
  pwd: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    disabilityType: string;
  };
}

interface Caregiver {
  id: string;
  relationship: string;
  caregiver: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

interface ProfileData extends Omit<UserType, 'pinHash' | 'pin'> {
  beneficiaries: Beneficiary[];
  caregivers: Caregiver[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/users/profile');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }
      
      setProfile(data.profile);
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

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatIdType = (idType: string | null) => {
    if (!idType) return 'Not provided';
    return idType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDisabilityType = (type: string | null) => {
    if (!type) return 'Not specified';
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  const formatRelationship = (relationship: string) => {
    return relationship.charAt(0) + relationship.slice(1).toLowerCase();
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

  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Failed to load profile</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/profile/edit')}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/profile/change-pin')}
          >
            <Lock className="mr-2 h-4 w-4" />
            Change PIN
          </Button>
        </div>
      </div>

      {/* Personal Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {profile.firstName} {profile.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{profile.phoneNumber}</p>
                {profile.phoneVerified && (
                  <span className="text-xs text-green-600">✓ Verified</span>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Age / Date of Birth</p>
                <p className="font-medium">
                  {profile.age ? `${profile.age} years` : formatDate(profile.dateOfBirth)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">
                  {profile.gender?.replace(/_/g, ' ') || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">
                  {profile.role === 'PWD' ? 'Person with Disability' : 'Caregiver'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Where you are based</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">County</p>
                <p className="font-medium">{profile.county || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Sub-County</p>
                <p className="font-medium">{profile.subCounty || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Ward</p>
                <p className="font-medium">{profile.ward || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Village</p>
                <p className="font-medium">{profile.village || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ID Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Identification</CardTitle>
          <CardDescription>Your ID details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">ID Type</p>
                <p className="font-medium">{formatIdType(profile.idType)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">ID Number</p>
                <p className="font-medium">{profile.idNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disability Information (for PWDs) */}
      {profile.role === 'PWD' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Disability Information</CardTitle>
            <CardDescription>Details about your disability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <Heart className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Disability Type</p>
                <p className="font-medium">{formatDisabilityType(profile.disabilityType)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Beneficiaries (for Caregivers) */}
      {profile.role === 'CAREGIVER' && profile.beneficiaries.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Beneficiaries</CardTitle>
            <CardDescription>People you care for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.beneficiaries.map((beneficiary) => (
                <div
                  key={beneficiary.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {beneficiary.pwd.firstName} {beneficiary.pwd.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatRelationship(beneficiary.relationship)} •{' '}
                      {formatDisabilityType(beneficiary.pwd.disabilityType)}
                    </p>
                    <p className="text-sm text-gray-500">{beneficiary.pwd.phoneNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Caregivers (for PWDs) */}
      {profile.role === 'PWD' && profile.caregivers.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Caregivers</CardTitle>
            <CardDescription>People caring for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.caregivers.map((caregiverLink) => (
                <div
                  key={caregiverLink.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {caregiverLink.caregiver.firstName} {caregiverLink.caregiver.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatRelationship(caregiverLink.relationship)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {caregiverLink.caregiver.phoneNumber}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Profile Status</p>
              <p className="font-medium">
                {profile.profileComplete ? (
                  <span className="text-green-600">✓ Complete</span>
                ) : (
                  <span className="text-yellow-600">Incomplete</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="font-medium">
                {profile.isActive ? (
                  <span className="text-green-600">✓ Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">{formatDate(profile.createdAt)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Last Login</p>
              <p className="font-medium">{formatDate(profile.lastLogin)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

