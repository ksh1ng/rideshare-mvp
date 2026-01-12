-- 1. 先刪除舊的 Trigger 以避免 42710 錯誤
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 清理現有的表格結構
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. 建立 Profiles
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

-- 4. 建立同步 Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 重新建立 Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. 建立 Rides (完全匹配您的 GitHub 代碼欄位)
CREATE TABLE rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_time timestamp with time zone NOT NULL,
  total_seats integer NOT NULL,
  available_seats integer NOT NULL,
  price_per_seat numeric NOT NULL,
  description text,
  status text DEFAULT 'OPEN' NOT NULL
);

-- 7. 建立 Bookings
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
  passenger_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seats integer NOT NULL,
  status text DEFAULT 'PENDING' NOT NULL
);

-- 8. 啟用 RLS 並設置政策
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "p1" ON profiles FOR SELECT USING (true);
CREATE POLICY "p2" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "r1" ON rides FOR SELECT USING (true);
CREATE POLICY "r2" ON rides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "r3" ON rides FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "r4" ON rides FOR DELETE USING (auth.uid() = user_id);
-- 允許司機更新自己發布的行程（用來在確認預訂時扣除座位）
CREATE POLICY "r5" ON public.rides
FOR UPDATE
USING (auth.uid() = user_id);


CREATE POLICY "b1" ON bookings FOR SELECT USING (auth.uid() = passenger_id OR EXISTS (
  SELECT 1 FROM rides WHERE rides.id = ride_id AND rides.user_id = auth.uid()
));
CREATE POLICY "b2" ON bookings FOR INSERT WITH CHECK (auth.uid() = passenger_id);
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
