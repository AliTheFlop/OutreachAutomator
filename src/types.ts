export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  [key: string]: any;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  createdAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  contactIds: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt?: Date;
  createdAt: Date;
  dailyLimit: number;
  delayBetweenEmails: number; // in minutes
}

export interface EmailSend {
  id: string;
  campaignId: string;
  contactId: string;
  sentAt: Date;
  opened: boolean;
  clicked: boolean;
  trackingPixelId: string;
}