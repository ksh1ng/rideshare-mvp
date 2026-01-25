// src/app/api/push/test/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET() {
  const supabase = await createClient();
  const { data: sub, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !sub) return NextResponse.json({ error: 'No subscription found' });

  // 強化 Payload 結構，確保符合標準
  const payload = JSON.stringify({
    title: 'Hello from Server!',
    body: 'If you see this, push is working!',
    url: '/rides'
  });

  try {
    const response = await webpush.sendNotification(sub.subscription, payload);
    // 回傳詳細的 HTTP 狀態碼
    return NextResponse.json({
      success: true,
      statusCode: response.statusCode,
      message: 'Push sent to Apple/Google servers'
    });
  } catch (err: any) {
    console.error('Push Error Details:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
      statusCode: err.statusCode, // 這裡最重要：如果是 403 代表金鑰錯了，410 代表 Token 廢了
      body: err.body
    }, { status: 500 });
  }
}
