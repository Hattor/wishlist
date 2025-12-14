export enum GiftStatus {
  WANT = 'WANT',
  RESERVED = 'RESERVED',
  BOUGHT = 'BOUGHT'
}

export interface Person {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color class snippet (e.g., 'blue')
}

export interface Gift {
  id: string;
  personId: string;
  categoryId: string;
  title: string;
  price?: number;
  url?: string;
  imageUrl?: string;
  status: GiftStatus;
  isPrivate: boolean; // Hidden from public
  notes?: string;
  createdAt: number;
}

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'VIEWER';
}
