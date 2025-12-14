// Enums for clarity and type safety
export enum RideType {
  DRIVER_OFFERING = 'DRIVER_OFFERING', // "車徵人"
  PASSENGER_SEEKING = 'PASSENGER_SEEKING' // "人徵車"
}

export enum RideStatus {
  OPEN = 'OPEN',
  FULL = 'FULL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

// Database Model Interfaces
export interface Profile {
  id: string; // UUID
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  rating?: number;
  created_at: string;
}

export interface Ride {
  id: string;
  user_id: string; // Foreign key to Profile
  user?: Profile; // Joined data via Supabase select
  type: RideType;
  origin: string;
  destination: string;
  departure_time: string; // ISO String
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  status: RideStatus;
  description?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  ride_id: string;
  user_id: string; // Passenger/Requester
  status: BookingStatus;
  created_at: string;
}

// Search Filter Interface
export interface SearchFilters {
  origin?: string;
  destination?: string;
  date?: string;
}
