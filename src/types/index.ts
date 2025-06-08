// Core entities
export interface Venue {
  id: string;
  name: string;
  description: string;
  location: Location;
  type: string[];
  capacity: Capacity;
  pricing: Pricing;
  amenities: string[];
  images: Image[];
  availability: Availability[];
  reviews: Review[];
  contactInfo: ContactInfo;
  virtualTourUrl?: string;
  hostId?: string;  // Reference to the host who owns this venue
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  password?: string; // Optional in the interface since it won't be returned in responses
  favoriteVenues: string[];
  bookings: Booking[];
}

export interface Host {
  id: string;
  email: string;
  name: string;
  phone: string;
  businessName: string;
  businessType: BusinessType;
  venues: string[];
  verified: boolean;
  profileImage?: string;
  address?: Address;
  createdAt: Date;
  updatedAt?: Date;
}

export type BusinessType = 'individual' | 'company' | 'event-planner' | 'hotel' | 'restaurant' | 'other';

export interface Booking {
  id: string;
  venueId: string;
  userId: string;
  eventDate: Date;
  packageId: string;
  guestCount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  createdAt: Date;
  specialRequests?: string;
}

// Supporting interfaces
export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Capacity {
  min: number;
  max: number;
}

export interface Pricing {
  basePrice: number;
  currency: string;
  pricingType?: 'fixed' | 'package';
  dynamicPricing?: {
    weekendPricing: {
      enabled: boolean;
      type: 'percentage' | 'fixed';
      value: number; // Either percentage increase or fixed amount
    };
    lastMinuteDiscount: {
      enabled: boolean;
      type: 'percentage' | 'fixed';
      value: number; // Either percentage discount or fixed amount
      daysBeforeEvent: number; // Number of days before event to apply discount
    };
  };
  packages: Package[];
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  items: string[];
}

export interface Image {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface Availability {
  startDate: Date;
  endDate: Date;
  isBooked: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    pinterest?: string;
  };
}

// Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}