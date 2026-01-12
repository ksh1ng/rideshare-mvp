'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * 更新預訂狀態並處理座位邏輯
 * @param bookingId 預訂紀錄的 ID
 * @param rideId 行程的 ID
 * @param newStatus 要變更的新狀態 ('CONFIRMED' | 'CANCELLED')
 * @param currentAvailableSeats 該行程目前的剩餘座位數
 */
export async function updateBookingStatus(
  bookingId: string,
  rideId: string,
  newStatus: 'CONFIRMED' | 'CANCELLED',
  currentAvailableSeats: number
) {
  const supabase = createClient();

  // 1. 如果司機點擊「確認」，先檢查是否還有位子
  if (newStatus === 'CONFIRMED' && currentAvailableSeats <= 0) {
    throw new Error("No seats available to confirm this booking.");
  }

  // 2. 更新 Booking 狀態
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId);

  if (bookingError) {
    console.error('Booking status update failed:', bookingError);
    throw bookingError;
  }

  // 3. 處理座位數量更新
  // 邏輯：只有在「確認」時才減 1；「拒絕/取消」時不變動 (因為預訂時沒扣)
  if (newStatus === 'CONFIRMED') {
    const { error: rideError } = await supabase
      .from('rides')
      .update({ available_seats: currentAvailableSeats - 1 })
      .eq('id', rideId);

    if (rideError) {
      console.error('Seat decrement failed:', rideError);
      throw rideError;
    }
  }

  // 如果 newStatus 是 'CANCELLED'，不做任何座位變動

  return { success: true };
}
