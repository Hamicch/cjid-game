import { NextRequest, NextResponse } from 'next/server';
import { getPlayerByName } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Check if username exists
    const existingPlayer = await getPlayerByName(name);

    if (existingPlayer) {
      return NextResponse.json({
        available: false,
        message: `Username "${name}" is already taken. Please choose a different name.`
      });
    }

    return NextResponse.json({
      available: true,
      message: `Username "${name}" is available!`
    });

  } catch (error) {
    console.error('Error checking username availability:', error);
    return NextResponse.json({ error: 'Failed to check username availability' }, { status: 500 });
  }
}