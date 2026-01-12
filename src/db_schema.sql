-- ==========================================
-- 1. 清理舊結構 (確保乾淨安裝)
-- ==========================================
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ==========================================
-- 2. 建立 Profiles 表格 (對應 UserProfile 介面)
-- ==========================================
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  full_name text,
  username text UNIQUE,
  avatar_url text,
  email text,
  phone text,
  rating numeric DEFAULT 5.0,
  created_at timestamp with time zone DEFAULT now()
);

-- 建立自動同步 Profile 的 Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 3. 建立 Rides 表格 (完全匹配您的 UI 與 Types)
-- ==========================================
CREATE TABLE rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,

  -- 匹配 UI 裡的 user_id
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- 核心資訊 (匹配 formData)
  type text NOT NULL, -- 存儲 'DRIVER_OFFERING' 或 'PASSENGER_SEEKING'
  origin text NOT NULL,
  destination text NOT NULL,
  departure_time timestamp with time zone NOT NULL,

  -- 數量資訊 (匹配您的 Create 頁面 insert 邏輯)
  total_seats integer NOT NULL,
  available_seats integer NOT NULL,
  price_per_seat numeric NOT NULL,

  -- 其他資訊
  description text,
  status text DEFAULT 'OPEN' NOT NULL -- 匹配您 UI 中的 'OPEN'
);

-- ==========================================
-- 4. 建立 Bookings 表格 (對應 Booking 介面)
-- ==========================================
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,

  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
  passenger_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  seats integer NOT NULL, -- 預訂位數
  status text DEFAULT 'PENDING' NOT NULL -- 'PENDING', 'CONFIRMED', 'CANCELLED'
);

-- ==========================================
-- 5. 安全政策 (RLS) - 配合 Auth Helpers
-- ==========================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Rides RLS
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rides are viewable by authenticated users" ON rides FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert own rides" ON rides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rides" ON rides FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rides" ON rides FOR DELETE USING (auth.uid() = user_id);

-- Bookings RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = passenger_id OR EXISTS (
  SELECT 1 FROM rides WHERE rides.id = ride_id AND rides.user_id = auth.uid()
));
CREATE POLICY "Users can insert bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- 允許司機更新他行程下的預訂 (為了 Confirm/Reject)
-- 或是允許乘客更新自己的預訂 (為了 Cancel)
CREATE POLICY "b3" ON bookings FOR UPDATE USING (
  auth.uid() = passenger_id OR
  EXISTS (
    SELECT 1 FROM rides
    WHERE rides.id = bookings.ride_id
    AND rides.user_id = auth.uid()
  )
);
