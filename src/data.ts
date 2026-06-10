import { Memory, MemoryCategory, StoryMilestone, TimelineEvent } from './types';
import firstMeetingImg from './assets/images/regenerated_image_1781096401635.png';

export const INITIAL_MEMORIES: Memory[] = [];

export const STORY_MILESTONES: StoryMilestone[] = [
  {
    id: 'story-1',
    date: 'August 2023',
    title: 'First Meeting',
    description: 'I first saw her on my sister\'s status, then we met face to face at AMH.',
    imageUrl: firstMeetingImg
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
