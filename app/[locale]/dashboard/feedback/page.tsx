'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Star, CheckCircle2, MessageSquare } from 'lucide-react';

const MAX_MESSAGE_LENGTH = 1000;
const MIN_MESSAGE_LENGTH = 10;

export default function FeedbackPage() {
  const _t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();

  // System Feedback State
  const [systemRating, setSystemRating] = useState<number>(0);
  const [systemMessage, setSystemMessage] = useState('');
  const [submittingSystem, setSubmittingSystem] = useState(false);

  // Service Feedback State
  const [serviceMessage, setServiceMessage] = useState('');
  const [submittingService, setSubmittingService] = useState(false);

  // Success State
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'system' | 'service' | null>(null);

  const handleSystemFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (systemRating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating from 1 to 5 stars',
        variant: 'error',
      });
      return;
    }

    if (systemMessage.length < MIN_MESSAGE_LENGTH) {
      toast({
        title: 'Message Too Short',
        description: `Please provide at least ${MIN_MESSAGE_LENGTH} characters`,
        variant: 'error',
      });
      return;
    }

    if (systemMessage.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: 'Message Too Long',
        description: `Message must not exceed ${MAX_MESSAGE_LENGTH} characters`,
        variant: 'error',
      });
      return;
    }

    setSubmittingSystem(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'system',
          rating: systemRating,
          message: systemMessage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccessType('system');
      setShowSuccess(true);
      setSystemRating(0);
      setSystemMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit feedback',
        variant: 'error',
      });
    } finally {
      setSubmittingSystem(false);
    }
  };

  const handleServiceFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (serviceMessage.length < MIN_MESSAGE_LENGTH) {
      toast({
        title: 'Message Too Short',
        description: `Please provide at least ${MIN_MESSAGE_LENGTH} characters`,
        variant: 'error',
      });
      return;
    }

    if (serviceMessage.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: 'Message Too Long',
        description: `Message must not exceed ${MAX_MESSAGE_LENGTH} characters`,
        variant: 'error',
      });
      return;
    }

    setSubmittingService(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'service',
          message: serviceMessage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccessType('service');
      setShowSuccess(true);
      setServiceMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit feedback',
        variant: 'error',
      });
    } finally {
      setSubmittingService(false);
    }
  };

  if (showSuccess) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-6">
                {successType === 'system'
                  ? 'Your system feedback has been submitted successfully. We appreciate your input!'
                  : 'Your service feedback has been submitted successfully. We appreciate your input!'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccess(false);
                    setSuccessType(null);
                  }}
                >
                  Submit More Feedback
                </Button>
                <Button onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Feedback</h1>
          <p className="text-gray-600 mt-1">
            Share your thoughts and help us improve
          </p>
        </div>

        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="system">
              <Star className="mr-2 h-4 w-4" />
              System Feedback
            </TabsTrigger>
            <TabsTrigger value="service">
              <MessageSquare className="mr-2 h-4 w-4" />
              Service/Process Feedback
            </TabsTrigger>
          </TabsList>

          {/* System Feedback Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Feedback</CardTitle>
                <CardDescription>
                  Rate your experience with the HMK PWA system (1-5 stars) and share your thoughts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSystemFeedback} className="space-y-6">
                  <div>
                    <Label htmlFor="rating">Rating *</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setSystemRating(rating)}
                          className={`p-2 rounded transition-colors ${
                            rating <= systemRating
                              ? 'text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                          aria-label={`Rate ${rating} out of 5 stars`}
                        >
                          <Star
                            className={`h-8 w-8 ${
                              rating <= systemRating ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                      ))}
                      {systemRating > 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                          {systemRating} out of 5 stars
                        </span>
                      )}
                    </div>
                    {systemRating === 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        Please select a rating
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="system-message">Your Feedback *</Label>
                    <Textarea
                      id="system-message"
                      value={systemMessage}
                      onChange={(e) => setSystemMessage(e.target.value)}
                      placeholder="Tell us about your experience with the system..."
                      rows={6}
                      className="mt-2"
                      maxLength={MAX_MESSAGE_LENGTH}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600">
                        {systemMessage.length < MIN_MESSAGE_LENGTH
                          ? `Minimum ${MIN_MESSAGE_LENGTH} characters required (${systemMessage.length}/${MIN_MESSAGE_LENGTH})`
                          : `${systemMessage.length}/${MAX_MESSAGE_LENGTH} characters`}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingSystem || systemRating === 0 || systemMessage.length < MIN_MESSAGE_LENGTH}
                    className="w-full"
                  >
                    {submittingSystem ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service/Process Feedback Tab */}
          <TabsContent value="service">
            <Card>
              <CardHeader>
                <CardTitle>Service/Process Feedback</CardTitle>
                <CardDescription>
                  Share your feedback about our services, processes, or any suggestions for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleServiceFeedback} className="space-y-6">
                  <div>
                    <Label htmlFor="service-message">Your Feedback *</Label>
                    <Textarea
                      id="service-message"
                      value={serviceMessage}
                      onChange={(e) => setServiceMessage(e.target.value)}
                      placeholder="Share your thoughts about our services, processes, or suggestions for improvement..."
                      rows={8}
                      className="mt-2"
                      maxLength={MAX_MESSAGE_LENGTH}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600">
                        {serviceMessage.length < MIN_MESSAGE_LENGTH
                          ? `Minimum ${MIN_MESSAGE_LENGTH} characters required (${serviceMessage.length}/${MIN_MESSAGE_LENGTH})`
                          : `${serviceMessage.length}/${MAX_MESSAGE_LENGTH} characters`}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingService || serviceMessage.length < MIN_MESSAGE_LENGTH}
                    className="w-full"
                  >
                    {submittingService ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

