// src/types/index.ts

// --- 輔助類型 (對應 SQL ENUM) ---

/**
 * 定義行程類型：'driver_offering' (車徵人) 或 'passenger_seeking' (人徵車)
 */
export type RideType = 'driver_offering' | 'passenger_seeking';

/**
 * 定義預訂狀態：'pending', 'accepted', 'rejected', 'cancelled'
 */
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';


// --- 核心資料模型介面 (對應資料庫表格) ---

/**
 * 👤 UserProfile 介面 (對應 Supabase profiles 表格)
 */
export interface UserProfile {
  id: string; // 來自 auth.users(id)
  updated_at: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  rating: number;
}


/**
 * 🚗 Ride 介面 (對應 Supabase rides 表格)
 */
export interface Ride {
  id: string;
  created_at: string;
  creator_id: string; // 行程發布者 ID

  ride_type: RideType;
  origin: string;
  destination: string;
  departure_time: string; // ISO 格式的日期時間

  seats_available: number | null; // 僅限 'driver_offering' (車徵人) 有效
  seats_requested: number | null; // 僅限 'passenger_seeking' (人徵車) 有效
  price_per_seat: number;

  status: 'active' | 'completed' | 'cancelled';
}

/**
 * 🤝 Booking 介面 (對應 Supabase bookings 表格)
 */
export interface Booking {
  id: string;
  created_at: string;
  ride_id: string;
  passenger_id: string;

  requested_seats: number;
  status: BookingStatus;
}
