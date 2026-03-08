/**
 * Availability Domain Entity
 * Represents teacher's weekly schedule availability
 */

export type SlotStatus = 'available' | 'booked' | null;

export interface Availability {
  teacherId: string;
  schedule: SlotStatus[][]; // [day][timeSlot] - 7 days x 12 time slots
  updatedAt?: any;
}
