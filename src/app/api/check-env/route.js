import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    EXPRESS_API_URL: process.env.EXPRESS_API_URL || 'NOT_SET',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
  });
}
