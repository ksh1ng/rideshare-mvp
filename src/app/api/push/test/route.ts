import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// 設定 VAPID 金鑰 (請換成您的環境變數或字串)
webpush.setVapidDetails(
  'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY! // 這是您的私鑰，務必設定在 Vercel 後台
);

export async function GET() {
  const supabase = await createClient();

  // 1. 撈出最新的訂閱資訊
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return NextResponse.json({ error: 'No subscription found' });

  // 2. 準備推播內容 (對應您 sw.js 的內容)
  const payload = JSON.stringify({
    title: 'Safari Test!',
    body: 'This is a push notification from your server.',
    url: '/rides'
  });

  try {
    // 3. 發送推播
    await webpush.sendNotification(data.subscription, payload);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Push Error:', err);
    return NextResponse.json({ error: 'Push failed' });
  }
}
