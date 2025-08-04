import { NextRequest, NextResponse } from 'next/server';
import { Player } from '@/lib/gameData';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'players.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(dataFilePath);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load players from file
async function loadPlayers(): Promise<Player[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save players to file
async function savePlayers(players: Player[]) {
  await ensureDataDirectory();
  await fs.writeFile(dataFilePath, JSON.stringify(players, null, 2));
}

export async function GET() {
  const players = await loadPlayers();
    console.log('API GET - Returning players:', players); // Debug log
  return NextResponse.json(players);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, score } = body;
      console.log('API POST - Received player data:', { id, name, score }); // Debug log

    const players = await loadPlayers();
    const existingPlayerIndex = players.findIndex(p => p.id === id);

    if (existingPlayerIndex >= 0) {
      // Update existing player
      players[existingPlayerIndex] = { id, name, score };
        console.log('API POST - Updated existing player'); // Debug log
    } else {
      // Add new player
      players.push({ id, name, score });
        console.log('API POST - Added new player'); // Debug log
    }

    await savePlayers(players);
      console.log('API POST - Saved players:', players); // Debug log
    return NextResponse.json({ success: true });
  } catch (error) {
      console.error('API POST - Error:', error); // Debug log
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      const players = await loadPlayers();
      // Reset all scores to 0
      const resetPlayers = players.map(player => ({ ...player, score: 0 }));
      await savePlayers(resetPlayers);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset scores' }, { status: 500 });
  }
}