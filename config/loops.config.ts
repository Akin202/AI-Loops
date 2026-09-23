export const loopsConfig = {
  name: 'AI Loops',
  tagline: 'NIGERIA AI & TECH CONVENING REGISTRY',
  taglineItems: ['NATIONAL REPOSITORY', 'SEPT–DEC 2026', 'WEST AFRICA'],
  description: 'An authoritative public index of artificial intelligence gatherings, tech conferences, hackathons, and convenings across Nigeria.',
  org: {
    name: 'National Centre for AI & Robotics',
    shortName: 'NCAIR',
    subLabel: 'FEDERAL REPUBLIC OF NIGERIA',
    logoText: 'NCAIR / NITDA',
    website: 'https://ncair.nitda.gov.ng',
  },
  undpProgrammeLine: 'Facilitated under the UNDP Nigeria Artificial Intelligence Ecosystem & Digital Transformation Framework.',
  sectors: [
    'Artificial Intelligence',
    'Fintech',
    'HealthTech',
    'GovTech',
    'EdTech',
    'AgriTech',
    'Creative Tech',
  ] as const,
  cities: ['All', 'Lagos', 'Abuja', 'Port Harcourt', 'Benin City', 'Ibadan', 'Online'] as const,
  categories: ['All', 'Conference', 'Workshop', 'Hackathon', 'Meetup', 'Demo Day'] as const,
  formats: ['All', 'In-Person', 'Virtual', 'Hybrid'] as const,
  months: ['All', 'September 2026', 'October 2026', 'November 2026', 'December 2026'] as const,
} as const;

export type LoopsConfig = typeof loopsConfig;
