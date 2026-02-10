export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { 
    day: 'numeric',
    month: 'numeric', 
    year: 'numeric',
    timeZone: 'UTC' 
  });
};