import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Super simple response with no PDF logic
  return NextResponse.json({ message: 'Hello from API route' });
} 