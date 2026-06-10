import { Memory, MemoryCategory, StoryMilestone, TimelineEvent } from './types';

export const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'seed-1',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    category: MemoryCategory.CEREMONY,
    caption: 'Tafadzwa and Chengeto during their beautiful vow exchange. Emotional moments!',
    guestName: 'Aunt Chipo',
    likes: 18,
    createdAt: '2026-08-29T11:30:00Z'
  },
  {
    id: 'seed-2',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
    category: MemoryCategory.RECEPTION,
    caption: 'The magnificent reception design at Blissful Barn Gardens. Truly premium!',
    guestName: 'Wedding Planner',
    likes: 24,
    createdAt: '2026-08-29T14:15:00Z'
  },
  {
    id: 'seed-3',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800',
    category: MemoryCategory.SPECIAL_MOMENTS,
    caption: 'They look absolutely ethereal. Forever Tafadzwa and Chengeto.',
    guestName: 'Farai (Best Man)',
    likes: 42,
    createdAt: '2026-08-29T13:45:00Z'
  },
  {
    id: 'seed-4',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800',
    category: MemoryCategory.FRIENDS,
    caption: 'The bridal crew looking incredibly sharp and champagne-gold unified!',
    guestName: 'Sekai (Maid of Honor)',
    likes: 31,
    createdAt: '2026-08-29T13:20:00Z'
  },
  {
    id: 'seed-5',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1519225495810-7512c322a3e6?auto=format&fit=crop&q=80&w=800',
    category: MemoryCategory.DANCE_FLOOR,
    caption: 'Chengeto showing off some incredible moves! The dance floor is electric!',
    guestName: 'Cousin Simba',
    likes: 35,
    createdAt: '2026-08-29T20:30:00Z'
  },
  {
    id: 'seed-6',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1507504038482-7621abf8c325?auto=format&fit=crop&q=80&w=800',
    category: MemoryCategory.FAMILY,
    caption: 'A truly beautiful moment with the parents holding hands during the speech.',
    guestName: 'Gogo Dube',
    likes: 29,
    createdAt: '2026-08-29T15:10:00Z'
  }
];

export const STORY_MILESTONES: StoryMilestone[] = [
  {
    id: 'story-1',
    date: 'August 2023',
    title: 'First Meeting',
    description: 'I first saw her on my sister\'s status, then we met face to face at AMH.',
    imageUrl: '/src/assets/images/regenerated_image_1781091822839.jpg'
  },
  {
    id: 'story-2',
    date: 'April 2024',
    title: 'First Date',
    description: 'Our first date was a church date at an Easter Church Conference in Mutoko.',
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'story-3',
    date: 'May 2024',
    title: 'The Engagement',
    description: 'I proposed to her in front of the ZEC building.',
    imageUrl: 'https://images.unsplash.com/photo-1519225495810-7512c322a3e6?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'story-4',
    date: 'August 2026',
    title: 'The Wedding Day',
    description: 'Our formal union and lifelong covenant at Blissful Barn Gardens of Harare, sharing memories with friends and family from around the globe.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600'
  }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    time: '10:00 AM',
    title: 'Guest Arrival',
    description: 'Welcome cocktail reception with refreshing signature mimosas in the garden courtyard accompanied by live harp music.'
  },
  {
    time: '11:00 AM',
    title: 'Wedding Ceremony',
    description: 'The main ceremony under the open-air wooden flower pavilion. Official exchange of vows, rings, and matrimonial signing.'
  },
  {
    time: '01:00 PM',
    title: 'Photo Session',
    description: 'Bridal party and family photo shoot across the gorgeous lavender meadows, while guests enjoy fine premium hor d\'oeuvres.'
  },
  {
    time: '02:00 PM',
    title: 'The Grand Reception',
    description: 'Unveiling Tafadzwa and Chengeto for the first time as Mr. & Mrs., followed by speech protocols, cake-cutting, and champagne toast.'
  },
  {
    time: '04:00 PM',
    title: 'Festive Entertainment',
    description: 'Live performance by the regional acoustic band, and interactive guest entertainment segment.'
  },
  {
    time: '06:00 PM',
    title: 'Harare Gourmet Feast',
    description: 'A formal sit-down 3-course luxurious dinner highlighting authentic Zimbabwean cuisine with premium modern twists.'
  },
  {
    time: '08:00 PM',
    title: 'Celebration & Dance',
    description: 'Under glittering glass chandeliers and fairy lights, the newlyweds open the dance floor. The celebration continues long into the night!'
  }
];
