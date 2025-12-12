'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Save, ArrowRight, ArrowLeft } from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple-choice' | 'open-ended' | 'yes-no';
  question: string;
  options?: string[];
  required: boolean;
}

// Dynamic questions based on disability type
const getQuestions = (disabilityType?: string): Question[] => {
  const baseQuestions: Question[] = [
    {
      id: 'disability-duration',
      type: 'multiple-choice',
      question: 'How long have you had this disability?',
      options: ['Less than 1 year', '1-5 years', '5-10 years', 'More than 10 years'],
      required: true,
    },
    {
      id: 'mobility-level',
      type: 'multiple-choice',
      question: 'What is your current mobility level?',
      options: ['Fully independent', 'Requires assistance', 'Wheelchair bound', 'Bedridden'],
      required: true,
    },
    {
      id: 'previous-devices',
      type: 'yes-no',
      question: 'Have you used mobility devices before?',
      required: true,
    },
    {
      id: 'device-experience',
      type: 'open-ended',
      question: 'If yes, please describe your experience with previous devices:',
      required: false,
    },
    {
      id: 'daily-activities',
      type: 'open-ended',
      question: 'What daily activities do you need assistance with?',
      required: true,
    },
    {
      id: 'living-situation',
      type: 'multiple-choice',
      question: 'What is your living situation?',
      options: ['Lives alone', 'Lives with family', 'Lives in care facility', 'Other'],
      required: true,
    },
    {
      id: 'caregiver-support',
      type: 'yes-no',
      question: 'Do you have a caregiver?',
      required: true,
    },
    {
      id: 'financial-assistance',
      type: 'yes-no',
      question: 'Do you need financial assistance for the device?',
      required: true,
    },
    {
      id: 'additional-needs',
      type: 'open-ended',
      question: 'Any additional information or special needs?',
      required: false,
    },
  ];

  // Add disability-specific questions
  if (disabilityType === 'MOBILITY') {
    baseQuestions.unshift({
      id: 'mobility-type',
      type: 'multiple-choice',
      question: 'What type of mobility impairment do you have?',
      options: ['Lower limb', 'Upper limb', 'Both', 'Spinal cord injury', 'Other'],
      required: true,
    });
  }

  return baseQuestions;
};

export default function AssessmentPage() {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const questions = getQuestions(user?.disabilityType);
  const progress = ((currentStep + 1) / questions.length) * 100;

  useEffect(() => {
    // Fetch user data
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push('/auth/login');
      });
  }, [router]);

  // Load saved assessment if exists
  useEffect(() => {
    fetch('/api/assessments?status=DRAFT')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.assessment?.responses) {
          setResponses(data.assessment.responses as Record<string, string>);
        }
      })
      .catch(() => {
        // No saved assessment, continue
      });
  }, []);

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion.required && !responses[currentQuestion.id]) {
      toast.toast({
        title: t('common.error'),
        description: 'Please answer this question before continuing',
        variant: 'error',
      });
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          status: 'DRAFT',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.toast({
          title: t('common.success'),
          description: 'Assessment saved. You can continue later.',
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.toast({
        title: t('common.error'),
        description: 'Failed to save assessment',
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          status: 'SUBMITTED',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.toast({
          title: t('common.success'),
          description: 'Assessment submitted successfully',
        });
        router.push('/dashboard/services/devices');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.toast({
        title: t('common.error'),
        description: 'Failed to submit assessment',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  const currentQuestion = questions[currentStep];
  const currentResponse = responses[currentQuestion.id] || '';

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            Disability Assessment Questionnaire
          </h1>
          <p className="mt-2 text-gray-600">
            Step {currentStep + 1} of {questions.length}
          </p>
        </div>

        {/* Progress indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>

        {/* Question card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.question}
              {currentQuestion.required && <span className="text-red-500"> *</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === 'multiple-choice' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option) => (
                  <label
                    key={option}
                    className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={currentResponse === option}
                      onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                      className="h-4 w-4 text-primary-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'yes-no' && (
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 flex-1">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value="yes"
                    checked={currentResponse === 'yes'}
                    onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 flex-1">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value="no"
                    checked={currentResponse === 'no'}
                    onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span>No</span>
                </label>
              </div>
            )}

            {currentQuestion.type === 'open-ended' && (
              <Textarea
                value={currentResponse}
                onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                placeholder="Enter your answer..."
                rows={4}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-4">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.back')}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save & Continue Later'}
            </Button>
            <Button onClick={handleNext} disabled={isLoading}>
              {currentStep === questions.length - 1 ? (
                <>
                  {t('common.submit')}
                  {isLoading ? '...' : ''}
                </>
              ) : (
                <>
                  {t('common.next')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

