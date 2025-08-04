import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table types
export interface Player {
  id: string;
  name: string;
  score: number;
  created_at?: string;
  updated_at?: string;
}

export interface GameSession {
  id?: number;
  device_id: string;
  user_id: string;
  player_name: string;
  last_played: string;
  game_completed: boolean;
  score: number;
  created_at?: string;
  updated_at?: string;
}

// Database functions
export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('score', { ascending: false });

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }

  return data || [];
}

export async function getPlayerById(id: string): Promise<Player | null> {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching player:', error);
        return null;
    }

    return data;
}

export async function getPlayerByName(name: string): Promise<Player | null> {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .ilike('name', name) // Case-insensitive search
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching player by name:', error);
        return null;
    }

    return data;
}

export async function upsertPlayer(player: Player): Promise<boolean> {
    // Check if player already exists by ID
    const existingPlayer = await getPlayerById(player.id);

    if (existingPlayer) {
        // Update existing player's score if new score is higher
        if (player.score > existingPlayer.score) {
            const { error } = await supabase
                .from('players')
                .update({
                    name: player.name,
                    score: player.score,
                    updated_at: new Date().toISOString()
                })
                .eq('id', player.id);

            if (error) {
                console.error('Error updating player:', error);
                return false;
            }
        }
        return true;
    }

    // Check if username already exists (case-insensitive)
    const existingPlayerByName = await getPlayerByName(player.name);
    if (existingPlayerByName) {
        console.error('Username already exists:', player.name);
        return false;
    }

    // Create new player
    const { error } = await supabase
        .from('players')
        .insert(player);

    if (error) {
        console.error('Error creating player:', error);
        return false;
    }

    return true;
}

export async function getGameSession(deviceId: string, userId: string): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('device_id', deviceId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching game session:', error);
    return null;
  }

  return data;
}

export async function createGameSession(session: Omit<GameSession, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
  const { error } = await supabase
    .from('game_sessions')
    .insert(session);

  if (error) {
    console.error('Error creating game session:', error);
    return false;
  }

  return true;
}

export async function updateGameSession(deviceId: string, userId: string, updates: Partial<GameSession>): Promise<boolean> {
  const { error } = await supabase
    .from('game_sessions')
    .update(updates)
    .eq('device_id', deviceId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating game session:', error);
    return false;
  }

  return true;
}

export async function resetAllScores(): Promise<boolean> {
  const { error } = await supabase
    .from('players')
    .update({ score: 0 });

  if (error) {
    console.error('Error resetting scores:', error);
    return false;
  }

  return true;
}

export async function clearAllUsers(): Promise<boolean> {
    const { error } = await supabase
        .from('players')
        .delete()
        .neq('id', ''); // Delete all records

    if (error) {
        console.error('Error clearing all users:', error);
        return false;
    }

    return true;
}