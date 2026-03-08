/**
 * Save Ijazahs Use Case
 * Updates teacher's ijazahs (certifications)
 */

import type { ITeacherRepository } from '../../domain/interfaces/ITeacherRepository';
import type { Ijazah } from '../../domain/entities/Ijazah';

export class SaveIjazahs {
  constructor(private repository: ITeacherRepository) {}

  async execute(teacherId: string, ijazahs: Ijazah[]): Promise<void> {
    // Get current ijazahs to find which ones to delete
    const currentIjazahs = await this.repository.getIjazahs(teacherId);
    const currentIds = currentIjazahs.map(i => i.id).filter(Boolean) as string[];
    const newIds = ijazahs.map(i => i.id).filter(Boolean) as string[];
    
    // Delete removed ijazahs
    const toDelete = currentIds.filter(id => !newIds.includes(id));
    await Promise.all(toDelete.map(id => this.repository.deleteIjazah(id!)));

    // Add/update ijazahs
    await Promise.all(
      ijazahs.map(async (ijazah) => {
        if (ijazah.id) {
          // Update existing
          await this.repository.updateIjazah(ijazah.id, {
            title: ijazah.title,
            description: ijazah.description,
            image: ijazah.image,
          });
        } else {
          // Add new
          await this.repository.saveIjazah({
            teacherId,
            title: ijazah.title,
            description: ijazah.description,
            image: ijazah.image,
          });
        }
      })
    );
  }
}
