'use client';

import { useState } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Send, FileText } from 'lucide-react';

interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  variables: string[];
}

const defaultTemplates: SMSTemplate[] = [
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    message: 'Dear {name}, this is a reminder for your appointment on {date} at {time}. Location: {location}. Please arrive on time. - HMK',
    variables: ['name', 'date', 'time', 'location'],
  },
  {
    id: 'appointment-confirmation',
    name: 'Appointment Confirmation',
    message: 'Dear {name}, your appointment has been confirmed for {date} at {time}. Location: {location}. We look forward to seeing you. - HMK',
    variables: ['name', 'date', 'time', 'location'],
  },
  {
    id: 'status-update',
    name: 'Status Update',
    message: 'Dear {name}, your appointment status has been updated to {status}. {additional_info} - HMK',
    variables: ['name', 'status', 'additional_info'],
  },
  {
    id: 'follow-up',
    name: 'Follow-up Reminder',
    message: 'Dear {name}, this is a follow-up reminder. Please contact us if you need any assistance. - HMK',
    variables: ['name'],
  },
  {
    id: 'general-announcement',
    name: 'General Announcement',
    message: 'Dear {name}, {message} - HMK',
    variables: ['name', 'message'],
  },
];

export default function SMSTemplatesPage() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');
  const [customMessage, setCustomMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedTemplateData = selectedTemplate !== 'none' 
    ? defaultTemplates.find(t => t.id === selectedTemplate)
    : undefined;

  const handleSendSMS = async () => {
    if (!phoneNumber || !phoneNumber.match(/^\+?254[17]\d{8}$/)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid phone number',
        variant: 'error',
      });
      return;
    }

    if (selectedTemplate === 'none' && !customMessage) {
      toast({
        title: 'Error',
        description: 'Please select a template or enter a custom message',
        variant: 'error',
      });
      return;
    }

    setIsSending(true);
    try {
      const message = selectedTemplate !== 'none' && selectedTemplateData
        ? selectedTemplateData.message
        : customMessage;

      const response = await fetch('/api/admin/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message,
          purpose: selectedTemplate !== 'none' ? selectedTemplate : 'custom',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'SMS sent successfully',
        });
        setPhoneNumber('');
        setCustomMessage('');
        setSelectedTemplate('none');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send SMS',
        variant: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMS Templates</h1>
          <p className="mt-2 text-gray-600">
            Send SMS reminders and notifications using templates
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Templates List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Available Templates
              </CardTitle>
              <CardDescription>
                Select a template to use or create a custom message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {defaultTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setCustomMessage('');
                  }}
                >
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.message}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.variables.map((variable) => (
                      <span
                        key={variable}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {'{'}{variable}{'}'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Send SMS Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send SMS
              </CardTitle>
              <CardDescription>
                Send an SMS using a template or custom message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="template">Template</Label>
                <Select value={selectedTemplate} onValueChange={(value) => {
                  setSelectedTemplate(value);
                  if (value !== 'none') {
                    setCustomMessage('');
                  }
                }}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Custom Message)</SelectItem>
                    {defaultTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplateData && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Template Preview:</p>
                  <p className="text-sm text-gray-700">{selectedTemplateData.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Variables: {selectedTemplateData.variables.join(', ')}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="message">Custom Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter custom message or edit template..."
                  value={customMessage}
                  onChange={(e) => {
                    setCustomMessage(e.target.value);
                    if (e.target.value) setSelectedTemplate('none');
                  }}
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {customMessage.length} characters
                </p>
              </div>

              <Button
                onClick={handleSendSMS}
                disabled={isSending || (!phoneNumber || (selectedTemplate === 'none' && !customMessage))}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send SMS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
