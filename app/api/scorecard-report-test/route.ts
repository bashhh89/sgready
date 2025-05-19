import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Minimal scorecard report test route called');
  return NextResponse.json({ 
    message: 'Scorecard report test route works!',
    time: new Date().toISOString()
  });
} 