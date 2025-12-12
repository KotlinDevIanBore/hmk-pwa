/**
 * Type definitions for the HMK PWA application
 */

import { User, Appointment, MobilityDevice, ServiceRequest, Assessment } from '@prisma/client';

// Re-export Prisma types
export type {
  User,
  UserRole,
  DisabilityType,
  Gender,
  IdType,
  Relationship,
  Appointment,
  AppointmentStatus,
  MobilityDevice,
  ServiceRequest,
  ServiceType,
  ServiceStatus,
  Assessment,
  AssessmentStatus,
  Beneficiary,
  OtpLog,
  AdminUser,
  AdminRole,
  SmsLog,
  Feedback,
  OutreachLocation,
  UssdCallback,
} from '@prisma/client';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface LoginFormData {
  phoneNumber: string;
  pin: string;
}

export interface RegisterFormData {
  phoneNumber: string;
  role: 'PWD' | 'CAREGIVER';
  firstName?: string;
  lastName?: string;
}

export interface VerifyOtpFormData {
  phoneNumber: string;
  otp: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  nationalId?: string;
  disabilityType?: string;
  county: string;
  subCounty?: string;
  ward?: string;
  village?: string;
  preferredLanguage: 'en' | 'sw';
}

export interface AppointmentFormData {
  appointmentDate: Date;
  appointmentTime: string;
  location: string;
  purpose: string;
}

export interface ServiceRequestFormData {
  serviceType: 'OPERATIONAL' | 'SPIRITUAL';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface FeedbackFormData {
  rating?: number;
  category?: string;
  message: string;
}

// Extended types with relations
export interface UserWithRelations extends User {
  appointments?: Appointment[];
  serviceRequests?: ServiceRequest[];
  assessments?: Assessment[];
}

export interface AppointmentWithUser extends Appointment {
  user: User;
}

export interface ServiceRequestWithUser extends ServiceRequest {
  user: User;
}

// Utility types
export type Locale = 'en' | 'sw';

export type FontSize = 'normal' | 'large' | 'xlarge';

export interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  reducedMotion: boolean;
}

// Auth types
export interface AuthUser {
  id: string;
  phoneNumber: string;
  role: 'PWD' | 'CAREGIVER';
  firstName?: string;
  lastName?: string;
  profileComplete: boolean;
  preferredLanguage: string;
}

export interface Session {
  user: AuthUser;
  expires: string;
}

// OTP types
export interface OtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentFilters extends SearchParams {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ServiceRequestFilters extends SearchParams {
  serviceType?: 'OPERATIONAL' | 'SPIRITUAL';
  status?: string;
  priority?: string;
}

// Dashboard types
export interface DashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  pendingServices: number;
  completedServices: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'appointment' | 'service' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}


