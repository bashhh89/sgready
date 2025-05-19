// A simple test API route
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Test route called successfully!');
  return NextResponse.json({ message: 'Test route works!' });
} 