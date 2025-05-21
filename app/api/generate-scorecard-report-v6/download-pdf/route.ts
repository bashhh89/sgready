import { NextResponse } from 'next/server';
import { generatePDF } from '../pdf-generator';

export async function POST(request: Request) {
  return generatePDF(request);
} 