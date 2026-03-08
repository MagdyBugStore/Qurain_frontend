/**
 * Save Qualifications Use Case
 * Updates teacher's qualifications
 */

import type { ITeacherRepository } from '../../domain/interfaces/ITeacherRepository';
import type { Qualification } from '../../domain/entities/Qualification';

export class SaveQualifications {
  constructor(private repository: ITeacherRepository) {}

  async execute(applicationId: string, qualifications: Qualification[]): Promise<void> {
    await this.repository.saveQualifications(applicationId, qualifications);
  }
}
