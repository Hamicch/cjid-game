# Database Setup Guide

This application uses Supabase (PostgreSQL) for persistent data storage. Follow these steps to set up the database:

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Note down your project URL and anon key

## 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Database Schema

Run these SQL commands in your Supabase SQL editor:

### Players Table
```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations" ON players FOR ALL USING (true);
```

### Game Sessions Table
```sql
CREATE TABLE game_sessions (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  game_completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(device_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations" ON game_sessions FOR ALL USING (true);
```

## 4. Features Enabled

With this setup, you get:

✅ **Persistent Player Data**: Scores and names stored in database
✅ **Cross-Device Cooldown**: 24-hour cooldown works across devices
✅ **Real-time Updates**: Leaderboard updates in real-time
✅ **Admin Dashboard**: Full admin interface with database
✅ **Scalable**: Can handle multiple users simultaneously

## 5. Testing

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Test the game and cooldown system
4. Check the admin dashboard at `http://localhost:3000/admin`

## 6. Production Deployment

For production deployment:

1. Set up environment variables in your hosting platform
2. Deploy to Vercel, Netlify, or your preferred platform
3. The database will work seamlessly across all deployments

## Alternative: Local File Storage

If you prefer to keep using local file storage (current implementation), the app will work without Supabase. Just remove the database-related environment variables and the app will fall back to file storage.