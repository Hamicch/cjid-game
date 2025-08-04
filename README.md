# CJID and Media Ecosystem Scramble Dash

A Next.js-based word scramble game where players unscramble definitions to find the correct acronyms.

## Features

- Real-time multiplayer leaderboard
- 2-minute timed game sessions
- 20 different acronyms and definitions
- Responsive design with Tailwind CSS
- Serverless API routes for game state management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

Build the app for production:
```bash
npm run build
npm start
```

## Game Rules

1. Enter your name to join the game
2. You'll see scrambled definitions - unscramble them to find the acronym
3. Type the acronym in the input field and submit
4. Score points for correct answers
5. Game lasts 2 minutes
6. Compete with other players on the real-time leaderboard

## Technical Details

- **Frontend**: Next.js 14 with React 18 and TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes with in-memory storage
- **Real-time Updates**: Polling-based leaderboard updates

## Project Structure

```
├── app/
│   ├── api/players/route.ts    # API routes for player management
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page
├── components/
│   └── Game.tsx                # Main game component
├── lib/
│   └── gameData.ts             # Game data and utilities
└── package.json
```

## Environment Variables

No environment variables are required for basic functionality. The app uses in-memory storage for development.

For production with persistent storage, you can modify the API routes to use a database like PostgreSQL, MongoDB, or Supabase.