/**
 * Save Availability Use Case
 * Updates teacher's weekly availability schedule
 */

import type { ITeacherRepository } from '../../domain/interfaces/ITeacherRepository';
import type { Availability } from '../../domain/entities/Availability';

export class SaveAvailability {
  constructor(private repository: ITeacherRepository) {}

  async execute(availability: Availability): Promise<void> {
    await this.repository.saveAvailability(availability);
  }
}
