import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const events = db.getAdherenceEvents();
    
    // Filter out today's events for the patient to reset today's schedule
    const filtered = events.filter((e) => !e.scheduledTime.startsWith(todayStr));
    
    // @ts-ignore - internal data reset
    db['data'].adherenceEvents = filtered;
    // @ts-ignore
    db['persist']();

    return NextResponse.json({ success: true, message: "Today's doses have been reset to pending for testing." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
