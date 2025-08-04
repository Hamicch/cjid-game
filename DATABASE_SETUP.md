# Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Choose your organization
6. Enter project details:
   - **Name**: `cjid-scramble-dash` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
7. Click "Create new project"
8. Wait for project to be ready (2-3 minutes)

## Step 2: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## Step 3: Set Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

## Step 4: Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run these commands:

### Players Table
```sql
-- Create players table
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate users
ALTER TABLE players ADD CONSTRAINT unique_player_id UNIQUE (id);

-- Enable Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for this app)
CREATE POLICY "Allow all operations" ON players FOR ALL USING (true);
```

### Game Sessions Table
```sql
-- Create game_sessions table
CREATE TABLE game_sessions (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  game_completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint for device_id and user_id combination
ALTER TABLE game_sessions ADD CONSTRAINT unique_device_user UNIQUE (device_id, user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for this app)
CREATE POLICY "Allow all operations" ON game_sessions FOR ALL USING (true);
```

## Step 5: Verify Setup

1. Go to **Table Editor** in Supabase
2. You should see both `players` and `game_sessions` tables
3. The tables should have the correct columns and constraints

## Database Features

✅ **Unique User IDs**: Each user can only exist once in the database
✅ **Score Tracking**: Player scores are stored and updated
✅ **Cooldown System**: 24-hour game cooldown per device/user
✅ **Admin Access**: Secure admin dashboard with authentication
✅ **Real-time Updates**: Live leaderboard updates

## Troubleshooting

- **Duplicate Users**: The unique constraint on `id` prevents duplicate players
- **Cooldown Issues**: Check `game_sessions` table for device/user combinations
- **Admin Access**: Verify `NEXT_PUBLIC_ADMIN_PASSWORD` is set correctly