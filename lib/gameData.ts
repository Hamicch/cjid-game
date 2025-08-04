export interface Acronym {
  acronym: string;
  definition: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface GameSession {
    deviceId: string;
    lastPlayed: number; // timestamp
    gameCompleted: boolean;
}

export const acronyms: Acronym[] = [
  { acronym: 'SLAPP', definition: 'Strategic Lawsuit Against Public Participation' },
  { acronym: 'OSINT', definition: 'Open-Source Intelligence' },
  { acronym: 'MIL', definition: 'Media and Information Literacy' },
  { acronym: 'LLM', definition: 'Large Language Model' },
  { acronym: 'VPN', definition: 'Virtual Private Network' },
  { acronym: 'E2EE', definition: 'End-to-End Encryption' },
  { acronym: 'GDPR', definition: 'General Data Protection Regulation' },
  { acronym: 'AAEA', definition: 'Association of African Electoral Authorities' },
  { acronym: 'CPJ', definition: 'Committee to Protect Journalists' },
  { acronym: 'FOI', definition: 'Freedom of Information' },
  { acronym: 'GHG', definition: 'Greenhouse Gas' },
  { acronym: 'COP', definition: 'Conference of the Parties' },
  { acronym: 'NDC', definition: 'Nationally Determined Contribution' },
  { acronym: 'EIA', definition: 'Environmental Impact Assessment' },
  { acronym: 'ESG', definition: 'Environmental, Social, and Governance' },
  { acronym: 'NAREP', definition: 'Natural Resources and Extractives Project' },
  { acronym: 'LDJ', definition: 'Law, Democracy and Journalism' },
  { acronym: 'MEL', definition: 'Monitoring, Evaluation, and Learning' },
  { acronym: 'DAIDAC', definition: 'Digital Technology, Artificial Intelligence, and Disinformation Analysis Centre' },
  { acronym: 'CIPE', definition: 'Centre for International Private Enterprise' }
];

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Generate a unique device ID
export function generateDeviceId(): string {
    const existingId = localStorage.getItem('deviceId');
    if (existingId) {
        return existingId;
    }

    const deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('deviceId', deviceId);
    return deviceId;
}

// Check if user can play again (24-hour cooldown)
export async function canPlayAgain(deviceId: string, userId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/sessions?deviceId=${deviceId}&userId=${userId}`);
        const session = await response.json();

        if (!session || !session.game_completed) {
            return true; // First time playing or game not completed
        }

        const now = new Date();
        const lastPlayed = new Date(session.last_played);
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Check if 24 hours have passed
        return (now.getTime() - lastPlayed.getTime()) >= twentyFourHours;
    } catch (error) {
        console.error('Error checking game session:', error);
        return true; // Allow playing if there's an error
    }
}

// Get time until next game is available
export async function getTimeUntilNextGame(deviceId: string, userId: string): Promise<string> {
    try {
        const response = await fetch(`/api/sessions?deviceId=${deviceId}&userId=${userId}`);
        const session = await response.json();

        if (!session || !session.game_completed) {
            return '00:00:00'; // Can play immediately
        }

        const now = new Date();
        const lastPlayed = new Date(session.last_played);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const timeRemaining = (lastPlayed.getTime() + twentyFourHours) - now.getTime();

        if (timeRemaining <= 0) {
            return '00:00:00'; // Can play now
        }

        // Convert to hours, minutes, seconds
        const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
        console.error('Error getting time until next game:', error);
        return '00:00:00';
    }
}

// Mark game as completed
export async function markGameCompleted(deviceId: string, userId: string, playerName: string, score: number): Promise<void> {
    try {
        await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deviceId,
                userId,
                playerName,
                score,
                gameCompleted: true
            }),
        });
    } catch (error) {
        console.error('Error marking game as completed:', error);
    }
}

// Reset game session (for testing or admin use)
export async function resetGameSession(deviceId: string, userId: string): Promise<void> {
    try {
        await fetch('/api/sessions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deviceId,
                userId,
                updates: { game_completed: false }
            }),
        });
    } catch (error) {
        console.error('Error resetting game session:', error);
    }
}