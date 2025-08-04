import { NextRequest, NextResponse } from 'next/server';
import { getPlayers, upsertPlayer, resetAllScores, clearAllUsers, type Player } from '@/lib/supabase';

export async function GET() {
  try {
      const players = await getPlayers();
      return NextResponse.json(players);
  } catch (error) {
      console.error('Error fetching players:', error);
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
      const { id, name, score } = body;

      const success = await upsertPlayer({ id, name, score });

      if (!success) {
          return NextResponse.json({ error: 'Username already exists or failed to update player' }, { status: 409 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
      console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
        const success = await resetAllScores();

        if (!success) {
            return NextResponse.json({ error: 'Failed to reset scores' }, { status: 500 });
        }

      return NextResponse.json({ success: true });
    }

      if (action === 'clear') {
          const success = await clearAllUsers();

          if (!success) {
              return NextResponse.json({ error: 'Failed to clear all users' }, { status: 500 });
          }

          return NextResponse.json({ success: true });
      }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
      console.error('Error processing admin action:', error);
      return NextResponse.json({ error: 'Failed to process admin action' }, { status: 500 });
  }
}