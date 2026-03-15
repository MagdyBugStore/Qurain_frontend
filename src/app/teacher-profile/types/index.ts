/**
 * Local type definitions for teacher profile page
 */

export interface Benefit {
  title: string;
  subject: string;
}

export interface SessionContentItem {
  title: string;
  subject: string;
}

export interface Ijazah {
  id?: string;
  title: string;
  description: string;
  image: string;
}

export interface SaveMessage {
  type: 'success' | 'error';
  text: string;
}

export type QuickTab = 'personal' | 'wallet' | 'support' | null;

export type SubTab = 'content' | 'qualifications' | 'availability' | 'reviews' | null;
