import { searchStation } from '@/lib/sl-stops';
import { NextRequest } from 'next/server';

// FIX: not needed in next.js 15
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name');

  if (name && name.length > 2) {
    const stops = await searchStation(name);
    if (stops) {
      return Response.json(stops, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET'
        }
      });
    }
  }

  return Response.json([], {
    status: 500,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET'
    }
  });
}
