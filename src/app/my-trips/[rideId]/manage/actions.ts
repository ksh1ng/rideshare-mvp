'use client'; // 注意：雖然是在伺服器跑，但為了方便在 Client Component 調用，我們定義邏輯

import { createClient } from '@/lib/supabase/client';

export async function updateBookingStatus(
  bookingId: string, 
  rideId: string, 
  newStatus: 'CONFIRMED' | 'CANCELLED',
  currentAvailableSeats: number
) {
  const supabase = createClient();

  // 1. 更新 Booking 狀態
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId);

  if (bookingError) throw bookingError;

  // 2. 如果是 Reject (CANCELLED)，需要把座位還回去
  if (newStatus === 'CANCELLED') {
    const { error: rideError } = await supabase
      .from('rides')
      .update({ available_seats: currentAvailableSeats + 1 })
      .eq('id', rideId);
    
    if (rideError) throw rideError;
  }

  return { success: true };
}
