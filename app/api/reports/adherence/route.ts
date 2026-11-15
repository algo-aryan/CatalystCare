import { NextResponse } from 'next/server';
import { generateAdherenceReportHtml } from '@/lib/pdf/adherence-report';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId') || 'patient_eleanor_vance';

  const html = generateAdherenceReportHtml(patientId);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
