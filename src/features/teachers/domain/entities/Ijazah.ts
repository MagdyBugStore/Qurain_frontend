/**
 * Ijazah Domain Entity
 * Represents a certification or authorization (إجازة)
 */

export interface Ijazah {
  id?: string;
  teacherId: string;
  title: string;
  description: string;
  image: string;
  createdAt?: any;
  updatedAt?: any;
}
