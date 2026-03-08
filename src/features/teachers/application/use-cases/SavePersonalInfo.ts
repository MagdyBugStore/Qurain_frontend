/**
 * Save Personal Info Use Case
 * Updates teacher's personal information (teaching style, session content, intro video)
 */

import type { ITeacherRepository } from '../../domain/interfaces/ITeacherRepository';
import type { TeacherApplication } from '../../../../shared/types/teacher.types';

export interface PersonalInfoData {
  teachingStyle: string;
  sessionContent: string;
  introVideo: string;
}

export class SavePersonalInfo {
  constructor(private repository: ITeacherRepository) {}

  async execute(applicationId: string, data: PersonalInfoData): Promise<void> {
    await this.repository.updateApplication(applicationId, {
      teachingStyle: data.teachingStyle,
      sessionContent: data.sessionContent,
      introVideo: data.introVideo,
    });
  }
}
