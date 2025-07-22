// Course preview URL mappings for courses that need custom URLs
// instead of auto-generated slug from title
export const coursePreviewUrlMappings: { [key: string]: string } = {
  's13': 'https://meet.getcampfire.com/lessons/make-the-most-of-1-on-1s/preview',
  's29': 'https://meet.getcampfire.com/lessons/storytelling/preview',
};

// Helper function to get preview URL for a course
export function getCoursePreviewUrl(courseId: string, courseTitle: string): string {
  // Check if course has custom preview URL mapping
  if (coursePreviewUrlMappings[courseId]) {
    return coursePreviewUrlMappings[courseId];
  }
  
  // Fall back to auto-generated URL from title
  const slug = courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `https://meet.getcampfire.com/lessons/${slug}/preview`;
}