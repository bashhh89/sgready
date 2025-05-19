// File: app/api/new-test-route/route.ts
// Purpose: Test API route

import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('API Route /api/new-test-route called.');
  
  // Get any query parameters
  const testParam = request.nextUrl.searchParams.get('test');
  console.log('Test parameter:', testParam);
  
  // Return JSON response
  return NextResponse.json({ 
    status: "success", 
    message: "New test route is working correctly", 
    testParam: testParam || "no test parameter provided" 
  });
} 