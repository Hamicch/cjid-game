import { NextRequest, NextResponse } from 'next/server';
import { getGameSession, createGameSession, updateGameSession, supabase, type GameSession } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const userId = searchParams.get('userId');

      if (!deviceId) {
          return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
    }

      if (userId) {
      // Get specific device + user session
        const session = await getGameSession(deviceId, userId);
        return NextResponse.json(session);
    } else {
        // Get any session for this device (for device recognition)
        const { data, error } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('device_id', deviceId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching device session:', error);
            return NextResponse.json({ error: 'Failed to fetch device session' }, { status: 500 });
        }

        return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching game session:', error);
    return NextResponse.json({ error: 'Failed to fetch game session' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, userId, playerName, score, gameCompleted } = body;

    if (!deviceId || !userId || !playerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session: Omit<GameSession, 'id' | 'created_at' | 'updated_at'> = {
      device_id: deviceId,
      user_id: userId,
      player_name: playerName,
      last_played: new Date().toISOString(),
      game_completed: gameCompleted || false,
      score: score || 0
    };

    const success = await createGameSession(session);

    if (!success) {
      return NextResponse.json({ error: 'Failed to create game session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating game session:', error);
    return NextResponse.json({ error: 'Failed to create game session' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, userId, updates } = body;

    if (!deviceId || !userId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const success = await updateGameSession(deviceId, userId, updates);

    if (!success) {
      return NextResponse.json({ error: 'Failed to update game session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game session:', error);
    return NextResponse.json({ error: 'Failed to update game session' }, { status: 500 });
  }
}