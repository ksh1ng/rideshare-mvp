import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. 取得 Supabase Server Client
    const supabase = await createClient();

    // 2. 解析前端傳來的訂閱 JSON 物件
    const { subscription } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription is required' }, { status: 400 });
    }

    // 3. 獲取當前登入的使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 4. 將訂閱資訊存入資料表 (對應您的 SQL Step 9)
    // 使用 upsert 以處理「同一個使用者在同一台裝置重複點擊」的情況
    const { error: dbError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id, // 指向您的 profiles(id)
          subscription: subscription,
        },
        { onConflict: 'user_id, subscription' }
      );

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
