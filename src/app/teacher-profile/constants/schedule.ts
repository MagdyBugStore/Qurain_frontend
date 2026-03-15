/**
 * Schedule constants for availability management
 */

export const TIME_SLOTS = [
  '٠٨:٠٠ ص', '٠٩:٠٠ ص', '١٠:٠٠ ص', '١١:٠٠ ص',
  '١٢:٠٠ م', '٠١:٠٠ م', '٠٢:٠٠ م', '٠٣:٠٠ م',
  '٠٤:٠٠ م', '٠٥:٠٠ م', '٠٦:٠٠ م', '٠٧:٠٠ م'
] as const;

export const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'] as const;

export const INITIAL_AVAILABILITY: (string | null)[][] = Array(7)
  .fill(null)
  .map(() => Array(12).fill(null));
