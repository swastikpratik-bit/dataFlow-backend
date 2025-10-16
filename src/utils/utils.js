export function convertToISO(dateStr) {
  if (!dateStr) return null;
  
  // Handle Excel date numbers (serial dates)
  if (typeof dateStr === 'number') {
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (dateStr - 2) * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  // Handle string dates
  if (typeof dateStr === 'string') {
    // Try different date formats
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        if (day && month && year) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }
    
    // Try parsing as ISO date or other formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  
  return null;
}