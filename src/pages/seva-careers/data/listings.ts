/**
 * Seva / Job / Internship listings.
 * Add or edit entries here; root CMS can manage later.
 */

export type ListingType = 'seva' | 'job' | 'internship';

export interface SevaListing {
  id: string;
  type: ListingType;
  title: string;
  department: string;
  duration: string;
  location: string;
  description?: string;
}

export const sevaListings: SevaListing[] = [
  {
    id: 'seva-garden',
    type: 'seva',
    title: 'Garden & Landscaping Seva',
    department: 'Estate',
    duration: 'Flexible',
    location: 'Bangalore Ashram',
    description: 'Help maintain gardens and green spaces at the ashram.',
  },
  {
    id: 'seva-kitchen',
    type: 'seva',
    title: 'Kitchen Seva',
    department: 'Kitchen',
    duration: '1–3 months',
    location: 'Bangalore Ashram',
    description: 'Support the kitchen team in preparing meals for residents and visitors.',
  },
  {
    id: 'seva-media',
    type: 'seva',
    title: 'Media & Content Seva',
    department: 'Communications',
    duration: 'Flexible',
    location: 'Bangalore / Remote',
    description: 'Create and edit content for social media and website.',
  },
  {
    id: 'job-admin',
    type: 'job',
    title: 'Administrative Coordinator',
    department: 'Admin',
    duration: 'Full-time',
    location: 'Bangalore Ashram',
    description: 'Coordinate day-to-day administrative operations.',
  },
  {
    id: 'job-program',
    type: 'job',
    title: 'Program Manager',
    department: 'Programs',
    duration: 'Full-time',
    location: 'Bangalore Ashram',
    description: 'Manage program logistics and facilitator coordination.',
  },
  {
    id: 'job-it',
    type: 'job',
    title: 'IT Support Associate',
    department: 'IT',
    duration: 'Full-time',
    location: 'Bangalore Ashram',
    description: 'Provide IT support and maintain systems.',
  },
  {
    id: 'intern-marketing',
    type: 'internship',
    title: 'Marketing Intern',
    department: 'Marketing',
    duration: '3–6 months',
    location: 'Bangalore / Hybrid',
    description: 'Support marketing campaigns and digital presence.',
  },
  {
    id: 'intern-hr',
    type: 'internship',
    title: 'HR Intern',
    department: 'Human Resources',
    duration: '3–6 months',
    location: 'Bangalore Ashram',
    description: 'Assist with recruitment and HR operations.',
  },
  {
    id: 'intern-design',
    type: 'internship',
    title: 'Design Intern',
    department: 'Communications',
    duration: '3–6 months',
    location: 'Bangalore / Remote',
    description: 'Create visual content for print and digital.',
  },
];
