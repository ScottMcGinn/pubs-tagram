// User types
export interface User {
  userId: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastLogin: Date;
}

// Pub Entry types
export interface Pub {
  pubId: string;
  userId: string;
  pubName: string;
  location: string;
  whatYouHad?: string;
  valueForMoney: number; // 1-5 £ symbols
  beerQuality: number; // 1-5 beer glasses
  foodQuality?: number; // 1-5 pies (optional)
  visitDate?: Date;
  photoUrls: string[];
  thumbnailUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Form data for creating a new pub
export interface PubFormData {
  pubName: string;
  location: string;
  whatYouHad?: string;
  valueForMoney: number;
  beerQuality: number;
  foodQuality?: number;
  visitDate?: Date;
  photos: PubPhoto[];
}

// Photo data structure
export interface PubPhoto {
  uri: string;
  type?: string;
  fileName?: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Feed: undefined;
  AddPub: undefined;
  PubDetail: { pub: Pub };
};
