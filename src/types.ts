export enum MemoryCategory {
  CEREMONY = 'Ceremony',
  RECEPTION = 'Reception',
  FAMILY = 'Family',
  FRIENDS = 'Friends',
  DANCE_FLOOR = 'Dance Floor',
  SPECIAL_MOMENTS = 'Special Moments'
}

export interface Memory {
  id: string;
  type: 'photo' | 'video';
  url: string; // Compress base64 format for real-time Firestore sync
  category: MemoryCategory;
  caption: string;
  guestName: string;
  likes: number;
  createdAt: string; // ISO string form for Firestore rules
}

export interface GuestbookMessage {
  id: string;
  name: string;
  text: string;
  voiceUrl?: string; // Optional audio base64 recording data
  likes: number;
  createdAt: string;
  isHearted?: boolean;
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
}

export interface StoryMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
}
