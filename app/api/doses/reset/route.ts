import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    db.resetTodayDoses();
    return NextResponse.json({ success: true, message: "Today's doses have been reset to pending for testing." });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error resetting schedule';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
