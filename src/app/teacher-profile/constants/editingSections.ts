/**
 * Editing section type definitions
 */

export type EditingSection = 
  | 'personalInfo' 
  | 'about' 
  | 'benefits' 
  | 'sessionContent' 
  | 'qualifications' 
  | 'ijazahs' 
  | 'availability' 
  | 'reviews';

export interface EditingStates {
  personalInfo: boolean;
  about: boolean;
  benefits: boolean;
  sessionContent: boolean;
  qualifications: boolean;
  ijazahs: boolean;
  availability: boolean;
  reviews: boolean;
}

export const INITIAL_EDITING_STATES: EditingStates = {
  personalInfo: false,
  about: false,
  benefits: false,
  sessionContent: false,
  qualifications: false,
  ijazahs: false,
  availability: false,
  reviews: false,
};
